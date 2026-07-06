# 🎨 Lesson 08 — Series Theming

> *Think of each comic series as a different TV channel. Channel 1 is
> warm and golden — afternoon newspaper comics energy. Channel 2 is
> cool and scrappy — a kids' show that got a bit weird. Channel 3 is
> deep red and dramatic — late-night gothic horror. When you change
> the channel, the whole environment changes: background, accent colour,
> cursor, font treatment. Same website, totally different world.*

---

## 🎭 The Big Picture

Series theming works through **three layers:**

1. **`series.json`** — declares which theme the series uses (`"warm"`, `"cool"`, `"dark"`) and what the accent colour is
2. **CSS custom properties** — each `[data-theme]` value defines a set of visual variables (overlay gradient, glow, font)
3. **`series.js`** — reads the manifest, applies body classes and CSS variables, sets `data-theme` on `<body>` to activate the right CSS

When a visitor lands on a series page:
- `series.js` sets `--series-bg: url(...)` on the root element and adds `body.has-series-bg` — this activates the series background and deactivates the wallpaper
- It sets `--series-accent` to the series accent colour — used everywhere for glows, progress bars, hover borders
- It sets `data-theme="dark"` (or `warm`/`cool`) on `<body>` — this activates the CSS theme variables
- Everything resets when they leave (those classes/attributes are only added by `series.js`)

---

## 🛒 What You Need for This Lesson

- [ ] A project from earlier lessons with scan.js producing a manifest
- [ ] At least one series with a `series.json` containing `"theme": "warm"` (or cool/dark)
- [ ] Optional: `bg.jpg`, `header.png`, `cursor.png` in `comics/[series]/assets/`
- [ ] Run `node scan.js` after adding any assets so the manifest includes them

---

## 📋 Step 1 — CSS Custom Properties (Theme Variables)

Open `css/style.css` and add the theme system. The full real implementation uses these variables:

```css
/* ── THEME SYSTEM ──────────────────────────────────────────────────── */

/* Default values — overridden when data-theme is set on body */
:root {
  --series-accent: #ffffff;     /* set by JS from series.json accentColor */
  --series-bg:     none;        /* set by JS from series.json background   */

  --theme-overlay:         linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.88));
  --theme-glow:            none;
  --theme-line:            rgba(255,255,255,0.25);
  --theme-title-style:     normal;
  --theme-title-transform: none;
  --theme-title-spacing:   -0.02em;
}

/* WARM theme — It's a Good Life (amber / golden) */
[data-theme="warm"] {
  --theme-overlay:         linear-gradient(135deg, rgba(240,165,0,0.4) 0%, rgba(8,5,0,0.92) 65%);
  --theme-glow:            0 0 50px rgba(240,165,0,0.35), 0 2px 10px rgba(0,0,0,0.9);
  --theme-line:            rgba(240,165,0,0.7);
  --theme-title-style:     italic;
  --theme-title-transform: none;
  --theme-title-spacing:   -0.02em;
}

/* COOL theme — Melvin (cyan / blue) */
[data-theme="cool"] {
  --theme-overlay:         linear-gradient(180deg, rgba(79,195,247,0.18) 0%, rgba(4,8,14,0.93) 68%);
  --theme-glow:            0 0 30px rgba(79,195,247,0.25), 0 2px 8px rgba(0,0,0,0.9);
  --theme-line:            rgba(79,195,247,0.65);
  --theme-title-style:     normal;
  --theme-title-transform: none;
}

/* DARK theme — Dio La Damned (red / dramatic) */
[data-theme="dark"] {
  --theme-overlay:         radial-gradient(ellipse at 50% 0%, rgba(198,40,40,0.38) 0%, rgba(0,0,0,0.98) 60%);
  --theme-glow:            0 0 60px rgba(198,40,40,0.4), 0 0 20px rgba(198,40,40,0.2), 0 2px 6px rgba(0,0,0,1);
  --theme-line:            rgba(198,40,40,0.85);
  --theme-title-style:     normal;
  --theme-title-transform: uppercase;
  --theme-title-spacing:   0.08em;
}
```

