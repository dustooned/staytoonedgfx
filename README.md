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
│   └── archive.js      🗂️  Archive page logic — full chapter listing
│
├── assets/             🗂️  Site-wide assets
│   ├── site.webmanifest    ✓ created — Android/PWA app manifest
│   ├── favicon.ico         ← drop in (16+32px multi-size)
│   ├── favicon-16x16.png   ← drop in
│   ├── favicon-32x32.png   ← drop in
│   ├── apple-touch-icon.png ← drop in (180×180)
│   ├── android-chrome-192x192.png ← drop in
│   ├── android-chrome-512x512.png ← drop in
│   ├── logo.png            ← drop in (site header logo)
│   └── artist.jpg          ← drop in (about page photo)
│
├── comics/             📚 Your content lives here
│   ├── iagl/           🟡 It's a Good Life  (theme: warm)
│   │   ├── series.json
│   │   ├── assets/         ← all series visual files go here
│   │   │   ├── cover.jpg       ← series card image
│   │   │   ├── header.png      ← title card logo/treatment
│   │   │   ├── bg.jpg          ← series background
│   │   │   └── cursor.png      ← custom series cursor
│   │   └── chapter-01/
│   │       ├── chapter.json
│   │       ├── bg.jpg          ← chapter bg override (optional)
│   │       └── 01.jpg, 02.jpg...
│   ├── melvin/         🔵 Melvin  (theme: cool)
│   └── dio/            🔴 Dio La Damned  (theme: dark)
│
└── posts/              📝 Blog posts (static HTML files)
    └── welcome.html    — starter post / copy as template for new posts
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

### Optional assets per series (drop in the series folder, scan picks them up)

| Filename | Effect |
|----------|--------|
| `cover.jpg` | Series card image on homepage (600×800 px) |
| `header.png` | Title treatment / logo in the title card (500px wide, PNG) |
| `bg.jpg` | Background image — cover or tile depending on `backgroundMode` |
| `cursor.png` | Custom cursor active on all pages for this series |

### Background modes

Set `"backgroundMode"` in `series.json` (or `chapter.json` to override per chapter):

| Mode | `bg.jpg` size | Behaviour |
|------|--------------|-----------|
| `"cover"` (default) | 1920×1080 px | Scales to fill screen, fixed while scrolling |
| `"tile"` | 200–800 px square, seamless | Repeats in all directions, scrolls with page |

When any background is active, the page content floats in a centred dark panel so the background shows around the sides — matching classic webcomic layouts. See IMAGE-SPECS.txt for design specs.

### Optional chapter-level override

Drop a `bg.jpg` inside any chapter folder. Add `"backgroundMode"` to `chapter.json` to also change the tile/cover mode for just that chapter.

---

## 🖱️ Custom Cursors

Drop `cursor.png` (or `cursor.gif` for animated) in a series folder. `node scan.js` wires it up automatically — no other changes needed.

- Active on the series archive page and reader for that series
- Cursor restores to default when leaving
- See IMAGE-SPECS.txt Part 5 for size specs, hotspot notes, and design tips

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

First/Latest automatically cross chapter boundaries.

### Progress bar
A thin coloured bar above the comic page fills as you read. Colour tracks the series accent. Resets to 0% on chapter change.

### Zoom / lightbox
Press `Z` or click ⤢ in the toolbar to open the current page full-screen. Click outside, press `Esc`, or tap the ✕ button to close.

### Strip mode (wide images)
When a comic page is wider than 2× its height (newspaper strips, 2-page spreads), the reader automatically switches to **strip mode** on mobile: fixed readable height, horizontal scroll, `← scroll →` hint. On desktop, wide images fill the container normally.

### Orientation overlay
On mobile portrait when a wide image is open, a prompt appears to rotate the device. Dismisses automatically on rotate, or tap "Keep portrait."

### Reading progress
Saves your position to `localStorage` on every page turn. Series page shows a **▶ p.N** badge on in-progress chapters linking directly to the last-read page.

---

## 📖 Navigation

