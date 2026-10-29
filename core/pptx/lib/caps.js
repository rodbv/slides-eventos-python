// pptxgenjs cannot write all-caps text, so text that should render in capitals carries
// a marker letter spacing (CAPS_SPACING points), and capitalizeMarkedRuns adds cap="all"
// to every run with that spacing, on the layouts and on the slides. The text itself
// stays as typed, so a speaker can still turn the capitals off in the font dialog.
const fs = require("fs");

const CAPS_SPACING = 1;
const MARK = ` spc="${CAPS_SPACING * 100}"`;

function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

async function capitalizeMarkedRuns(deckPath) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(deckPath));
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts)\/[^/]+\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async("string");
    const out = xml.replaceAll(MARK, `${MARK} cap="all"`);
    if (out !== xml) zip.file(name, out);
  }
  fs.writeFileSync(deckPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { CAPS_SPACING, capitalizeMarkedRuns };
