#!/usr/bin/env bash
# Builds the PNG brand pieces in events/python-brasil-2026/assets/ from the crops of the official brandboard,
# which events/python-brasil-2026/extract_brandboard.sh writes to events/python-brasil-2026/brandboard/:
#   - the stacked "python brasil 2026" logo, in one color per background;
#   - the surfing witch and the two wizards, as ink for each background and as stickers;
#   - the brandboard stickers: the signature, the pybr pixel ellipse, the magic marks
#     and the pixel icons, copied as they are;
#   - a pixelated circle drawn in the style of the pybr pixel ellipse.
# Needs ImageMagick 7 (`magick`). Run events/python-brasil-2026/extract_brandboard.sh first.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
BOARD="$HERE/brandboard"
BRAND="$HERE/assets"

LIME="#B7FF06"
OFF_WHITE="#E8F4BA"
BLACK="#0F0F0F"

[[ -d "$BOARD" ]] || { echo "run events/python-brasil-2026/extract_brandboard.sh first" >&2; exit 1; }

# The brandboard draws its logo and illustrations as black ink on a transparent page,
# so a piece takes another color by replacing its RGB and keeping its alpha.
tint() { magick "$BOARD/$1.png" -channel RGB -fill "$2" -colorize 100 +channel -resize "$3" "$BRAND/$4"; }

# A sticker is the black ink on a lime silhouette grown around it.
sticker() {
  magick "$BOARD/$1.png" -resize "$2" -channel RGB -fill "$BLACK" -colorize 100 +channel -bordercolor none -border 60 \
    \( +clone -alpha extract -morphology Close Disk:20 -morphology Dilate Disk:40 -background "$LIME" -alpha shape \) \
    +swap -compose over -composite "$BRAND/$3"
}

tint logo-horizontal "$OFF_WHITE" 2400x lockup-on-dark.png
tint logo-horizontal "$BLACK" 2400x lockup-on-light.png

tint bruxa-surfista "$OFF_WHITE" 1600x witch-light.png
tint bruxa-surfista "$BLACK" 1600x witch-dark.png
sticker bruxa-surfista 1400x sticker-witch.png

tint mago-teclado "$BLACK" 1600x mago-dark.png
sticker mago-teclado 1400x sticker-mago.png
sticker mago-ola-mundo 1600x sticker-mago-ola.png

for piece in logo-assinatura logo-abstracao magia-explosao magia-brilho-violeta magia-estrela magia-brilhos magia-estrela-pixel icone-seta icone-codigo; do
  magick "$BOARD/$piece.png" -resize '1200x1200>' "$BRAND/$piece.png"
done

# Pixelated circle: drawn small without antialiasing, tilted, then enlarged with hard edges.
magick -size 64x34 xc:none +antialias -stroke "$LIME" -strokewidth 2 -fill none \
  -draw "ellipse 32,17 29,14 0,360" -background none -rotate -4 -trim +repage -bordercolor none -border 1 \
  -filter point -resize 1000% "$BRAND/pixel-circle.png"

echo "brand pieces written to $BRAND"
