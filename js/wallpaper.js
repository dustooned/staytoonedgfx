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
  var state  = localStorage.getItem(KEY) || 'play';
  if (STATES.indexOf(state) === -1) state = 'play';

  // Apply state as a body class — CSS handles the visual output.
  // body.wallpaper-pause and body.wallpaper-stop rules in style.css
  // use :not(.has-series-bg) so they never affect series pages.
  function applyState() {
    document.body.classList.remove('wallpaper-play', 'wallpaper-pause', 'wallpaper-stop');
    document.body.classList.add('wallpaper-' + state);
  }

  var CONFIG = {
    play:  { icon: '▶', label: 'Pause wallpaper', next: 'pause' },
    pause: { icon: '⏸', label: 'Stop wallpaper',  next: 'stop'  },
    stop:  { icon: '⏹', label: 'Play wallpaper',  next: 'play'  },
  };

  function syncSeriesState() {
    var active = document.body.classList.contains('has-series-bg');
    remote.setAttribute('data-series-active', active ? '1' : '0');
    var base = CONFIG[state].label;
    var tip  = active ? base + ' — saved, takes effect on non-series pages' : base;
    btn.title = tip;
    btn.setAttribute('aria-label', tip);
  }

  function updateBtn() {
    var c = CONFIG[state];
    btn.textContent = c.icon;
    btn.setAttribute('data-state', state);
    syncSeriesState();
  }

  var remote = document.createElement('div');
  remote.id  = 'bg-remote';

  // Dim immediately on series/reader pages so the button is clearly
  // inactive before series.js finishes its async fetch.
  var p = location.pathname;
  remote.setAttribute('data-series-active',
    (p.endsWith('series.html') || p.endsWith('reader.html')) ? '1' : '0');

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

  // Re-sync when series.js adds/removes has-series-bg after its async fetch
  new MutationObserver(function () { syncSeriesState(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
