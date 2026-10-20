/* =====================================================================
   ui.js | Comportamentos gerais da página (não relacionados ao carrossel)
   ===================================================================== */
(function (global) {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Header ganha fundo/blur depois de rolar um pouco. */
  function setupHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Menu hambúrguer no mobile. */
  function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /** 
   * ROLAGEM SUAVE ISOLADA DENTRO DO IFRAME (FIX DO DESLOCAMENTO DO MONITOR)
   */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          
          const headerOffset = 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  /** 
   * SOM DE CLIQUE DO MOUSE (Lazy Load)
   * O áudio só é instanciado no evento do clique para não interferir na reprodução da intro.
   */
  function setupClickSound() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        try {
          const clickSound = new Audio('assets/click-mouse.wav');
          clickSound.volume = 0.6;
          clickSound.play().catch(() => {});
        } catch (err) {}
      }
    });
  }

  /** Destaca no menu a seção que está no centro da tela. */
  function setupActiveLink() {
    const links = Array.from(document.querySelectorAll('.nav__link'));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /** Anima elementos .reveal quando entram na tela. */
  function setupReveal() {
    const targets = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach((t) => t.classList.add('is-visible'));
      return;
    }

    const settle = (el) => {
      const onEnd = (e) => {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        el.style.removeProperty('--reveal-delay');
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          settle(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((t) => {
      const siblings = Array.from(t.parentElement.children).filter((c) => c.classList.contains('reveal'));
      const step = Math.min(siblings.indexOf(t), 5);
      t.style.setProperty('--reveal-delay', `${step * 70}ms`);
      observer.observe(t);
    });
  }

  /** Brilho sutil [data-spotlight]. */
  function setupSpotlight() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('[data-spotlight]').forEach((node) => {
      let frame = 0;
      node.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect();
          node.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          node.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
      });
    });
  }

  /** Inclinação sutil ([data-tilt]). */
  function setupTilt() {
    const zone = document.querySelector('[data-tilt-zone]');
    const target = document.querySelector('[data-tilt]');
    if (!zone || !target || prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

    const MAX = 4;
    let frame = 0;

    zone.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = zone.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty('--ry', `${(x * MAX * 2).toFixed(2)}deg`);
        target.style.setProperty('--rx', `${(-y * MAX * 2).toFixed(2)}deg`);
      });
    });

    zone.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      target.style.setProperty('--ry', '0deg');
      target.style.setProperty('--rx', '0deg');
    });
  }

  /** Efeito de digitação (typewriter). */
  function setupTypewriter() {
    const target = document.getElementById('typewriter');
    if (!target) return;

    const words = (target.dataset.words || '').split('|').filter(Boolean);
    if (!words.length) return;

    if (prefersReducedMotion) {
      target.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = word.slice(0, charIndex);

      let delay = deleting ? 35 : 75;
      if (!deleting && charIndex === word.length) { deleting = true; delay = 1700; }
      else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 350; }

      setTimeout(tick, delay);
    };
    tick();
  }

  /** Copia o e-mail. */
  function setupCopyEmail() {
    const button = document.getElementById('copy-email');
    const feedback = document.getElementById('copy-feedback');
    if (!button) return;

    button.addEventListener('click', async () => {
      const email = button.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        feedback.textContent = 'Copiado! ✓';
      } catch {
        feedback.textContent = email;
      }
      setTimeout(() => (feedback.textContent = ''), 2500);
    });
  }

  function setupFooterYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /** Inicializa todos os comportamentos da página. */
  function init() {
    setupHeader();
    setupMobileNav();
    setupSmoothScroll();
    setupActiveLink();
    setupReveal();
    setupSpotlight();
    setupTilt();
    setupTypewriter();
    setupCopyEmail();
    setupFooterYear();
    setupClickSound();
  }

  global.PortfolioUI = { init };
})(window);