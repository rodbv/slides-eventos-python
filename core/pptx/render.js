// Renders dist/pybr2026-template.pptx through LibreOffice: a PDF, one PNG per slide
// in dist/preview/, a contact sheet, an animated tour of a few slides for the README, and
// the .odp copy of the deck with its fonts embedded.
// Needs `soffice` on PATH (LibreOffice), `pdftoppm` (poppler) and ImageMagick 6 or 7.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const DIST = path.join(ROOT, "dist");
const BUILD = path.join(ROOT, "build");
const PREVIEW = path.join(DIST, "preview");
const DECK = path.join(DIST, "pybr2026-template.pptx");

// Slides for the README tour, by number: a sample of the dark layouts, the light ones and the stickers.
const TOUR = [1, 2, 3, 6, 9, 12, 14, 17, 18, 20, 22, 23, 38];
const TOUR_SECONDS = 2.5;

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

// ImageMagick 7 runs every tool through `magick`; version 6, the one Ubuntu ships, has one binary per tool.
const hasMagick = (() => {
  try {
    execFileSync("magick", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
function imagemagick(tool, args) {
  if (hasMagick) run("magick", tool === "convert" ? args : [tool, ...args]);
  else run(tool, args);
}

fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(PREVIEW, { recursive: true });
for (const f of fs.readdirSync(BUILD)) if (/^slide-.*\.png$|\.pdf$/.test(f)) fs.unlinkSync(path.join(BUILD, f));
for (const f of fs.readdirSync(PREVIEW)) if (f.endsWith(".png")) fs.unlinkSync(path.join(PREVIEW, f));

run("soffice", ["--headless", "--convert-to", "pdf", "--outdir", BUILD, DECK]);
run("soffice", ["--headless", "--convert-to", "odp", "--outdir", DIST, DECK]);
run("python3", [path.join(__dirname, "embed_fonts.py"), path.join(DIST, "pybr2026-template.odp")]);
const pdf = path.join(BUILD, "pybr2026-template.pdf");
run("pdftoppm", ["-png", "-r", "110", pdf, path.join(PREVIEW, "slide")]);

const slides = fs.readdirSync(PREVIEW).filter((f) => /^slide-.*\.png$/.test(f)).sort().map((f) => path.join(PREVIEW, f));
imagemagick("montage", [...slides, "-tile", "4x", "-geometry", "440x248+6+6", "-background", "#2A2A2A", path.join(PREVIEW, "overview.png")]);
const tour = TOUR.map((n) => slides[n - 1]);
imagemagick("convert", ["-delay", String(TOUR_SECONDS * 100), "-loop", "0", ...tour, "-resize", "880x", "-colors", "128", "-layers", "Optimize", path.join(PREVIEW, "tour.gif")]);
console.log(`${slides.length} slides rendered to ${path.relative(ROOT, PREVIEW)}`);
