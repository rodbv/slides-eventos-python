// Writes the GitHub Pages site: dist/index.html lists the events, and dist/<event>/index.html
// links the files a speaker downloads. Run it after the event builds.
const fs = require("fs");
const path = require("path");
const { loadEvent } = require("../core/event");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const REPO = "https://github.com/rodbv/slides-eventos-python";

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function eventSlugs() {
  return fs
    .readdirSync(path.join(ROOT, "events"))
    .filter((name) => !name.startsWith("_") && fs.existsSync(path.join(DIST, name, `${name}.pptx`)));
}

function fontImport(dir) {
  const match = fs.readFileSync(path.join(dir, "brand.css"), "utf8").match(/@import url\("([^"]+)"\);/);
  return match ? `<link rel="stylesheet" href="${escape(match[1])}">` : "";
}

function page(title, head, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
${head}
</head>
<body>
${body}
</body>
</html>
`;
}

function eventPage(ev) {
  const { event: e, light, fonts, slug } = ev;
  fs.copyFileSync(ev.logo.light.file, path.join(DIST, slug, "logo.png"));
  const links = [
    e.googleSlides && [e.googleSlides, "Google Slides", "Faz uma cópia no seu Google Drive."],
    [`${slug}.pptx`, "PowerPoint (.pptx)", "Abre no PowerPoint, no Keynote e no Google Slides."],
    [`${slug}.odp`, "LibreOffice (.odp)", "Com as fontes do evento dentro do arquivo."],
    [`${slug}-marp.zip`, "Marp (.zip)", "Slides em Markdown, para o VS Code com a extensão Marp."],
  ].filter(Boolean);
  const style = `<style>
:root { --bg: #${light.bg}; --text: #${light.text}; --muted: #${light.muted}; --link: #${light.link}; --card: #${light.card}; --line: #${light["card-outline"]}; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 18px/1.5 "${fonts.body}", system-ui, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 32px 16px 64px; }
h1, h2 { font-family: "${fonts.head}", system-ui, sans-serif; line-height: 1.2; }
h1 { font-size: 34px; margin: 24px 0 8px; }
h2 { font-size: 24px; margin: 40px 0 12px; }
a { color: var(--link); }
.logo { width: 260px; max-width: 70%; height: auto; }
.data { color: var(--muted); margin: 0; }
ul.arquivos { list-style: none; padding: 0; display: grid; gap: 12px; }
ul.arquivos li { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; }
ul.arquivos a { font-weight: 700; font-size: 20px; }
ul.arquivos span { display: block; color: var(--muted); }
img.previa { width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); }
footer { margin-top: 48px; color: var(--muted); font-size: 16px; }
</style>`;
  const body = `<main>
<img class="logo" src="logo.png" alt="${escape(ev.logo.alt)}">
<h1>Modelo de slides da ${escape(e.nome)}</h1>
<p class="data">${escape(e.selo.replace(/\n/g, " ").replace(/[{}]/g, ""))}</p>
<p>Que bom que você vai palestrar! Cada slide do modelo mostra um layout e traz dicas nas anotações. Use as que servirem para você.</p>
<h2>Baixe o modelo</h2>
<ul class="arquivos">
${links.map(([href, label, note]) => `<li><a href="${escape(href)}">${escape(label)}</a><span>${escape(note)}</span></li>`).join("\n")}
</ul>
<h2>Escuro ou claro?</h2>
<p>Tela de LED do tamanho de uma parede: a versão escura, que não ofusca o público. Projetor, TV ou monitor: a versão clara. O código fica em fundo claro nas duas.</p>
<h2>Veja antes de baixar</h2>
<p><a href="marp/">Os slides no navegador</a> (a tecla D troca entre claro e escuro, a tecla P abre as anotações) e o <a href="slides.pdf">PDF</a>.</p>
<img class="previa" src="preview/overview.png" alt="Miniaturas de todos os slides do modelo da ${escape(e.nome)}">
<footer><a href="../">Outros eventos</a> · <a href="${REPO}">Código do modelo</a></footer>
</main>`;
  fs.writeFileSync(path.join(DIST, slug, "index.html"), page(`Slides da ${e.nome}`, fontImport(ev.dir) + "\n" + style, body));
}

function indexPage(events) {
  const sorted = [...events].sort((a, b) => Number(!!b.event.destaque) - Number(!!a.event.destaque) || a.event.nome.localeCompare(b.event.nome));
  const style = `<style>
:root { --bg: #ffffff; --text: #1f2328; --muted: #57606a; --link: #0b5cad; --card: #f6f8fa; --line: #d0d7de; }
@media (prefers-color-scheme: dark) { :root { --bg: #0d1117; --text: #e6edf3; --muted: #9da7b3; --link: #6cb6ff; --card: #161b22; --line: #30363d; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 18px/1.5 system-ui, sans-serif; }
main { max-width: 960px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 32px; line-height: 1.2; }
a { color: var(--link); }
ul { list-style: none; padding: 0; display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
li a { display: block; padding: 20px; border-radius: 12px; border: 1px solid var(--line); text-decoration: none; }
li img { width: 100%; height: 90px; object-fit: contain; }
li strong { display: block; font-size: 20px; margin-top: 12px; }
li span { color: var(--muted); }
</style>`;
  const cards = sorted
    .map(({ event: e, slug, light }) => `<li><a href="${slug}/" style="background: #${light.bg}; color: #${light.text}"><img src="${slug}/logo.png" alt=""><strong>${escape(e.nome)}</strong><span style="color: #${light.muted}">${escape(e.selo.replace(/\n/g, " ").replace(/[{}]/g, ""))}</span></a></li>`)
    .join("\n");
  const body = `<main>
<h1>Modelos de slides para eventos da comunidade Python</h1>
<p>Cada evento tem o seu modelo, em PowerPoint, LibreOffice e Markdown (Marp), com dicas para quem vai palestrar nas anotações de cada slide.</p>
<ul>
${cards}
</ul>
<p>O seu evento quer um modelo? <a href="${REPO}">Proponha uma pasta nova no repositório</a>.</p>
</main>`;
  fs.writeFileSync(path.join(DIST, "index.html"), page("Slides de eventos Python", style, body));
}

const events = eventSlugs().map((slug) => loadEvent(ROOT, slug));
for (const ev of events) eventPage(ev);
indexPage(events);
console.log(`site: ${events.map((e) => e.slug).join(", ")}`);
