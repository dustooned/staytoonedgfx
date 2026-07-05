(function () {
  var KEY    = 'wallpaper-paused';
  var paused = localStorage.getItem(KEY) === '1';
  var frozen = null; // data URL of first GIF frame, used when paused

  function gifUrl() {
    var link = document.querySelector('link[rel="stylesheet"]');
    var href = link ? link.getAttribute('href') : 'css/style.css';
    return href.replace('css/style.css', '') + 'assets/site-bg.gif';
  }

  // Capture first frame of the GIF so pause shows a static image, not nothing
  function captureFrame(url) {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width  = img.naturalWidth  || 400;
      c.height = img.naturalHeight || 400;
      c.getContext('2d').drawImage(img, 0, 0);
      try {
        frozen = c.toDataURL('image/png');
        if (paused) applyState(); // re-apply now that we have a frame
      } catch (e) { /* cross-origin taint — pause will hide instead of freeze */ }
    };
    img.src = url;
  }

  function applyState() {
    if (paused) {
      // Show frozen first frame as tiled static image, or just hide GIF
      document.body.style.backgroundImage = frozen ? 'url(' + frozen + ')' : 'none';
    } else {
      document.body.style.backgroundImage = ''; // restore CSS rule
    }
  }

  // Button
  var btn = document.createElement('button');
  btn.id        = 'wallpaper-toggle';
  btn.textContent = paused ? '▶' : '⏸';
  btn.title     = paused ? 'Play wallpaper' : 'Pause wallpaper';
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

  // Apply persisted state immediately, then load frame data async
  applyState();
  captureFrame(gifUrl());
})();
