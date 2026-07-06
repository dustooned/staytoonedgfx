# Stay Tooned GFX — v1

Static webcomic site built from scratch to replace WordPress.
Hosted on GitHub Pages with a custom domain. No frameworks, no build tools, no database — just HTML, CSS, and vanilla JS.

---

## 📁 File Structure

```
v1/
├── index.html          🏠 Homepage  — series grid, latest updates, Mailchimp subscribe
├── series.html         🗂️  Series archive — themed title card + chapters grid
├── reader.html         📖 Comic reader  — full navigation, zoom, progress bar
├── blog.html           📝 Blog index    — post list, newest first
├── about.html          ℹ️  About page    — bio, series blurbs, artist photo
├── archive.html        🗂️  Archive       — all chapters across all series
├── 404.html            🚫 Custom 404    — GitHub Pages auto-serves this
├── scan.js             🔄 Manifest + sitemap generator — run after adding content
├── manifest.json       📦 Auto-generated  — DO NOT hand-edit
├── sitemap.xml         🗺️  Auto-generated  — DO NOT hand-edit
├── CNAME               🌐 Custom domain   — contains: staytoonedgfx.com
├── package.json        ⚙️  npm scripts: scan, dev
├── .gitignore
│
├── css/
│   └── style.css       🎨 All styles — emoji-labelled sections for Ctrl+F navigation
│
├── js/
│   ├── app.js          🏠 Homepage logic — series cards, latest updates feed
│   ├── series.js       🗂️  Series page logic — theming, chapters grid, progress badges
│   ├── reader.js       📖 Reader logic — navigation, zoom, progress bar, shortcuts
│   ├── archive.js      🗂️  Archive page logic — full chapter listing
│   ├── cursor.js       🖱️  Animated cursor system — fake cursor div, GIF on hover
│   ├── transition.js   ✨ Pixel dissolve page transitions — canvas, Fisher-Yates
│   ├── wallpaper.js    📺 BG Remote wallpaper control — 3 states, localStorage
│   └── construction.js 🎉 First-visit welcome overlay — localStorage gate, email form
│
├── assets/             🗂️  Site-wide assets
│   ├── site.webmanifest    ✓ created — Android/PWA app manifest
│   ├── favicon.ico         ← drop in (16+32px multi-size)
│   ├── favicon-16x16.png   ← drop in
│   ├── favicon-32x32.png   ← drop in
│   ├── apple-touch-icon.png ← drop in (180×180)
│   ├── android-chrome-192x192.png ← drop in
│   ├── android-chrome-512x512.png ← drop in
│   ├── logo.svg            ← site header logo (SVG, transparent bg)
│   ├── cursor.png          ← site-wide idle cursor (32–64px PNG)
│   ├── cursor.gif          ← site-wide hover cursor (animated GIF)
│   ├── artist.png          ← about page photo
│   ├── site-bg.gif         ← animated TV static wallpaper tile (tiling GIF)
│   ├── site-bg-pause.gif   ← freeze-frame version for pause state
│   └── wave.gif            ← welcome overlay character wave (160×160 — drop in when ready)
│
├── assets/templates/
│   └── tv-static-tile.jsx  ← After Effects ExtendScript to generate site-bg.gif
│
├── comics/             📚 Your content lives here
│   ├── iagl/           🟡 It's a Good Life  (theme: warm)
│   │   ├── series.json
│   │   ├── assets/         ← all series visual files go here
│   │   │   ├── cover.jpg       ← series card image
│   │   │   ├── header.png      ← title card logo/treatment
│   │   │   ├── bg.jpg          ← series background
│   │   │   ├── cursor.png      ← custom series cursor (idle)
│   │   │   └── cursor.gif      ← custom series cursor (hover animated)
│   │   └── chapter-01/
│   │       ├── chapter.json
│   │       ├── bg.jpg          ← chapter bg override (optional)
│   │       └── 01.jpg, 02.jpg...
│   ├── melvin/         🔵 Melvin  (theme: cool)
│   └── dio/            🔴 Dio La Damned  (theme: dark)
│
├── posts/              📝 Blog posts (static HTML files)
│   └── welcome.html    — starter post / copy as template for new posts
│
└── lessons/            📚 Student-facing lesson docs — build this from scratch
    ├── 00-WELCOME.md
    ├── 01-YOUR-TOOLKIT.md
    ├── 02-PROJECT-SETUP.md
    ├── 03-CONTENT-PIPELINE.md
    ├── 04-WALLPAPER-SYSTEM.md
    ├── 05-PIXEL-TRANSITIONS.md
    ├── 06-CUSTOM-CURSORS.md
    ├── 07-WELCOME-OVERLAY.md
    ├── 08-SERIES-THEMING.md
    └── 09-GOING-LIVE.md
```

