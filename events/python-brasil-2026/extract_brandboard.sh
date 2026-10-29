#!/usr/bin/env bash
# Crops the logos, illustrations, icons and patterns out of the official brandboard PDF
# into events/python-brasil-2026/brandboard/, as transparent PNGs at 600 dpi. The brandboard is the
# designer's file and is not in this repository, so its output stays out of git too.
#   events/python-brasil-2026/extract_brandboard.sh [path/to/PYBR-BRANDBOARD.pdf]
# Needs poppler (`pdftocairo`) and ImageMagick 7 (`magick`).
set -euo pipefail

PDF="${1:-$HOME/Downloads/PYBR-BRANDBOARD.pdf}"
OUT="$(cd "$(dirname "$0")" && pwd)/brandboard"
DPI=600
mkdir -p "$OUT"

# Each box is x y width height, in pixels of the page rendered at 40 dpi.
# Extra boxes after the size clear page parts that fall inside the crop, such as labels.
crop() {
  local name="$1" x="$2" y="$3" w="$4" h="$5" k=$((DPI / 40))
  shift 5
  pdftocairo -png -transp -r "$DPI" -singlefile \
    -x $((x * k)) -y $((y * k)) -W $((w * k)) -H $((h * k)) "$PDF" "$OUT/$name"
  local clear=()
  while (($#)); do
    clear+=(-draw "rectangle $((($1 - x) * k)),$((($2 - y) * k)) $((($1 - x + $3) * k)),$((($2 - y + $4) * k))")
    shift 4
  done
  # The boxes are painted black on the alpha channel, which makes them transparent.
  magick "$OUT/$name.png" \( +clone -alpha extract -fill black "${clear[@]}" -alpha off \) \
    -compose copy_opacity -composite -trim +repage "PNG32:$OUT/$name.png"
}

crop logo-assinatura        165  165 610 290  165 216 440 12  312 260 136 40
crop logo-horizontal        315  488 190  95
crop logo-sigla             595  493  75  40
crop logo-abstracao         825  487  82  58

crop magia-estrela-pixel    373  710  77  75
crop magia-estrela          465  698  97  97
crop magia-explosao         583  705  82  82
crop magia-brilho-violeta   368  810  87  87
crop magia-brilhos          483  815  67  76
crop magia-quadrado         585  815  80  77

crop moldura                110 2465 300 220
crop etiqueta-pessoas       110 2685 170  50
crop icone-seta             535 2488 138 118
crop icone-codigo           673 2488 138 118
crop etiqueta-auditorios    533 2650 164  90

crop mago-ola-mundo         205 2910 200 160
crop bruxa-surfista         465 2915 165 140
crop mago-teclado           707 2915 133 160

crop padrao-limao            35 3280 470 280
crop padrao-preto-branco    522 3280 472 280

echo "brandboard pieces written to $OUT"
