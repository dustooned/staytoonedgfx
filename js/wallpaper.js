(function () {
  var KEY    = 'wallpaper-paused';
  var paused = localStorage.getItem(KEY) === '1';

  function assetUrl(filename) {
    var link = document.querySelector('link[rel="stylesheet"]');
    var href = link ? link.getAttribute('href') : 'css/style.css';
    return href.replace('css/style.css', '') + 'assets/' + filename;
  }

  function applyState() {
    if (paused) {
      document.body.style.backgroundImage = 'url(' + assetUrl('site-bg-pause.gif') + ')';
    } else {
      document.body.style.backgroundImage = ''; // restore CSS rule
    }
  }

  // Button
  var btn = document.createElement('button');
  btn.id          = 'wallpaper-toggle';
  btn.textContent = paused ? '▶' : '⏸';
  btn.title       = paused ? 'Play wallpaper' : 'Pause wallpaper';
  btn.setAttribute('aria-label', btn.title);

  btn.addEventListener('click', function () {
    paused = !paused;
    localStorage.setItem(KEY, paused ? '1' : '0');
    btn.textContent = paused ? '▶' : '⏸';
    var label = paused ? 'Play wallpaper' : 'Pause wallpaper';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    applyState();
  });

  document.body.appendChild(btn);
  applyState();
})();
