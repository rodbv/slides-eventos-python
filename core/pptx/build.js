// Builds dist/pybr2026-template.pptx: a themed deck whose layouts carry the
// Python Brasil 2026 brand, with one example slide per layout.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const QRCode = require("qrcode");
const { applyTheme } = require("./lib/theme");
const { continueNumbering } = require("./lib/numbering");
const { fixNotes } = require("./lib/notes");
const { plainCategories } = require("./lib/charts");
const { highlightCode, CODE_TEXT_COLOR } = require("./lib/highlight");

const ROOT = path.resolve(__dirname, "../..");
const BRAND = path.join(ROOT, "events", "python-brasil-2026", "assets");
const DIST = path.join(ROOT, "dist");
const BUILD = path.join(ROOT, "build");
const OUT = path.join(DIST, "pybr2026-template.pptx");

const THEME = {
  name: "Python Brasil 2026",
  headFontFace: "Cascadia Mono",
  // Cores do brandboard: preto, off white, verde cítrico e violeta, com os tons de apoio.
  bodyFontFace: "Roboto",
  colors: {
    dk1: "0F0F0F", // preto (fundo escuro, texto no claro)
    lt1: "FFFFFF", // branco (fundo claro)
    dk2: "1A1A1A", // quase preto de apoio
    lt2: "E8F4BA", // off white (texto no escuro, cartões no claro)
    accent1: "B7FF06", // verde cítrico: texto só sobre escuro; preenchimento com texto preto em ambos
    accent2: "BF2EB2", // violeta: links e destaques sobre fundo claro (4,9:1)
    accent3: "D26CC9", // violeta claro do brandboard: links sobre fundo escuro (6,1:1)
    accent4: "E7E7E7", // cinza claro de apoio
    accent5: "ABABAB", // cinza: texto secundário sobre fundo escuro
    accent6: "4A4A4A", // grafite: texto secundário sobre fundo claro
    hlink: "D26CC9",
    folHlink: "BF2EB2",
  },
};
const HEX = THEME.colors;
// Links are underlined brand violet. On black the violet falls to 3.9:1, so dark slides use its light tint.
const LINK_ON_DARK = HEX.accent3;
const LINK_ON_LIGHT = HEX.accent2;

const W = 10;
const H = 5.625;
const M = 0.5; // margem lateral
const TITLE = { x: M, y: 0.3, w: W - 2 * M, h: 0.75 };
const BODY = { x: M, y: 1.45, w: W - 2 * M, h: 3.3 };
const TEXT_COL_W = 4.4;
const IMAGE_RIGHT_W = W - M - (M + TEXT_COL_W + 0.4);
// 16:10, the ratio of most screenshots and laptop screens.
const IMAGE_RIGHT = { x: M + TEXT_COL_W + 0.4, y: BODY.y, w: IMAGE_RIGHT_W, h: IMAGE_RIGHT_W / 1.6 };
const IMAGE_LEFT = { x: 0, y: 0, w: 4.4, h: H };
const PHOTO = { x: M, y: 1.3, w: 3.0, h: 3.0 };
const SHOT_GAP = 0.3;
const SHOT_W = (W - 2 * M - 2 * SHOT_GAP) / 3;
const SHOT = { w: SHOT_W, h: SHOT_W / 1.6 };
const shotBox = (i) => ({ x: M + i * (SHOT.w + SHOT_GAP), y: BODY.y, ...SHOT });
const TEXT_W = 8.0; // keeps body lines under about 60 characters at 20 pt
const FOOTER_Y = 5.15;
const LANG = "pt-BR";
const NOTES = require(`./notes.${LANG}.js`);
const { CAPS_SPACING, capitalizeMarkedRuns } = require("./lib/caps");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Python Brasil 2026: modelo de apresentação";
pres.subject = "Modelo de slides para palestrantes e organização da Python Brasil 2026";
pres.author = "Comunidade Python Brasil";
pres.company = "Python Brasil 2026";
pres.lang = LANG;
const C = pres.SchemeColor;

// pptxgenjs stores one copy of an image per layout that uses it, so images repeated on
// every layout are resized to the size they show at before the deck is written.
const RESIZED = [];
function resized(src, size) {
  const out = path.join(BUILD, `${path.basename(src, ".png")}-${size.width || size.height}.png`);
  RESIZED.push({ src, out, size });
  return out;
}

// Two color modes share every layout definition. Lime fills (discs, table header, text
// highlight) carry black text in both modes; as a text color, lime is used only on dark.
const DARK = {
  suffix: "",
  bg: HEX.dk1,
  text: C.background2,
  textHex: HEX.lt2,
  muted: C.accent5,
  mutedHex: HEX.accent5,
  cardHex: "242424",
  outlineHex: "3A3A3A",
  limeEdgeHex: HEX.accent1,
  accent: C.accent1,
  accentHex: HEX.accent1,
  watermark: resized(path.join(BRAND, "witch-light.png"), { height: 700 }),
  lockup: resized(path.join(BRAND, "lockup-on-dark.png"), { width: 1600 }),
  lockupSmall: resized(path.join(BRAND, "lockup-on-dark.png"), { width: 440 }),
};
const LIGHT = {
  suffix: " (claro)",
  bg: "FFFFFF",
  text: C.text1,
  textHex: HEX.dk1,
  muted: C.accent6,
  mutedHex: HEX.accent6,
  cardHex: HEX.lt2,
  outlineHex: "C9D9A0",
  // Lime on white is 1.2:1, so lime shapes get a black edge, as the brand's stickers do.
  limeEdgeHex: HEX.dk1,
  // On white, the brand's own pages use black text with lime fills, so the accent is black.
  accent: C.text1,
  accentHex: HEX.dk1,
  watermark: resized(path.join(BRAND, "witch-dark.png"), { height: 700 }),
  lockup: resized(path.join(BRAND, "lockup-on-light.png"), { width: 1600 }),
  lockupSmall: resized(path.join(BRAND, "lockup-on-light.png"), { width: 440 }),
};
const LIME = HEX.accent1;
const ON_LIME = HEX.dk1;

// ---------- layout building blocks ----------

const MAGO_RATIO = 1520 / 1982;
const WITCH_RATIO = 1600 / 1374;
const LOCKUP_RATIO = 1190 / 2400;
const PIXEL_CIRCLE_RATIO = 350 / 650;