---

## ⚡ Quick Start (local preview)

You need [Node.js](https://nodejs.org) installed.

```bash
# 1. Generate the manifest + sitemap from your comics/ folder
node scan.js

# 2. Serve locally (fetch() doesn't work over file://)
npx serve . -l 3000
# then open http://localhost:3000
```

---

## ✏️ Adding Content

### ➕ Add pages to an existing chapter

1. Drop images (`01.jpg`, `02.jpg`, etc.) into the chapter folder
2. Run `node scan.js`
3. Push to GitHub — done

Pages sort **alphabetically** — use leading zeros: `01.jpg`, `02.jpg`, `10.jpg`.

### ➕ Add a new chapter

```
comics/iagl/chapter-02/
    chapter.json
    01.jpg
    02.jpg
```

**`chapter.json`** minimum:
```json
{
  "title": "Chapter 2: Whatever You Want",
  "date": "2026-07-01"
}
```

Optional chapter fields:
```json
{
  "title": "Chapter 2",
  "date": "2026-07-01",
  "backgroundMode": "tile"
}
```

Then `node scan.js`.

### ➕ Add a new series

```
comics/my-new-series/
    series.json
    assets/
        cover.jpg
        header.png
        bg.jpg
        cursor.png
    chapter-01/
        chapter.json
        01.jpg
```

**`series.json`** minimum:
```json
{
  "title": "My New Series",
  "shortName": "MNS",
  "description": "A short description shown on the homepage card.",
  "accentColor": "#hex",
  "theme": "warm"
}
```

Full `series.json` with all options:
```json
{
  "title": "My New Series",
  "shortName": "MNS",
  "description": "Description here.",
  "accentColor": "#hex",
  "theme": "warm",
  "backgroundMode": "tile"
}
```

Then `node scan.js`. The series appears on the homepage automatically.

---

## 🎨 Theming

Each series has its own visual personality set by `"theme"` in `series.json`.

| Theme | Series | Overlay | Title | Glow line |
|-------|--------|---------|-------|-----------|
| `"warm"` | IAGL | Amber diagonal | Italic | Gold |
| `"cool"` | Melvin | Cyan fade from top | Normal | Cyan |
| `"dark"` | Dio La Damned | Red radial vignette | Uppercase | Blood red |

The theme drives the title card overlay gradient, title text glow, and the decorative line at the bottom of the header.

### Series emoji labels

Each series on the homepage card shows an emoji before its title:

| Series | Emoji | Slug |
|--------|-------|------|
| 👿 Dio La Damned | 👿 | `dio` |
| 🐰 Melvin | 🐰 | `melvin` |
| 🦆 It's a Good Life | 🦆 | `iagl` |

Managed in `js/app.js` via the `SERIES_EMOJI` lookup object. Add new entries to support additional series.

### Optional assets per series (drop in the series folder, scan picks them up)

| Filename | Effect |
|----------|--------|
| `cover.jpg` | Series card image on homepage (600×800 px) |
| `header.png` | Title treatment / logo in the title card (500px wide, PNG) |
| `bg.jpg` | Background image — cover or tile depending on `backgroundMode` |
| `cursor.png` | Custom idle cursor for this series (32–64px PNG) |
| `cursor.gif` | Custom hover/animated cursor for this series (plays on links/buttons) |

### Background modes

Set `"backgroundMode"` in `series.json` (or `chapter.json` to override per chapter):

| Mode | `bg.jpg` size | Behaviour |
|------|--------------|-----------|
| `"cover"` (default) | 1920×1080 px | Scales to fill screen, fixed while scrolling |
| `"tile"` | 200–800 px square, seamless | Repeats in all directions, scrolls with page |

---

## 📺 Wallpaper & BG Remote

Non-series pages (homepage, blog, about, archive, 404) show a tiled animated TV static GIF wallpaper as the site background. A **BG Remote** control widget in the header toolbar lets visitors cycle through three states.

### Three states

| State | Icon | Body class | Background | Button colour |
|-------|------|------------|-----------|---------------|
| Play | ▶ | `wallpaper-play` | `site-bg.gif` (animated) | 🟢 Green |
| Pause | ⏸ | `wallpaper-pause` | `site-bg-pause.gif` (still) | 🟡 Amber |
| Stop | ⏹ | `wallpaper-stop` | None (dark body) | 🔴 Red |

Click cycles: Play → Pause → Stop → Play.

### How it works

`wallpaper.js` adds a body class (`wallpaper-play`, `wallpaper-pause`, or `wallpaper-stop`) on every page load. CSS handles the visual output via:

```css
body:not(.has-series-bg) {
  background-image: url(../assets/site-bg.gif);  /* base rule — play */
}
body.wallpaper-pause:not(.has-series-bg) {
  background-image: url(../assets/site-bg-pause.gif);
}
body.wallpaper-stop:not(.has-series-bg) {
  background-image: none;
}
```

The `:not(.has-series-bg)` selector means series/reader pages are **never affected** — series backgrounds are managed entirely by `series.js`.

State is stored in `localStorage('wallpaper-state')` and persists across all pages and sessions.

### Mobile

`wallpaper.js` checks `window.matchMedia('(pointer: fine)')` on load. On touch/mobile devices the script returns immediately — no GIF is loaded, no button is injected. This prevents loading a heavy animated GIF on mobile.

### The GIF assets

| File | Description |
|------|-------------|
| `assets/site-bg.gif` | Animated TV static tile (~170KB). Generated via `assets/templates/tv-static-tile.jsx` in After Effects. |
| `assets/site-bg-pause.gif` | Single freeze-frame of the static (~20KB). Hand-exported from AE or made by duplicating one frame of the animated GIF. |

To regenerate: open `assets/templates/tv-static-tile.jsx` in After Effects via File → Scripts → Run Script File. Adjust size and frame rate in the script, render, export as GIF.

### Legacy key migration

Earlier versions of the site stored wallpaper state as `localStorage('wallpaper-paused')` with a `0`/`1` value. `wallpaper.js` automatically migrates returning visitors: if the old key is found, it maps it to the new `wallpaper-state` system and removes the old key.

---

## ✨ Pixel Dissolve Transitions

`js/transition.js` intercepts internal link clicks and covers/reveals the screen with a randomised grid of `12px` dark blocks — like a comic panel wipe.

### How it works

1. On link click: a `<canvas>` covers the screen by filling blocks in Fisher-Yates random order (cover animation). Sets `sessionStorage('px-nav')` then navigates.
2. On page load: if `px-nav` is in sessionStorage, the canvas starts solid, then clears blocks in random order (reveal animation). Removes the canvas when done.

### What gets intercepted

Only internal links (same origin, not `_blank`, no modifier keys, not anchor-only `#id` links). External links and modified clicks navigate normally.

### Tunables (top of `transition.js`)

```js
var BLOCK    = 12;        // pixel block size in px — bigger = chunkier
var DURATION = 450;       // ms for a full dissolve
var COLOR    = '#080808'; // block fill colour
```

---

## 🖱️ Custom Cursors

The site uses a **fake cursor div** (`js/cursor.js`) instead of CSS `cursor:` — because browsers don't animate GIFs in CSS cursors (they fall back to an arrow). The div follows `mousemove` via `transform` and uses `background-image`, which does animate GIFs.

**Site-wide cursors** (assets/ root):

| File | Role |
|------|------|
| `assets/cursor.png` | Idle — shown everywhere |
| `assets/cursor.gif` | Animated — shown when hovering links/buttons |

**Per-series cursors** (override the site defaults on series + reader pages):

| File | Role |
|------|------|
| `comics/[series]/assets/cursor.png` | Series idle cursor |
| `comics/[series]/assets/cursor.gif` | Series hover cursor |

Drop either or both files — `node scan.js` wires them up automatically.

- Touch devices (`pointer: coarse`) are skipped
- GIF animates continuously while hovering over any interactive element
- The per-series override API: `window.__cursorSetPaths(staticPath, animPath)` — called automatically by `series.js` and `reader.js`

---

## 🎉 First-Visit Welcome Overlay

`js/construction.js` shows a full-screen welcome modal to first-time visitors only. Uses `localStorage('stg-visited')` as a gate — set on dismiss, never shown again.

### Toggle

```js
const SHOW = true;   // change to false to disable entirely
```

### To test the overlay again

Open DevTools → Application → Local Storage → delete the `stg-visited` key → refresh.

### What it shows

- A 160×160 character wave GIF placeholder (`assets/wave.gif` — drop in when artwork is ready; `onerror` handles gracefully if missing)
- Personal welcome copy with surreal/goofy tone
- Email subscribe form (Mailchimp placeholder)
- "I'm already poking around, thanks →" dismiss button
- Click outside the modal also dismisses

### Wiring up Mailchimp

Find the `<!-- MAILCHIMP EMBED -->` comment block in `construction.js` and replace the placeholder `<form>` with your Mailchimp embedded form code. Delete the placeholder submit handler at the bottom (marked with a comment).

### Disabling for launch

Change `const SHOW = false` and push. The overlay is gone site-wide until you flip it back.

---

## 🖱️ Reader Controls

| Action | Result |
|--------|--------|
| Click right half of page | Next page |
| Click left half of page | Previous page |
| Swipe left (mobile) | Next page |
| Swipe right (mobile) | Previous page |
| `→` / `Space` | Next page |
| `←` | Previous page |
| `Z` | Open zoom / lightbox |
| `?` | Toggle keyboard shortcut reference |
| `Esc` | Close zoom or shortcut panel |
| ⏮ First | Page 1 of the very first chapter |
| ⏭ Latest | Last page of the most recent chapter |
| ⤢ Zoom button | Open current page full-screen |
| ? button | Show keyboard shortcut reference |
| Chapter dropdown | Jump directly to any chapter |

---

## 🖼️ Image Dimensions & Optimization

See **IMAGE-SPECS.txt** for the complete reference. Summary:

| Format | Export width | Format | Quality |
|--------|-------------|--------|---------|
| Portrait page | 900px | WebP / JPEG | 85% |
| Newspaper strip / wide | 1200px | WebP / JPEG | 85% |
| 2-page spread | 1400px | WebP / JPEG | 85% |
| Series cover | 600×800px | WebP / JPEG | 85% |
| Header / title treatment | 500px max | PNG | — |
| Background (cover) | 1920px | WebP / JPEG | 80% |
| Background (tile) | 200–800px sq | WebP / JPEG / PNG | 80% |
| Wallpaper tile | 200–400px sq | Animated GIF | — |
| Favicon source | 512×512px | PNG | — |
| Custom cursor | 32–64px sq | PNG / GIF | — |
| Welcome overlay character | 160×160px | Animated GIF | — |

---

## 🌐 GitHub Pages Deployment

### First time

```bash
git init
git add .
git commit -m "initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then in your GitHub repo: **Settings → Pages → Source: Deploy from branch → main → / (root)**.

### Custom domain

The `CNAME` file is already in the repo. At your DNS provider:
- `A` records → `185.199.108.153`, `.109`, `.110`, `.111`
- `CNAME` record: `www` → `YOUR_USERNAME.github.io`

In GitHub Settings → Pages → Custom domain → enter your domain → Save.

### Ongoing updates

```bash
node scan.js          # always run after adding content
git add .
git commit -m "add chapter X"
git push
```

GitHub Pages rebuilds automatically. Live within 1–2 minutes.

> **Cache note:** GitHub Pages caches aggressively. After a push, hard-refresh with `Ctrl+Shift+R` if you don't see changes.

---

## 📬 Mailchimp Setup

1. Log into Mailchimp → **Audience → Signup forms → Embedded forms**
2. Copy the embed code
3. Replace the placeholder `<form>` inside the `<!-- MAILCHIMP EMBED -->` block in `js/construction.js` (overlay) and `index.html` (homepage)

---

## 💸 Donate Link

All pages have a Donate button wired to `href="#"`. Replace with your Ko-fi, PayPal, or Patreon URL in all `.nav-donate` links and footer Donate links across all HTML files.

---

## 🏗️ Build Log

Built from scratch to replace a WordPress installation. Pure static — HTML, CSS, and vanilla JS only. No frameworks, no build tools, no database.

### Goals

- Replace WordPress with something fully custom and self-owned
- Host on GitHub Pages (free, static, fast, custom domain)
- Support multiple comic series with clean organisation
- Automatic content detection — drop images in a folder, run one command, done
- Each series has its own visual identity (themed headers, backgrounds, accent colours, cursors)
- Fun, personality-driven UI touches: animated wallpaper, pixel transitions, character cursors, goofy welcome overlay

### Pages built

| File | Purpose |
|------|---------|
| `index.html` | Homepage: full-width series grid with emoji labels + latest updates feed + Mailchimp subscribe |
| `series.html` | Series archive: themed title card + chapters grid with progress badges |
| `reader.html` | Comic reader: progress bar, toolbar, page display, bottom nav mirror, lightbox, shortcut overlay |
| `blog.html` | Blog index: flat post list, newest first |
| `about.html` | About: artist photo, bio, series blurbs, tools |
| `archive.html` | Full archive: all chapters across all series grouped by series |
| `404.html` | Custom 404: GitHub Pages auto-serves this on missing URLs |
| `posts/welcome.html` | First blog post + copy-paste template for new posts |

### JavaScript

| File | What it does |
|------|-------------|
| `app.js` | Fetches manifest, renders series cards with emoji labels (SERIES_EMOJI lookup), renders latest updates feed |
| `series.js` | Applies theming + cursor, renders title card, renders chapters grid with localStorage progress badges |
| `reader.js` | Full reader: theming, cursor, navigation, chapter selector, progress bar, lightbox, keyboard shortcuts, strip mode, swipe, localStorage progress |
| `archive.js` | Fetches manifest, renders all chapters grouped by series |
| `cursor.js` | Animated fake cursor system: idle PNG everywhere, GIF on hover; skips touch; `window.__cursorSetPaths()` API |
| `transition.js` | Pixel dissolve transitions: Fisher-Yates shuffled 12px block grid on `<canvas>`, `sessionStorage` flag for cross-page reveal |
| `wallpaper.js` | BG Remote: 3-state (play/pause/stop) wallpaper control; adds body class for CSS to act on; localStorage persistence; mobile skip; old-key migration |
| `construction.js` | First-visit welcome overlay: localStorage gate (`stg-visited`), animated-in modal, email form placeholder, click-outside dismiss |

### CSS architecture

Single stylesheet (`style.css`) with emoji-labelled sections for Ctrl+F navigation. Key systems:

- **Tiled wallpaper**: `body:not(.has-series-bg)` base rule, overridden by `body.wallpaper-pause` and `body.wallpaper-stop` — higher-specificity rules written so `:not(.has-series-bg)` guards series pages automatically
- **Dark content panel**: `body:not(.has-series-bg) main` — max-width 1100px, dark bg, border glow. Exemptions via body classes for pages that don't need it.
- **Series full-bleed breakout**: `body.page-home .series-picker` uses `width: 100vw; left: 50%; transform: translateX(-50%)` to break out of the content panel
- **Theme system**: CSS custom properties on `[data-theme="warm|cool|dark"]`
- **Strip mode**: `.strip-mode` class enables horizontal scroll at fixed height on mobile for wide images
- **BG Remote widget**: `#bg-remote` in flex header row; `#wallpaper-toggle[data-state="play/pause/stop"]` drives colour via attribute selector

### Comic series

| Slug | Title | Theme | Accent | Emoji |
|------|-------|-------|--------|-------|
| `iagl` | It's a Good Life | warm | `#f0a500` | 🦆 |
| `melvin` | Melvin | cool | `#4fc3f7` | 🐰 |
| `dio` | Dio La Damned | dark | `#c62828` | 👿 |

### Key technical decisions

**Why fake cursor div instead of CSS cursor?**
Browsers silently drop GIF animation when set via `cursor: url()` — they only show the first frame. Using a `position:fixed; pointer-events:none` div with `background-image` is the only cross-browser way to get animated cursors.

**Why body-class approach for wallpaper states?**
Early implementation used `body.style.backgroundImage` directly from JS. This broke on page-to-page navigation (state wasn't re-applied consistently), and the inline style had higher specificity than any CSS overrides. Body classes give CSS full control — the `:not(.has-series-bg)` selector guard means series pages are automatically exempt without any URL detection.

**Why sessionStorage for transitions?**
The transition needs to "know" when a page was arrived at via a pixel-cover click, so it can reveal on load. `sessionStorage` survives page navigation but clears on tab close — exactly the right scope. `localStorage` would persist too long (across future visits).

**Why no social meta tags?**
Intentional. No OG/Twitter/social share metadata on this site — URL sharing only, no card previews. This is a permanent constraint.

---

*© Stay Tooned GFX. All characters and artwork are protected.*
