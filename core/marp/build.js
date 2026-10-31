// Builds the Marp version of an event's template:
//   build/<event>/<event>-marp/   the package a speaker downloads (slides.md, theme, img, scripts)
//   dist/<event>/<event>-marp.zip that package, zipped
//   dist/<event>/marp/index.html  the deck as a web page, where the D key switches light and dark
//   dist/<event>/<event>-escuro.pdf and <event>-claro.pdf, the deck as PDFs
// Needs `uv` (Python scripts for the chart and the QR code) and `zip`.
//
//   node core/marp/build.js python-brasil-2026
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { loadEvent } = require("../event");

const ROOT = path.resolve(__dirname, "../..");
const SLUG = process.argv[2];
if (!SLUG) throw new Error("usage: node core/marp/build.js <event folder name>");
const EVENT = loadEvent(ROOT, SLUG);
const EV = EVENT.event;
const PACKAGE_NAME = `${SLUG}-marp`;
const STAGE = path.join(ROOT, "build", SLUG, PACKAGE_NAME);
const DIST = path.join(ROOT, "dist", SLUG);
const EVENT_MARP = path.join(EVENT.dir, "marp");
const MARP = path.join(ROOT, "node_modules", ".bin", "marp");

function run(cmd, args, cwd = ROOT) {
  execFileSync(cmd, args, { stdio: "inherit", cwd });
}

function eventFile(name) {
  const file = path.join(EVENT_MARP, name);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

const fonts = [...new Set([EVENT.fonts.body, EVENT.fonts.head, EVENT.fonts.code])];
const fim = eventFile("fim.md");
const VALUES = {
  tema: SLUG,
  nome: EV.nome,
  nomeCurto: EV.nomeCurto,
  rodape: EV.rodape,
  // With a pill in event.json, the cover shows the talk's day and time in place of the event's date disc.
  "capa:selo": EV.pilula ? `<span class="pilula">${EV.pilula}</span>` : `<div class="selo">${EV.selo.replace(/\n/g, "<br>")}</div>`,
  site: EV.site,
  siteCurto: EV.site.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  "conduta.de": EV.conduta.de,
  "conduta.endereco": EV.conduta.endereco,
  corDestaque: EV.corDestaque,
  fontes: fonts.join(" e "),
  fonteTexto: EVENT.fonts.body,
  fill: EVENT.dark.fill,
  "dark.text": EVENT.dark.text,
  "light.text": EVENT.light.text,
  "light.fill-edge": EVENT.light["fill-edge"],
  "extra:codigo": eventFile("codigo.md"),
  "extra:fim": fim && `---\n\n${fim}`,
};

function fill(template, where) {
  return template.replace(/\{\{([\w.:-]+)\}\}/g, (_, key) => {
    if (!(key in VALUES)) throw new Error(`${where}: unknown placeholder {{${key}}}`);
    return VALUES[key];
  });
}

function copyTemplate(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, fill(fs.readFileSync(from, "utf8"), path.relative(ROOT, from)));
}

