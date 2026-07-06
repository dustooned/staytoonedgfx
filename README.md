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
├── sw.js               📦 Service worker — caches app shell + comic images for PWA/offline
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
│   ├── hero-type.js    ✍️  Homepage hero interactive typography — Bungee Inline, scale falloff
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
    ├── 09-GOING-LIVE.md
    └── 10-INTERACTIVE-TYPOGRAPHY.md
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

> **Note:** `background` and `backgroundPause` for chapters are auto-detected from `bg.gif` / `bg.jpg` / `bg-pause.gif` in the chapter folder by `scan.js` — you don't add them to `chapter.json` manually.

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

> **Note:** `background` and `backgroundPause` are auto-detected by `scan.js` from `bg.gif` / `bg.jpg` / `bg-pause.gif` in the series `assets/` folder — do not add them to `series.json` manually.

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
| `bg.gif` | Animated background — BG Remote play/pause/stop controls it (checked before `bg.jpg`) |
| `bg.jpg` | Static background — used if no `bg.gif` is present |
| `bg-pause.gif` | Still frame shown when BG Remote is in pause state (optional; falls back to `bg.gif`) |
| `cursor.png` | Custom idle cursor for this series (32–64px PNG) |
| `cursor.gif` | Custom hover/animated cursor for this series (plays on links/buttons) |

### Background modes

Set `"backgroundMode"` in `series.json` (or `chapter.json` to override per chapter):

| Mode | `bg.gif` / `bg.jpg` size | Behaviour |
|------|--------------------------|-----------|
| `"cover"` (default) | 1920×1080 px | Scales to fill screen, fixed while scrolling |
| `"tile"` | 200–800 px square, seamless | Repeats in all directions, scrolls with page |

---

## 📺 Wallpaper & BG Remote

Non-series pages (homepage, blog, about, archive, 404) support a tiled animated TV static GIF wallpaper as the site background. The default state for new visitors is **Stop** (no background) — they can enable it via the BG Remote. A **BG Remote** control widget in the header toolbar lets visitors cycle through three states.

### Three states

| State | Icon | `<html>` class | Background | Button colour |
|-------|------|----------------|-----------|---------------|
| Stop | ⏹ | `wallpaper-stop` | None (dark) | 🔴 Red |
| Play | ▶ | `wallpaper-play` | `site-bg.gif` (animated) | 🟢 Green |
| Pause | ⏸ | `wallpaper-pause` | `site-bg-pause.gif` (still) | 🟡 Amber |

**Default for new visitors: Stop.** Click cycles: Stop → Play → Pause → Stop.

### How it works

`wallpaper.js` adds a class (`wallpaper-play`, `wallpaper-pause`, or `wallpaper-stop`) to the **`<html>` element** — not body. CSS handles the visual output via:

```css
html.wallpaper-play body:not(.has-series-bg) {
  background-image: url(../assets/site-bg.gif);
  background-repeat: repeat;
}
html.wallpaper-pause body:not(.has-series-bg) {
  background-image: url(../assets/site-bg-pause.gif);
  background-repeat: repeat;
}
/* Series pages get their own animated wallpaper via bg.gif in the series assets folder */
html.wallpaper-play body.has-series-bg {
  background-image: var(--series-bg);
}
html.wallpaper-pause body.has-series-bg {
  background-image: var(--series-bg-pause, var(--series-bg));
}
```

**Why `<html>` and not `<body>`:** No CSS rule fires without a positive class on `<html>`. This means the GIF is guaranteed never to load before JS runs — no flicker, no seizure-risk flash on first paint. The default (no class / JS disabled) is always a dark, background-free page.

**Series pages get wallpaper control too.** If a series has a `bg.gif` in its assets folder, the BG Remote controls it just like the site-wide wallpaper. Series with only `bg.jpg` show the image on play/pause and go dark on stop.

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

## ✍️ Interactive Typography (Homepage Hero)

`js/hero-type.js` replaces the plain homepage `<h1>` with a character-by-character interactive display using **Bungee Inline** (Google Fonts).

### How it works

Each character in "Stay Tooned GFX" is wrapped in a `<span class="hero-char">` by JS on page load. On hover, an **exponential scale falloff** radiates out from the hovered character — neighbouring letters scale down proportionally, snapping back on mouse leave via a spring cubic-bezier.

Per-word colors are pulled from the SVG logo palette:

| Word | Color |
|------|-------|
| Stay | `#f60047` (red) |
| Tooned | `#48a6ff` (blue) |
| GFX | `#ffca23` (yellow) |

Each character also gets a matching `--char-glow` CSS variable for a `drop-shadow` on hover.

### Tunables (top of `hero-type.js`)

```js
var SCALE_MAX    = 1.55;   // how large the hovered character gets
var FALLOFF      = 1.1;    // how fast scale drops with distance (higher = tighter)
var WORD_PALETTE = ['#f60047', '#48a6ff', '#ffca23', '#8fe900'];
```

### Mobile / touch

On `(pointer: coarse)` devices (touch/mobile) the hover and focus events are not bound — characters show their word colors but don't animate. This avoids accidental scale triggers on tap.

### Accessibility

The container has `role="img"` and `aria-label="Stay Tooned GFX"`. Individual character spans are `aria-hidden="true"`. Screen readers announce the whole phrase as a single label.

### `prefers-reduced-motion`

Scale animation is skipped; glow on focus is retained so keyboard users still get feedback.

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
| ⤢ Zoom button | Open lightbox — on Android + wide strip, also locks landscape orientation |
| ? button | Show keyboard shortcut reference |
| Chapter dropdown | Jump directly to any chapter |

