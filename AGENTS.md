# Instruções para agentes

Este repositório gera modelos de slides para eventos da comunidade Python, em .pptx, .odp e Marp. O modelo comum fica em `core/`, e a marca de cada evento fica em `events/<evento>/`. Você pode estar aqui por três motivos:

1. **Alguém quer um modelo para um evento novo.** Siga "Criar um evento".
2. **Uma pessoa palestrante pediu ajuda com a palestra** (slides, imagens, diagramas, um gráfico). Siga as regras de marca e de conteúdo.
3. **Alguém quer mudar o modelo comum.** Leia "Mudar o modelo comum" no [`CONTRIBUTING.md`](CONTRIBUTING.md).

O [`CONTRIBUTING.md`](CONTRIBUTING.md) descreve cada variável de `brand.css` e cada campo de `event.json`. Leia esse arquivo antes de criar um evento.

## Criar um evento

1. **Junte as fontes da marca.** Peça o site do evento, o manual de marca, os posts ou o logo. Tire as cores e as fontes dessas fontes; não invente uma paleta. Se faltar alguma coisa, pergunte.
2. **Pergunte o que você não sabe.** Datas, cidade, endereço do código de conduta, nome curto: pergunte à pessoa ou confira no site do evento. Não invente nenhum desses dados.
3. **Copie `events/python-cerrado-2026/`** para `events/<evento>-<ano>/`. Essa pasta tem só os arquivos obrigatórios.
4. **Escreva `brand.css`.** Ponha cada cor da marca no papel que combina com ela: o fundo da marca em `--bg`, a cor mais forte em `--fill`. Calcule o contraste de cada par da tabela do `CONTRIBUTING.md`, nas duas versões. Se um par fica abaixo do mínimo, ajuste o tom da cor só o necessário e explique a troca num comentário curto no `brand.css`.
5. **Escreva `event.json`** com os textos do evento.
6. **Prepare os logos** em PNG com fundo transparente: um para o fundo escuro e outro para o claro. Use as peças da marca como estão: sem distorcer, sem recolorir fora da paleta e sem efeitos. Se o evento só tem um logo, pergunte se ele serve nos dois fundos.
7. **Baixe as fontes** em `.ttf` para `fonts/<Fonte>/`, com o arquivo de licença. Use fontes com licença livre, como as do Google Fonts. Ponha o `@import` do Google Fonts no topo de `brand.css`, para o Marp.
8. **Gere e confira** com `npm run build -- <evento>`. Olhe `dist/<evento>/preview/escuro/overview.png` e `dist/<evento>/preview/claro/overview.png`, e abra `dist/<evento>/marp/index.html`. Procure texto ilegível, texto cortado e logo deformado.
9. **Mostre o resultado à pessoa** antes de abrir a pull request: as duas visões gerais e a tabela de contraste.

Os extras opcionais (`extra.js` e `marp/`) servem para peças que só aquele evento tem, como figurinhas. A pasta `events/python-brasil-2026/` mostra como usar esses extras.

## Regras de marca

- As cores e as fontes de cada evento estão em `events/<evento>/brand.css`. Os comentários desse arquivo dizem onde cada cor pode aparecer.
- Todo texto precisa de contraste de 4,5:1 com o fundo (WCAG 2.1 AA), nas duas versões. A borda de um preenchimento precisa de 3:1 com o fundo.
- Código usa o tema GitHub Light sobre um cartão branco, nas duas versões.
- Tela de LED do tamanho de uma parede: versão escura, que não ofusca o público. Projetor, TV ou monitor: versão clara.
- Use as peças da marca como estão: sem distorcer, sem recolorir fora da paleta e sem efeitos. Uma figurinha por slide costuma bastar.
- Gráficos e diagramas: barras e caixas na cor de `--fill`, rótulos com os números, fundo transparente ou da cor do slide.

## Regras de conteúdo

- O conteúdo é da pessoa palestrante. Organize, encurte e escolha os layouts, mas não invente fatos, exemplos, números nem opiniões. Se faltar alguma coisa, pergunte.
- Uma ideia por slide, de 3 a 5 tópicos curtos. O que não cabe vai para as anotações.
- Texto no corpo de 20 pt, nunca abaixo de 18 pt. Código: até 8 linhas e 60 colunas por slide.
- Conte mais ou menos 1 minuto por slide, depois de separar uns 5 minutos para perguntas. Pergunte a duração da palestra se não souber.
- Toda imagem leva texto alternativo; gráficos levam os números no texto alternativo.
- Linguagem neutra de gênero quando possível ("pessoa palestrante", "o público").
- O tom é de dica, não de regra: apoio, sem cobrança e sem prometer resultado. Evite "é só", "é fácil" e "todo mundo sabe".
- O texto dos slides, das anotações e da documentação é em português do Brasil.
