"""Downloads the image placeholders of the templates from imgplaceholdr.com: gray boxes that
say what goes there and the size that fills the slot on a Full HD (1920 x 1080) screen.

    python3 core/make_examples.py                      # .pptx images, Portuguese
    python3 core/make_examples.py ../pybr2026-marp/img --marp
"""

import argparse
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

FILL, TEXT_COLOR = "cccccc", "969696"

TEXT = {
    "pt": {"imagem": "Sua imagem aqui", "foto": "Sua foto favorita", "captura": "Sua captura de tela", "fundo": "Sua imagem de fundo"},
    "en": {"imagem": "Your image here", "foto": "Your favorite photo", "captura": "Your screenshot here", "fundo": "Your background image"},
    "es": {"imagem": "Tu imagen aquí", "foto": "Tu foto favorita", "captura": "Tu captura de pantalla", "fundo": "Tu imagen de fondo"},
}


def download(path: Path, size: tuple[int, int], label: str) -> None:
    w, h = size
    text = quote(f"{label}\n{w} × {h}")
    # The longest line fills at most 80% of the width; a character is about 0.62 of the size.
    size = min(min(w, h) // 10, int(w * 0.8 / (0.62 * len(label))))
    url = f"https://imgplaceholdr.com/{w}x{h}/{FILL}/{TEXT_COLOR}/png?text={text}&text_size={size}"
    with urlopen(url) as response:
        path.write_bytes(response.read())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("out", nargs="?", default=str(Path(__file__).parent / "exemplos"))
    parser.add_argument("--marp", action="store_true", help="Marp file names and sizes, in the three languages")
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    if args.marp:
        # Marp: side images take 42% of the width; screenshots are 16:10 cards.
        slots = {
            "imagem-exemplo": ("imagem", (806, 1080)),
            "foto-exemplo": ("foto", (570, 570)),
            "captura-exemplo": ("captura", (640, 400)),
            "fundo-exemplo": ("fundo", (1920, 1080)),
        }
        langs = {"pt": "", "en": "-en", "es": "-es"}
    else:
        slots = {
            "imagem-lado": ("imagem", (845, 1080)),
            "imagem-caixa": ("imagem", (883, 552)),
            "foto": ("foto", (576, 576)),
            "captura": ("captura", (538, 336)),
            "fundo": ("fundo", (1920, 1080)),
        }
        langs = {"pt": ""}

    for lang, suffix in langs.items():
        for name, (kind, size) in slots.items():
            download(out / f"{name}{suffix}.png", size, TEXT[lang][kind])


if __name__ == "__main__":
    main()
