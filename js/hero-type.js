(function () {
  var container = document.getElementById('hero-phrase');
  if (!container) return;

  var PHRASE       = 'Stay Tooned GFX';
  var SCALE_MAX    = 1.55;
  var FALLOFF      = 1.1;
  var WORD_PALETTE = ['#f60047', '#48a6ff', '#ffca23', '#8fe900'];

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function getScale(distance) {
    return 1 + (SCALE_MAX - 1) * Math.exp(-FALLOFF * distance);
  }

  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var chars   = [];
  var wordIdx = 0;

  Array.from(PHRASE).forEach(function (ch) {
    var span = document.createElement('span');
    span.textContent = ch;
    span.setAttribute('aria-hidden', 'true');

    if (ch === ' ') {
      span.className = 'hero-char space';
      wordIdx++;
    } else {
      span.className = 'hero-char';
      if (finePointer) span.setAttribute('tabindex', '0');
      var color = WORD_PALETTE[wordIdx % WORD_PALETTE.length];
      span.style.color = color;
      span.style.setProperty('--char-glow', hexToRgba(color, 0.65));
    }

    chars.push(span);
    container.appendChild(span);
  });

  function applyScales(hoveredIndex) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chars.forEach(function (span, i) {
      if (span.classList.contains('space')) return;
      var dist  = Math.abs(i - hoveredIndex);
      var scale = reduced ? 1 : getScale(dist);
      span.style.transform = 'scale(' + scale.toFixed(3) + ')';
      span.classList.toggle('is-active', i === hoveredIndex);
    });
  }

  function resetScales() {
    chars.forEach(function (span) {
      if (span.classList.contains('space')) return;
      span.style.transform = 'scale(1)';
      span.classList.remove('is-active');
    });
  }

  if (finePointer) {
    chars.forEach(function (span, i) {
      if (span.classList.contains('space')) return;

      span.addEventListener('mouseenter', function () { applyScales(i); });
      span.addEventListener('focus',      function () { applyScales(i); });
      span.addEventListener('blur',       function () {
        if (!chars.some(function (s) { return s === document.activeElement; })) {
          resetScales();
        }
      });
    });

    container.addEventListener('mouseleave', resetScales);
  }
})();