// Content slides carry the event name as quiet text; the logo itself appears only on the
// cover, section and closing slides, where it does not compete with the content.
function footer(mode, x = M) {
  return [{ text: { text: "Python Brasil 2026", options: { x, y: FOOTER_Y - 0.07, w: 3, h: 0.3, fontSize: 12, color: mode.mutedHex, fontFace: THEME.headFontFace, margin: 0, valign: "middle", lang: LANG } } }];
}

const BRAND_LOCKUP_W = 1.1;
function brandFooter(mode) {
  const h = BRAND_LOCKUP_W * LOCKUP_RATIO;
  return [{ image: { x: M, y: H - 0.25 - h, w: BRAND_LOCKUP_W, h, path: mode.lockupSmall, altText: "python brasil 2026" } }];
}

function slideNumber(mode) {
  return { x: W - M - 0.6, y: FOOTER_Y - 0.07, w: 0.6, h: 0.3, fontSize: 12, color: mode.mutedHex, align: "right", fontFace: THEME.headFontFace };
}

function ph(name, type, box, text, options = {}) {
  return { placeholder: { options: { name, type, ...box, margin: 0, lang: LANG, valign: "top", ...options }, text } };
}

// Content titles go uppercase with a thin rule below, as on the brand's pages. pptxgenjs
// has no all-caps option, so the 1 pt letter spacing marks these runs for lib/caps.js.
const TITLE_RULE_Y = 1.15;
function titlePh(mode, box = TITLE, text = "Título do slide") {
  return ph("title", "title", box, text, { fontSize: 28, bold: true, color: mode.text, align: "left", valign: "bottom", fit: "shrink", charSpacing: CAPS_SPACING });
}

function titleRule(mode, x = 0) {
  return { line: { x, y: TITLE_RULE_Y, w: W - x, h: 0, line: { color: mode.textHex, width: 0.75 } } };
}

// defineSlideMaster only knows rect, text, image, line and chart objects; a text object
// with a shape gives layouts their circles and rounded cards.
function shape(kind, box, fillHex, options = {}, text = " ") {
  return { text: { text, options: { shape: kind, ...box, fill: { color: fillHex }, line: { color: fillHex, width: 0 }, ...options } } };
}

function bodyPh(mode, name, box, text = "Clique para adicionar texto", options = {}) {
  return ph(name, "body", box, text, { fontSize: 20, color: mode.text, bullet: { indent: 20 }, paraSpaceAfter: 10, fit: "shrink", ...options });
}

function headingPh(mode, name, box, text, options = {}) {
  return ph(name, "body", box, text, { fontSize: 22, bold: true, color: mode.accent, fontFace: THEME.headFontFace, fit: "shrink", ...options });
}

// A surface needs an outline: its fill alone is about 1.1:1 against either background.
function surface(mode, kind, box, options = {}) {
  return shape(kind, box, mode.cardHex, { line: { color: mode.outlineHex, width: 1 }, ...options });
}

// Light slides frame images in gray: the green card outline would tint the photo edge.
function imagePh(mode, name, box, text = "Clique no ícone ou arraste uma imagem", outlineHex = mode === LIGHT ? "C8C8C8" : mode.outlineHex) {
  return ph(name, "pic", box, text, { fontSize: 14, color: mode.muted, align: "center", valign: "middle", fill: { color: mode.cardHex }, line: { color: outlineHex, width: 1 } });
}

function defineLayout(name, mode, objects, extra = {}) {
  pres.defineSlideMaster({
    title: name + mode.suffix,
    background: { color: mode.bg },
    slideNumber: slideNumber(mode),
    objects: [...footer(mode), ...objects],
    ...extra,
  });
}

// Cover, section and closing slides open or close a part of the talk: they show the logo
// and leave the slide number out.
function defineBrandLayout(name, mode, objects) {
  pres.defineSlideMaster({ title: name + mode.suffix, background: { color: mode.bg }, objects: [...brandFooter(mode), ...objects] });
}

// A layout whose first object is the slide title gets the rule below it.
function defineTitledLayout(name, mode, objects) {
  defineLayout(name, mode, [titleRule(mode), ...objects]);
}

// ---------- layouts ----------

function coverLockup(mode, { x = W - M - 4.0, y = 2.2, w = 4.0 } = {}) {
  return [{ image: { x, y, w, h: w * LOCKUP_RATIO, path: mode.lockup, altText: "python brasil 2026" } }];
}

