from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FRAME_DIR = Path("assets/demo/frames")
OUTPUT_PATH = Path("assets/demo/ecommerce-demo.gif")
STEP_TITLES = {
    "01-admin-dashboard.png": "1. Admin dashboard loaded",
    "02-product-form-filled.png": "2. Product form filled",
    "03-product-created.png": "3. Product created",
    "04-login-screen.png": "4. Customer login screen",
    "05-login-filled.png": "5. Customer login filled",
    "06-customer-logged.png": "6. Customer logged in",
    "07-cart-updated.png": "7. Product added to cart",
    "08-checkout-complete.png": "8. Checkout completed",
}


def add_caption(image: Image.Image, caption: str) -> Image.Image:
    canvas = image.copy().convert("RGBA")
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()

    box_height = 52
    draw.rectangle(
        [(0, 0), (canvas.size[0], box_height)],
        fill=(12, 18, 28, 210),
    )
    draw.text((20, 18), caption, fill=(255, 245, 230, 255), font=font)
    return Image.alpha_composite(canvas, overlay).convert("P", palette=Image.ADAPTIVE)


def main() -> None:
    frames = []
    durations = []
    for image_path in sorted(FRAME_DIR.glob("*.png")):
        image = Image.open(image_path).convert("RGB")
        image.thumbnail((1280, 1280))
        captioned = add_caption(image, STEP_TITLES.get(image_path.name, image_path.stem))
        frames.append(captioned)
        durations.append(1100 if image_path.name != "08-checkout-complete.png" else 1800)

    if not frames:
        raise SystemExit("No frames found to build GIF")

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