> **Key point:** `--series-accent` and `--series-bg` are set by JavaScript from the manifest data, not by CSS. The CSS just declares a default value in `:root`. JS overrides it per-series.
>
> The `[data-theme]` blocks define *visual personality* (overlay gradient, glow, font treatment) — they don't define the accent color, because each series can have a unique accent independent of theme.

---

## 📋 Step 2 — The Content Panel

When a series background is active, the page content needs to sit on a dark panel so it's readable against the potentially busy background.

```css
/* ── SERIES CONTENT PANEL ──────────────────────────────────────────── */

.content-panel {
  max-width: 1100px;
  margin: 0 auto;
  background: rgba(10, 10, 10, 0.9);
  border-left:   1px solid rgba(255,255,255,0.07);
  border-right:  1px solid rgba(255,255,255,0.07);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  border-radius: 0 0 8px 8px;
  padding: 32px;
  min-height: calc(100vh - 64px);
}

/* When a series background is active, the content panel gets a backdrop */
body.has-series-bg .content-panel {
  background: rgba(10, 10, 10, 0.88);
}

/* ── SERIES BACKGROUND ──────────────────────────────────────────────── */
/* series.js sets --series-bg via root.style.setProperty()              */
/* and adds .has-series-bg to body when a bg image exists.              */

body.has-series-bg {
  background-image: var(--series-bg);  /* value is already url(...) from JS */
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* TILE mode — series.js adds .bg-tile when backgroundMode is "tile" */
body.has-series-bg.bg-tile {
  background-size: auto;
  background-repeat: repeat;
  background-attachment: scroll;
}
```

---

## ���� Step 3 — The Series Title Card

Add to `css/style.css`:

```css
/* ── TITLE CARD ─────────────────────────────────────────────────────── */

.title-card {
  position: relative;
  height: 320px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: #111;
  background-image: var(--series-bg);   /* matches body bg */
  background-size: cover;
  background-position: center;
}

/* Themed gradient overlay — uses var(--theme-overlay) */
.title-card-overlay {
  position: absolute;
  inset: 0;
  background: var(--theme-overlay);
  z-index: 1;
}

.title-card-content {
  position: relative;
  z-index: 2;
  padding: 32px;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

/* Decorative accent line at the bottom of the title card */
.title-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--theme-line);
  z-index: 3;
}

/* Series header image (the logo/title treatment) */
.series-header-img {
  max-width: 300px;
  max-height: 120px;
  margin-bottom: 16px;
  object-fit: contain;
}

/* Series name text (shown when no header image exists) */
.title-card-series-name {
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  text-shadow: var(--theme-glow);
  font-style: var(--theme-title-style);
  text-transform: var(--theme-title-transform);
  letter-spacing: var(--theme-title-spacing);
  margin-bottom: 8px;
}

.title-card-desc {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.65);
  max-width: 600px;
  line-height: 1.6;
}
```

---

## ���� Step 4 — Chapter Card CSS

```css
/* ���─ CHAPTER CARDS ──────────────────────────────────────────────────── */

.chapters-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  transition: background 0.15s, border-color 0.15s;
}

.chapter-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--series-accent);   /* ← uses the JS-set accent colour */
}

.chapter-thumb {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.chapter-thumb-placeholder {
  width: 60px;
  height: 80px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.chapter-card-body { flex: 1; }

.chapter-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
  margin-bottom: 4px;
}

.chapter-card-meta {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.progress-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--series-accent);
  color: #000;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}
```

---

## 📋 Step 5 — Minimal `series.js`

Create `js/series.js`. This is a teaching-minimal version of the real file — the actual production file has more features (continue-reading badges, better error states), but this covers the core theming:

