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

## O seu evento quer um modelo?

Um evento novo é uma pasta em `events/`, enviada numa pull request. O [`CONTRIBUTING.md`](CONTRIBUTING.md) mostra o passo a passo. Se você usa um agente de IA, o [`AGENTS.md`](AGENTS.md) traz as instruções para o agente criar a pasta do evento.

## Licenças

- Modelo, textos de exemplo e código deste repositório: [CC0 1.0](LICENSE) (domínio público). Use, mude e compartilhe sem pedir permissão nem dar crédito.
- Logos, ilustrações e identidade visual de cada evento pertencem ao evento e ficam aqui só para os modelos desse evento. A identidade visual da Python Brasil 2026 é de [Ana Terhorst](https://anaterhorstdesign.com), para a APyB. A marca da Python Cerrado 2026 é da Python Cerrado.
- Fontes: cada pasta `events/*/fonts/` traz a licença da fonte (SIL Open Font License 1.1).
