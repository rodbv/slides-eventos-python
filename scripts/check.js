// Checks the contrast of every color pair in each event's brand.css, in the dark and the
// light version, against WCAG 2.1 AA, and fails when a pair is below its minimum.
//
//   node scripts/check.js                       all events
//   node scripts/check.js python-cerrado-2026   one event
const fs = require("fs");
const path = require("path");
const { loadEvent } = require("../core/event");

const ROOT = path.resolve(__dirname, "..");

// [foreground, background, minimum]: text needs 4.5:1, the edge of a filled shape 3:1.
const PAIRS = [
  ["text", "bg", 4.5],
  ["text", "card", 4.5],
  ["muted", "bg", 4.5],
  ["accent", "bg", 4.5],
  ["link", "bg", 4.5],
  ["on-fill", "fill", 4.5],
  ["fill-edge", "bg", 3],
];

function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const all = fs.readdirSync(path.join(ROOT, "events")).filter((name) => !name.startsWith("_"));
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : all;
let failures = 0;

for (const slug of slugs) {
  if (!all.includes(slug)) throw new Error(`events/${slug} does not exist`);
  const ev = loadEvent(ROOT, slug);
  console.log(`\n${slug}`);
  for (const [version, colors] of [["escuro", ev.dark], ["claro", ev.light]]) {
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(colors[fg], colors[bg]);
      const ok = ratio >= min;
      if (!ok) failures++;
      console.log(`  ${ok ? "ok   " : "FALHA"} ${version.padEnd(7)} --${fg} #${colors[fg]} sobre --${bg} #${colors[bg]}: ${ratio.toFixed(2)}:1 (mínimo ${min}:1)`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} par(es) abaixo do contraste mínimo. Veja "As cores" no CONTRIBUTING.md.`);
  process.exit(1);
}
