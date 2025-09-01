// js/script.js
// Carrusel de testimonios: 1 ítem en móvil, 4 en pantallas grandes.
// Navegación por flechas, autoplay cada 5s, pausa al hover, teclado y swipe.
// No requiere librerías.

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.carousel').forEach(setupCarousel);
  });

  function setupCarousel(root) {
    const viewport   = root.querySelector('.viewport');
    const track      = root.querySelector('.track');
    const slides     = Array.from(track.children);
    const prevBtn    = root.querySelector('.prev');
    const nextBtn    = root.querySelector('.next');

    // Config desde data-attributes (con defaults)
    const autoplayMs    = toInt(root.dataset.autoplay, 5000);
    const itemsMobile   = toInt(root.dataset.itemsMobile, 1);
    const itemsDesktop  = toInt(root.dataset.itemsDesktop, 4);
    const breakpoint    = toInt(root.dataset.breakpoint, 1024); // px para desktop

    const mqDesktop = window.matchMedia(`(min-width: ${breakpoint}px)`);

    let index = 0;            // índice del primer slide visible
    let slidesToShow = itemsMobile;
    let slideW = 0;
    let gapPx = 0;
    let timer = null;

    // ===== Helpers =====
    function toInt(v, def) {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : def;
    }
    function getGap() {
      const gapStr = getComputedStyle(track).gap || '0px';
      const n = parseFloat(gapStr);
      return Number.isFinite(n) ? n : 0;
    }
    function calcSlidesToShow() {
      return mqDesktop.matches ? itemsDesktop : itemsMobile;
    }
    function maxIndex() {
      return Math.max(0, slides.length - slidesToShow);
    }

    // ===== Layout =====
    function setSizes() {
      slidesToShow = calcSlidesToShow();
      gapPx = getGap();

      const vw = viewport.clientWidth;
      // Ancho de cada slide considerando gaps entre ítems visibles
      slideW = (vw - gapPx * (slidesToShow - 1)) / slidesToShow;

      slides.forEach(sl => {
        sl.style.width = `${slideW}px`;
        sl.style.flex = `0 0 ${slideW}px`;
      });

      // Recoloca al índice actual sin animación para evitar "saltos"
      goTo(index, false);
    }

    // ===== Movimiento =====
    function goTo(i, animate = true) {
      const maxI = maxIndex();
      // Wrap-around
      if (i < 0) i = maxI;
      if (i > maxI) i = 0;
      index = i;

      track.style.transition = animate ? 'transform .4s ease' : 'none';
      // Distancia: ancho de slide + gap por cada paso
      const x = -(index * (slideW + gapPx));
      track.style.transform = `translateX(${x}px)`;
    }

    // ===== Controles =====
    prevBtn?.addEventListener('click', () => { goTo(index - 1); restart(); });
    nextBtn?.addEventListener('click', () => { goTo(index + 1); restart(); });

    // Teclado cuando el carrusel tiene foco
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nextBtn?.click(); }
      if (e.key === 'ArrowLeft')  { prevBtn?.click(); }
    });

    // Swipe táctil
    let startX = 0, isTouching = false;
    viewport.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      isTouching = true;
      startX = e.touches[0].clientX;
      stop();
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      // opcional: podríamos arrastrar visualmente; mantenemos simple
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (!isTouching) return;
      isTouching = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? nextBtn?.click() : prevBtn?.click();
      }
      start();
    });

    // Autoplay + pausa al hover
    function start()   { if (autoplayMs > 0) timer = setInterval(() => goTo(index + 1), autoplayMs); }
    function stop()    { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    // Recalcular en resize / cambio de media query
    window.addEventListener('resize', setSizes);
    mqDesktop.addEventListener?.('change', setSizes);

    // Init
    setSizes();
    start();

    // Asegurar foco navegable en viewport
    viewport.setAttribute('tabindex', viewport.getAttribute('tabindex') ?? '0');
  }
})();
