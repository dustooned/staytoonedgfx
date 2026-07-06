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

1. **`series.json`** — declares which theme the series uses (`"warm"`, `"cool"`, `"dark"`)
2. **CSS custom properties** — each theme defines a set of variables on `[data-theme="warm"]`
3. **`series.js` / `reader.js`** — reads the manifest, sets `data-theme` on `<body>` and `data-series-bg` class to activate the right CSS

When a visitor lands on a series page:
- `series.js` adds `class="has-series-bg"` to `<body>` — this deactivates the wallpaper system
- It sets `data-theme="dark"` (or warm/cool) on `<body>` — this activates the theme variables
- The background image (`bg.jpg`) is applied via a CSS variable

Everything resets when they leave the series page — because those classes are only added by `series.js` when it runs.

---

## 🛒 What You Need for This Lesson

- [ ] A project from earlier lessons
- [ ] At least one series with a `series.json` that has `"theme": "warm"` (or cool/dark)
- [ ] Optional: `bg.jpg`, `header.png`, `cursor.png` in `comics/[series]/assets/`

---

## 📋 Step 1 — CSS Custom Properties (Theme Variables)

CSS custom properties let you define values once and reuse them everywhere. The syntax is `--variable-name: value` and you access them with `var(--variable-name)`.

Open `css/style.css` and add the theme system:

```css
/* ── THEME SYSTEM ──────────────────────────────────────────────────── */

/* Default values (no theme active) */
:root {
  --accent:        #888;
  --accent-glow:   rgba(136, 136, 136, 0.3);
  --title-overlay: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85));
  --theme-line:    #888;
}

/* WARM theme — IAGL / newspaper comic energy */
[data-theme="warm"] {
  --accent:        #f0a500;
  --accent-glow:   rgba(240, 165, 0, 0.4);
  --title-overlay: linear-gradient(135deg, rgba(120, 80, 0, 0.75), rgba(0,0,0,0.88));
  --theme-line:    #f0a500;
}

/* COOL theme — Melvin / bright scrappy energy */
[data-theme="cool"] {
  --accent:        #4fc3f7;
  --accent-glow:   rgba(79, 195, 247, 0.35);
  --title-overlay: linear-gradient(to bottom, rgba(0, 30, 60, 0.75), rgba(0,0,0,0.9));
  --theme-line:    #4fc3f7;
}

/* DARK theme — Dio / gothic horror energy */
[data-theme="dark"] {
  --accent:        #c62828;
  --accent-glow:   rgba(198, 40, 40, 0.45);
  --title-overlay: radial-gradient(ellipse at center, rgba(80, 0, 0, 0.5), rgba(0,0,0,0.95));
  --theme-line:    #c62828;
}
```

Now anywhere in your CSS you can use `var(--accent)` and it will automatically be the right colour for whatever series is active.

---

## 📋 Step 2 — The Content Panel

When a series background is active, the page content needs to sit on a dark panel so it's readable against the potentially busy background.

Add this to `css/style.css`:

```css
/* ── SERIES CONTENT PANEL ──────────────────────────────────────────── */
/* When a series background is active, the main content floats centred  */
/* on a dark panel — the bg shows around the sides (comic spread feel). */

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

/* ── NON-SERIES PAGE CONTENT PANEL ─────────────────────────────────── */
/* On regular pages (blog, about, archive, 404) with the wallpaper BG,  */
/* the main element acts as the content panel.                           */

body:not(.has-series-bg) main {
  max-width: 1100px;
  margin: 0 auto;
  background: rgba(10, 10, 10, 0.94);
  border-left:   1px solid rgba(255,255,255,0.07);
  border-right:  1px solid rgba(255,255,255,0.07);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  border-radius: 0 0 8px 8px;
  min-height: calc(100vh - 64px);
}
```

---

## 📋 Step 3 — The Series Title Card

The title card is the big header at the top of a series page — full-width, themed background, with the series header image and description.

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
}

/* The themed gradient overlay — uses var(--title-overlay) from theme */
.title-card-overlay {
  position: absolute;
  inset: 0;
  background: var(--title-overlay);
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

/* The decorative line at the bottom of the title card */
.title-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  opacity: 0.6;
  z-index: 3;
}

/* Series header image */
.title-card-header-img {
  max-width: 300px;
  max-height: 120px;
  margin-bottom: 16px;
  object-fit: contain;
}

.title-card-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 12px var(--accent-glow), 0 0 40px var(--accent-glow);
  margin-bottom: 8px;
}

/* WARM: italic title */
[data-theme="warm"] .title-card-title { font-style: italic; }

/* DARK: uppercase title */
[data-theme="dark"] .title-card-title { text-transform: uppercase; letter-spacing: 0.05em; }

.title-card-desc {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.65);
  max-width: 600px;
  line-height: 1.6;
}
```

---

## 📋 Step 4 — Series Background Body Class

The body-class system is what ties everything together:

```css
/* ── SERIES BACKGROUND ──────────────────────────────────────────────── */
/* series.js adds .has-series-bg to body when a series bg image loads.  */
/* This activates the cover-mode background and disables the wallpaper. */

