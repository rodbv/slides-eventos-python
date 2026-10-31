// Writes the GitHub Pages site: dist/index.html lists the events, and dist/<event>/index.html
// links the files a speaker downloads. Run it after the event builds.
const fs = require("fs");
const path = require("path");
const { loadEvent } = require("../core/event");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const REPO = "https://github.com/rodbv/slides-eventos-python";

// The GitHub mark, from Primer Octicons (mark-github, 16 px).
const GITHUB_MARK = `<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>`;

// The call to the repository at the top of every page: the template is open, and any event can get one.
const REPO_LINK = `<a class="repo" href="${REPO}">${GITHUB_MARK}<span>Modelo aberto no GitHub: <strong>crie o do seu evento</strong></span></a>`;
const REPO_STYLE = `.repo { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--text); text-decoration: none; font-size: 16px; }
.repo:hover { border-color: var(--text); }
.repo svg { flex: none; }`;

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The cover badge reads "14 a 19\nde outubro\nde 2026\n{Floripa/SC}"; its last line is the place.
function dateLine(e) {
  const lines = e.selo.replace(/[{}]/g, "").split("\n");
  return `${lines.slice(0, -1).join(" ")} · ${lines.at(-1)}`;
}

function eventSlugs() {
  return fs
    .readdirSync(path.join(ROOT, "events"))
    .filter((name) => !name.startsWith("_") && fs.existsSync(path.join(DIST, name, `${name}-escuro.pptx`)));
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
  if (ev.watermark) fs.copyFileSync(ev.watermark.light.file, path.join(DIST, slug, "marca-dagua.png"));
  const list = (links) => `<ul class="arquivos">\n${links.map(([href, label, note]) => `<li><a href="${escape(href)}">${escape(label)}</a><span>${escape(note)}</span></li>`).join("\n")}\n</ul>`;
  // event.json can carry a Google Slides copy link per version: { "escuro": "...", "claro": "..." }.
  // That copy is the main action; without it, the .pptx is.
  const version = (key, title) => {
    const slides = e.googleSlides && e.googleSlides[key];
    const pptx = `${slug}-${key}.pptx`;
    const [mainHref, mainLabel] = slides ? [slides, "Fazer uma cópia no Google Slides"] : [pptx, "Baixar o PowerPoint (.pptx)"];
    const others = [
      slides && [pptx, "PowerPoint (.pptx)", "PowerPoint e Keynote"],
      [`${slug}-${key}.odp`, "LibreOffice (.odp)", "com as fontes do evento"],
      [`${slug}-${key}.pdf`, "PDF", "para ver sem instalar nada"],
      [`preview/${key}/overview.png`, "Todos os slides", "numa imagem"],
    ].filter(Boolean);
    return `<section class="versao">
<h3>${escape(title)}</h3>
<a href="${escape(mainHref)}"><img src="preview/${key}/slide-01.png" alt="Capa da ${escape(title.toLowerCase())} do modelo"></a>
<a class="botao" href="${escape(mainHref)}">${escape(mainLabel)}</a>
<ul class="outros">
${others.map(([href, label, note]) => `<li><a href="${escape(href)}">${escape(label)}</a> <span>${escape(note)}</span></li>`).join("\n")}
</ul>
</section>`;
  };
  const style = `<style>
:root { --bg: #${light.bg}; --text: #${light.text}; --muted: #${light.muted}; --accent: #${light.accent}; --link: #${light.link}; --card: #${light.card}; --line: #${light["card-outline"]}; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 18px/1.5 "${fonts.body}", system-ui, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; }
h1, h2, h3, .botao { font-family: "${fonts.head}", system-ui, sans-serif; }
h1, h2 { line-height: 1.2; }
h1 { font-size: 36px; margin: 28px 0 0; }
h2 { font-size: 24px; margin: 48px 0 12px; }
a { color: var(--link); }
${REPO_STYLE}
/* The header carries the event's watermark in a corner, away from the text, as the event's posts do. */
header { position: relative; isolation: isolate; }
header .marca { position: absolute; z-index: -1; right: 0; top: 8px; width: auto; height: 190px; opacity: 0.18; pointer-events: none; }
@media (max-width: 640px) { header .marca { display: none; } }
.logo { display: block; width: 260px; max-width: 70%; height: auto; margin-top: 28px; }
.data { color: var(--muted); margin: 8px 0 0; }
.versoes { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
h3 { font-family: "${fonts.head}", system-ui, sans-serif; font-size: 22px; margin: 0 0 12px; }
.versao img { display: block; width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); }
.botao { display: block; margin: 16px 0 12px; padding: 12px 18px; border-radius: 10px; background: var(--accent); color: var(--bg); text-align: center; text-decoration: none; font-weight: 700; font-size: 19px; }
.botao:hover { filter: brightness(1.1); }
ul.outros { list-style: none; padding: 0; margin: 0; font-size: 16px; }
ul.outros li { padding: 4px 0; }
ul.outros a { font-weight: 700; }
ul.outros span { color: var(--muted); }
ul.arquivos { list-style: none; padding: 0; display: grid; gap: 12px; }
ul.arquivos li { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; }
ul.arquivos a { font-weight: 700; font-size: 20px; }
ul.arquivos span { display: block; color: var(--muted); }
footer { margin-top: 48px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; color: var(--muted); font-size: 16px; }
</style>`;
  const body = `<main>
<header>
${ev.watermark ? `<img class="marca" src="marca-dagua.png" alt="">` : ""}
<img class="logo" src="logo.png" alt="${escape(ev.logo.alt)}">
<h1>Modelo de slides da ${escape(e.nome)}</h1>
<p class="data">${escape(dateLine(e))}</p>
</header>
<p>Que bom que você vai palestrar! Cada slide do modelo mostra um layout e traz dicas nas anotações. Use as que servirem para você.</p>
<h2>Escolha a versão</h2>
<p>Projetor, TV ou monitor: a versão clara. Tela de LED do tamanho de uma parede: a versão escura, que não ofusca o público. O código fica em fundo claro nas duas.</p>
<div class="versoes">
${version("claro", "Versão clara")}
${version("escuro", "Versão escura")}
</div>
<h2>Em Markdown, com o Marp</h2>
${list([
  [`${slug}-marp.zip`, "Marp (.zip)", "As duas versões num pacote para o VS Code com a extensão Marp. A linha theme, no topo de slides.md, escolhe a versão."],
  ["marp/", "Os slides no navegador", "A tecla D troca entre claro e escuro. A tecla P abre as anotações em outra aba; para voltar aos slides, feche essa aba."],
])}
<footer>${REPO_LINK}<a href="../">Outros eventos</a></footer>
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
${REPO_STYLE}
</style>`;
  const cards = sorted
    .map(({ event: e, slug, light }) => `<li><a href="${slug}/" style="background: #${light.bg}; color: #${light.text}"><img src="${slug}/logo.png" alt=""><strong>${escape(e.nome)}</strong><span style="color: #${light.muted}">${escape(dateLine(e))}</span></a></li>`)
    .join("\n");
  const body = `<main>
<h1>Modelos de slides para eventos da comunidade Python</h1>
<p>Cada evento tem o seu modelo, em PowerPoint, LibreOffice e Markdown (Marp), com dicas para quem vai palestrar nas anotações de cada slide.</p>
<ul>
${cards}
</ul>
${REPO_LINK}
</main>`;
  fs.writeFileSync(path.join(DIST, "index.html"), page("Slides de eventos Python", style, body));
}

const events = eventSlugs().map((slug) => loadEvent(ROOT, slug));
for (const ev of events) eventPage(ev);
indexPage(events);
console.log(`site: ${events.map((e) => e.slug).join(", ")}`);