for (const mode of [DARK, LIGHT]) {
  // Capa: o disco limão com a data repete o selo da página do evento
  const dateD = 1.7;
  pres.defineSlideMaster({
    title: "Capa" + mode.suffix,
    background: { color: mode.bg },
    objects: [
      ...coverLockup(mode),
      // The date sits in its own text box: an ellipse only lays text out in its inscribed rectangle.
      shape("ellipse", { x: W - M - dateD, y: 0.3, w: dateD, h: dateD }, LIME),
      { text: { text: "14 a 19\nde outubro\nde 2026\n{Floripa/SC}", options: { x: W - M - dateD, y: 0.3, w: dateD, h: dateD, fontSize: 14, bold: true, fontFace: THEME.headFontFace, color: ON_LIME, align: "center", valign: "middle", margin: 0, isTextBox: true, lang: LANG } } },
      ph("title", "title", { x: M, y: 0.6, w: 4.6, h: 2.6 }, "Título da palestra", { fontSize: 36, bold: true, color: mode.accent, align: "left", valign: "bottom", fit: "shrink" }),
      ph("subtitle", "body", { x: M, y: 3.35, w: 4.6, h: 0.5 }, "Subtítulo ou frase de efeito", { fontSize: 20, color: mode.text, fit: "shrink" }),
      ph("speaker", "body", { x: M, y: 4.0, w: 4.6, h: 0.5 }, "Nome da pessoa palestrante · @usuario", { fontSize: 18, bold: true, color: mode.text, fit: "shrink" }),
    ],
  });

  // Encerramento ("Valeu!" ou "Perguntas?"): o QR code grande leva o público aos slides
  const qrD = 3.3;
  const qrX = W - M - qrD;
  const closeW = qrX - 0.5 - M;
  pres.defineSlideMaster({
    title: "Encerramento" + mode.suffix,
    background: { color: mode.bg },
    objects: [
      ph("title", "title", { x: M, y: 0.8, w: closeW, h: 1.4 }, "Valeu!", { fontSize: 44, bold: true, color: mode.accent, align: "left", valign: "bottom", fit: "shrink" }),
      bodyPh(mode, "body", { x: M, y: 2.4, w: closeW, h: 2.3 }, "Contatos: handle, e-mail, site", { bullet: false }),
      // On white slides the QR code's own white margin frames it, so a green outline would show as a stray line.
      imagePh(mode, "qr", { x: qrX, y: 0.55, w: qrD, h: qrD }, "QR code com o link dos slides", mode === LIGHT ? "FFFFFF" : mode.outlineHex),
      ph("qrCaption", "body", { x: qrX, y: 0.55 + qrD + 0.1, w: qrD, h: 0.8 }, "endereço.com.br/slides", { fontSize: 16, color: mode.text, fontFace: THEME.headFontFace, align: "center", fit: "shrink" }),
    ],
  });

  defineTitledLayout("Agenda", mode, [
    titlePh(mode, TITLE, "Agenda"),
    bodyPh(mode, "body", { ...BODY, w: TEXT_W }, "Tópico", { fontSize: 24, bullet: { type: "number", indent: 34 }, paraSpaceAfter: 14 }),
  ]);

  // Seção: disco limão com o número, título à direita, dragão translúcido ao fundo
  const secD = 1.9;
  const markH = 2.6;
  const watermark = { image: { x: W - markH * WITCH_RATIO + 0.5, y: H - markH + 0.25, w: markH * WITCH_RATIO, h: markH, path: mode.watermark, transparency: 88 } };
  defineBrandLayout("Seção", mode, [
    watermark,
    shape("ellipse", { x: M, y: 1.85, w: secD, h: secD }, LIME),
    ph("number", "body", { x: M, y: 1.85, w: secD, h: secD }, "01", { fontSize: 40, bold: true, color: ON_LIME, align: "center", valign: "middle", fontFace: THEME.headFontFace }),
    ph("title", "title", { x: M + secD + 0.4, y: 1.6, w: 4.6, h: 2.4 }, "Título da seção", { fontSize: 34, bold: true, color: mode.text, align: "left", valign: "middle", fit: "shrink" }),
  ]);

  defineTitledLayout("Título e conteúdo", mode, [titlePh(mode), bodyPh(mode, "body", { ...BODY, w: TEXT_W })]);

  defineTitledLayout("Somente título", mode, [titlePh(mode)]);

  // Duas colunas: o título de cada coluna tem espaço reservado próprio
  const colGap = 0.5;
  const colW = (W - 2 * M - colGap) / 2;
  const colHeadH = 0.5;
  const colBodyY = BODY.y + colHeadH + 0.15;
  defineTitledLayout("Duas colunas", mode, [
    titlePh(mode),
    headingPh(mode, "leftTitle", { x: M, y: BODY.y, w: colW, h: colHeadH }, "Título da coluna"),
    bodyPh(mode, "left", { x: M, y: colBodyY, w: colW, h: BODY.y + BODY.h - colBodyY }),
    headingPh(mode, "rightTitle", { x: M + colW + colGap, y: BODY.y, w: colW, h: colHeadH }, "Título da coluna"),
    bodyPh(mode, "right", { x: M + colW + colGap, y: colBodyY, w: colW, h: BODY.y + BODY.h - colBodyY }),
  ]);

  defineTitledLayout("Texto e imagem", mode, [
    titlePh(mode),
    bodyPh(mode, "body", { ...BODY, w: TEXT_COL_W }),
    imagePh(mode, "image", IMAGE_RIGHT),
  ]);

  pres.defineSlideMaster({
    title: "Imagem e texto" + mode.suffix,
    background: { color: mode.bg },
    slideNumber: slideNumber(mode),
    objects: [
      ...footer(mode, 4.9),
      titleRule(mode, 4.4),
      imagePh(mode, "image", IMAGE_LEFT),
      titlePh(mode, { x: 4.9, y: TITLE.y, w: W - 4.9 - M, h: TITLE.h }),
      bodyPh(mode, "body", { x: 4.9, y: BODY.y, w: W - 4.9 - M, h: BODY.h }),
    ],
  });

  // Três imagens: capturas de tela lado a lado, cada uma com legenda
  const shots = [];
  for (let i = 0; i < 3; i++) {
    const box = shotBox(i);
    shots.push(imagePh(mode, `image${i + 1}`, box));
    shots.push(bodyPh(mode, `caption${i + 1}`, { x: box.x, y: BODY.y + SHOT.h + 0.15, w: SHOT.w, h: 0.75 }, "Legenda curta", { bullet: false, fontSize: 18, paraSpaceAfter: 0 }));
  }
  defineTitledLayout("Três imagens", mode, [titlePh(mode), ...shots]);

  // Código: cartão claro em ambos os modos, porque código se lê melhor em fundo claro
  const codeCard = (box) => shape("roundRect", box, "FFFFFF", { rectRadius: 0.1, line: { color: "D0D7DE", width: 1 } });
  const codePh = (name, box, text) => ph(name, "body", box, text, { fontSize: 15, color: CODE_TEXT_COLOR, fontFace: THEME.headFontFace, paraSpaceAfter: 0, lineSpacing: 17, fit: "shrink" });
  const codeH = 2.85;
  defineTitledLayout("Código", mode, [
    titlePh(mode),
    codeCard({ x: M, y: BODY.y, w: W - 2 * M, h: codeH }),
    codePh("code", { x: M + 0.25, y: BODY.y + 0.15, w: W - 2 * M - 0.5, h: codeH - 0.25 }, "# Até 8 linhas e 60 colunas por slide"),
    bodyPh(mode, "note", { x: M, y: BODY.y + codeH + 0.1, w: W - 2 * M, h: 0.4 }, "O que este trecho mostra", { bullet: false, fontSize: 18, valign: "middle" }),
  ]);

  // Código lado a lado: antes e depois, cada cartão com cerca de 30 colunas
  const pairGap = 0.4;
  const pairW = (W - 2 * M - pairGap) / 2;
  const pairHeadH = 0.45;
  const pairY = BODY.y + pairHeadH + 0.05;
  const pair = [];
  [["leftTitle", "codeLeft", "Antes"], ["rightTitle", "codeRight", "Depois"]].forEach(([head, code, label], i) => {
    const x = M + i * (pairW + pairGap);
    pair.push(headingPh(mode, head, { x, y: BODY.y - 0.05, w: pairW, h: pairHeadH }, label, { fontSize: 20 }));
    pair.push(codeCard({ x, y: pairY, w: pairW, h: codeH }));
    pair.push(codePh(code, { x: x + 0.25, y: pairY + 0.15, w: pairW - 0.5, h: codeH - 0.25 }, "# Até 8 linhas e 30 colunas"));
  });
  defineTitledLayout("Código lado a lado", mode, [titlePh(mode), ...pair]);

  // Citação: as aspas fazem parte do texto, para ficarem sempre junto da primeira linha
  defineLayout("Citação", mode, [
    ph("quote", "body", { x: M, y: 0.6, w: TEXT_W + 0.5, h: 2.4 }, "“A citação vai aqui, em até três linhas.”", { fontSize: 32, color: mode.text, valign: "bottom", fit: "shrink" }),
    ph("author", "body", { x: M, y: 3.15, w: TEXT_W + 0.5, h: 0.5 }, "Nome, cargo ou fonte", { fontSize: 18, color: mode.muted, fontFace: THEME.headFontFace }),
  ]);

  // Frase: uma ideia só, grande, como "Perguntas?"
  // No slide number: the witch watermark fills that corner.
  defineLayout("Frase", mode, [
    watermark,
    ph("title", "title", { x: M, y: 0.9, w: TEXT_W, h: 3.4 }, "Uma frase só", { fontSize: 48, bold: true, color: mode.accent, align: "left", valign: "middle", fit: "shrink" }),
  ], { slideNumber: undefined });

  defineTitledLayout("Referências", mode, [titlePh(mode, TITLE, "Referências"), bodyPh(mode, "body", BODY, "Título do material  endereço.com.br/link", { bullet: false, fontSize: 18, paraSpaceAfter: 12 })]);

  // Três cartões: fundo e numeração fixos no layout; título e texto editáveis
  const cardGap = 0.35;
  const cardW = (W - 2 * M - 2 * cardGap) / 3;
  const badgeD = 0.7;
  const cards = [];
  ["01", "02", "03"].forEach((n, i) => {
    const x = M + i * (cardW + cardGap);
    cards.push(surface(mode, "roundRect", { x, y: BODY.y, w: cardW, h: BODY.h }, { rectRadius: 0.12 }));
    cards.push(shape("ellipse", { x: x + 0.3, y: BODY.y + 0.3, w: badgeD, h: badgeD }, LIME, { fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: ON_LIME, align: "center", valign: "middle", margin: 0, line: { color: mode.limeEdgeHex, width: 1 } }, n));
    cards.push(headingPh(mode, `card${i + 1}Title`, { x: x + 0.3, y: BODY.y + 1.15, w: cardW - 0.6, h: 0.65 }, "Título", { fontSize: 18 }));
    cards.push(bodyPh(mode, `card${i + 1}`, { x: x + 0.3, y: BODY.y + 1.85, w: cardW - 0.6, h: BODY.h - 2.0 }, "Descrição curta", { bullet: false, fontSize: 18, paraSpaceAfter: 6 }));
  });
  defineTitledLayout("Três cartões", mode, [titlePh(mode), ...cards]);

  // Números em destaque: o número grande na cor de destaque, sem moldura, cabe "1.200" ou "R$ 3,5 mi"
  // The gap keeps neighbouring values and labels from reading as one line.
  const statGap = 0.45;
  const statW = (W - 2 * M - 2 * statGap) / 3;
  const stats = [];
  for (let i = 0; i < 3; i++) {
    const x = M + i * (statW + statGap);
    stats.push(ph(`value${i + 1}`, "body", { x, y: 1.75, w: statW, h: 1.4 }, "44", { fontSize: 60, bold: true, fontFace: THEME.headFontFace, color: mode.accent, align: "center", valign: "bottom", fit: "shrink" }));
    stats.push(bodyPh(mode, `label${i + 1}`, { x, y: 3.25, w: statW, h: 0.9 }, "rótulo", { bullet: false, fontSize: 18, align: "center" }));
  }
  defineTitledLayout("Números em destaque", mode, [titlePh(mode), ...stats]);

  defineLayout("Palestrante", mode, [
    imagePh(mode, "photo", PHOTO, "Foto"),
    ph("title", "title", { x: 4.0, y: 1.3, w: W - 4.0 - M, h: 0.9 }, "Nome da pessoa", { fontSize: 30, bold: true, color: mode.text, align: "left", fit: "shrink" }),
    ph("role", "body", { x: 4.0, y: 2.2, w: W - 4.0 - M, h: 0.7 }, "Cargo, empresa ou comunidade", { fontSize: 18, color: mode.accent, fontFace: THEME.headFontFace, fit: "shrink" }),
    bodyPh(mode, "bio", { x: 4.0, y: 3.0, w: W - 4.0 - M, h: 1.8 }, "Três fatos sobre você", { fontSize: 18 }),
  ]);

  // Destaque: a lime panel holds the title, for a message the room must not miss, such as the code of conduct.
  const panelW = 3.7;
  const highlightX = panelW + 0.5;
  pres.defineSlideMaster({
    title: "Destaque" + mode.suffix,
    background: { color: mode.bg },
    slideNumber: slideNumber(mode),
    objects: [
      { rect: { x: 0, y: 0, w: panelW, h: H, fill: { color: LIME }, line: { color: LIME, width: 0 } } },
      ...footer(mode, highlightX),
      ph("title", "title", { x: M, y: 0.7, w: panelW - 2 * M, h: 3.6 }, "Uma mensagem importante", { fontSize: 30, bold: true, color: ON_LIME, align: "left", valign: "middle", fit: "shrink", charSpacing: CAPS_SPACING }),
      bodyPh(mode, "body", { x: highlightX, y: 0.7, w: W - highlightX - M, h: 3.9 }, "Até quatro tópicos curtos", { valign: "middle" }),
    ],
  });

  if (mode === DARK) {
    // The stickers slide closes the deck: title only, no footer or slide number.
    pres.defineSlideMaster({ title: "Figurinhas", background: { color: mode.bg }, objects: [titleRule(mode), titlePh(mode)] });

    pres.defineSlideMaster({
      title: "Imagem cheia",
      background: { color: mode.bg },
      // The caption bar lives on the example slide: slide-level placeholders draw above
      // every layout object, so a bar on the layout would sit under the image.
      objects: [imagePh(mode, "image", { x: 0, y: 0, w: W, h: H }, "Clique no ícone ou arraste uma imagem de fundo")],
    });
  }

  defineLayout("Em branco", mode, []);
}

