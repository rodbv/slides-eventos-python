// Turns source code into pptxgenjs text runs colored with the GitHub Light theme.
// Slide editors have no syntax highlighting, so the colors are baked into the runs.
// Shiki uses VS Code's grammars and theme files, so the runs match what a speaker
// gets when copying from VS Code, or from slidesnippet.com, with GitHub Light.
const { createHighlighterCoreSync } = require("shiki/core");
const { createJavaScriptRegexEngine } = require("shiki/engine/javascript");
const python = require("shiki/langs/python.mjs").default;
const githubLight = require("shiki/themes/github-light.mjs").default;

const THEME = "github-light";
const ITALIC = 1;
const BOLD = 2;

const highlighter = createHighlighterCoreSync({
  themes: [githubLight],
  langs: [python],
  engine: createJavaScriptRegexEngine(),
});

const hex = (color) => color.replace("#", "").slice(0, 6).toUpperCase();

function highlightCode(source, lang = "python") {
  const { tokens, fg } = highlighter.codeToTokens(source.replace(/\n$/, ""), { lang, theme: THEME });
  const runs = [];
  tokens.forEach((line, i) => {
    const lineRuns = line.map((t) => ({
      text: t.content,
      options: { color: hex(t.color || fg), italic: (t.fontStyle & ITALIC) !== 0, bold: (t.fontStyle & BOLD) !== 0 },
    }));
    if (lineRuns.length === 0) lineRuns.push({ text: " ", options: { color: hex(fg) } });
    if (i < tokens.length - 1) lineRuns[lineRuns.length - 1].options.breakLine = true;
    runs.push(...lineRuns);
  });
  return runs;
}

module.exports = { highlightCode, CODE_TEXT_COLOR: hex(githubLight.colors["editor.foreground"]) };
