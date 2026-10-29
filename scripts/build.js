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
const node = (script, ...args) => execFileSync("node", [path.join(ROOT, script), ...args], { stdio: "inherit", cwd: ROOT });

for (const slug of slugs.length ? slugs : all) {
  if (!all.includes(slug)) throw new Error(`events/${slug} does not exist`);
  for (const version of ["escuro", "claro"]) {
    node("core/pptx/build.js", slug, version);
    node("core/pptx/render.js", slug, version);
  }
  node("core/marp/build.js", slug);
}
node("scripts/site.js");
