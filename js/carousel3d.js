/* =====================================================================
   carousel3d.js | Componente de carrossel 3D giratório (reutilizável)

   Ideia geométrica:
     - N cards ficam distribuídos num círculo (anel) ao redor do eixo Y.
     - Cada card i recebe:  rotateY(i * 360/N deg) translateZ(raio)
     - Para "trazer" o card i para a frente, giramos o anel inteiro em
       -i * 360/N graus. O anel também recua (translateZ(-raio)) para que
       o card da frente fique no plano da tela, sem estourar a perspectiva.

   Interações: clique em botões/pontos/cards, arrastar (mouse e toque,
   com inércia), teclado (← →) e autoplay opcional.

   Uso:
     const carousel = new Carousel3D(rootEl, { onChange: (i) => {...} });
     carousel.next(); carousel.prev(); carousel.goTo(2);

   Estrutura HTML esperada:
     <div class="carousel3d"> <div class="carousel3d__ring"> ...cards... </div> </div>
   ===================================================================== */
(function (global) {
  'use strict';

  const DEFAULTS = {
    dragSensitivity: 0.32, // graus de rotação por pixel arrastado
    inertia: 260,          // ms de "projeção" da velocidade ao soltar
    dragThreshold: 6,      // px mínimos para considerar que é um arraste (e não um clique)
    gap: 40,               // folga entre cards no anel (px)
    minRadius: 280,        // raio mínimo (evita anel apertado com poucos cards)
    autoplay: 0,           // ms entre trocas automáticas (0 = desligado)
    onChange: () => {},    // chamado com o índice ativo quando muda
  };

  /** Módulo matemático que funciona para negativos: mod(-1, 3) === 2 */
  const mod = (n, m) => ((n % m) + m) % m;

  class Carousel3D {
    /**
     * @param {HTMLElement} root  elemento .carousel3d
     * @param {Partial<typeof DEFAULTS>} options
     */
    constructor(root, options = {}) {
      this.root = root;
      this.ring = root.querySelector('.carousel3d__ring');
      this.items = Array.from(this.ring.children);
      this.opts = { ...DEFAULTS, ...options };

      this.count = this.items.length;
      this.step = 360 / this.count;   // ângulo entre cards
      this.rotation = 0;              // rotação atual do anel (graus, contínua)
      this.current = 0;               // índice do card ativo (0..N-1)
      this.rawIndex = 0;              // índice "sem módulo", mantém o sentido do giro
      this.radius = 0;

      // Estado do arraste
      this.drag = { active: false, moved: false, startX: 0, startRotation: 0, lastX: 0, lastT: 0, velocity: 0 };
      this.suppressClick = false;
      this.autoplayTimer = null;
      this.paused = false;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.layout();
      this.render();
      this.bindEvents();
      this.startAutoplay();
    }

    /* ------------------------------ Layout ------------------------------ */

    /** Calcula o raio do anel e posiciona cada card no círculo. */
    layout() {
      const cardWidth = this.items[0].offsetWidth;
      // Raio para que cards vizinhos não colidam: (metade da largura + folga) / tan(π/N)
      const geometric = this.count > 1 ? (cardWidth / 2 + this.opts.gap) / Math.tan(Math.PI / this.count) : 0;
      this.radius = Math.max(geometric, this.count > 1 ? this.opts.minRadius : 0);

      this.items.forEach((item, i) => {
        item.style.transform = `rotateY(${i * this.step}deg) translateZ(${this.radius}px)`;
      });
    }

    /* ------------------------------ Render ------------------------------ */

    /** Aplica a rotação ao anel e atualiza aparência (profundidade/foco) dos cards. */
    render() {
      this.ring.style.transform = `translateZ(${-this.radius}px) rotateY(${this.rotation}deg)`;

      const nearest = this.nearestIndex();
      if (nearest !== this.current) {
        this.current = nearest;
        this.opts.onChange(this.current);
      }

      this.items.forEach((item, i) => {
        // Ângulo do card relativo à frente da tela, normalizado para [-180, 180]
        const rel = mod(i * this.step + this.rotation + 180, 360) - 180;
        const depth = (1 + Math.cos((rel * Math.PI) / 180)) / 2; // 1 = frente, 0 = atrás

        item.style.opacity = (0.18 + 0.82 * depth * depth).toFixed(3);
        item.classList.toggle('is-active', i === this.current);
        item.setAttribute('aria-hidden', i === this.current ? 'false' : 'true');
      });
    }

    /** Índice do card mais próximo da frente com base na rotação atual. */
    nearestIndex() {
      return mod(Math.round(-this.rotation / this.step), this.count);
    }

    /* ----------------------------- Navegação ----------------------------- */

    /** Gira até o índice bruto informado (inteiro, pode ser negativo ou > N). */
    snapTo(rawIndex) {
      this.rawIndex = rawIndex;
      this.rotation = -rawIndex * this.step;
      this.render();
    }

    next() { this.snapTo(this.rawIndexFromRotation() + 1); }
    prev() { this.snapTo(this.rawIndexFromRotation() - 1); }

    /** Vai para um índice 0..N-1 pelo caminho mais curto. */
    goTo(index) {
      const base = this.rawIndexFromRotation();
      let delta = mod(index - mod(base, this.count), this.count);
      if (delta > this.count / 2) delta -= this.count;
      this.snapTo(base + delta);
    }

    rawIndexFromRotation() {
      return Math.round(-this.rotation / this.step);
    }

    /* ------------------------------ Eventos ------------------------------ */

    bindEvents() {
      const { root } = this;

      // Arraste (Pointer Events cobrem mouse, toque e caneta)
      root.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      root.addEventListener('pointermove', (e) => this.onPointerMove(e));
      root.addEventListener('pointerup', (e) => this.onPointerUp(e));
      root.addEventListener('pointercancel', (e) => this.onPointerUp(e));

      // Clique em card inativo traz o card para a frente.
      // Fase de captura: roda antes de links dentro do card.
      root.addEventListener('click', (e) => this.onClick(e), true);

      // Teclado
      root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); this.prev(); }
      });

      // Pausa o autoplay ao interagir
      ['mouseenter', 'focusin'].forEach((ev) => root.addEventListener(ev, () => (this.paused = true)));
      ['mouseleave', 'focusout'].forEach((ev) => root.addEventListener(ev, () => (this.paused = false)));

      // Recalcula o raio ao redimensionar a janela
      let resizeFrame;
      window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => { this.layout(); this.render(); });
      });
    }

    onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const d = this.drag;
      d.active = true;
      d.moved = false;
      d.startX = d.lastX = e.clientX;
      d.startRotation = this.rotation;
      d.lastT = performance.now();
      d.velocity = 0;
    }

    onPointerMove(e) {
      const d = this.drag;
      if (!d.active) return;

      const dx = e.clientX - d.startX;

      // Só vira "arraste" após passar do limiar: assim cliques simples continuam funcionando
      if (!d.moved && Math.abs(dx) > this.opts.dragThreshold) {
        d.moved = true;
        this.ring.classList.add('is-dragging');
        this.root.classList.add('is-grabbing');
        this.root.setPointerCapture(e.pointerId);
      }
      if (!d.moved) return;

      // Velocidade instantânea (graus/ms) para a inércia
      const now = performance.now();
      const dt = Math.max(now - d.lastT, 1);
      d.velocity = ((e.clientX - d.lastX) * this.opts.dragSensitivity) / dt;
      d.lastX = e.clientX;
      d.lastT = now;

      this.rotation = d.startRotation + dx * this.opts.dragSensitivity;
      this.render();
    }

    onPointerUp(e) {
      const d = this.drag;
      if (!d.active) return;
      d.active = false;

      if (!d.moved) return; // foi só um clique

      this.ring.classList.remove('is-dragging');
      this.root.classList.remove('is-grabbing');
      if (this.root.hasPointerCapture(e.pointerId)) this.root.releasePointerCapture(e.pointerId);

      // Projeta a rotação final com base na velocidade e "encaixa" no card mais próximo
      // O impulso e limitado a 1 card, para um flick rapido nao dar varias voltas
      const boost = Math.max(-this.step, Math.min(this.step, d.velocity * this.opts.inertia));
      const projected = this.rotation + boost;
      this.snapTo(Math.round(-projected / this.step));

      // Evita que o "soltar" dispare um click no card sob o cursor
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false), 0);
    }

    onClick(e) {
      if (this.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const item = e.target.closest('.carousel3d__item');
      if (!item) return;
      const index = this.items.indexOf(item);
      if (index !== this.current) {
        e.preventDefault();
        e.stopPropagation();
        this.goTo(index);
      }
    }

    /* ------------------------------ Autoplay ------------------------------ */

    startAutoplay() {
      if (!this.opts.autoplay || this.reducedMotion || this.count < 2) return;
      this.autoplayTimer = setInterval(() => {
        if (!this.paused && !this.drag.active && !document.hidden) this.next();
      }, this.opts.autoplay);
    }

    /** Libera timers (útil se o componente for removido da página). */
    destroy() {
      clearInterval(this.autoplayTimer);
    }
  }

  global.Carousel3D = Carousel3D;
})(window);
