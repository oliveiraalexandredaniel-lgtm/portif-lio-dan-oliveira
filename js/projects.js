/* =====================================================================
   projects.js | Renderização dos cards e do painel de detalhes
   Responsabilidade única: transformar dados (data.js) em DOM.
   Não conhece nada sobre rotação 3D (isso é do carousel3d.js).
   ===================================================================== */
(function (global) {
  'use strict';

  /**
   * Helper para criar elementos de forma segura (usa textContent, nunca innerHTML).
   * @param {string} tag
   * @param {Object} props  class, text, ou qualquer propriedade/atributo
   * @param {Array<Node|null>|Node} children
   */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('aria-') || key.startsWith('data-') || key === 'role') node.setAttribute(key, value);
      else node[key] = value;
    });
    [].concat(children).forEach((child) => child && node.append(child));
    return node;
  }

  /** Cria a lista de tags de tecnologia. */
  function buildTags(tags) {
    return el('ul', { class: 'tags' }, tags.map((t) => el('li', { class: 'tag', text: t })));
  }

  /** Cria o elemento de um card do carrossel. */
  function buildCard(project, index, total) {
    return el(
      'article',
      {
        class: 'carousel3d__item project-card',
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': `${index + 1} de ${total}: ${project.title}`,
        'data-id': project.id,
      },
      [
        el('div', { class: 'project-card__top' }, [
          el('span', { class: 'project-card__icon', text: project.icon, 'aria-hidden': 'true' }),
          el('span', { class: 'chip chip--accent', text: project.status }),
        ]),
        el('h3', { class: 'project-card__title', text: project.title }),
        el('p', { class: 'project-card__subtitle', text: project.subtitle }),
        el('p', { class: 'project-card__summary', text: project.summary }),
        buildTags(project.tags),
        el('p', { class: 'project-card__more', text: '↓ detalhes abaixo' }),
      ]
    );
  }

  /**
   * Insere todos os cards dentro do "ring" e devolve a lista de elementos.
   * @param {HTMLElement} ring
   * @param {Array} projects
   * @returns {HTMLElement[]}
   */
  function renderCards(ring, projects) {
    const cards = projects.map((p, i) => buildCard(p, i, projects.length));
    ring.replaceChildren(...cards);
    return cards;
  }

  /**
   * Preenche o painel de detalhes com o projeto ativo.
   * @param {HTMLElement} container
   * @param {Object} project
   */
  function renderDetail(container, project) {
    const links = project.links.map((link) =>
      el('a', {
        class: 'btn btn--ghost',
        href: link.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: `${link.label} ↗`,
      })
    );

    const left = el('div', {}, [
      el('p', { class: 'eyebrow', text: project.status }),
      el('h3', { text: project.title }),
      el('p', { text: project.description }),
      buildTags(project.tags),
      links.length ? el('div', { class: 'project-detail__links' }, links) : null,
    ]);

    const right = el('div', {}, [
      el('h4', { text: 'Destaques' }),
      el('ul', { class: 'project-detail__list' }, project.highlights.map((h) => el('li', { text: h }))),
    ]);

    container.replaceChildren(left, right);

    // Reinicia a animação de entrada a cada troca de projeto
    container.style.animation = 'none';
    void container.offsetWidth; // força reflow
    container.style.animation = '';
  }

  global.PortfolioProjects = { renderCards, renderDetail };
})(window);