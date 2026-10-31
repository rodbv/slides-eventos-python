// Python Cerrado 2026 pieces outside the common template: the details of the event's posts (a pill
// on the code slide, a short ocre bar on the speaker and closing slides) and the stickers slide that
// closes the deck, with the logo and the tree.
const path = require("path");

const ASSETS = path.join(__dirname, "assets");
const TREE_RATIO = 546 / 588;

module.exports = {
  layouts({ pres, mode, titlePh, titleRule }) {
    // The stickers slide closes the deck: title only, no footer or slide number.
    pres.defineSlideMaster({ title: "Figurinhas", background: { color: mode.bg }, objects: [titleRule(mode), titlePh(mode)] });
  },

  decorate: {
    codigo(s, { pill, mode, W, M }) {
      pill(s, mode, "Python 3.10+", { x: W - M - 1.8, y: 0.55, w: 1.8, h: 0.42 }, { objectName: "Pílula de versão" });
      return ["A pílula mostra a versão que o código precisa: troque o texto ou apague."];
    },
    palestrante(s, { pres, LIME }) {
      bar(s, pres, LIME, { x: 4.0, y: 2.72 });
    },
    encerramento(s, { pres, LIME, M }) {
      bar(s, pres, LIME, { x: M, y: 2.27 });
    },
  },

  slides({ pres, slide, resized, marked, pill, THEME, LANG, M, LIME, LOCKUP_RATIO, DARK }) {
    const FIGURINHAS = "Figurinhas";
    pres.addSection({ title: FIGURINHAS });
    const s = slide("Figurinhas", FIGURINHAS, [
      "Copie uma figurinha e cole no seu slide. Para mudar o tamanho sem deformar, arraste um canto segurando Shift.",
      "A pílula, o rótulo e a barra vêm dos posts da Python Cerrado. A pílula e a barra já aparecem na capa, no código e nos slides com o seu nome; o rótulo cabe acima do título da capa ou de uma seção.",
      "A figurinha marca-texto é um realce: troque a palavra dela ou aplique o realce ocre numa palavra sua.",
      "Uma figurinha por slide costuma bastar.",
    ]);
    s.addText("Figurinhas", { placeholder: "title" });
    const head = { fontFace: THEME.headFontFace, margin: 0, isTextBox: true, lang: LANG };

    s.addImage({ path: DARK.lockup, x: M, y: 1.85, w: 2.6, h: 2.6 * LOCKUP_RATIO, altText: "Logo da Python Cerrado" });
    s.addImage({ path: resized(path.join(ASSETS, "arvore-escuro.png"), { width: 900 }), x: 3.55, y: 1.45, w: 1.7 * TREE_RATIO, h: 1.7, altText: "Árvore de circuito sobre o disco ocre, do logo da Python Cerrado" });
    pill(s, DARK, "Sáb, 07/11 · 15:30", { x: 5.75, y: 1.95, w: 2.7, h: 0.56 }, { fontSize: 20, objectName: "Pílula de dia e hora" });

    s.addText("PALESTRA", { ...head, x: M, y: 3.55, w: 2.6, h: 0.45, fontSize: 20, bold: true, charSpacing: 2, color: LIME, valign: "middle", objectName: "Rótulo" });
    bar(s, pres, LIME, { x: M, y: 4.2 });
    s.addText([marked("marca-texto")], { ...head, x: 3.55, y: 3.6, w: 2.6, h: 0.6, fontSize: 26, align: "center", valign: "middle", objectName: "Marca-texto ocre" });
  },
};

// The short ocre bar of the posts, which separates a name from the text around it.
function bar(s, pres, color, { x, y }) {
  s.addShape(pres.ShapeType.rect, { x, y, w: 1.1, h: 0.09, fill: { color }, line: { color, width: 0 }, objectName: "Barra ocre" });
}