```js
// series.js — applies series theming + renders chapters grid
// URL: series.html?s=series-slug

(function () {
  document.querySelectorAll('.js-year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  // ── PARSE URL: ?s= for series slug ───────────────────────────────
  var params = new URLSearchParams(location.search);
  var slug   = params.get('s');   // ← 's', not 'series'

  if (!slug) { location.href = 'index.html'; return; }

  var titleCardContent = document.getElementById('title-card-content');
  var grid             = document.getElementById('chapters-grid');

  fetch('manifest.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var s = data.series.find(function(x) { return x.slug === slug; });

      if (!s) { location.href = 'index.html'; return; }

      document.title = s.title + ' — My Webcomic Site';

      // ── APPLY THEMING ─────────────────────────────────────────────
      var root = document.documentElement;

      // Set accent colour variable — CSS uses var(--series-accent) everywhere
      if (s.accentColor) root.style.setProperty('--series-accent', s.accentColor);

      // Set background — value is wrapped in url() so CSS can use it directly
      // Field name in manifest is 'background' (not 'bg')
      if (s.background) {
        root.style.setProperty('--series-bg', 'url(' + s.background + ')');
        document.body.classList.add('has-series-bg');
        if (s.backgroundMode === 'tile') document.body.classList.add('bg-tile');
      }

      // Set data-theme for CSS [data-theme] selectors
      if (s.theme) document.body.setAttribute('data-theme', s.theme);

      // ── CUSTOM CURSOR ────────────────────────────────────────────
      if (typeof window.__cursorSetPaths === 'function') {
        window.__cursorSetPaths(s.cursor || null, s.cursorAnim || null);
      }

      // ── TITLE CARD ───────���───────────────────────────────────────
      // Manifest field is 'headerImage' (not 'header')
      if (titleCardContent) {
        titleCardContent.innerHTML =
          (s.headerImage
            ? '<img class="series-header-img" src="' + s.headerImage + '" alt="' + s.title + '">'
            : '<h1 class="title-card-series-name">' + s.title + '</h1>') +
          (s.description
            ? '<p class="title-card-desc">' + s.description + '</p>'
            : '');
      }

      // ── CHAPTERS GRID ─────────��──────────────────────────────────
      if (!grid || !s.chapters || s.chapters.length === 0) {
        if (grid) grid.innerHTML = '<p>No chapters yet.</p>';
        return;
      }

      grid.innerHTML = s.chapters.map(function(ch) {
        // URL params: ?s= ?ch= ?p=  (p is 1-indexed)
        var href = 'reader.html?s=' + s.slug + '&ch=' + ch.slug + '&p=1';

        var thumbHtml = ch.thumbnail
          ? '<img class="chapter-thumb" src="' + ch.thumbnail + '" alt="' + ch.title + '" loading="lazy">'
          : '<div class="chapter-thumb-placeholder">📄</div>';

        var dateStr = ch.date
          ? new Date(ch.date + 'T00:00:00').toLocaleDateString('en-US',
              { year: 'numeric', month: 'short', day: 'numeric' })
          : '';

        return '<a href="' + href + '" class="chapter-card">' +
          thumbHtml +
          '<div class="chapter-card-body">' +
            '<div class="chapter-card-title">' + ch.title + '</div>' +
            '<div class="chapter-card-meta">' +
              ch.pageCount + ' page' + (ch.pageCount !== 1 ? 's' : '') +
              (dateStr ? ' · ' + dateStr : '') +
            '</div>' +
          '</div>' +
        '</a>';
      }).join('');
    })
    .catch(function(err) {
      if (titleCardContent) titleCardContent.innerHTML = '<p>Could not load series data.</p>';
      console.error(err);
    });
})();
```

