# Como contribuir

Para baixar o modelo de um evento, use o [site](https://rodbv.github.io/slides-eventos-python/). Esta página é para quem quer adicionar um evento ou mudar o modelo comum a todos os eventos.

Encontrou um problema? Abra uma [issue](https://github.com/rodbv/slides-eventos-python/issues).

## Adicionar um evento

Cada evento é uma pasta em `events/`, e um evento novo chega como uma pull request que adiciona uma pasta.

1. Copie `events/python-cerrado-2026/` para `events/<evento>-<ano>/`. Essa pasta tem só os arquivos obrigatórios.
2. Em `brand.css`, troque as cores e as fontes pelas da marca do evento (veja [As cores](#as-cores)).
3. Em `event.json`, troque os textos e os caminhos dos logos (veja [Os textos](#os-textos)).
4. Em `assets/`, coloque o logo em PNG com fundo transparente, numa versão para o fundo escuro e noutra para o fundo claro.
5. Em `fonts/`, coloque os arquivos `.ttf` das fontes e a licença de cada uma. Use fontes com licença livre, como a SIL Open Font License.
6. Gere os arquivos e confira as prévias (veja [Gerar e conferir](#gerar-e-conferir)).
7. Abra a pull request. O GitHub Actions gera os arquivos de todos os eventos; na página da execução, o artefato `github-pages` traz o site completo para conferir.

A pasta `events/python-brasil-2026/` mostra os extras opcionais: figurinhas, marca-d'água e um slide só do evento.

## As cores

`brand.css` tem dois blocos de variáveis, uma por linha: `:root` é a versão escura e `section.light` é a versão clara. O bloco claro herda o escuro, então ele só repete o que muda.

| Variável | Onde aparece | Contraste mínimo |
|---|---|---|
| `--bg` | Fundo do slide | |
| `--text` | Texto do corpo e títulos | 4,5:1 com `--bg` e com `--card` |
| `--muted` | Texto secundário, rodapé e número do slide | 4,5:1 com `--bg` |
| `--accent` | Títulos das colunas, aspas e números em destaque | 4,5:1 com `--bg` |
| `--link` | Links | 4,5:1 com `--bg` |
| `--card` | Fundo de cartões e de células de tabela | |
| `--card-outline` | Borda dos cartões | |
| `--image-outline` | Borda das caixas de imagem | |
| `--fill` | Discos, painel de destaque, barras do gráfico, cabeçalho de tabela e marca-texto | |
| `--on-fill` | Texto sobre `--fill` | 4,5:1 com `--fill` |
| `--fill-edge` | Borda de tudo o que usa `--fill` | 3:1 com `--bg` |
| `--font-head`, `--font-body`, `--font-code` | Fontes dos títulos, do texto e do código | |

`--fill` e `--on-fill` são os mesmos nas duas versões, então ficam só no `:root`.

Todo texto precisa de contraste de 4,5:1 com o fundo (WCAG 2.1 AA), nas duas versões. Se uma cor da marca não chega lá, escureça ou clareie a cor só o necessário e explique a troca num comentário em `brand.css`, como faz `events/python-cerrado-2026/brand.css`. O [verificador do WebAIM](https://webaim.org/resources/contrastchecker/) calcula o contraste de um par de cores.

## Os textos

| Campo | Uso |
|---|---|
| `nome` | Nome completo, como "Python Cerrado 2026" |
| `nomeCurto` | Nome sem o ano, usado nas dicas |
| `selo` | Texto do disco da capa, uma linha por `\n`; a última linha, entre chaves, é o local |
| `site` | Endereço do evento, usado no QR code de exemplo |
| `rodape` | Texto do rodapé dos slides |
| `rodapeLogo` | Opcional. Com `true`, os slides de conteúdo mostram o logo pequeno no lugar do texto do rodapé |
| `organizacao` | Autoria gravada no arquivo .pptx |
| `titulosMaiusculos` | Com `true`, os títulos dos slides de conteúdo ficam em maiúsculas |
| `corDestaque` | Nome da cor de `--fill`, como "ocre", usado nas dicas |
| `conduta` | `de` ("da Python Cerrado") e `endereco` do código de conduta, sem `https://` |
| `logo` | Caminhos do logo para o fundo `escuro` e para o `claro`, e o texto alternativo `alt` |
| `marcaDagua` | Opcional. Imagens `escuro` e `claro` para a marca-d'água |
| `googleSlides` | Opcional. Links `/copy` das cópias no Google Slides, `escuro` e `claro` |

## Extras opcionais

- `extra.js` acrescenta peças ao .pptx: `layouts` define layouts novos, `decorate.codigo` e `decorate.numeros` põem uma imagem nesses slides, e `slides` acrescenta slides no fim do deck.
- `marp/` acrescenta peças ao Marp: `codigo.md` vai no slide de código, `fim.md` vira o último slide, `extra.css` vai no fim do tema e `img/` vai para a pasta de imagens do pacote.

## Gerar e conferir

Precisa de Node 24, LibreOffice, poppler, ImageMagick, `zip`, [uv](https://docs.astral.sh/uv/) e das fontes de `events/*/fonts` instaladas no sistema.

```sh
npm ci
npm run build -- <evento>
```

O build escreve em `dist/<evento>/`:

- `preview/escuro/overview.png` e `preview/claro/overview.png`: todos os slides do .pptx numa imagem;
- `preview/<versão>/slide-NN.png`: cada slide;
- `marp/index.html`: o deck do Marp no navegador (a tecla D troca entre claro e escuro);
- `index.html`: a página do evento.

## Mudar o modelo comum

O modelo comum fica em `core/` e vale para todos os eventos. Depois de mudar o modelo, gere todos os eventos com `npm run build` e confira as prévias de cada um.

- `core/pptx/build.js` define os layouts e os slides de exemplo do .pptx.
- `core/pptx/notes.pt-BR.js` tem as anotações, uma lista por slide, na ordem do deck. O build falha se o número de anotações for diferente do número de slides: ao criar ou apagar um slide, mude as anotações também.
- `core/pptx/lib/` corrige o arquivo depois do pptxgenjs: tema, numeração, anotações, versaletes e o formato das categorias dos gráficos.
- `core/marp/slides.md` é o deck do Marp, com os campos de `event.json` entre chaves duplas. `core/marp/base.css` é o tema comum.
- `core/exemplos/` tem as imagens de exemplo; `python3 core/make_examples.py` baixa as imagens de novo.

## Atualizar a cópia no Google Slides

O build não atualiza o Google Slides. Depois de mudar um .pptx, envie o arquivo para o Drive, abra e escolha Arquivo > Salvar como Apresentações Google. Compartilhe a cópia como "Qualquer pessoa com o link: Leitor" e ponha o link em `googleSlides` no `event.json`, com `/copy` no lugar de `/edit`.
