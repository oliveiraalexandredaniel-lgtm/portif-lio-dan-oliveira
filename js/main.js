/* =====================================================================
   main.js | Ponto de entrada
   Conecta os módulos: dados (data.js) -> cards (projects.js)
   -> carrossel 3D (carousel3d.js) -> controles e painel de detalhes.
   ===================================================================== */
(function () {
  'use strict';

  /** Monta o carrossel de projetos e liga botões, pontos e painel de detalhes. */
  function initProjects() {
    const { projects } = window.PortfolioData;

    const root = document.getElementById('carousel');
    const ring = document.getElementById('carousel-ring');
    const dotsBox = document.getElementById('carousel-dots');
    const detail = document.getElementById('project-detail');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    // 1) Renderiza os cards a partir dos dados
    window.PortfolioProjects.renderCards(ring, projects);

    // 2) Cria um "ponto" de navegação por projeto
    const dots = projects.map((project, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para ${project.title}`);
      dot.addEventListener('click', () => carousel.goTo(i));
      dotsBox.append(dot);
      return dot;
    });

    // 3) Atualiza pontos e painel quando o projeto ativo muda
    function onProjectChange(index) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', String(i === index));
      });
      window.PortfolioProjects.renderDetail(detail, projects[index]);
    }

    // 4) Instancia o carrossel 3D
    const carousel = new window.Carousel3D(root, {
      onChange: onProjectChange,
      autoplay: 0, // ex.: 7000 para girar sozinho a cada 7s (pausa ao passar o mouse)
    });

    onProjectChange(carousel.current); // estado inicial

    // 5) Botões anterior / próximo
    prevBtn.addEventListener('click', () => carousel.prev());
    nextBtn.addEventListener('click', () => carousel.next());
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.PortfolioUI.init();
    initProjects();
  });
})();