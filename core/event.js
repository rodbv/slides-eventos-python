// Reads an event folder: brand.css holds the colors and fonts as CSS variables, one per
// line, in a dark block (:root) and a light block (section.light) that inherits the dark
// one; event.json holds the texts and the image paths.
const fs = require("fs");
const path = require("path");

const ROLES = ["bg", "text", "muted", "accent", "link", "card", "card-outline", "image-outline", "fill", "on-fill", "fill-edge"];
const FONTS = ["font-head", "font-body", "font-code"];

function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`brand.css has no "${selector} {" block`);
  const body = css.slice(start, css.indexOf("}", start));
  const vars = {};
  for (const [, name, value] of body.matchAll(/--([a-z-]+):\s*([^;]+);/g)) vars[name] = value.trim();
  return vars;
}

function colors(vars, where) {
  const out = {};
  for (const role of ROLES) {
    const value = vars[role];
    if (!/^#[0-9a-fA-F]{6}$/.test(value || "")) throw new Error(`brand.css ${where}: --${role} must be a six-digit hex color, got ${JSON.stringify(value)}`);
    out[role] = value.slice(1).toUpperCase();
  }
  return out;
}

// PNG keeps its size at bytes 16 to 24 of the IHDR chunk.
function pngRatio(file) {
  const head = fs.readFileSync(file).subarray(0, 24);
  if (head.toString("latin1", 1, 4) !== "PNG") throw new Error(`${file} is not a PNG`);
  return head.readUInt32BE(20) / head.readUInt32BE(16);
}

// Tips that state facts about an event or speak for its organizers. The defaults hold for any
// event; event.json overrides them under "textos", and an empty recadoDaOrganizacao drops that tip.
const TEXTOS = {
  duvidas: "Tirar dúvidas com a organização",
  vespera: "Voz e descanso em dia",
  antesDaPalestra: "Testar o projetor e o microfone",
  ajudaNaSala: "Se faltar alguma coisa na sala, como projetor ou microfone, procure a organização do evento.",
  ajudaConduta: "Se você sofrer ou presenciar assédio, discriminação ou humilhação, procure a organização do evento.",
  recadoDaOrganizacao: "",
};

function textos(event, slug) {
  const unknown = Object.keys(event.textos || {}).filter((key) => !(key in TEXTOS));
  if (unknown.length) throw new Error(`events/${slug}/event.json: unknown textos ${unknown.join(", ")}; expected ${Object.keys(TEXTOS).join(", ")}`);
  return { ...TEXTOS, ...event.textos };
}

function loadEvent(root, slug) {
  const dir = path.join(root, "events", slug);
  const css = fs.readFileSync(path.join(dir, "brand.css"), "utf8");
  const dark = block(css, ":root");
  const light = { ...dark, ...block(css, "section.light") };
  const fonts = {};
  for (const name of FONTS) {
    if (!dark[name]) throw new Error(`brand.css :root: --${name} is missing`);
    fonts[name] = dark[name].replace(/^["']|["'],?.*$/g, "");
  }
  const event = JSON.parse(fs.readFileSync(path.join(dir, "event.json"), "utf8"));
  event.textos = textos(event, slug);
  const image = (rel) => {
    const file = path.join(dir, rel);
    if (!fs.existsSync(file)) throw new Error(`events/${slug}/${rel} does not exist`);
    return { file, ratio: pngRatio(file) };
  };
  const pair = (spec) => spec && { dark: image(spec.escuro), light: image(spec.claro), alt: spec.alt };
  const extraFile = path.join(dir, "extra.js");
  return {
    slug,
    dir,
    event,
    dark: colors(dark, ":root"),
    light: colors(light, "section.light"),
    fonts: { head: fonts["font-head"], body: fonts["font-body"], code: fonts["font-code"] },
    logo: pair(event.logo),
    watermark: pair(event.marcaDagua),
    extra: fs.existsSync(extraFile) ? require(extraFile) : null,
  };
}

module.exports = { loadEvent };
