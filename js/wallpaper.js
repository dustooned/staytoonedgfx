(function () {
  var KEY    = 'wallpaper-state';
  var STATES = ['play', 'pause', 'stop'];
  var state  = localStorage.getItem(KEY) || 'play';
  if (STATES.indexOf(state) === -1) state = 'play';

  function assetUrl(filename) {
    var link = document.querySelector('link[rel="stylesheet"]');
    var href = link ? link.getAttribute('href') : 'css/style.css';
    return href.replace('css/style.css', '') + 'assets/' + filename;
  }

  function applyState() {
    if (state === 'play') {
      document.body.style.backgroundImage = '';          // restore CSS GIF rule
    } else if (state === 'pause') {
      document.body.style.backgroundImage = 'url(' + assetUrl('site-bg-pause.gif') + ')';
    } else {
      document.body.style.backgroundImage = 'none';      // black
    }
  }

  var CONFIG = {
    play:  { icon: '▶', label: 'Pause wallpaper',  next: 'pause' },
    pause: { icon: '⏸', label: 'Stop wallpaper',   next: 'stop'  },
    stop:  { icon: '⏹', label: 'Play wallpaper',   next: 'play'  },
  };

  function updateBtn() {
    var c = CONFIG[state];
    btn.textContent = c.icon;
    btn.title       = c.label;
    btn.setAttribute('aria-label', c.label);
    btn.setAttribute('data-state', state);
  }

  // Container
  var remote = document.createElement('div');
  remote.id  = 'bg-remote';

  // Label
  var lbl = document.createElement('span');
  lbl.id          = 'bg-remote-label';
  lbl.textContent = 'BG Remote';

  // Button
  var btn = document.createElement('button');
  btn.id = 'wallpaper-toggle';

  btn.addEventListener('click', function () {
    state = CONFIG[state].next;
    localStorage.setItem(KEY, state);
    updateBtn();
    applyState();
  });

  remote.appendChild(lbl);
  remote.appendChild(btn);
  document.body.appendChild(remote);

  updateBtn();
  applyState();
})();