// ---------- example slides ----------
// Every example slide carries a real tip for the person presenting, so the deck
// teaches the layouts and the craft at the same time.

let notesUsed = 0;
function slide(layout, section) {
  const s = pres.addSlide({ masterName: layout, sectionTitle: section });
  const tips = NOTES[notesUsed++];
  if (!tips) throw new Error(`notes.${LANG}.js has no notes for slide ${notesUsed}`);
  s.addNotes(tips.map((tip) => `• ${tip}`).join("\n"));
  return s;
}

function bullets(items) {
  return items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } }));
}

// pptxgenjs applies the placeholder's numbering to the first paragraph only, so each item repeats it.
function numbered(items) {
  return items.map((t, i) => ({ text: t, options: { bullet: { type: "number", indent: 34 }, breakLine: i < items.length - 1 } }));
}

// The brand's marker pen: black bold text on a lime highlight, readable on both backgrounds.
function marked(text) {
  return { text, options: { highlight: LIME, color: ON_LIME, bold: true } };
}

function quoted(text, accentHex) {
  const mark = (m) => ({ text: m, options: { color: accentHex, bold: true } });
  return [mark("“"), { text }, mark("”")];
}

// A clickable address, written without the scheme as the slides show it.
function link(address, linkHex, options = {}) {
  return { text: address, options: { hyperlink: { url: `https://${address}` }, color: linkHex, underline: { style: "sng", color: linkHex }, fontFace: THEME.headFontFace, ...options } };
}