> **Scroll position:** Page navigation does **not** scroll to the top. The viewport stays wherever the reader left it — they decide when and how to scroll.


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

> **Service worker cache:** When you add new comic strips, bump the `CACHE` version string at the top of `sw.js` (e.g., `'stg-2026-07-05'` → `'stg-2026-07-12'`). This forces installed PWAs to fetch fresh assets rather than serving the old cached manifest.

---

## 📱 Mobile & PWA

The site is installable as a Progressive Web App on Android and iOS.

### How it works

- `sw.js` (service worker) pre-caches the app shell on install and caches comic images as they're accessed. Registered by `transition.js` on every page.
- `assets/site.webmanifest` defines the PWA identity: name, icons, theme colour, display mode.
- All pages have iOS PWA meta tags for home screen installs: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`.
- Viewport uses `viewport-fit=cover` so content reaches the edges on notched iPhones.

### Cache strategy

| Request type | Strategy |
|---|---|
| Comic images (`/comics/**`) | Cache-first — fast repeat visits, survives offline |
| `manifest.json` | Network-first — always reflect new content |
| App shell (HTML, CSS, JS, assets) | Cache-first |

### Installing on Android

Visit the site in Chrome → three-dot menu → **Add to Home Screen**. The site opens full-screen with the correct theme colour.

### Installing on iOS (Safari)

Visit the site in Safari → Share → **Add to Home Screen**. Opens as a standalone app, status bar uses `black-translucent` style.

### Adding new strips — bump the cache

After adding new comic pages and running `scan.js`, also bump the `CACHE` constant at the top of `sw.js`. This forces all installed PWAs to re-download the updated manifest and new images on next open.

```js
// sw.js — top of file
const CACHE = 'stg-2026-07-12'; // change the date when adding new content
```

### Landscape orientation (Android)

On the comic reader, tapping the ⤢ Zoom button on a wide strip (newspaper-style panels, ratio > 2:1) on an Android touch device will:
1. Request fullscreen
2. Lock screen orientation to landscape

This happens automatically — no prompt, no overlay. Closing the lightbox releases the lock. iOS does not support programmatic orientation lock and is silently skipped.

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
| `reader.js` | Full reader: theming, cursor, navigation, chapter selector, progress bar, lightbox (panel-sized to image), keyboard shortcuts, strip detection, swipe, localStorage progress, landscape lock on Android, no auto-scroll on chapter nav |
| `archive.js` | Fetches manifest, renders all chapters grouped by series |
| `cursor.js` | Animated fake cursor system: idle PNG everywhere, GIF on hover; skips touch; `window.__cursorSetPaths()` API |
| `transition.js` | Pixel dissolve transitions: Fisher-Yates shuffled 12px block grid on `<canvas>`, `sessionStorage` flag for cross-page reveal; also registers `sw.js` service worker on every page |
| `wallpaper.js` | BG Remote: 3-state (play/pause/stop) wallpaper control; adds class to `<html>` (not body) for CSS to act on; default `'stop'`; localStorage persistence; mobile skip; old-key migration |
| `hero-type.js` | Homepage hero: Bungee Inline character spans with exponential scale falloff on hover, per-word brand colors, `--char-glow` drop-shadow; skips events on touch/coarse-pointer; reduced-motion safe |
| `construction.js` | First-visit welcome overlay: localStorage gate (`stg-visited`), animated-in modal, email form placeholder, click-outside dismiss |

### CSS architecture

Single stylesheet (`style.css`) with emoji-labelled sections for Ctrl+F navigation. Key systems:

- **Tiled wallpaper**: classes on `<html>` (`wallpaper-play/pause/stop`) enable CSS rules. No class = no background — GIF can never fire before JS confirms it. Series pages get wallpaper control too via `--series-bg` / `--series-bg-pause` CSS custom properties
- **Dark content panel**: `body:not(.has-series-bg) main` — max-width 1100px, dark bg, border glow. Exemptions via body classes for pages that don't need it.
- **Series full-bleed breakout**: `body.page-home .series-picker` uses `width: 100vw; left: 50%; transform: translateX(-50%)` to break out of the content panel
- **Theme system**: CSS custom properties on `[data-theme="warm|cool|dark"]`
- **Strip mode**: `.strip-mode` class tracked by JS for wide images (ratio > 2:1). No forced horizontal scroll — images always size naturally (`max-width: 100%; height: auto; max-height: 85vh`). Used to trigger landscape lock and lightbox strip mode
- **Lightbox panel**: `.lightbox-panel` inside `.lightbox` — panel auto-sizes to the image so the dark background matches image dimensions exactly. The outer `.lightbox` is the full-screen dim backdrop only
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

**Why `<html>` classes for wallpaper states, not body?**
Early versions put classes on `<body>` and had a CSS base rule that loaded the GIF by default. Problem: the GIF would start loading before JS ran and could apply the `wallpaper-stop` class — causing a flash of animated background on first paint, a seizure risk. Moving classes to `<html>` and making every CSS rule an opt-in (`html.wallpaper-play body { ... }`) means no background fires without explicit JS confirmation. The default (no class, or JS disabled entirely) is always a clean dark page.

**Why sessionStorage for transitions?**
The transition needs to "know" when a page was arrived at via a pixel-cover click, so it can reveal on load. `sessionStorage` survives page navigation but clears on tab close — exactly the right scope. `localStorage` would persist too long (across future visits).

**Why no social meta tags?**
Intentional. No OG/Twitter/social share metadata on this site — URL sharing only, no card previews. This is a permanent constraint.

---

*© Stay Tooned GFX. All characters and artwork are protected.*
