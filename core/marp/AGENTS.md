# Instruções para agentes

Esta pasta é o modelo de slides da {{nome}} para o [Marp](https://marp.app/). A pessoa que abriu a pasta quer montar uma palestra. Ajude a escrever `slides.md`.

## O que mudar e o que deixar

- Mude `slides.md`, as imagens em `img/` e os dados de `scripts/grafico.py`.
- Não mude `{{tema}}.css` nem `{{tema}}-claro.css`. Os dois temas têm as cores, as fontes e os logos da {{nome}}, com contraste conferido. Não escreva cores, fontes nem `style` dentro de `slides.md`.
- Se um layout não serve, escolha outro da lista abaixo em vez de criar CSS novo.

## Como montar a palestra

1. Pergunte o título, o nome da pessoa, a duração da palestra e o roteiro, se ainda não sabe.
2. Cada slide de `slides.md` é um exemplo de layout, com dicas no comentário `<!-- -->` do fim do slide. Para um slide novo, copie o exemplo do layout e troque o conteúdo.
3. Apague os slides de exemplo que a palestra não usa. Mantenha a capa e o encerramento.
4. Escreva o que a pessoa vai falar nas anotações, no comentário do fim de cada slide. A tecla P mostra as anotações na visão de apresentação.
5. Mantenha o bloco `<script>` do fim do arquivo: ele faz a tecla D trocar entre a versão clara e a escura.

## Layouts

O comentário `<!-- _class: nome -->` no topo do slide escolhe o layout. Um slide sem classe é título e tópicos.

| Classe | Para quê |
|---|---|
| `capa` | Título da palestra, nome e o logo do evento |
| `frase` | Uma frase grande, em até duas linhas |
| `palestrante` | Foto, nome, pronomes e três fatos |
| `secao` | Abre uma parte da agenda: `# _01_ Título` |
| `duas-colunas` | Antes e depois, problema e solução; com `miuda`, o código da esquerda fica pequeno de propósito |
| `tres-imagens` | Três capturas de tela com legenda |
| `numeros` | Até três números grandes: `- **18** rótulo` |
| `cartoes` | Três cartões numerados: `1. **Título** Descrição.` |
| `fluxo` | Uma sequência de 3 a 5 passos, numa lista numerada |
| `imagem-cheia` | Uma foto no slide inteiro, com a legenda e o crédito |
| `destaque` | Um painel na cor {{corDestaque}} para a mensagem que a sala não pode perder |
| `encerramento` | Contatos e o QR code |

Sem classe, o Markdown já tem: citação (linha que começa com `>`), lista numerada, tabela, bloco de código e imagem ao lado do texto (`![bg right:42%](img/arquivo.png)`).

## Regras de conteúdo

- O conteúdo é da pessoa palestrante. Organize, encurte e escolha os layouts, mas não invente fatos, exemplos, números nem opiniões. Se faltar alguma coisa, pergunte.
- Uma ideia por slide, de 3 a 5 tópicos curtos. O que não cabe vai para as anotações.
- Código: até 8 linhas e 60 colunas por slide. Abra o bloco com a linguagem, como ```python.
- Conte mais ou menos 1 minuto por slide, depois de separar uns 5 minutos para perguntas.
- Toda imagem leva texto alternativo entre os colchetes. Gráficos levam os números no texto alternativo.
- Para destacar uma palavra, use `<mark>palavra</mark>`: o tema pinta o marca-texto na cor {{corDestaque}}.
- Linguagem neutra de gênero quando possível ("pessoa palestrante", "o público").
- Escreva no idioma da palestra. Pergunte se não souber.

## Imagens, gráfico e QR code

- Ponha as imagens em `img/` e troque os arquivos `*-exemplo.png` pelos da palestra.
- Gráfico: troque `ROTULOS` e `VALORES` em `scripts/grafico.py` e rode `uv run scripts/grafico.py`. O script escreve `img/grafico-exemplo.png` com as cores do evento.
- QR code: `uv run scripts/qr.py https://endereco-da-pessoa` troca `img/qr.png`.

## Conferir e exportar

```sh
npx @marp-team/marp-cli@4 --theme-set {{tema}}.css {{tema}}-claro.css --html --allow-local-files --pdf slides.md
```

Sem `--pdf`, o comando gera o HTML, onde as teclas P e D funcionam. A linha `theme` no topo de `slides.md` escolhe a versão: `{{tema}}-claro` para projetor, TV ou monitor, e `{{tema}}` para tela de LED do tamanho de uma parede.