function fill(sl, texts) {
  for (const [placeholder, text] of Object.entries(texts)) sl.addText(text, { placeholder });
}

function coverSlide(mode, section, title, subtitle) {
  const sl = slide("Capa" + mode.suffix, section);
  fill(sl, {
    title,
    subtitle,
    speaker: [{ text: "Seu nome aqui", options: { bold: true } }, { text: "  ·  @seu_usuario", options: { bold: false, color: mode.mutedHex } }],
  });
}

const QR_PATH = path.join(BUILD, "qr-exemplo.png");
const QR_BOX = { x: W - M - 3.3, y: 0.55, w: 3.3, h: 3.3 }; // same box as the layout's qr placeholder
const QR_URL = "https://2026.pythonbrasil.org.br/";

// pptxgenjs writes into the options it receives, so each slide gets its own copy.
const contacts = (mode) => [
  { text: "Seu nome aqui", options: { bold: true, color: mode.textHex, breakLine: true } },
  { text: "@seu_usuario", options: { fontFace: THEME.headFontFace, fontSize: 18, color: mode.textHex, breakLine: true } },
  { text: "voce@exemplo.com.br", options: { fontFace: THEME.headFontFace, fontSize: 18, color: mode.textHex } },
];

function closingSlide(mode, section, title, body = contacts(mode)) {
  const sl = slide("Encerramento" + mode.suffix, section);
  // The caption tells the speaker to replace the QR code; on their slides it holds the link.
  fill(sl, { title, body, qrCaption: "Troque pelo seu QR code:\ncontato, slides ou site" });
  sl.addImage({ placeholder: "qr", path: QR_PATH, ...QR_BOX, altText: `QR code para ${QR_URL}` });
  return sl;
}

// Example slides fill their image slots with a labeled placeholder image, so the slot reads
// as "your image goes here"; "Substituir imagem" keeps the size and the position.
const EXAMPLES = path.join(ROOT, "core", "exemplos");
function exampleImage(sl, mode, placeholder, file, box) {
  const alt = file.startsWith("foto") ? "Espaço para a sua foto" : "Espaço para a sua imagem";
  sl.addImage({ placeholder, path: path.join(EXAMPLES, file + ".png"), ...box, altText: alt });
}

// Native chart with sample data that anyone reads at once, so the slide shows how to replace it.
function chartSlide(mode, section) {
  const sl = slide("Somente título" + mode.suffix, section);
  sl.addText("Versão do Python que você usa (%)", { placeholder: "title" });
  sl.addChart(
    pres.ChartType.bar,
    [{ name: "Pessoas (%)", labels: ["Python 3.10", "Python 3.11", "Python 3.12", "Python 3.13", "Python 3.14"], values: [8, 15, 29, 33, 15] }],
    {
      x: M, y: BODY.y, w: W - 2 * M, h: BODY.h - 0.5,
      barDir: "col",
      // Lime bars on both backgrounds: the value labels carry the numbers, so the bars need no text contrast.
      chartColors: [LIME],
      dataBorder: { pt: 1, color: mode.limeEdgeHex },
      showValue: true,
      dataLabelFormatCode: '0"%"',
      dataLabelPosition: "outEnd",
      dataLabelColor: mode.textHex,
      dataLabelFontSize: 14,
      dataLabelFontBold: true,
      dataLabelFontFace: THEME.bodyFontFace,
      catAxisLabelColor: mode.textHex,
      catAxisLabelFontSize: 14,
      catAxisLabelFontFace: THEME.bodyFontFace,
      catAxisLineShow: false,
      valAxisHidden: true,
      valGridLine: { style: "none" },
      catGridLine: { style: "none" },
      showLegend: false,
      showTitle: false,
    }
  );
  sl.addText("Dados de exemplo. Para trocar os dados, veja as anotações deste slide.", { x: M, y: BODY.y + BODY.h - 0.4, w: W - 2 * M, h: 0.4, fontSize: 18, color: mode.mutedHex, fontFace: THEME.bodyFontFace, margin: 0, valign: "middle", isTextBox: true, lang: LANG });
}

