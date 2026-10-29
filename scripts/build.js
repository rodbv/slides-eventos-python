// Builds every file of one event, or of all events, and then the site pages.
//
//   node scripts/build.js                       all events
//   node scripts/build.js python-cerrado-2026   one event
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const slugs = process.argv.slice(2);
const all = fs.readdirSync(path.join(ROOT, "events")).filter((name) => !name.startsWith("_"));

for (const slug of slugs.length ? slugs : all) {
  if (!all.includes(slug)) throw new Error(`events/${slug} does not exist`);
  for (const step of ["core/pptx/build.js", "core/pptx/render.js", "core/marp/build.js"]) {
    execFileSync("node", [path.join(ROOT, step), slug], { stdio: "inherit", cwd: ROOT });
  }
}
execFileSync("node", [path.join(__dirname, "site.js")], { stdio: "inherit", cwd: ROOT });