> **Field name reference** — these are what the manifest produces and what your JS must read:
>
> | Manifest field | What it is |
> |----------------|-----------|
> | `s.background` | Background image path (not `s.bg`) |
> | `s.headerImage` | Title card logo/treatment (not `s.header`) |
> | `s.cursor` | Idle cursor PNG path |
> | `s.cursorAnim` | Hover/animated cursor GIF path |
> | `s.accentColor` | The hex colour string |
> | `s.chapterCount` | Integer count of chapters |
> | `ch.pageCount` | Integer count of pages |
> | `ch.thumbnail` | Full path to first page image |
> | `ch.pages` | Array of full page image paths |

---

## 📋 Step 6 — Create `series.html`

Create `series.html` in the project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Series — My Webcomic Site</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="site-logo">
        <img src="assets/logo.svg" alt="My Webcomic Site" onerror="this.style.display='none'">
      </a>
      <nav class="site-nav">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="blog.html">Blog</a>
        <a href="#" class="nav-donate" target="_blank">Donate</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- Title card: series background + themed overlay + header image or title -->
    <div id="title-card" class="title-card">
      <div class="title-card-overlay"></div>
      <div id="title-card-content" class="title-card-content">
        <p class="loading">Loading…</p>
      </div>
    </div>

    <!-- Content panel: dark backdrop over the series background -->
    <div class="content-panel">
      <div class="section">
        <p class="section-title">Chapters</p>
        <div id="chapters-grid" class="chapters-grid">
          <p class="loading">Loading chapters…</p>
        </div>
      </div>
    </div>
  </main>

  <script src="js/series.js"></script>
  <script src="js/transition.js"></script>
  <script src="js/wallpaper.js"></script>
  <script src="js/cursor.js"></script>
  <script src="js/construction.js"></script>
</body>
</html>
```

---

## 📋 Step 7 — Test It

1. Start your server: `npm run dev`
2. Navigate to `http://localhost:3000/series.html?s=my-series`
3. The title card should show your series title with the themed overlay (gradient follows the theme)
4. If you have a `bg.jpg` in `comics/my-series/assets/`, it should fill the background
5. Chapters should list below
6. The chapter hover border should be the `accentColor` from your `series.json`

> 💡 **DevTools check:** Open DevTools → Elements → select `<html>`. You should see `--series-accent` and `--series-bg` as inline styles on it. That's JS having done its job.

---

## 🧪 How to Know It's Working

- [ ] `series.html?s=my-series` loads without blank page or errors
- [ ] Title card shows series name or header image
- [ ] If `bg.jpg` exists, it fills the background
- [ ] Hovering a chapter card shows a border in the accent colour
- [ ] `body` has `has-series-bg` class (check DevTools Elements)
- [ ] `body` has `data-theme` attribute (check DevTools Elements)
- [ ] `document.documentElement` has `--series-accent` inline style (check DevTools Elements → computed styles)

---

## 🐛 Common Mistakes

**"Theme isn't applying / background not showing"**
→ Check that `series.json` has `"theme": "warm"` (or cool/dark) and you ran `node scan.js` after adding the `bg.jpg`. Open `manifest.json` and check `s.background` is a path, not `null`.

**"headerImage is null in the manifest"**
→ The file must be in `comics/[series]/assets/header.png` (the `assets/` subfolder, not the series root). Run `node scan.js` after adding it.

**"Background shows on body but not title card"**
→ The title card uses `background-image: var(--series-bg)` from CSS. Make sure you have that CSS rule on `.title-card`. Since `--series-bg` is set on `document.documentElement` (root), it cascades down to `.title-card` automatically.

**"Accent colour isn't changing"**
→ Check DevTools: `document.documentElement` should have `style="--series-accent: #hex"` as an inline style. If it doesn't, JS didn't run — check for console errors.

**"Reader link goes to a 404 or blank page"**
→ Confirm the URL is using `?s=`, `?ch=`, `?p=` — not `?series=`, `?chapter=`, `?page=`. The reader.js parses `params.get('s')`, `params.get('ch')`, `params.get('p')`.

---

*Continue to → [Lesson 09: Going Live](09-GOING-LIVE.md)*
