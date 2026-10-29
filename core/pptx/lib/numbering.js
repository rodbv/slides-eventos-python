// pptxgenjs writes startAt="1" on every numbered paragraph. PowerPoint continues the count
// across paragraphs, but LibreOffice restarts it at each one, so every item shows "1.".
// startAt defaults to 1, so dropping it keeps the deck the same in PowerPoint.
const fs = require("fs");

function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

async function continueNumbering(deckPath) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(deckPath));
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts)\/[^/]+\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async("string");
    const out = xml.replace(/(<a:buAutoNum\b[^>]*?) startAt="1"/g, "$1");
    if (out !== xml) zip.file(name, out);
  }
  fs.writeFileSync(deckPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { continueNumbering };
