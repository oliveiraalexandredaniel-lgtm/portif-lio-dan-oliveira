Claro! Aqui está uma versão pronta para um README em Markdown, com o texto reorganizado e mais profissional:

# Portfólio Dan Oliveira

Bem-vindo ao repositório do meu portfólio pessoal, uma experiência visual inspirada em estética retrô, com elementos de CRT/VHS, HUDs, navegação em camadas e uma interface imersiva em estilo anos 90.

## Visão Geral

Este projeto foi desenvolvido como uma vitrine digital pessoal, combinando identidade visual retrô, interatividade e narrativa audiovisual. A experiência é estruturada em duas partes principais:

- Shell retrô principal em HTML, responsável pela estética do ambiente e do monitor vintage
- Aplicação do portfólio em uma interface interna, com navegação fluida, cards, efeitos visuais e conteúdo profissional

A proposta foi criar uma apresentação memorável, com identidade própria, impacto visual e uma sensação de “máquina antiga conectada ao futuro”.

## Ferramentas de IA e Assistentes

### Gemini
A IA Gemini foi utilizada para apoiar a unificação e a arquitetura dos arquivos do projeto, além da organização estrutural do conteúdo. Também auxiliou na criação do layout retrô com container iframe, resolução de bugs de scroll suave isolado, lógica do HUD da câmera VHS em tempo real e integração dos manipuladores de eventos de áudio.

### Claude (Anthropic)
O Claude foi utilizado para estruturar os componentes iniciais do portfólio e para auxiliar na lógica base do carrossel 3D e nos manipuladores DOM do arquivo ui.js.

### IA de Geração de Imagens
Foram usadas ferramentas de geração de imagens, como Midjourney, DALL·E e Leonardo AI, para criar a imagem principal do monitor CRT vintage dos anos 90 (retro-pc.jpg), que serve como plano de fundo da cena principal.

## Bancos de Áudio e Efeitos Sonoros

O projeto integra uma série de elementos sonoros para reforçar a atmosfera retrô e a experiência de uso.

- Mixkit: banco de efeitos sonoros utilizado para capturar cliques limpos e feedbacks de botões
- Freesound.org: utilizado para buscar ruídos analógicos de estática CRT
- Pixabay Sound Effects: usado para ruídos de fita VHS e chiado de gravação

### Arquivos de áudio incluídos
- intro.wav — som da câmera ligando na abertura
- click-start.wav — som do botão INICIAR no monitor
- click-mouse.wav — feedback sonoro suave de cliques nos botões e links do portfólio

## Vídeos e Mídia Animada

- intro-camera.mp4 — vídeo de abertura com estilo estática/glitch VHS que desvia suavemente antes da cena principal carregar

Essa mídia ajuda a criar a sensação de uma interface audiovisual antiga, com ruído, brilho e distorção característicos do analógico.

## Tecnologias e Linguagens

### HTML5
Estrutura semântica dividida entre:
- shell retrô principal em index.html
- aplicação do portfólio em portfolio.html

### CSS3 Avançado
O projeto utiliza CSS para criar:
- manipulação de viewport e escala dinâmica via variável --k
- estética retrô com linhas de varredura CRT (scanlines)
- efeito de vidro reflexivo e iluminação neon
- iluminação tipo spotlight e brilho em cards
- efeitos typewriter, tilt 3D e elementos visuais com profundidade

### JavaScript Puro (Vanilla JS)
A lógica de interação foi desenvolvida em JavaScript puro, incluindo:
- cálculo de rolagem suave com getBoundingClientRect().top para evitar que o iframe empurre a página pai
- manipulação de canvas para renderização de estática analógica em tempo real
- relógio e data dinâmicos no formato HUD VHS

### Google Fonts
Tipografia retrô inspirada em terminal, com uso da fonte VT323.

## Perfis Profissionais e Redes

- LinkedIn: link personalizado, configurado para abrir em nova aba com target="_blank" e rel="noopener noreferrer"
- GitHub: link direto para a vitrine de código e projetos públicos

## Stack Tecnológica

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Áudio e mídia retrô
- IA para design e arquitetura
- Visual design inspirado em CRT/VHS
