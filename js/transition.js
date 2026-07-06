(function () {
  var BLOCK    = 12;        // pixel block size in px
  var DURATION = 450;       // ms for a full dissolve
  var COLOR    = '#080808'; // block colour

  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.id  = 'pixel-transition';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: '99998',   // below cursor (99999) above everything else
  });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeBlocks() {
    var cols   = Math.ceil(canvas.width  / BLOCK);
    var rows   = Math.ceil(canvas.height / BLOCK);
    var blocks = [];
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        blocks.push([c * BLOCK, r * BLOCK]);
    // Fisher-Yates shuffle
    for (var i = blocks.length - 1; i > 0; i--) {
      var j   = Math.floor(Math.random() * (i + 1));
      var tmp = blocks[i]; blocks[i] = blocks[j]; blocks[j] = tmp;
    }
    return blocks;
  }

  function animate(blocks, fill, onDone) {
    var total    = blocks.length;
    var done     = 0;
    var perFrame = Math.max(1, Math.ceil(total / (DURATION / (1000 / 60))));
    ctx.fillStyle = COLOR;
    (function step() {
      var end = Math.min(done + perFrame, total);
      while (done < end) {
        var b = blocks[done++];
        if (fill) ctx.fillRect(b[0], b[1], BLOCK, BLOCK);
        else      ctx.clearRect(b[0], b[1], BLOCK, BLOCK);
      }
      if (done < total) requestAnimationFrame(step);
      else if (onDone)  onDone();
    }());
  }

  function cover(onDone) {
    resize();
    if (!canvas.parentNode) document.body.appendChild(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animate(makeBlocks(), true, onDone);
  }

  function reveal() {
    resize();
    if (!canvas.parentNode) document.body.appendChild(canvas);
    ctx.fillStyle = COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate(makeBlocks(), false, function () { canvas.remove(); });
  }

  // Intercept internal link clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (url.hash && url.pathname === location.pathname) return; // anchor only
    e.preventDefault();
    sessionStorage.setItem('px-nav', '1');
    cover(function () { window.location.href = a.href; });
  }, false);

  // Reveal if we arrived via a pixel transition
  if (sessionStorage.getItem('px-nav')) {
    sessionStorage.removeItem('px-nav');
    reveal();
  }

  // Register service worker for PWA / offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})();
