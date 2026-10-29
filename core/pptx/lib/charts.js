// pptxgenjs writes chart categories as a multi-level reference even when there is one level.
// Google Slides does not read that form and labels the axis 1, 2, 3; PowerPoint writes a
// plain string reference for one level, which every program reads.
const fs = require("fs");

function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

const SINGLE_LEVEL = /<c:multiLvlStrRef>\s*(<c:f>[^<]*<\/c:f>)\s*<c:multiLvlStrCache>\s*(<c:ptCount val="\d+"\/>)\s*<c:lvl>((?:(?!<c:lvl>).)*?)<\/c:lvl>\s*<\/c:multiLvlStrCache>\s*<\/c:multiLvlStrRef>/gs;

async function plainCategories(deckPath) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(deckPath));
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/charts\/chart[^/]*\.xml$/.test(name)) continue;
    const xml = await zip.file(name).async("string");
    const out = xml.replace(SINGLE_LEVEL, "<c:strRef>$1<c:strCache>$2$3</c:strCache></c:strRef>");
    if (out !== xml) zip.file(name, out);
  }
  fs.writeFileSync(deckPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { plainCategories };
