# Slides de eventos Python

Modelos de slides para eventos da comunidade Python, em PowerPoint (.pptx), LibreOffice (.odp) e Markdown ([Marp](https://marp.app/)). Cada slide de exemplo mostra um layout e traz dicas para quem vai palestrar nas anotações.

**Baixe o modelo do seu evento em [rodbv.github.io/slides-eventos-python](https://rodbv.github.io/slides-eventos-python/).**

| Evento | Página |
|---|---|
| Python Brasil 2026 | [rodbv.github.io/slides-eventos-python/python-brasil-2026](https://rodbv.github.io/slides-eventos-python/python-brasil-2026/) |
| Python Cerrado 2026 | [rodbv.github.io/slides-eventos-python/python-cerrado-2026](https://rodbv.github.io/slides-eventos-python/python-cerrado-2026/) |

## Como funciona

- `core/` tem os layouts e o deck de dicas, comuns a todos os eventos: `core/pptx/` gera o .pptx e o .odp, `core/marp/` gera o tema e o pacote do Marp.
- `events/<evento>/` tem a marca de um evento: `brand.css` com as cores e as fontes, `event.json` com os textos e os logos, `assets/` e `fonts/`. Os arquivos `extra.js` e `marp/` são opcionais e trazem slides e imagens só daquele evento.
- A cada push no `main`, o GitHub Actions gera os arquivos de todos os eventos e publica o site.

Todo texto dos modelos tem contraste de 4,5:1 ou mais com o fundo (WCAG 2.1 AA), nas versões escura e clara.

## Gerar localmente

Precisa de Node 24, LibreOffice, poppler, ImageMagick, `zip`, [uv](https://docs.astral.sh/uv/) e as fontes de `events/*/fonts` instaladas.

```sh
npm ci
npm run build                         # todos os eventos
npm run build -- python-cerrado-2026  # um evento
```

Os arquivos saem em `dist/`.
