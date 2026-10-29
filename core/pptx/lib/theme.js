// pptxgenjs writes the theme fonts but hard-codes Office's stock palette, so every
// scheme color resolves to Office blue until the deck's own colors replace it in
// ppt/theme/theme1.xml. Run this after pres.writeFile().
const fs = require("fs");

const SLOTS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function themeXml(xml, theme) {
  const name = escapeAttr(theme.name);
  for (const k of SLOTS) {
    if (!/^[0-9A-Fa-f]{6}$/.test(String(theme.colors[k]))) {
      throw new Error(`theme.colors.${k} must be six hex digits, got ${JSON.stringify(theme.colors[k])}`);
    }
  }
  const scheme =
    `<a:clrScheme name="${name}">` +
    SLOTS.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k].toUpperCase()}"/></a:${k}>`).join("") +
    "</a:clrScheme>";
  const out = xml
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${name}"`);
  if (!out.includes(scheme)) throw new Error("ppt/theme/theme1.xml has no <a:clrScheme>");
  return out;
}

async function applyTheme(deckPath, theme) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(deckPath));
  const part = "ppt/theme/theme1.xml";
  if (!zip.file(part)) throw new Error(`${deckPath} has no ${part}`);
  zip.file(part, themeXml(await zip.file(part).async("string"), theme));

  // A scheme color passed to a hex-only option is written as <a:srgbClr val="bg2"/>,
  // which is not a color. Refuse to write such a deck.
  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith(".xml")) continue;
    const bad = (await zip.file(name).async("string")).match(/<a:srgbClr val="((?![0-9A-Fa-f]{6}")[^"]*)"/);
    if (bad) throw new Error(`${name}: <a:srgbClr val="${bad[1]}"> is not a hex color; pass hex to that option`);
  }
  fs.writeFileSync(deckPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { applyTheme };