body.has-series-bg {
  background-image: var(--series-bg-url);
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

## 📋 Step 5 — Minimal `series.js`

Create `js/series.js` — this file runs on `series.html` and applies the theming:

```js
// series.js — applies series theming + renders chapters grid

(function () {
  // Read the ?series= URL parameter
  var params     = new URLSearchParams(location.search);
  var seriesSlug = params.get('series');

  if (!seriesSlug) {
    document.getElementById('title-card-content').innerHTML =
      '<p>No series specified. <a href="index.html">← Back to home</a></p>';
    return;
  }

  fetch('manifest.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var series = data.series.find(function(s) { return s.slug === seriesSlug; });

      if (!series) {
        document.getElementById('title-card-content').innerHTML =
          '<p>Series not found. <a href="index.html">← Back to home</a></p>';
        return;
      }

      // ── Apply theme ──────────────────────────────────────────────
      document.title = series.title + ' — My Webcomic Site';

      if (series.theme) {
        document.body.setAttribute('data-theme', series.theme);
      }

      // ── Apply series background ──────────────────────────────────
      if (series.bg) {
        document.body.style.setProperty('--series-bg-url', 'url(' + series.bg + ')');
        document.body.classList.add('has-series-bg');
        if (series.backgroundMode === 'tile') {
          document.body.classList.add('bg-tile');
        }
      }

      // ── Apply custom cursor ──────────────────────────────────────
      if (typeof window.__cursorSetPaths === 'function') {
        window.__cursorSetPaths(series.cursor || null, series.cursorAnim || null);
      }

      // ── Render title card ────────────────────────────────────────
      var tc = document.getElementById('title-card-content');
      if (tc) {
        tc.innerHTML =
          (series.header
            ? '<img class="title-card-header-img" src="' + series.header + '" alt="' + series.title + '">'
            : '<div class="title-card-title">' + series.title + '</div>') +
          (series.description
            ? '<div class="title-card-desc">' + series.description + '</div>'
            : '');

        // Apply background to title card if available
        if (series.bg) {
          var titleCard = document.getElementById('title-card');
          if (titleCard) {
            titleCard.style.backgroundImage = 'url(' + series.bg + ')';
            titleCard.style.backgroundSize  = 'cover';
            titleCard.style.backgroundPosition = 'center';
          }
        }
      }

      // ── Render chapters grid ─────────────────────────────────────
      var grid = document.getElementById('chapters-grid');
      if (!grid || !series.chapters) return;

      if (series.chapters.length === 0) {
        grid.innerHTML = '<p>No chapters yet.</p>';
        return;
      }

      grid.innerHTML = series.chapters.map(function(ch, i) {
        var href = 'reader.html?series=' + series.slug +
                   '&chapter=' + ch.slug + '&page=0';
        return '<a href="' + href + '" class="chapter-card">' +
          '<div class="chapter-card-num">' + (i + 1) + '</div>' +
          '<div class="chapter-card-info">' +
            '<div class="chapter-card-title">' + ch.title + '</div>' +
            '<div class="chapter-card-meta">' + ch.date +
              ' · ' + ch.pages.length + ' pages' +
            '</div>' +
          '</div>' +
        '</a>';
      }).join('');
    });
})();
```

---

## 📋 Step 6 — Chapter Card CSS

Add to `css/style.css`:

```css
/* ── CHAPTER CARDS ──────────────────────────────────────────────────── */

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
  border-color: var(--accent);
}

.chapter-card-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  min-width: 40px;
  text-align: center;
}

.chapter-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
}

.chapter-card-meta {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}
```

---

## 📋 Step 7 — Create `series.html`

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
    <div id="title-card" class="title-card">
      <div class="title-card-overlay"></div>
      <div id="title-card-content" class="title-card-content">
        <p class="loading">Loading…</p>
      </div>
    </div>

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

## 🧪 How to Know It's Working

1. Go to `http://localhost:3000/series.html?series=my-series`
2. The title card should show your series title/header with the themed overlay
3. The accent colour should match your `accentColor` value
4. If you have a `bg.jpg`, it should show as the background
5. Chapters should list below with the chapter number in the accent colour

---

## 🐛 Common Mistakes

**"Theme isn't applying"**
→ Check that `series.json` has `"theme": "warm"` (or cool/dark) and that `series.js` is calling `document.body.setAttribute('data-theme', series.theme)`.

**"Background image not showing"**
→ Run `node scan.js` after adding the bg.jpg. Check that `series.cursor` is in the manifest. Also check the file path in DevTools Network tab.

**"CSS custom properties aren't updating"**
→ Make sure `[data-theme="warm"]` is declared on `body` or `:root` equivalent — the `data-theme` attribute must be set on the same element the CSS selector targets.

---

*Continue to → [Lesson 09: Going Live](09-GOING-LIVE.md)*
