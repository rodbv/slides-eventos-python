# Modelo de slides da {{nome}} em Markdown

Este pacote é um modelo para o [Marp](https://marp.app/). A palestra fica em `slides.md`, e o tema `{{tema}}.css` aplica as cores e as fontes do evento.

## Para começar

1. Abra esta pasta no VS Code e instale a extensão Marp for VS Code, que o próprio VS Code sugere.
2. Abra `slides.md` e clique no ícone de prévia, no canto de cima.
3. Cada slide de exemplo mostra um layout e traz dicas nas anotações, no comentário do fim do slide.

## Arquivos

- `slides.md`: a palestra. O comentário `<!-- _class: nome -->` no topo de cada slide escolhe o layout.
- `{{tema}}.css`: o tema do evento.
- `img/`: logos, imagens de exemplo, o gráfico e o QR code. As imagens `*-exemplo.png` marcam o lugar de uma imagem sua.
- `scripts/qr.py`: gera o QR code do encerramento (`uv run scripts/qr.py https://seu-endereco`).
- `scripts/grafico.py`: gera o gráfico de exemplo; troque os rótulos e os valores pelos seus dados.

## Exportar

Na extensão, o comando "Marp: Export Slide Deck" gera PDF, HTML ou PowerPoint. Pela linha de comando:

```sh
npx @marp-team/marp-cli@4 --theme-set {{tema}}.css --html --allow-local-files --pdf slides.md
```

Tela de LED do tamanho de uma parede: versão escura. Projetor, TV ou monitor: versão clara, com `class: light` no topo do arquivo.