// Flowchart: plain shapes, so a step is added by duplicating a box and an arrow.
function flowSlide(mode, section, title, steps) {
  const sl = slide("Somente título" + mode.suffix, section);
  sl.addText(title, { placeholder: "title" });
  const gap = 0.55;
  const w = (W - 2 * M - (steps.length - 1) * gap) / steps.length;
  const h = 1.3;
  const y = 2.45;
  // Arrows take the accent color: lime on dark, black on white.
  const arrowHex = mode === DARK ? LIME : LIGHT.textHex;
  steps.forEach((step, i) => {
    const x = M + i * (w + gap);
    // The last step carries the lime, as the outcome of the flow.
    const last = i === steps.length - 1;
    sl.addText(step, {
      shape: pres.ShapeType.roundRect, x, y, w, h, rectRadius: 0.12,
      fill: { color: last ? LIME : mode.cardHex }, line: { color: last ? mode.limeEdgeHex : mode.outlineHex, width: 1.5 },
      fontSize: 18, bold: last, color: last ? ON_LIME : mode.textHex, fontFace: THEME.bodyFontFace, align: "center", valign: "middle", margin: 0.1, lang: LANG,
      objectName: `Passo ${i + 1}`,
    });
    if (!last) {
      sl.addShape(pres.ShapeType.line, {
        x: x + w + 0.08, y: y + h / 2, w: gap - 0.16, h: 0,
        line: { color: arrowHex, width: 2.5, endArrowType: "triangle" }, objectName: `Seta ${i + 1}`,
      });
    }
  });
}

const ESCURO = "Layouts escuros";
pres.addSection({ title: ESCURO });

coverSlide(DARK, ESCURO,
  "Título da sua palestra",
  "Modelo de slides da Python Brasil 2026");

let s = slide("Frase", ESCURO);
fill(s, { title: "A sala está torcendo por você." });
s.addText("Cada slide deste modelo traz dicas nas anotações.", { x: M, y: 4.0, w: TEXT_W, h: 0.5, fontSize: 20, color: DARK.textHex, fontFace: THEME.bodyFontFace, margin: 0, valign: "top", isTextBox: true, lang: LANG });

s = slide("Palestrante", ESCURO);
fill(s, {
  title: "Seu nome aqui",
  role: "O que você faz · onde",
  bio: bullets(["Quem abre a sessão costuma apresentar você", "Com o tempo curto, este slide pode sair", "Uma autodescrição ajuda quem não vê"]),
});
exampleImage(s, DARK, "photo", "foto", PHOTO);

s = slide("Citação", ESCURO);
fill(s, {
  quote: quoted("Legibilidade conta.", LIME),
  author: "The Zen of Python, PEP 20",
});
// The context line lives on the slide, not the layout: other quotes do not need it.
s.addText([{ text: "Dicas, " }, marked("não regras"), { text: ": use as que servirem para você." }], { x: M, y: 3.75, w: TEXT_W + 0.5, h: 0.5, fontSize: 20, color: DARK.textHex, fontFace: THEME.bodyFontFace, margin: 0, valign: "top", isTextBox: true, lang: LANG });

s = slide("Título e conteúdo", ESCURO);
fill(s, {
  title: "Na hora de começar",
  body: bullets([
    "Solte o ar devagar antes da primeira frase",
    "O público está do seu lado",
    "Fale com calma e respire entre as frases",
    "A palestra é sua, no seu ritmo",
  ]),
});

s = slide("Agenda", ESCURO);
fill(s, {
  title: "Agenda",
  body: numbered([
    "A agenda mostra o caminho da palestra",
    "Três a cinco partes costumam bastar",
    "Volte a este slide entre uma parte e outra",
    "Cada parte pode abrir com um slide de seção",
    "Opcional: pode sair se o tempo for curto",
  ]),
});

s = slide("Seção", ESCURO);
fill(s, { number: "01", title: "Uma seção para cada parte da agenda" });

s = slide("Duas colunas", ESCURO);
fill(s, {
  title: "Texto no slide",
  leftTitle: "Em vez de",
  left: bullets(["Parágrafos inteiros", "Ler o slide em voz alta", "Diminuir a fonte para caber", "A “colinha” no slide"]),
  rightTitle: "Experimente",
  right: bullets(["Uma ideia por slide", "Falar o que o slide não diz", "Dividir em dois slides", "A “colinha” nas anotações do slide"]),
});

s = slide("Texto e imagem", ESCURO);
fill(s, {
  title: "Imagens que explicam",
  body: bullets(["Um diagrama no lugar de um parágrafo", "Uma imagem por ideia", "Descreva para quem não vê"]),
});
exampleImage(s, DARK, "image", "imagem-caixa", IMAGE_RIGHT);

s = slide("Imagem e texto", ESCURO);
fill(s, {
  title: "Licença e crédito",
  body: bullets(["Fotos suas ou de licença livre", "A licença permite este uso?", "Crédito da autoria no slide", "Pelo menos 1080 px de altura"]),
});
exampleImage(s, DARK, "image", "imagem-lado", IMAGE_LEFT);

s = slide("Três imagens", ESCURO);
fill(s, {
  title: "Capturas de tela legíveis",
  caption1: "Só a parte que importa",
  caption2: "Fonte grande antes de capturar",
  caption3: "Sem senhas, tokens nem e-mails",
});
[0, 1, 2].forEach((i) => exampleImage(s, DARK, `image${i + 1}`, "captura", shotBox(i)));

const SAMPLE_CODE = `@dataclass
class Palestra:
    titulo: str
    duracao_min: int = 25

    def cabe_no_slot(self, slot_min: int) -> bool:
        # Reserva 5 minutos para perguntas
        return self.duracao_min + 5 <= slot_min
`;

function codeSlide(layout, section, tip) {
  const sl = slide(layout, section);
  fill(sl, { title: "Código com cores", code: highlightCode(SAMPLE_CODE, "python"), note: tip });
  return sl;
}
s = codeSlide("Código", ESCURO, [
  { text: "Dica: ", options: { bold: true } },
  { text: "gere o código colorido no " },
  link("slidesnippet.com", LINK_ON_DARK),
  { text: ", tema GitHub Light." },
]);
// The wizard sticker from the stickers slide, in the empty corner of the code card, as an example of use.
s.addImage({ path: resized(path.join(BRAND, "sticker-mago.png"), { width: 600 }), x: 8.2, y: 2.75, w: 1.6 * MAGO_RATIO, h: 1.6, altText: "Figurinha do mago digitando no teclado" });

