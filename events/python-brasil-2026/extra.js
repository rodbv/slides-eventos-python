// Python Brasil 2026 pieces outside the common template: the wizard on the code slide,
// the pixel circle on the numbers slide and the stickers slide that closes the deck.
const path = require("path");

const ASSETS = path.join(__dirname, "assets");
const MAGO_RATIO = 1520 / 1982;
const PIXEL_CIRCLE_RATIO = 350 / 650;
const ICON_RATIO = 1058 / 1200;

module.exports = {
  layouts({ pres, mode, titlePh, titleRule }) {
    // The stickers slide closes the deck: title only, no footer or slide number.
    pres.defineSlideMaster({ title: "Figurinhas", background: { color: mode.bg }, objects: [titleRule(mode), titlePh(mode)] });
  },

  decorate: {
    // The wizard sticker from the stickers slide, in the empty corner of the code card, as an example of use.
    codigo(s, { resized }) {
      s.addImage({ path: resized(path.join(ASSETS, "sticker-mago.png"), { width: 600 }), x: 8.2, y: 2.75, w: 1.6 * MAGO_RATIO, h: 1.6, altText: "Figurinha do mago digitando no teclado" });
    },
    // The pixel circle from the stickers slide, around the middle number, as an example of use.
    numeros(s) {
      s.addImage({ path: path.join(ASSETS, "pixel-circle.png"), x: 4.1, y: 2.0, w: 1.8, h: 1.2, altText: "Círculo pixelado limão em volta do número 1" });
      return ["O círculo pixelado é uma figurinha: arraste para outro número ou apague."];
    },
  },

  slides({ pres, slide, resized, link, marked, THEME, LANG, W, M, LIME, LINK_ON_DARK, LOCKUP_RATIO, DARK }) {
    const FIGURINHAS = "Figurinhas";
    pres.addSection({ title: FIGURINHAS });
    const s = slide("Figurinhas", FIGURINHAS, [
      "Copie uma figurinha e cole no seu slide. Para mudar o tamanho sem deformar, arraste um canto segurando Shift.",
      "A figurinha marca-texto é um realce: troque a palavra dela ou aplique o realce verde limão #B7FF06 numa palavra sua.",
      "Uma figurinha por slide costuma bastar.",
    ]);
    s.addText("Figurinhas", { placeholder: "title" });
    // A Florianópolis greeting for whoever reads the template to the end.
    s.addText("Dazumbanho! Chegasse ao fim, ixtepô!", { x: W - M - 6.2, y: 0.45, w: 6.2, h: 0.6, fontSize: 20, bold: true, color: LIME, fontFace: THEME.headFontFace, align: "right", valign: "middle", margin: 0, isTextBox: true, lang: LANG, objectName: "Fim do modelo" });
    const sticker = (file, box, altText) => s.addImage({ path: resized(path.join(ASSETS, file), { width: 900 }), ...box, altText });
    sticker("lockup-on-dark.png", { x: M, y: 1.7, w: 2.3, h: 2.3 * LOCKUP_RATIO }, "Logo python brasil 2026 com o dragão");
    sticker("sticker-witch.png", { x: 3.0, y: 1.55, w: 1.4 * (1520 / 1322), h: 1.4 }, "Figurinha da bruxinha surfista com contorno limão");
    sticker("sticker-mago-ola.png", { x: 4.8, y: 1.55, w: 1.4 * (1720 / 1282), h: 1.4 }, "Figurinha do mago dizendo Olá, mundo!, com contorno limão");
    sticker("sticker-mago.png", { x: 6.95, y: 1.5, w: 1.5 * MAGO_RATIO, h: 1.5 }, "Figurinha do mago digitando no teclado, com contorno limão");
    sticker("magia-explosao.png", { x: 8.45, y: 1.75, w: 1.0, h: 1.0 }, "Explosão de magia limão");
    sticker("logo-assinatura.png", { x: M, y: 3.45, w: 2.3, h: 2.3 * (570 / 1200) }, "Assinatura PythonBrasil com o dragão");
    s.addImage({ path: path.join(ASSETS, "pixel-circle.png"), x: 3.0, y: 3.45, w: 2.0, h: 2.0 * PIXEL_CIRCLE_RATIO, altText: "Círculo pixelado limão para marcar uma palavra" });
    s.addText("olha aqui", { x: 3.0, y: 3.45, w: 2.0, h: 2.0 * PIXEL_CIRCLE_RATIO, fontSize: 20, bold: true, color: DARK.textHex, fontFace: THEME.headFontFace, align: "center", valign: "middle", margin: 0, isTextBox: true, lang: LANG });
    sticker("icone-seta.png", { x: 7.9, y: 3.6, w: 0.75, h: 0.75 * ICON_RATIO }, "Ícone de seta pixelada sobre quadrado limão");
    sticker("icone-codigo.png", { x: 8.75, y: 3.6, w: 0.75, h: 0.75 * ICON_RATIO }, "Ícone de código pixelado sobre quadrado limão");
    // Credit to the designer of the brand identity, with a link to her site.
    s.addText(
      [
        { text: "Identidade visual de Ana Terhorst, " },
        link("anaterhorstdesign.com", LINK_ON_DARK),
        { text: ". Valeu, Ana!" },
      ],
      { x: M, y: 4.62, w: W - 2 * M, h: 0.35, fontSize: 16, color: DARK.textHex, fontFace: THEME.headFontFace, valign: "middle", margin: 0, isTextBox: true, lang: LANG, objectName: "Crédito da identidade visual" },
    );
    // The marker is the native text highlight, black on lime, so it follows edits and reads on dark and on white slides.
    s.addText([marked("marca-texto")], { x: 5.15, y: 3.65, w: 2.6, h: 0.6, fontSize: 26, fontFace: THEME.headFontFace, align: "center", valign: "middle", margin: 0, isTextBox: true, lang: LANG, objectName: "Marca-texto limão" });
  },
};
