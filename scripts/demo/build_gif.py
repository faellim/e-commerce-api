from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FRAME_DIR = Path("assets/demo/frames")
OUTPUT_PATH = Path("assets/demo/ecommerce-demo.gif")
STEP_TITLES = {
    "01-home.png": "1. Home screen",
    "02-admin-login-filled.png": "2. Admin login",
    "03-admin-dashboard.png": "3. Admin dashboard",
    "04-admin-form-partial.png": "4. Product form in progress",
    "05-admin-form-complete.png": "5. Product data completed",
    "06-product-created.png": "6. Product created successfully",
    "07-customer-login-screen.png": "7. Customer access screen",
    "08-customer-login-filled.png": "8. Customer login",
    "09-customer-dashboard.png": "9. Product catalog available",
    "10-cart-updated.png": "10. Item added to cart",
    "11-checkout-complete.png": "11. Checkout completed",
}

FRAME_DURATION_MS = 2200
FINAL_FRAME_DURATION_MS = 3000


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in ("arial.ttf", "segoeui.ttf"):
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def add_caption(image: Image.Image, caption: str) -> Image.Image:
    canvas = image.copy().convert("RGBA")
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    title_font = load_font(28)

    box_height = 74
    draw.rectangle(
        [(0, 0), (canvas.size[0], box_height)],
        fill=(10, 14, 22, 222),
    )
    draw.text((26, 22), caption, fill=(255, 244, 227, 255), font=title_font)
    return Image.alpha_composite(canvas, overlay).convert("P", palette=Image.ADAPTIVE)


def main() -> None:
    ordered_paths = sorted(FRAME_DIR.glob("*.png"))
    if not ordered_paths:
        raise SystemExit("No frames found to build GIF")

    base_frames = []
    target_size = None
    for image_path in ordered_paths:
        image = Image.open(image_path).convert("RGB")
        image.thumbnail((1320, 1320))
        captioned = add_caption(image, STEP_TITLES.get(image_path.name, image_path.stem))
        if target_size is None:
            target_size = captioned.size
        if captioned.size != target_size:
            background = Image.new("P", target_size)
            background.paste(captioned, (0, 0))
            captioned = background
        base_frames.append(captioned)

    frames = []
    durations = []

    for index, frame in enumerate(base_frames):
        frames.append(frame)
        durations.append(FINAL_FRAME_DURATION_MS if index == len(base_frames) - 1 else FRAME_DURATION_MS)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUTPUT_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=False,
    )


if __name__ == "__main__":
    main()