const LONG_CODE = `from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class Palestra:
    titulo: str
    inicio: datetime
    duracao_min: int = 25

    @property
    def fim(self) -> datetime:
        return self.inicio + timedelta(minutes=self.duracao_min)

    def conflita_com(self, outra: "Palestra") -> bool:
        return self.inicio < outra.fim and outra.inicio < self.fim

    def cabe_no_slot(self, slot_min: int) -> bool:
        # Reserva 5 minutos para perguntas
        return self.duracao_min + 5 <= slot_min
`;
// The whole class at 6 pt shows what a long snippet looks like from the back of the room.
const tiny = (runs) => runs.map((r) => ({ ...r, options: { ...r.options, fontSize: 6, lineSpacing: 7.5 } }));

s = slide("Código lado a lado", ESCURO);
fill(s, {
  title: "Um exemplo menor também ensina",
  leftTitle: "Muito pequeno para ler 😟",
  codeLeft: tiny(highlightCode(LONG_CODE)),
  rightTitle: "Dá para ler do fundo 😊",
  codeRight: highlightCode(`def cabe(palestra, slot):
    # 5 min para perguntas
    fim = palestra.duracao + 5
    return fim <= slot
`),
});

s = slide("Números em destaque", ESCURO);
s.addText("Três números que ajudam", { placeholder: "title" });
[["18", "pontos de letra: dá para ler do fundo da sala"], ["1", "ensaio em voz alta mostra o tempo real"], ["5", "minutos para perguntas no fim"]].forEach(([v, l], i) => {
  fill(s, { [`value${i + 1}`]: v, [`label${i + 1}`]: l });
});
// The pixel circle from the stickers slide, around the middle number, as an example of use.
s.addImage({ path: path.join(BRAND, "pixel-circle.png"), x: 4.1, y: 2.0, w: 1.8, h: 1.2, altText: "Círculo pixelado limão em volta do número 1" });

s = slide("Três cartões", ESCURO);
s.addText("Antes de subir ao palco", { placeholder: "title" });
[
  ["Live coding", "Plano B: capturas de tela ou um vídeo da demo."],
  ["Internet", "Com vídeos e páginas baixados, você não depende da rede."],
  ["PDF", "Leve os slides em PDF num pendrive."],
].forEach(([h, t], i) => fill(s, { [`card${i + 1}Title`]: h, [`card${i + 1}`]: t }));

s = slide("Somente título", ESCURO);
s.addText("O seu dia de palestra", { placeholder: "title" });
const tableHead = { bold: true, color: HEX.dk1, fill: { color: HEX.accent1 } };
const tableCell = { color: DARK.textHex, fill: { color: DARK.cardHex } };
const row = (cells, options) => cells.map((text) => ({ text, options }));
s.addTable(
  [
    row(["Quando", "Sugestão"], tableHead),
    ...[
      ["Antes do evento", "Tirar dúvidas no grupo de palestrantes no Telegram"],
      ["Na véspera", "Pega leve no karaokê :P Voz e descanso em dia"],
      ["No dia", "Chegar cedo e conhecer a sala"],
      ["15 min antes", "Dar um oi ao voluntariado da sala"],
      ["Na palestra", "Microfone perto da boca, mesmo ao olhar para o telão"],
      ["Depois", "Publicar os slides no link do QR code"],
    ].map((cells) => row(cells, tableCell)),
  ],
  { x: M, y: BODY.y, w: W - 2 * M, colW: [2.2, 6.8], fontSize: 18, fontFace: THEME.bodyFontFace, rowH: 0.48, border: { type: "solid", pt: 1, color: HEX.dk1 }, margin: 0.08, valign: "middle", lang: LANG }
);

chartSlide(DARK, ESCURO);

flowSlide(DARK, ESCURO, "Um dia de evento", ["Palestras", "Coffee break", "Lightning talks", "PyRolê"]);

s = slide("Imagem cheia", ESCURO);
// The example image fills the placeholder; an empty placeholder would be drawn above the caption.
exampleImage(s, DARK, "image", "fundo", { x: 0, y: 0, w: W, h: H });
s.addShape(pres.ShapeType.rect, { x: 0, y: H - 0.9, w: W, h: 0.9, fill: { color: HEX.dk1, transparency: 25 }, line: { color: HEX.dk1, width: 0 }, objectName: "Faixa da legenda" });
s.addText("Legenda da foto. Foto: Nome da pessoa · CC BY 4.0", { x: M, y: H - 0.75, w: W - 2 * M, h: 0.6, fontSize: 18, color: DARK.textHex, valign: "middle", isTextBox: true, margin: 0, lang: LANG });

s = slide("Destaque", ESCURO);
fill(s, {
  title: "Sua palestra é para todo mundo",
  body: bullets([
    "O público inclui crianças: conteúdo para todas as idades",
    "Humor que não ridiculariza ninguém, exemplos sem estereótipos",
    "Na dúvida sobre algum conteúdo, a organização ajuda",
  ]),
});

s = slide("Referências", ESCURO);
s.addText("Referências", { placeholder: "title" });
const reference = ([name, url], i, all) => [
  { text: name + "  ", options: {} },
  link(url, LINK_ON_DARK, { breakLine: i < all.length - 1 }),
];
s.addText([
  ["Código de conduta da Python Brasil", "python.org.br/cdc"],
  ["Código colorido para slides", "slidesnippet.com"],
  ["Fontes Roboto e Cascadia Mono", "fonts.google.com"],
  ["Verificador de contraste", "webaim.org/resources/contrastchecker"],
].flatMap(reference), { placeholder: "body" });

closingSlide(DARK, ESCURO, "Perguntas?");

// ----- light variants -----
const CLARO = "Layouts claros";
pres.addSection({ title: CLARO });

coverSlide(LIGHT, CLARO,
  "Título da sua palestra",
  "Versão clara, para projetor, TV ou monitor");

s = slide("Seção (claro)", CLARO);
fill(s, { number: "02", title: "Uma pausa para respirar e beber água" });

s = slide("Título e conteúdo (claro)", CLARO);
fill(s, {
  title: "A sua tela no telão",
  body: bullets([
    "Notificações desligadas (modo Não incomodar)",
    "Papel de parede neutro",
    "Só as abas e os programas da palestra",
    "Janela anônima: o histórico não aparece ao digitar endereços",
  ]),
});