### Site nav (all pages)
`Home` / `About` / `Blog` / `Donate`

### Footer nav (all pages)
`Home` / `About` / `Blog` / `Archive` / `Donate`

### Homepage
- **Series grid** — cover art, title, description, chapter count. "Start Reading →" goes to chapter 1 page 1. "Archive ›" goes to the series page.
- **Latest Updates feed** — most recent 6 chapters across all series, sorted by date, auto-populated from the manifest.

### Archive page
`archive.html` — all chapters grouped by series with date and page count. Auto-populated from the manifest.

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
| Favicon source | 512×512px | PNG | — |
| Custom cursor | 32–64px sq | PNG / GIF | — |

---

## 🌐 Favicons

All pages include a full modern favicon set. Drop these 6 files into `assets/`:

| File | Size |
|------|------|
| `favicon.ico` | 16+32px multi-size |
| `favicon-16x16.png` | 16×16 |
| `favicon-32x32.png` | 32×32 |
| `apple-touch-icon.png` | 180×180 |
| `android-chrome-192x192.png` | 192×192 |
| `android-chrome-512x512.png` | 512×512 |

**Quickest method:** design at 512×512, upload to [favicon.io](https://favicon.io) → download → rename → drop in `assets/`. The `site.webmanifest` is already created and wired up.

---

## ℹ️ About Page

`about.html` — edit directly in the file. Placeholder sections:
- Artist photo: drop `assets/artist.jpg` (displays as a 140px circle)
- Bio paragraph: marked with a comment, replace the placeholder text
- Series blurbs: pre-filled with your three series, update descriptions as needed
- Tools paragraph: marked with a comment, describe your actual process

---

## 🚧 Under Construction Overlay

A modal appears on every page until you turn it off. When you're ready to launch:

1. Open [`js/construction.js`](js/construction.js)
2. Change line 11: `const SHOW = false;`
3. Commit and push — overlay is gone site-wide

To re-enable it: set `SHOW = true` and push again.

**Wiring up Mailchimp:** find the `<!-- MAILCHIMP EMBED -->` comment block inside `construction.js` and replace the placeholder `<form>` with your Mailchimp embedded form code. Then delete the placeholder submit handler at the bottom of the file (also marked with a comment).

**Editing the message:** find `#stg-ob-title` and `#stg-ob-body` in the `backdrop.innerHTML` block inside `construction.js`.

See WORKFLOW.txt Part 7 for the full step-by-step.

---

## 📬 Mailchimp Setup

1. Log into Mailchimp → **Audience → Signup forms → Embedded forms**
2. Copy the embed code
3. Open `index.html` and paste it inside the `<!-- MAILCHIMP EMBED -->` comment block, replacing the placeholder `<form>`

---

## 💸 Donate Link

All pages have a Donate button. To wire it up, find `href="#"` on every `.nav-donate` link and footer Donate link across:
`index.html`, `series.html`, `reader.html`, `blog.html`, `about.html`, `archive.html`, `404.html`, `posts/*.html`

Replace `#` with your Ko-fi, PayPal, Patreon, or other donation URL.

---

## 📝 Adding a Blog Post

1. Open `blog.html` and copy one `<a class="post-card">` block
2. Paste it at the **top** of the `posts-list` div (newest first)
3. Fill in the date, title, excerpt, and `href`
4. Duplicate `posts/welcome.html` → rename → write content between the comment markers

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

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

### Custom domain (staytoonedgfx.com)

The `CNAME` file is already in the repo containing `staytoonedgfx.com`.

At your DNS provider, point the domain to GitHub Pages:
- `A` record → `185.199.108.153`
- `A` record → `185.199.109.153`
- `A` record → `185.199.110.153`
- `A` record → `185.199.111.153`
- `CNAME` record: `www` → `YOUR_USERNAME.github.io`

In GitHub repo Settings → Pages → Custom domain → enter `staytoonedgfx.com` → Save.

DNS propagation can take up to 48 hours. GitHub auto-provisions HTTPS once it resolves.

### Ongoing updates

```bash
node scan.js          # always run after adding content
git add .
git commit -m "add chapter X"
git push
```

GitHub Pages rebuilds automatically on every push. Live within 1–2 minutes.

---

## 🏗️ Build Log

Built from scratch in a single session to replace a WordPress installation at staytoonedgfx.com. Pure static — HTML, CSS, and vanilla JS only.

### Goals

- Replace WordPress with something fully custom and self-owned
- Host on GitHub Pages (free, static, fast, custom domain)
- Support multiple comic series with clean organisation
- Automatic content detection — drop images in a folder, run one command, done
- Each series has its own visual identity (themed headers, backgrounds, accent colours, cursors)
- Universal nav (HOME / ABOUT / BLOG / DONATE), footer nav with Archive
- Mailchimp newsletter embed
- Mobile-first reader with swipe, strip mode, and orientation UX

### Pages built

| File | Purpose |
|------|---------|
| `index.html` | Homepage: series grid with Start Reading CTA + latest updates feed + Mailchimp subscribe |
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
| `app.js` | Fetches manifest, renders series cards (cover art, CTAs), renders latest updates feed |
| `series.js` | Applies theming + cursor, renders title card, renders chapters grid with localStorage progress badges |
| `reader.js` | Full reader: theming, cursor, navigation (First/Prev/Next/Latest), chapter selector, progress bar, lightbox/zoom, keyboard shortcut overlay, strip mode, orientation overlay, swipe, click-to-navigate, keyboard, URL sync, preloading, localStorage progress |
| `archive.js` | Fetches manifest, renders all chapters grouped by series |

### scan.js

Node.js, zero dependencies. Walks `comics/` alphabetically, reads `series.json` and `chapter.json`, auto-detects all assets by filename, outputs:
- `manifest.json` — all series/chapter/page data the frontend reads via `fetch()`
- `sitemap.xml` — all page URLs for search engine indexing

Detected automatically (no config needed): `cover.jpg`, `header.png`, `bg.jpg`, `cursor.png/gif`, chapter page images (all standard image extensions).

### CSS architecture

Single stylesheet (`style.css`) with emoji-labelled sections for Ctrl+F navigation. Theme system via CSS custom properties on `[data-theme="warm|cool|dark"]`. Key systems:
- **Content panel**: when a series background is active, content floats in a centred dark panel (max 1100px) with the background visible around the sides
- **Strip mode**: `.strip-mode` class enables horizontal scroll at fixed 220px height on mobile for wide images
- **Tile mode**: `body.has-series-bg.bg-tile` switches from fixed cover to repeating scroll background
- **Lightbox**: fixed overlay with `z-index: 600`, closes on click-outside or Esc
- **Shortcut overlay**: `z-index: 550`, shows keyboard reference card
- **Progress bar**: 3px bar above the comic page, fills via inline `width` style set by JS

### Comic series

| Slug | Title | Theme | Accent |
|------|-------|-------|--------|
| `iagl` | It's a Good Life | warm | `#f0a500` |
| `melvin` | Melvin | cool | `#4fc3f7` |
| `dio` | Dio La Damned | dark | `#c62828` |

### Reader features at a glance

- First / Prev / Next / Latest buttons (cross-chapter boundaries)
- Chapter dropdown selector
- Chapter progress bar (coloured, animated)
- Zoom / lightbox (⤢ button or Z key)
- Keyboard shortcut reference panel (? button or ? key)
- Touch swipe (40px threshold, horizontal only)
- Click-half navigation (right = next, left = prev; disabled in strip mode)
- Arrow key + spacebar navigation
- Strip mode auto-detection (ratio > 2:1)
- Orientation overlay (touch + portrait + wide image)
- localStorage reading progress (per chapter, per series)
- Adjacent page preloading
- URL sync via `history.replaceState` (no full reload)
- Custom cursor per series (auto-activated)
- Content panel backdrop (auto-activated when bg image present)

---

*© Stay Tooned GFX. All characters and artwork are protected.*
