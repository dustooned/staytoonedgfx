// 🖱️ cursor.js — Animated fake cursor
//
// CSS cursor: url() does not animate GIFs — only PNG/SVG work natively.
// This replaces the native cursor with a positioned <div> so GIFs animate.
//
// Site-wide:    assets/cursor.png  (idle)   +  assets/cursor.gif  (hover)
// Per-series:   called via window.__cursorSetPaths(staticPath, animPath)
//               from reader.js / series.js after loading the manifest.
//
// Touch devices are skipped — pointer: coarse check at the top.

(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // Detect base path — handles both root pages and posts/ subpages
  const base = (document.querySelector('link[rel="stylesheet"]')
    ?.getAttribute('href') || 'css/style.css').replace('css/style.css', '');

  let SRC_IDLE = base + 'assets/cursor.png';
  let SRC_ANIM = base + 'assets/cursor.gif';

  // ── Build the cursor element ──────────────────────────────────────────
  const el = document.createElement('div');
  el.id = 'site-cursor';
  Object.assign(el.style, {
    position:           'fixed',
    top:                '0',
    left:               '0',
    width:              '32px',
    height:             '32px',
    backgroundImage:    `url(${SRC_IDLE})`,
    backgroundSize:     'contain',
    backgroundRepeat:   'no-repeat',
    pointerEvents:      'none',
    zIndex:             '99999',
    imageRendering:     'pixelated',
    transform:          'translate(-100px, -100px)',
    willChange:         'transform',
  });
  document.body.appendChild(el);

  // Hide the native cursor everywhere
  const hideStyle = document.createElement('style');
  hideStyle.textContent = '@media (pointer: fine) { * { cursor: none !important; } }';
  document.head.appendChild(hideStyle);

  // ── Mouse tracking + interactive detection ────────────────────────────
  // Merged into mousemove: position updates every frame, interactive state
  // is checked on every move. Simpler and more reliable than separate
  // mouseover — no requestAnimationFrame race condition.
  const INTERACTIVE = 'a, button, select, input, label, [role="button"], [tabindex]';
  let onInteractive = false;

  document.addEventListener('mousemove', e => {
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

    const now = !!e.target.closest(INTERACTIVE);
    if (now !== onInteractive) {
      onInteractive = now;
      el.style.backgroundImage = now ? `url(${SRC_ANIM})` : `url(${SRC_IDLE})`;
    }
  }, { passive: true });

  // mouseout with no relatedTarget = cursor left the viewport
  document.addEventListener('mouseout', e => {
    if (!e.relatedTarget) el.style.transform = 'translate(-100px, -100px)';
  }, { passive: true });

  // ── API for per-series cursor override ───────────────────────────────
  // Called by reader.js / series.js after manifest loads:
  //   window.__cursorSetPaths('comics/iagl/assets/cursor.png', 'comics/iagl/assets/cursor.gif')
  window.__cursorSetPaths = function (staticPath, animPath) {
    SRC_IDLE = staticPath || SRC_IDLE;
    SRC_ANIM = animPath   || staticPath || SRC_IDLE;
    onInteractive = false;
    el.style.backgroundImage = `url(${SRC_IDLE})`;
  };

})();
