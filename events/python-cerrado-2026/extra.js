// Python Cerrado 2026 pieces outside the common template: the stickers slide that closes the deck,
// with the logo, the tree and the details of the event's posts.
const path = require("path");

const ASSETS = path.join(__dirname, "assets");
const TREE_RATIO = 546 / 588;

module.exports = {
  layouts({ pres, mode, titlePh, titleRule }) {
    // The stickers slide closes the deck: title only, no footer or slide number.
    pres.defineSlideMaster({ title: "Figurinhas", background: { color: mode.bg }, objects: [titleRule(mode), titlePh(mode)] });
  },

  slides({ pres, slide, resized, marked, THEME, LANG, M, LIME, ON_LIME, LOCKUP_RATIO, DARK }) {
    const FIGURINHAS = "Figurinhas";
    pres.addSection({ title: FIGURINHAS });
    const s = slide("Figurinhas", FIGURINHAS, [
      "Copie uma figurinha e cole no seu slide. Para mudar o tamanho sem deformar, arraste um canto segurando Shift.",
      "A pílula, o rótulo e a barra vêm dos posts da Python Cerrado: troque o texto e use no slide de abertura ou de seção.",
      "A figurinha marca-texto é um realce: troque a palavra dela ou aplique o realce ocre numa palavra sua.",
      "Uma figurinha por slide costuma bastar.",
    ]);
    s.addText("Figurinhas", { placeholder: "title" });
    const head = { fontFace: THEME.headFontFace, margin: 0, isTextBox: true, lang: LANG };

    s.addImage({ path: DARK.lockup, x: M, y: 1.85, w: 2.6, h: 2.6 * LOCKUP_RATIO, altText: "Logo da Python Cerrado" });
    s.addImage({ path: resized(path.join(ASSETS, "arvore-escuro.png"), { width: 900 }), x: 3.55, y: 1.45, w: 1.7 * TREE_RATIO, h: 1.7, altText: "Árvore de circuito sobre o disco ocre, do logo da Python Cerrado" });
    // The date pill of the posts, in ocre: the posts' green pill disappears on the green background.
    s.addText("Sáb, 07/11 · 15:30", { ...head, shape: pres.ShapeType.roundRect, rectRadius: 0.28, x: 5.75, y: 1.95, w: 2.7, h: 0.56, fill: { color: LIME }, line: { color: LIME, width: 0 }, fontSize: 20, bold: true, color: ON_LIME, align: "center", valign: "middle", objectName: "Pílula de data" });

    s.addText("PALESTRA", { ...head, x: M, y: 3.55, w: 2.6, h: 0.45, fontSize: 20, bold: true, charSpacing: 2, color: LIME, valign: "middle", objectName: "Rótulo" });
    s.addShape(pres.ShapeType.rect, { x: M, y: 4.2, w: 1.1, h: 0.09, fill: { color: LIME }, line: { color: LIME, width: 0 }, objectName: "Barra ocre" });
    s.addText([marked("marca-texto")], { ...head, x: 3.55, y: 3.6, w: 2.6, h: 0.6, fontSize: 26, align: "center", valign: "middle", objectName: "Marca-texto ocre" });
  },
};
