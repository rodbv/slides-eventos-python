# /// script
# dependencies = ["qrcode[pil]"]
# ///
"""Gera o QR code do encerramento. Troque o endereço pelo link dos seus slides.

    uv run scripts/qr.py https://exemplo.com.br/slides
"""

import sys
from pathlib import Path

import qrcode

endereco = sys.argv[1] if len(sys.argv) > 1 else "{{site}}"
destino = Path(__file__).resolve().parent.parent / "img" / "qr.png"

# A margem branca em volta faz parte do QR code: sem ela, o celular demora a ler no fundo escuro.
imagem = qrcode.make(endereco, box_size=20, border=2)
imagem.save(destino)
print(f"{destino} -> {endereco}")
