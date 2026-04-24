from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FRAME_DIR = Path("assets/demo/frames")
OUTPUT_PATH = Path("assets/demo/ecommerce-demo.gif")
FRAME_FILES = [
    "01-home.png",
    "03-admin-dashboard.png",
    "05-admin-form-complete.png",
    "06-product-created.png",
    "08-customer-login-filled.png",
    "09-customer-dashboard.png",
    "10-cart-updated.png",
    "11-checkout-complete.png",
]
STEP_TITLES = {
    "01-home.png": "1. Home screen",
    "03-admin-dashboard.png": "2. Admin dashboard",
    "05-admin-form-complete.png": "3. Product form completed",
    "06-product-created.png": "4. Product created",
    "08-customer-login-filled.png": "5. Customer login",
    "09-customer-dashboard.png": "6. Customer dashboard",
    "10-cart-updated.png": "7. Item added to cart",
    "11-checkout-complete.png": "8. Checkout completed",
}

FRAME_DURATION_MS = 2200
FINAL_FRAME_DURATION_MS = 3200
TARGET_WIDTH = 960
TARGET_HEIGHT = 1500


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in ("arial.ttf", "segoeui.ttf"):
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def compose_frame(image: Image.Image, caption: str) -> Image.Image:
    image = image.convert("RGB")
    image.thumbnail((TARGET_WIDTH, TARGET_HEIGHT - 84))

    canvas = Image.new("RGB", (TARGET_WIDTH, TARGET_HEIGHT), (12, 16, 24))
    x = (TARGET_WIDTH - image.width) // 2
    y = 84 + max(0, (TARGET_HEIGHT - 84 - image.height) // 2)
    canvas.paste(image, (x, y))

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    title_font = load_font(30)
    draw.rectangle([(0, 0), (TARGET_WIDTH, 72)], fill=(10, 14, 22, 230))
    draw.text((24, 20), caption, fill=(255, 244, 227, 255), font=title_font)

    composed = Image.alpha_composite(canvas.convert("RGBA"), overlay)
    return composed.convert("P", palette=Image.ADAPTIVE)


def main() -> None:
    frames = []
    durations = []

    for file_name in FRAME_FILES:
        image_path = FRAME_DIR / file_name
        if not image_path.exists():
            raise SystemExit(f"Missing frame: {file_name}")

        frame = compose_frame(Image.open(image_path), STEP_TITLES[file_name])
        frames.append(frame)
        durations.append(FINAL_FRAME_DURATION_MS if file_name == FRAME_FILES[-1] else FRAME_DURATION_MS)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUTPUT_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=False,
        disposal=2,
    )


if __name__ == "__main__":
    main()
