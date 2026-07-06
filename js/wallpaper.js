(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var KEY = 'wallpaper-state';

  // Migrate old 2-state key so returning visitors don't get confused
  if (localStorage.getItem('wallpaper-paused') !== null) {
    var old = localStorage.getItem('wallpaper-paused');
    if (old === '1') localStorage.setItem(KEY, 'pause');
    localStorage.removeItem('wallpaper-paused');
  }

  var STATES = ['play', 'pause', 'stop'];
  var state  = localStorage.getItem(KEY) || 'stop';
  if (STATES.indexOf(state) === -1) state = 'stop';

  // Stamp on <html> so CSS fires immediately and the class survives
  // across series/non-series pages without body-class conflicts.
  function applyState() {
    document.documentElement.classList.remove('wallpaper-play', 'wallpaper-pause', 'wallpaper-stop');
    document.documentElement.classList.add('wallpaper-' + state);
  }

  var CONFIG = {
    play:  { icon: '▶', label: 'Pause wallpaper', next: 'pause' },
    pause: { icon: '⏸', label: 'Stop wallpaper',  next: 'stop'  },
    stop:  { icon: '⏹', label: 'Play wallpaper',  next: 'play'  },
  };

  function updateBtn() {
    var c = CONFIG[state];
    btn.textContent = c.icon;
    btn.title       = c.label;
    btn.setAttribute('aria-label', c.label);
    btn.setAttribute('data-state', state);
  }

  var remote = document.createElement('div');
  remote.id  = 'bg-remote';

  var lbl = document.createElement('span');
  lbl.id          = 'bg-remote-label';
  lbl.textContent = '📺 BG Remote';

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

  var headerInner = document.querySelector('.header-inner');
  if (headerInner) {
    headerInner.insertBefore(remote, headerInner.firstChild);
  } else {
    document.body.appendChild(remote);
  }

  updateBtn();
  applyState();
})();