s = slide("Duas colunas (claro)", CLARO);
fill(s, {
  title: "Um ensaio em voz alta ajuda",
  leftTitle: "Ensaiar",
  left: bullets(["Com cronômetro", "Com alguém assistindo", "No computador da palestra"]),
  rightTitle: "Cortar",
  right: bullets(["O que passar do tempo", "Detalhes que cabem nas anotações", "Slides que você pula ao ensaiar"]),
});

s = slide("Texto e imagem (claro)", CLARO);
fill(s, {
  title: "Imagens acessíveis",
  body: bullets(["Texto alternativo em toda imagem", "Legenda curta se a imagem não for óbvia", "Cor e emoji ajudam, mas não sozinhos"]),
});
exampleImage(s, LIGHT, "image", "imagem-caixa", IMAGE_RIGHT);

s = slide("Imagem e texto (claro)", CLARO);
fill(s, {
  title: "Falar com a sala",
  body: bullets(["Olhar para o público, se for confortável", "As anotações do slide como apoio", "Apontar com palavras, não com o mouse"]),
});
exampleImage(s, LIGHT, "image", "imagem-lado", IMAGE_LEFT);

codeSlide("Código (claro)", CLARO, [
  { text: "Prefere fundo escuro para o código? ", options: { bold: true } },
  { text: "Use o tema Monokai e deixe a fonte bem grande." },
]);

s = slide("Citação (claro)", CLARO);
// Light slides mark the key word with the lime highlight, as the brand's light pages do.
const [open, , close] = quoted("", HEX.dk1);
fill(s, { quote: [open, marked("Pessoas"), { text: " > Tecnologia" }, close], author: "Comunidade Python Brasil, 2016" });

s = slide("Frase (claro)", CLARO);
fill(s, { title: "Menos texto, letra maior." });

s = slide("Destaque (claro)", CLARO);
fill(s, {
  title: "Fale de um jeito que acolha",
  body: bullets([
    "Mostre o passo a passo em vez de dizer que é fácil",
    "Explique cada sigla na primeira vez",
    "Pergunte quem já usou em vez de supor",
  ]),
});

s = slide("Três cartões (claro)", CLARO);
s.addText("Depois da palestra", { placeholder: "title" });
[
  ["Anotações", "Anote o que funcionou, para a próxima palestra."],
  ["Conversa", "Fique por perto: muitas perguntas aparecem no corredor."],
  ["Descanso", "Aproveite o resto do evento. Você mereceu."],
].forEach(([h, t], i) => fill(s, { [`card${i + 1}Title`]: h, [`card${i + 1}`]: t }));

s = slide("Palestrante (claro)", CLARO);
fill(s, {
  title: "Seu nome aqui",
  role: "Pronomes, cargo e comunidade",
  bio: bullets(["Onde o público encontra você", "Três fatos, não um currículo", "Uma foto recente"]),
});
exampleImage(s, LIGHT, "photo", "foto", PHOTO);

flowSlide(LIGHT, CLARO, "Do rascunho ao palco", ["Escrever os slides", "Ensaiar em voz alta", "Exportar em PDF", "Apresentar"]);

chartSlide(LIGHT, CLARO);

closingSlide(LIGHT, CLARO, "Valeu!");

// ----- stickers -----
const FIGURINHAS = "Figurinhas";
pres.addSection({ title: FIGURINHAS });
s = slide("Figurinhas", FIGURINHAS);
s.addText("Figurinhas", { placeholder: "title" });
// A Florianópolis greeting for whoever reads the template to the end.
s.addText("Dazumbanho! Chegasse ao fim, ixtepô!", { x: W - M - 6.2, y: 0.45, w: 6.2, h: 0.6, fontSize: 20, bold: true, color: LIME, fontFace: THEME.headFontFace, align: "right", valign: "middle", margin: 0, isTextBox: true, lang: LANG, objectName: "Fim do modelo" });
const sticker = (file, box, altText) => s.addImage({ path: resized(path.join(BRAND, file), { width: 900 }), ...box, altText });
const ICON_RATIO = 1058 / 1200;
sticker("lockup-on-dark.png", { x: M, y: 1.7, w: 2.3, h: 2.3 * LOCKUP_RATIO }, "Logo python brasil 2026 com o dragão");
sticker("sticker-witch.png", { x: 3.0, y: 1.55, w: 1.4 * (1520 / 1322), h: 1.4 }, "Figurinha da bruxinha surfista com contorno limão");
sticker("sticker-mago-ola.png", { x: 4.8, y: 1.55, w: 1.4 * (1720 / 1282), h: 1.4 }, "Figurinha do mago dizendo Olá, mundo!, com contorno limão");
sticker("sticker-mago.png", { x: 6.95, y: 1.5, w: 1.5 * MAGO_RATIO, h: 1.5 }, "Figurinha do mago digitando no teclado, com contorno limão");
sticker("magia-explosao.png", { x: 8.45, y: 1.75, w: 1.0, h: 1.0 }, "Explosão de magia limão");
sticker("logo-assinatura.png", { x: M, y: 3.45, w: 2.3, h: 2.3 * (570 / 1200) }, "Assinatura PythonBrasil com o dragão");
s.addImage({ path: path.join(BRAND, "pixel-circle.png"), x: 3.0, y: 3.45, w: 2.0, h: 2.0 * PIXEL_CIRCLE_RATIO, altText: "Círculo pixelado limão para marcar uma palavra" });
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

// ---------- write ----------
(async () => {
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });
  // pptxgenjs reads image files only when it writes the deck, so the resized images and the QR code can be made here.
  for (const { src, out, size } of RESIZED) await sharp(src).resize(size).png().toFile(out);
  await QRCode.toFile(QR_PATH, QR_URL, { margin: 2, width: 800, color: { dark: "#0F0F0FFF", light: "#FFFFFFFF" } });
  if (notesUsed !== NOTES.length) throw new Error(`notes.${LANG}.js has ${NOTES.length} notes for ${notesUsed} slides`);
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  await continueNumbering(OUT);
  await plainCategories(OUT);
  await fixNotes(OUT, LANG);
  await capitalizeMarkedRuns(OUT);
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
