// Speaker notes, one list of short tips per slide, in deck order.
// build.js takes the next list each time it adds a slide and fails if the counts differ.
// The event's own texts and colors come from its event.json and brand.css.
module.exports = (ev, brand, version) => [
  // Capa
  [
    "Que bom que você vai palestrar! O seu jeito de falar vale mais do que qualquer dica deste modelo.",
    "Este arquivo é um modelo: cada slide de exemplo mostra um layout e traz dicas nas anotações. Use as que servirem para você.",
    "Para começar: guarde uma cópia sem mudanças e duplique os slides que quiser usar.",
    `Este arquivo é a versão ${version === "claro" ? "clara" : "escura"}. Tela de LED do tamanho de uma parede: versão escura, que não ofusca o público. Projetor, TV ou monitor: versão clara.`,
    "Ao reaproveitar um slide, apague estas anotações e escreva as suas.",
  ],
  // Frase
  [
    "Uma ideia por slide, em até duas linhas. Que frase o público deve levar da sala?",
    "Quase toda pessoa palestrante fica nervosa. Se bater o nervosismo, fale para um rosto amigo na plateia.",
  ],
  // Palestrante
  [
    "Troque a caixa cinza pela sua foto: botão direito > Substituir imagem (no PowerPoint, Alterar Imagem).",
    "Quem abre a sessão costuma apresentar você; com o tempo curto, este slide pode sair.",
    "Uma autodescrição ajuda quem não vê, por exemplo: “Sou a Maria, tenho 1,60 m e cabelo preto solto, uso óculos verdes e estou com uma camiseta da PyLadies.”",
    "Com os pronomes no slide, quem cita a sua palestra acerta como se referir a você.",
  ],
  // Citação
  [
    "Até três linhas, com quem disse e onde. Vale conferir a autoria numa fonte primária.",
    "As aspas coloridas fazem parte do texto: ao trocar a citação, mantenha as duas.",
    `Para destacar a palavra principal, use o marca-texto ${ev.corDestaque} e mantenha a cor do texto.`,
  ],
  // Título e conteúdo
  [
    "De três a cinco tópicos por slide. Se o programa diminuir a fonte para caber, divida o conteúdo em dois slides.",
    "As anotações aparecem só para você no modo apresentador. Olhar as anotações no palco é normal.",
    "LibreOffice: Console do apresentador. Google Slides: Visualização do apresentador. PowerPoint: Modo de Exibição do Apresentador.",
  ],
  // Agenda
  [
    "A numeração é automática.",
    "Voltar à agenda entre as partes ajuda o público a saber onde está.",
  ],
  // Seção
  [
    "Edite o número dentro do círculo e o título. O número acompanha a ordem da agenda.",
    "Entre uma parte e outra, faça uma pausa: respire e beba um gole de água. A pausa parece longa para quem fala e curta para quem ouve.",
  ],
  // Duas colunas
  [
    "Cada coluna tem o seu título: antes e depois, problema e solução.",
    "O detalhe e a “colinha” vão para as anotações, que só você vê.",
    "Com menos texto no slide, cabe uma letra maior, e o público tende a olhar mais para você.",
  ],
  // Texto e imagem
  [
    "A caixa cinza marca o lugar da sua imagem e mostra o tamanho que preenche o espaço numa tela Full HD. Botão direito > Substituir imagem (no PowerPoint, Alterar Imagem).",
    "Preencha o texto alternativo da imagem: botão direito > Descrição (LibreOffice), Texto alternativo (Google Slides e PowerPoint).",
    "Na fala, diga o que a imagem mostra, para quem não enxerga e para quem ouve a gravação.",
    "Cores e emojis comunicam bem, mas não podem ser a única diferença: parte do público tem daltonismo, baixa visão ou usa leitor de tela. Junte a cor a um rótulo: em vez de uma bolinha verde e uma vermelha, escreva também “passou” e “falhou”.",
    "Todo texto do modelo tem contraste de 4,5:1 ou mais com o fundo. Ao usar outras cores, confira em webaim.org/resources/contrastchecker.",
  ],
  // Imagem e texto
  [
    "Uma foto na vertical preenche este espaço; uma foto na horizontal aparece recortada nas laterais.",
    "Confira se a licença da foto permite o uso numa palestra gravada e dê o crédito no formato “Foto: nome, licença, site”.",
  ],
  // Três imagens
  [
    "Troque cada caixa cinza pela sua captura de tela: botão direito > Substituir imagem (no PowerPoint, Alterar Imagem).",
    "Antes de capturar a tela, aumente o zoom do navegador ou a fonte do terminal.",
    "Confira se a captura mostra senhas, tokens, e-mails, abas ou notificações.",
  ],
  // Código
  [
    "Se a sua palestra não tem código, pode pular este slide.",
    "Até 8 linhas e 60 colunas. Se o trecho for maior, divida em slides ou mostre só o que importa.",
    "Para as mesmas cores, use o slidesnippet.com com o tema GitHub Light.",
    "O código fica num cartão claro também no slide escuro. Estudos de legibilidade mostram que texto escuro sobre fundo claro se lê melhor, em especial em letra pequena, como a do código (Piepenbrock, Mayr e Buchner, 2014).",
    "Se preferir fundo escuro no código, use o tema Monokai com o fundo #1A1A1A e deixe a fonte bem grande.",
    "Google Slides: “Copy styled” e Editar > Colar. PowerPoint: “Copy styled” e colar com Manter Formatação Original. LibreOffice: baixe o SVG e arraste para o cartão.",
  ],
  // Código lado a lado
  [
    "Antes e depois de uma refatoração, ou duas formas de resolver o mesmo problema.",
    "Cada cartão aceita até 30 colunas. O cartão da esquerda mostra como fica a letra miúda no telão.",
    "Emoji também é recurso: um rosto triste ou feliz diz na hora qual lado é o exemplo a evitar. O título diz o mesmo em palavras, para quem não vê o emoji.",
  ],
  // Números em destaque
  [
    "Até três números, cada um com um rótulo do que mede.",
    "Ensaiar em voz alta, com cronômetro, mostra o tempo real e costuma deixar a fala mais solta. O que passar do tempo pode ir para as anotações.",
  ],
  // Três cartões
  [
    "Escolha o plano B que combina com a sua palestra e ensaie a troca para ele no seu computador.",
    "Com palestras emendadas, nem sempre dá para testar o som; um vídeo legendado funciona sem áudio.",
    "O telão mostra tudo o que aparece na sua tela: ative o modo Não incomodar e deixe abertos só as abas e os programas da palestra. Numa janela anônima, o navegador não sugere endereços do histórico.",
  ],
  // Somente título, com tabela
  [
    "Espaço livre para tabelas, gráficos e diagramas.",
    "Testar em casa o adaptador de vídeo e o espelhamento de tela costuma deixar o dia mais tranquilo.",
    ev.textos.ajudaNaSala,
    "Depois da palestra, anote o que funcionou, para a próxima. Cansaço depois de palestrar é normal: descanse e aproveite o resto do evento.",
  ],
  // Gráfico
  [
    "PowerPoint: botão direito no gráfico > Editar Dados. LibreOffice: clique duas vezes no gráfico e use Exibir > Tabela de dados.",
    `O Google Slides importa o gráfico como imagem. Lá, crie o seu em Inserir > Gráfico e pinte as barras de ${ev.corDestaque} (#${brand.fill}).`,
    "Um gráfico, uma mensagem: diga em voz alta o que o público deve ver nas barras.",
    "Escreva os números do gráfico no texto alternativo, para leitores de tela.",
  ],
  // Fluxo
  [
    "Um fluxo mostra uma sequência: os passos de um processo, as etapas de um pipeline, a programação do dia.",
    "Conte o fluxo da esquerda para a direita: primeiro, depois, no fim.",
    "Cada caixa e cada seta são formas: para um passo a mais, duplique uma caixa e uma seta e arraste para o lugar.",
    "De três a cinco passos cabem numa linha. Para um fluxo com ramificações, divida em dois slides.",
  ],
  // Imagem cheia
  [
    "Botão direito na imagem > Substituir imagem (no PowerPoint, Alterar Imagem). Para usar a faixa da legenda em outra foto, duplique este slide.",
    "Dê o crédito da foto na legenda, como no exemplo.",
  ],
  // Destaque, código de conduta
  [
    `O código de conduta ${ev.conduta.de} vale para todas as pessoas no evento, inclusive no palco: ${ev.conduta.endereco}.`,
    ev.textos.ajudaConduta,
    `O painel ${ev.corDestaque} guarda a mensagem que a sala não pode perder, com até quatro tópicos curtos ao lado.`,
    "Para quem está começando, “é só” e “todo mundo sabe” soam como “você deveria saber”. Mostre o passo a passo e explique cada sigla na primeira vez.",
    `Para muita gente, a ${ev.nomeCurto} é a primeira conferência; um exemplo do dia a dia ajuda quem chegou agora.`,
  ],
  // Referências
  [
    "Um material por linha, com o nome e o endereço curto.",
    "Uma página só com todos os links (um README, um gist ou um Linktree) cabe num QR code no encerramento.",
  ],
  // Encerramento
  [
    "O QR code pode levar ao seu contato, aos seus slides ou a uma página com tudo isso. Com uma página só, você troca os links depois sem mudar o QR code.",
    "Para gerar o QR code no LibreOffice: Inserir > Objeto > Código QR e de barras. Nos outros programas, gere a imagem num site de QR code e substitua esta. Depois, troque a legenda pelo link.",
    "Nas perguntas, repita cada pergunta no microfone, para a sala e a gravação.",
    "“Não sei, posso ver e te respondo depois” é uma boa resposta. Uma pergunta que desrespeita o código de conduta não precisa de resposta.",
    ...(ev.textos.recadoDaOrganizacao ? [ev.textos.recadoDaOrganizacao] : []),
  ],
];
