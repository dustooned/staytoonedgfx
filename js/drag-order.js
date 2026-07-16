// drag-order.js — drag-to-reorder series cards on the homepage
// Uses pointer events (mouse + touch). Order persists via localStorage.

(function () {

  const STORAGE_KEY  = 'stg-series-order';
  const DRAG_THRESHOLD = 8; // px of movement before drag activates

  // ── Persist / retrieve ───────────────────────────────────────────
  function saveOrder(grid) {
    const slugs = [...grid.querySelectorAll('.series-card[data-slug]')]
      .map(c => c.dataset.slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }

  window.getSavedSeriesOrder = function () {
    try   { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; }
    catch { return null; }
  };

  // ── Main init — call after cards are in the DOM ──────────────────
  window.initDragOrder = function (grid) {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let dragging       = null; // the card being dragged
    let ghost          = null; // floating clone that follows the pointer
    let cardW = 0, cardH = 0; // cached dimensions of the dragging card
    let offsetX = 0, offsetY = 0; // pointer offset inside the card
    let startX  = 0, startY  = 0; // where the pointer went down
    let active  = false;           // true once drag threshold is crossed

    // ── Helpers ────────────────────────────────────────────────────
    function cards() {
      return [...grid.querySelectorAll('.series-card[data-slug]')];
    }

    // ── Kick off drag visuals once threshold is crossed ────────────
    function activateDrag() {
      active = true;
      const rect = dragging.getBoundingClientRect();
      cardW = rect.width;
      cardH = rect.height;

      ghost = dragging.cloneNode(true);
      Object.assign(ghost.style, {
        position:      'fixed',
        left:          rect.left + 'px',
        top:           rect.top  + 'px',
        width:         cardW     + 'px',
        pointerEvents: 'none',
        zIndex:        '9999',
        opacity:       '0.92',
        boxShadow:     '0 16px 48px rgba(0,0,0,0.55)',
        transform:     'scale(1.04) rotate(0.8deg)',
        transition:    'transform 0.1s ease, box-shadow 0.1s ease',
        willChange:    'left, top',
      });
      document.body.appendChild(ghost);

      dragging.style.opacity       = '0.2';
      dragging.style.pointerEvents = 'none';
      document.body.classList.add('is-dragging');
    }

    // ── Pointer down — start watching for movement ─────────────────
    function onPointerDown(e) {
      if (e.button !== 0) return; // primary only
      dragging = e.currentTarget;
      const rect = dragging.getBoundingClientRect();
      startX  = e.clientX;
      startY  = e.clientY;
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      active  = false;

      document.addEventListener('pointermove', onPointerMove, { passive: false });
      document.addEventListener('pointerup',   onPointerUp);
    }

    // ── Pointer move — activate on threshold, then track + swap ────
    function onPointerMove(e) {
      if (!dragging) return;

      if (!active) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist < DRAG_THRESHOLD) return;
        activateDrag();
      }

      e.preventDefault(); // prevent page scroll while dragging

      // Move ghost
      ghost.style.left = (e.clientX - offsetX) + 'px';
      ghost.style.top  = (e.clientY - offsetY) + 'px';

      // Hit-test: find which card the ghost center is over
      const cx = e.clientX - offsetX + cardW / 2;
      const cy = e.clientY - offsetY + cardH / 2;

      for (const card of cards()) {
        if (card === dragging) continue;
        const r = card.getBoundingClientRect();
        if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom) {
          const all  = cards();
          const di   = all.indexOf(dragging);
          const hi   = all.indexOf(card);
          if (di < hi) card.after(dragging);
          else          card.before(dragging);
          break;
        }
      }
    }

    // ── Pointer up — clean up and save ─────────────────────────────
    function onPointerUp() {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   onPointerUp);

      if (ghost)    { ghost.remove(); ghost = null; }
      if (dragging) {
        dragging.style.opacity       = '';
        dragging.style.pointerEvents = '';
        dragging = null;
      }
      document.body.classList.remove('is-dragging');

      if (active) saveOrder(grid);
      active = false;
    }

    // ── Attach listeners to every card ─────────────────────────────
    cards().forEach(card => {
      card.style.cursor     = 'grab';
      card.style.userSelect = 'none';
      card.addEventListener('pointerdown', onPointerDown);
    });
  };

})();
