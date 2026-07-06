# 📺 Lesson 04 — Wallpaper System & BG Remote

> *Imagine your site is a TV show set. When the cameras roll on a comic
> chapter, the crew puts up the specific backdrop for that scene.
> But between scenes — on the regular pages like About, Blog, Home —
> the set goes to its "default" look: a rolling TV static wallpaper.
> The BG Remote is the lighting board that lets the audience turn
> the effect on, pause it, or cut it entirely.*

---

## 🎭 The Big Picture

This system has **three pieces working together:**

1. **The GIF tile** — an animated (or still) image that tiles to fill the background
2. **`wallpaper.js`** — reads/saves the visitor's preference, adds a CSS class to `<body>`, injects the BG Remote widget into the header
3. **CSS rules** — respond to the body class and apply the right background

The elegant part: **CSS does all the visual work.** JS just manages the class name. This means the wallpaper is automatically off on series pages (which have their own backgrounds) because of a single CSS selector — no URL checking, no special cases.

---

## 🛒 What You Need for This Lesson

- [ ] A project from Lessons 02–03 running locally
- [ ] Two GIF files (we'll cover making them below):
  - `assets/site-bg.gif` — animated TV static tile (≤ 200KB)
  - `assets/site-bg-pause.gif` — single freeze-frame (≤ 25KB)

---

## 📋 Step 1 — Make the Wallpaper GIF

You need a seamless, looping animated texture GIF. This is the "play" state.

### Option A: After Effects (best quality)

If you have After Effects, run the included script:
`assets/templates/tv-static-tile.jsx`

In After Effects: **File → Scripts → Run Script File** → select the `.jsx` file → click Run.

The script:
- Creates a 200×200 px composition
- Adds Fractal Noise with animated evolution for the static look
- Runs at 8fps (fast enough to look live, slow enough to stay small)
- Creates a new 3-second comp named `TV_STATIC_TILE`

After the script runs:
1. Add the comp to the render queue: **Composition → Add to Render Queue**
2. Output module → click the format → choose **Animated GIF** (via GIFGun or Media Encoder)
3. Export to `assets/site-bg.gif`

**Recommended settings for a good static effect:**
- Size: 200×200 px
- Frame rate: 8 fps
- Duration: 2–3 seconds (loops seamlessly)
- Colours: monochrome (B&W) looks most authentic
- Target file size: under 200KB

### Option B: Manual / online

1. Find a seamless texture GIF (grey noise, static, grain) from a royalty-free source
2. OR use Photoshop/GIMP to generate noise and export as animated GIF
3. Keep it under 200×200px, 8–12fps, looping

### The pause GIF

The pause GIF is a **single still frame** — not animated. It looks like the static was frozen mid-frame.

Easiest way: open `site-bg.gif` in Photoshop → delete all layers except the first one → export as GIF (no animation). Or just extract a single frame in any GIF editor.

Target size: under 25KB.

---

## 📋 Step 2 — Add the Wallpaper CSS

Open `css/style.css` and add these rules. Put them after your body base rule:

```css
/* ── WALLPAPER — non-series pages ───────────────────────────────
   .has-series-bg is added by series.js when a series background is active.
   Everything here only fires when that class is NOT present.
   wallpaper.js adds wallpaper-play / wallpaper-pause / wallpaper-stop
   to body — the higher-specificity rules below override the base.    */

body:not(.has-series-bg) {
  background-image: url(../assets/site-bg.gif);
  background-repeat: repeat;
}

body.wallpaper-pause:not(.has-series-bg) {
  background-image: url(../assets/site-bg-pause.gif);
  background-repeat: repeat;
}

body.wallpaper-stop:not(.has-series-bg) {
  background-image: none;
}
```

### Why this works

The selector `body:not(.has-series-bg)` matches every page that does NOT have a series background active. That's your homepage, about page, blog, archive, 404.

When `body.wallpaper-pause` is also present, the second rule has **higher specificity** (two classes vs. one) — so it wins and overrides the animated GIF with the still version.

When `body.wallpaper-stop` is present, it wins and sets `background-image: none` — the background goes dark.

Series pages that have `body.has-series-bg` are never matched by any of these rules — so series/reader backgrounds are completely unaffected.

---

## 📋 Step 3 — Add BG Remote CSS

Still in `css/style.css`, add the widget styles. These can go in your header section:

```css
/* ── BG REMOTE WIDGET ───────────────────────────────── */
#bg-remote {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  margin-right: 8px;
}

#bg-remote-label {
  background: #000;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 5px;
  border-radius: 3px;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.15);
  user-select: none;
}

#wallpaper-toggle {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

/* Green = playing */
#wallpaper-toggle[data-state="play"] {
  background: rgba(20, 130, 45, 0.9);
  border: 1px solid rgba(60, 200, 90, 0.6);
  color: #fff;
}

/* Amber = paused */
#wallpaper-toggle[data-state="pause"] {
  background: rgba(160, 110, 10, 0.9);
  border: 1px solid rgba(220, 160, 40, 0.6);
  color: #fff;
}

/* Red = stopped */
#wallpaper-toggle[data-state="stop"] {
  background: rgba(160, 20, 20, 0.9);
  border: 1px solid rgba(220, 60, 60, 0.6);
  color: #fff;
}
```

---

## 📋 Step 4 — Create `js/wallpaper.js`

Create `js/wallpaper.js`:

```js
(function () {
  // Skip on touch/mobile — don't load a heavy animated GIF on phones
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var KEY = 'wallpaper-state';

  // Migrate from old 2-state system (if returning visitors had it)
  if (localStorage.getItem('wallpaper-paused') !== null) {
    var old = localStorage.getItem('wallpaper-paused');
    if (old === '1') localStorage.setItem(KEY, 'pause');
    localStorage.removeItem('wallpaper-paused');
  }

  var STATES = ['play', 'pause', 'stop'];
  var state  = localStorage.getItem(KEY) || 'play';
  if (STATES.indexOf(state) === -1) state = 'play';

  // CSS does the visual work — we just manage the body class
  function applyState() {
    document.body.classList.remove('wallpaper-play', 'wallpaper-pause', 'wallpaper-stop');
    document.body.classList.add('wallpaper-' + state);
  }

  // Config for each state: what icon, what tooltip, what comes next on click
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
    btn.setAttribute('data-state', state);  // CSS uses this for colour
  }

  // Build the widget: a container div with a label and a button
  var remote = document.createElement('div');
  remote.id  = 'bg-remote';

  var lbl = document.createElement('span');
  lbl.id          = 'bg-remote-label';
  lbl.textContent = '📺 BG Remote';

  var btn = document.createElement('button');
  btn.id = 'wallpaper-toggle';

  btn.addEventListener('click', function () {
    state = CONFIG[state].next;   // advance the cycle
    localStorage.setItem(KEY, state);
    updateBtn();
    applyState();
  });

  remote.appendChild(lbl);
  remote.appendChild(btn);

  // Inject as the first child of the header — appears on the far left
  var headerInner = document.querySelector('.header-inner');
  if (headerInner) {
    headerInner.insertBefore(remote, headerInner.firstChild);
  } else {
    document.body.appendChild(remote);   // fallback
  }

  updateBtn();
  applyState();
})();
```

---

## 📋 Step 5 — Add the Script to Your Pages

In `index.html` (and every other page you want it on), add the script **after** your other JS:

```html
  <script src="js/app.js"></script>
  <script src="js/wallpaper.js"></script>   ← add this
</body>
```

The BG Remote will appear in the header on every page that includes this script.

---

## 📋 Step 6 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. You should see the TV static GIF tiling across the background
4. In the top-left of the header, you should see `📺 BG Remote` with a green ▶ button
5. Click the button:
   - First click → ⏸ amber (pause) — static freezes
   - Second click → ⏹ red (stop) — background goes dark
   - Third click → ▶ green (play) — animated static returns
6. Refresh the page — it should remember your last choice

---

## 🧪 How to Know It's Working

- [ ] TV static GIF tiles across the background on non-series pages
- [ ] BG Remote widget appears in top-left of header
- [ ] Clicking cycles through green ▶ → amber ⏸ → red ⏹
- [ ] State persists after page refresh (localStorage is saving it)
- [ ] On a phone/tablet, the BG Remote doesn't appear and no GIF loads

---

## 🐛 Common Mistakes

**"The GIF loads but the BG Remote doesn't appear"**
→ Check that `wallpaper.js` is included in the page's `<script>` tags. Also confirm `.header-inner` exists in your HTML — the script injects into it.

**"The stop state doesn't turn off the background on series pages"**
→ That's correct behavior! Series pages have their own background managed by `series.js`. The CSS `:not(.has-series-bg)` guard means the wallpaper rules never fire there.

**"My button is green but the GIF isn't showing"**
→ Check the file path. The CSS rule is `url(../assets/site-bg.gif)` — it uses `../` because it's in `css/style.css`. Make sure the GIF is in `assets/site-bg.gif`.

**"I'm on mobile and want to test the GIF anyway"**
→ Open DevTools → find the `matchMedia` check at the top of `wallpaper.js` → the `(pointer: fine)` query returns `false` on touch devices. Comment out the early `return` temporarily to test.

---

## 📎 The After Effects Script Reference

`assets/templates/tv-static-tile.jsx` is an ExtendScript file. The key values to change:

```js
var COMP_WIDTH  = 200;   // tile width in pixels
var COMP_HEIGHT = 200;   // tile height in pixels
var COMP_FPS    = 8;     // frames per second (lower = smaller file)
var COMP_DUR    = 3;     // duration in seconds
```

The Fractal Noise effect drives the static look. The evolution is animated with an expression:
`posterizeTime(8); seedRandom(index, false); random(200, 400)`

This creates random-looking but consistent evolution at the specified frame rate.

---

*Continue to → [Lesson 05: Pixel Transitions](05-PIXEL-TRANSITIONS.md)*
