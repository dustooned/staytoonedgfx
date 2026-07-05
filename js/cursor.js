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

  // ── Mouse tracking ────────────────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(-100px, -100px)';
  }, { passive: true });

  // ── Swap between idle and animated on interactive elements ────────────
  const INTERACTIVE = 'a, button, select, input, label, [role="button"], [tabindex]';
  let onInteractive = false;

  document.addEventListener('mouseover', e => {
    const isInteractive = !!e.target.closest(INTERACTIVE);

    if (isInteractive && !onInteractive) {
      // Force GIF to restart from frame 1 by briefly clearing
      el.style.backgroundImage = 'none';
      requestAnimationFrame(() => {
        el.style.backgroundImage = `url(${SRC_ANIM})`;
      });
    } else if (!isInteractive && onInteractive) {
      el.style.backgroundImage = `url(${SRC_IDLE})`;
    }

    onInteractive = isInteractive;
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