// The theme is the brand, the logo variables, the common base and the event's own CSS, in that order.
// The light theme is the same CSS with every `section.light` rule applied to all slides. Marp gives
// `:root` variables priority over `section` ones, so the light variable blocks become `:root` blocks.
function theme(version) {
  const logoVars = (side) => `  --lockup: url("img/logo-${side}.png");\n`;
  const name = version === "claro" ? `${SLUG}-claro` : SLUG;
  const label = version === "claro" ? "versão clara" : "versão escura";
  const css = [
    `/*\n * @theme ${name}\n * @size 16:9 1280px 720px\n *\n * Tema da ${EV.nome} para o Marp, ${label}, gerado por slides-eventos-python.\n */\n`,
    fs.readFileSync(path.join(EVENT.dir, "brand.css"), "utf8"),
    ":root {\n" +
      `  --dark-bg: #${EVENT.dark.bg};\n  --dark-text: #${EVENT.dark.text};\n  --rule: var(--text);\n` +
      logoVars("escuro") +
      "  --marca-dagua: none;\n}\n\nsection.light {\n" +
      logoVars("claro") +
      "}\n",
    fs.readFileSync(path.join(__dirname, "base.css"), "utf8"),
    EV.titulosMaiusculos ? "" : "h2 {\n  text-transform: none;\n  letter-spacing: normal;\n}\n",
    // The footer text stays in the page for screen readers; the logo takes its place on screen.
    EV.rodapeLogo ? "footer {\n  bottom: 22px;\n  width: 96px;\n  height: 34px;\n  font-size: 0;\n  background: var(--lockup) left center / contain no-repeat;\n}\n" : "",
    eventFile("extra.css"),
  ].join("\n");
  if (version !== "claro") return css;
  // The D key script in slides.md toggles `light` and `dark` together; in the light theme only `dark` has rules.
  const d = EVENT.dark;
  const darkVars = `section.dark {\n  --bg: #${d.bg};\n  --text: #${d.text};\n  --muted: #${d.muted};\n  --accent: #${d.accent};\n  --link: #${d.link};\n  --card: #${d.card};\n  --card-outline: #${d["card-outline"]};\n  --fill-edge: #${d["fill-edge"]};\n${logoVars("escuro")}}\n`;
  return css.replace(/^section\.light \{/gm, ":root {").replace(/section\.light\b/g, "section").replace(/\.light\b/g, "") + "\n" + darkVars;
}

fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(path.join(STAGE, "img"), { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

const css = `${SLUG}.css`;
const lightCss = `${SLUG}-claro.css`;
fs.writeFileSync(path.join(STAGE, css), theme("escuro"));
fs.writeFileSync(path.join(STAGE, lightCss), theme("claro"));
copyTemplate(path.join(__dirname, "slides.md"), path.join(STAGE, "slides.md"));
copyTemplate(path.join(__dirname, "LEIA-ME.md"), path.join(STAGE, "LEIA-ME.md"));
// AGENTS.md guides an AI agent that helps the speaker write the talk; Claude Code reads it through CLAUDE.md.
copyTemplate(path.join(__dirname, "AGENTS.md"), path.join(STAGE, "AGENTS.md"));
fs.writeFileSync(path.join(STAGE, "CLAUDE.md"), "@AGENTS.md\n");
for (const script of ["qr.py", "grafico.py"]) copyTemplate(path.join(__dirname, "scripts", script), path.join(STAGE, "scripts", script));

for (const dir of [path.join(__dirname, "img"), path.join(EVENT_MARP, "img")]) {
  if (fs.existsSync(dir)) fs.cpSync(dir, path.join(STAGE, "img"), { recursive: true });
}
fs.copyFileSync(EVENT.logo.dark.file, path.join(STAGE, "img", "logo-escuro.png"));
fs.copyFileSync(EVENT.logo.light.file, path.join(STAGE, "img", "logo-claro.png"));
run("uv", ["run", "--quiet", path.join(STAGE, "scripts", "qr.py")]);
run("uv", ["run", "--quiet", path.join(STAGE, "scripts", "grafico.py")]);

fs.mkdirSync(path.join(STAGE, ".vscode"), { recursive: true });
fs.writeFileSync(path.join(STAGE, ".vscode", "settings.json"), JSON.stringify({ "markdown.marp.themes": [`./${css}`, `./${lightCss}`], "markdown.marp.enableHtml": true }, null, 2) + "\n");
fs.writeFileSync(path.join(STAGE, ".vscode", "extensions.json"), JSON.stringify({ recommendations: ["marp-team.marp-vscode"] }, null, 2) + "\n");

const zip = path.join(DIST, `${PACKAGE_NAME}.zip`);
fs.rmSync(zip, { force: true });
run("zip", ["-qr", zip, PACKAGE_NAME], path.dirname(STAGE));

const marp = (args) => run(MARP, ["--no-stdin", "--theme-set", path.join(STAGE, css), path.join(STAGE, lightCss), "--html", "--allow-local-files", ...args]);
fs.mkdirSync(path.join(DIST, "marp"), { recursive: true });
marp(["-o", path.join(DIST, "marp", "index.html"), path.join(STAGE, "slides.md")]);
fs.cpSync(path.join(STAGE, "img"), path.join(DIST, "marp", "img"), { recursive: true });

// One PDF per version: slides.md starts in the light theme, and --theme overrides it for the dark one.
marp(["--pdf", "-o", path.join(DIST, `${SLUG}-claro.pdf`), path.join(STAGE, "slides.md")]);
marp(["--theme", SLUG, "--pdf", "-o", path.join(DIST, `${SLUG}-escuro.pdf`), path.join(STAGE, "slides.md")]);
console.log(`wrote dist/${SLUG}/marp/index.html, the two PDFs and ${PACKAGE_NAME}.zip`);
