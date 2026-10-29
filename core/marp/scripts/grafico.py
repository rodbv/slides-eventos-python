# /// script
# dependencies = ["matplotlib"]
# ///
"""Gera o gráfico de exemplo nas cores da {{nome}}, em versão escura e clara.
Troque os rótulos e os valores pelos seus dados e rode de novo:

    uv run scripts/grafico.py
"""

from pathlib import Path

import matplotlib.pyplot as plt

DESTAQUE = "#{{fill}}"
TEXTO_ESCURO = "#{{dark.text}}"
TEXTO_CLARO = "#{{light.text}}"
BORDA_CLARO = "#{{light.fill-edge}}"
FONTE = "{{fonteTexto}}"

IMG = Path(__file__).resolve().parent.parent / "img"

ROTULOS = ["Python 3.10", "Python 3.11", "Python 3.12", "Python 3.13", "Python 3.14"]
VALORES = [8, 15, 29, 33, 15]


def grafico(arquivo: str, texto: str, borda: str) -> None:
    plt.rcParams["font.family"] = [FONTE, "DejaVu Sans"]
    fig, ax = plt.subplots(figsize=(11.5, 4.6), dpi=150)
    # O número sobre cada barra leva a informação; no fundo claro, a borda dá contraste à barra.
    barras = ax.bar(ROTULOS, VALORES, color=DESTAQUE, edgecolor=borda, linewidth=2, width=0.5)
    ax.bar_label(barras, labels=[f"{v}%" for v in VALORES], padding=8, color=texto, fontsize=26, fontweight="bold")
    ax.tick_params(axis="x", colors=texto, labelsize=24, length=0)
    ax.set_yticks([])
    for lado in ax.spines.values():
        lado.set_visible(False)
    fig.tight_layout()
    # Fundo transparente: o gráfico pega a cor do slide, sem um retângulo em volta.
    fig.savefig(IMG / arquivo, transparent=True)


grafico("grafico-exemplo.png", TEXTO_ESCURO, DESTAQUE)
grafico("grafico-exemplo-claro.png", TEXTO_CLARO, BORDA_CLARO)
