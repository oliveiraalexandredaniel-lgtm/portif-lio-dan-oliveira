/* =====================================================================
   RETRO | retro.js
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var room = document.getElementById('room');
  var screen = document.getElementById('screen');
  var img = document.getElementById('scene-bg');
  var frame = document.getElementById('site');
  var boot = document.getElementById('boot');
  var btn = document.getElementById('boot-btn');
  var canvas = document.getElementById('boot-static');

  var mobile = window.matchMedia('(max-width: 700px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Efeitos sonoros */
  var startSound = new Audio('assets/click-start.wav');
  var mouseClickSound = new Audio('assets/click-mouse.wav');
  var introSound = new Audio('assets/intro.wav');

  /* Tempos da transição */
  var STATIC_MS = reduceMotion ? 250 : 1500;
  var LOAD_AT   = reduceMotion ? 0   : 700;
  var FADE_MS   = 380;
  var GIVE_UP   = 7000;
  var FOCUS_BTN_AFTER = 3000;

  /* ------------------------------------------------------------------ */
  /* VÍDEO DE INTRODUÇÃO E LIBERAÇÃO DO ÁUDIO DE ABERTURA              */
  /* ------------------------------------------------------------------ */
  function initIntro() {
    var introVideo = document.getElementById('introVideo');
    var introOverlay = document.getElementById('introOverlay');

    function removeIntro() {
      if (introOverlay && !introOverlay.classList.contains('fade-out')) {
        introOverlay.classList.add('fade-out');
      }
    }

    // Tenta reproduzir o som da intro imediatamente
    introSound.volume = 1.0;
    var playPromise = introSound.play();

    // Se o navegador bloquear o Autoplay, libera o som na primeira interatividade do usuário
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        function unlockAndPlay() {
          introSound.currentTime = 0;
          introSound.play().catch(function () {});
          // Remove os eventos após disparar o áudio uma vez
          window.removeEventListener('pointerdown', unlockAndPlay);
          window.removeEventListener('keydown', unlockAndPlay);
          window.removeEventListener('mousemove', unlockAndPlay);
        }
        window.addEventListener('pointerdown', unlockAndPlay);
        window.addEventListener('keydown', unlockAndPlay);
        window.addEventListener('mousemove', unlockAndPlay, { once: true });
      });
    }

    if (introVideo) {
      introVideo.addEventListener('ended', removeIntro);
      introVideo.addEventListener('error', removeIntro);
      setTimeout(removeIntro, 2500); // Garante a remoção da intro após 2.5s
    } else {
      removeIntro();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }

  /* ------------------------------------------------------------------ */
  /* RELÓGIO VHS                                                         */
  /* ------------------------------------------------------------------ */
  function updateVHSTime() {
    var dateEl = document.getElementById('vhs-date');
    var timeEl = document.getElementById('vhs-time');
    if (!dateEl || !timeEl) return;

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
    var timeStr = now.toTimeString().split(' ')[0];

    dateEl.textContent = dateStr;
    timeEl.textContent = timeStr;
  }
  setInterval(updateVHSTime, 1000);
  updateVHSTime();

  /* ------------------------------------------------------------------ */
  /* 1. ESCALA DO IFRAME                                                */
  /* ------------------------------------------------------------------ */
  function virtualWidth() {
    var v = parseFloat(getComputedStyle(root).getPropertyValue('--vw-site'));
    return v > 0 ? v : 1120;
  }

  function fit() {
    if (mobile.matches) {
      root.style.removeProperty('--k');
      return;
    }
    root.style.setProperty('--k', (screen.offsetWidth / virtualWidth()).toFixed(5));
  }

  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(screen);
  else window.addEventListener('resize', fit);

  /* ------------------------------------------------------------------ */
  /* 2. ZOOM E BOOT                                                      */
  /* ------------------------------------------------------------------ */
  var readyDone = false;
  function ready() {
    if (readyDone) return;
    readyDone = true;
    if (room) room.classList.add('is-ready');
    if (!reduceMotion && !mobile.matches) {
      setTimeout(function () { if (!started && btn) btn.focus({ preventScroll: true }); }, FOCUS_BTN_AFTER);
    } else if (btn) {
      btn.focus({ preventScroll: true });
    }
  }

  if (img) {
    if (img.decode) img.decode().then(ready, ready);
    else if (img.complete) ready();
    else img.addEventListener('load', ready);
  }
  setTimeout(ready, 1000);

  /* ------------------------------------------------------------------ */
  /* 3. BOOT & SOM DE INICIALIZAÇÃO                                     */
  /* ------------------------------------------------------------------ */
  var started = false;
  var rafId = 0;

  function runStatic() {
    var ctx = canvas.getContext('2d');
    var w = canvas.width = 220;
    var h = canvas.height = Math.round(220 * screen.offsetHeight / Math.max(screen.offsetWidth, 1)) || 143;
    var image = ctx.createImageData(w, h);
    var data = image.data;
    var t0 = performance.now();

    (function frameLoop(now) {
      for (var i = 0; i < data.length; i += 4) {
        var v = 35 + Math.random() * 190;
        data[i] = v; data[i + 1] = v; data[i + 2] = v * 1.04; data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);

      var y = ((now - t0) / 5) % (h + 24) - 12;
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(0, y, w, 12);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, (h - y) % h, w, 2);

      rafId = requestAnimationFrame(frameLoop);
    })(t0);
  }

  function stopStatic() { cancelAnimationFrame(rafId); }

  function start() {
    if (started) return;
    started = true;

    // Dispara o som ao clicar em INICIAR
    startSound.play().catch(function () {});

    boot.classList.add('is-starting');
    if (!reduceMotion) runStatic();

    var minTime = new Promise(function (resolve) { setTimeout(resolve, STATIC_MS); });
    var loaded = new Promise(function (resolve) {
      frame.addEventListener('load', function onLoad() {
        if (!frame.getAttribute('src')) return;
        frame.removeEventListener('load', onLoad);
        resolve();
      });
      setTimeout(function () { frame.src = frame.dataset.src; }, LOAD_AT);
      setTimeout(resolve, GIVE_UP);
    });

    Promise.all([minTime, loaded]).then(reveal);
  }

  function reveal() {
    frame.classList.add('is-on');
    boot.classList.add('is-leaving');
    setTimeout(function () {
      boot.classList.add('is-done');
      stopStatic();
      try { frame.focus({ preventScroll: true }); } catch (e) {}
    }, FADE_MS);
  }

  if (btn) btn.addEventListener('click', start);

  // Sons de clique para links fora do iframe
  document.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mouseClickSound.currentTime = 0;
      mouseClickSound.play().catch(function () {});
    });
  });

})();