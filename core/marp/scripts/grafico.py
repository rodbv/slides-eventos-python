# /// script
# dependencies = ["matplotlib"]
# ///
"""Gera o gráfico de exemplo nas cores da {{nome}}, num cartão branco que serve nas
versões escura e clara. Troque os rótulos e os valores pelos seus dados e rode de novo:

    uv run scripts/grafico.py
"""

from pathlib import Path

import matplotlib.pyplot as plt

DESTAQUE = "#{{fill}}"
TEXTO = "#{{light.text}}"
BORDA = "#{{light.fill-edge}}"
FONTE = "{{fonteTexto}}"

IMG = Path(__file__).resolve().parent.parent / "img"

ROTULOS = ["Python 3.10", "Python 3.11", "Python 3.12", "Python 3.13", "Python 3.14"]
VALORES = [8, 15, 29, 33, 15]

plt.rcParams["font.family"] = [FONTE, "DejaVu Sans"]
fig, ax = plt.subplots(figsize=(11.5, 4.6), dpi=150)
# O número sobre cada barra leva a informação; a borda dá contraste à barra no cartão branco.
barras = ax.bar(ROTULOS, VALORES, color=DESTAQUE, edgecolor=BORDA, linewidth=2, width=0.5)
ax.bar_label(barras, labels=[f"{v}%" for v in VALORES], padding=8, color=TEXTO, fontsize=26, fontweight="bold")
ax.tick_params(axis="x", colors=TEXTO, labelsize=24, length=0)
ax.set_yticks([])
for lado in ax.spines.values():
    lado.set_visible(False)
fig.tight_layout(pad=1.2)
# Fundo branco, como o cartão de código: o gráfico se lê igual nas duas versões.
fig.savefig(IMG / "grafico-exemplo.png", facecolor="white")
