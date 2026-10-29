// pptxgenjs writes a notes page as wide as the slide is tall (5.625 in), but lays out its
// notes master for the standard 7.5 x 10 in page, so the slide image and the notes run
// past the right edge in LibreOffice's Notes view and in printed notes.
// It also tags the notes as en-US, which sends Portuguese notes to the English spell
// checker, and LibreOffice ignores the master's 12 pt, so each run carries both.
const fs = require("fs");

const NOTES_SIZE = '<p:notesSz cx="6858000" cy="9144000"/>';

function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

function notesRunProps(xml, lang) {
  return xml.replace(/<a:(rPr|endParaRPr) lang="en-US"/g, `<a:$1 lang="${lang}" sz="1200"`);
}

// pptxgenjs keeps the line breaks of a note inside one run, where the apps show them as
// spaces; each line becomes its own paragraph instead.
function splitNoteLines(xml, lang) {
  const newParagraph = `</a:t></a:r></a:p><a:p><a:r><a:rPr lang="${lang}" sz="1200" dirty="0"/><a:t>`;
  return xml.replace(/<a:t>([^<]*)<\/a:t>/g, (run, text) => (/\r?\n/.test(text) ? `<a:t>${text.split(/\r?\n/).join(newParagraph)}</a:t>` : run));
}

async function fixNotes(deckPath, lang) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(deckPath));
  const part = "ppt/presentation.xml";
  const xml = await zip.file(part).async("string");
  const out = xml.replace(/<p:notesSz\b[^>]*\/>/, NOTES_SIZE);
  if (!out.includes(NOTES_SIZE)) throw new Error(`${part} has no <p:notesSz>`);
  zip.file(part, out);
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)) continue;
    zip.file(name, splitNoteLines(notesRunProps(await zip.file(name).async("string"), lang), lang));
  }
  fs.writeFileSync(deckPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { fixNotes };
