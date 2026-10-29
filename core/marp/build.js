// Builds the Marp version of an event's template:
//   build/<event>/<event>-marp/   the package a speaker downloads (slides.md, theme, img, scripts)
//   dist/<event>/<event>-marp.zip that package, zipped
//   dist/<event>/marp/index.html  the deck as a web page, where the D key switches light and dark
//   dist/<event>/slides.pdf       the deck as a PDF
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
  selo: EV.selo.replace(/\n/g, "<br>"),
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
function theme() {
  const logoVars = (side) => `  --lockup: url("img/logo-${side}.png");\n`;
  return [
    `/*\n * @theme ${SLUG}\n * @size 16:9 1280px 720px\n *\n * Tema da ${EV.nome} para o Marp, gerado por slides-eventos-python.\n */\n`,
    fs.readFileSync(path.join(EVENT.dir, "brand.css"), "utf8"),
    ":root {\n" +
      `  --dark-bg: #${EVENT.dark.bg};\n  --dark-text: #${EVENT.dark.text};\n  --rule: var(--text);\n` +
      logoVars("escuro") +
      "  --marca-dagua: none;\n}\n\nsection.light {\n" +
      logoVars("claro") +
      "}\n",
    fs.readFileSync(path.join(__dirname, "base.css"), "utf8"),
    EV.titulosMaiusculos ? "" : "h2 {\n  text-transform: none;\n  letter-spacing: normal;\n}\n",
    eventFile("extra.css"),
  ].join("\n");
}

// Pressing D in the web page switches every slide between light and dark. The package leaves the
// script out: the VS Code preview would show the tag as text.
const TOGGLE_SCRIPT = `
<script>
document.addEventListener("keydown", (e) => {
  if (e.key !== "d" || e.ctrlKey || e.metaKey || e.altKey) return;
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("light"));
});
</script>
`;

fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(path.join(STAGE, "img"), { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

const css = `${SLUG}.css`;
fs.writeFileSync(path.join(STAGE, css), theme());
copyTemplate(path.join(__dirname, "slides.md"), path.join(STAGE, "slides.md"));
copyTemplate(path.join(__dirname, "LEIA-ME.md"), path.join(STAGE, "LEIA-ME.md"));
for (const script of ["qr.py", "grafico.py"]) copyTemplate(path.join(__dirname, "scripts", script), path.join(STAGE, "scripts", script));

for (const dir of [path.join(__dirname, "img"), path.join(EVENT_MARP, "img")]) {
  if (fs.existsSync(dir)) fs.cpSync(dir, path.join(STAGE, "img"), { recursive: true });
}
fs.copyFileSync(EVENT.logo.dark.file, path.join(STAGE, "img", "logo-escuro.png"));
fs.copyFileSync(EVENT.logo.light.file, path.join(STAGE, "img", "logo-claro.png"));
run("uv", ["run", "--quiet", path.join(STAGE, "scripts", "qr.py")]);
run("uv", ["run", "--quiet", path.join(STAGE, "scripts", "grafico.py")]);

fs.mkdirSync(path.join(STAGE, ".vscode"), { recursive: true });
fs.writeFileSync(path.join(STAGE, ".vscode", "settings.json"), JSON.stringify({ "markdown.marp.themes": [`./${css}`], "markdown.marp.enableHtml": true }, null, 2) + "\n");
fs.writeFileSync(path.join(STAGE, ".vscode", "extensions.json"), JSON.stringify({ recommendations: ["marp-team.marp-vscode"] }, null, 2) + "\n");

const zip = path.join(DIST, `${PACKAGE_NAME}.zip`);
fs.rmSync(zip, { force: true });
run("zip", ["-qr", zip, PACKAGE_NAME], path.dirname(STAGE));

// The web page is built from a copy with the D key script, next to the package's images.
const webDeck = path.join(STAGE, "..", "slides-web.md");
fs.writeFileSync(webDeck, fs.readFileSync(path.join(STAGE, "slides.md"), "utf8") + TOGGLE_SCRIPT);
fs.cpSync(path.join(STAGE, "img"), path.join(path.dirname(webDeck), "img"), { recursive: true });
const marp = (args) => run(MARP, ["--no-stdin", "--theme-set", path.join(STAGE, css), "--html", "--allow-local-files", ...args]);
fs.mkdirSync(path.join(DIST, "marp"), { recursive: true });
marp(["-o", path.join(DIST, "marp", "index.html"), webDeck]);
fs.cpSync(path.join(STAGE, "img"), path.join(DIST, "marp", "img"), { recursive: true });
marp(["--pdf", "-o", path.join(DIST, "slides.pdf"), path.join(STAGE, "slides.md")]);
console.log(`wrote dist/${SLUG}/marp/index.html, slides.pdf and ${PACKAGE_NAME}.zip`);
