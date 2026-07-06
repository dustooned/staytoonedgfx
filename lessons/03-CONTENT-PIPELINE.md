# 📦 Lesson 03 — Content Pipeline

> *A comic artist needs an assistant who can take a look at all their
> finished pages, write a list of everything, and hand that list to
> the display case so it knows what to put out. That assistant is
> `scan.js`. The list it writes is `manifest.json`.
> The display case is your frontend JavaScript.*

---

## 🎭 The Big Picture

**The pipeline works like this:**

```
Your art folders  →  scan.js  →  manifest.json  →  app.js reads it  →  pages render
```

1. You drop images into folders
2. You run `node scan.js` — it reads every folder, counts every page, checks for assets
3. It writes `manifest.json` — a single JSON file with everything the frontend needs to know
4. Your JS files (`app.js`, `series.js`, `reader.js`) fetch `manifest.json` to render series cards, chapter grids, and comic pages

This means **you never hand-edit the manifest.** The scanner handles it. You just manage folders and JSON tag files.

---

## 🛒 What You Need for This Lesson

- [ ] Project scaffold from Lesson 02
- [ ] At least one chapter folder with 3+ images inside `comics/`
- [ ] Images named `01.jpg`, `02.jpg`, `03.jpg` (zero-padded)

---

## 📋 Step 1 — Create Your First Series Folder

In your `comics/` folder, create a folder for your series. Use a **slug** — lowercase, no spaces, hyphens instead:

```
comics/
└── my-series/
```

---

## 📋 Step 2 — Create `series.json`

Create a file called `series.json` directly inside `comics/my-series/`:

```json
{
  "title": "My Series",
  "shortName": "MS",
  "description": "A one or two sentence description shown on the homepage card.",
  "accentColor": "#4fc3f7",
  "theme": "cool"
}
```

**Field reference:**

| Field | Required? | What it does |
|-------|-----------|-------------|
| `title` | ✅ | Full display name shown on cards and title cards |
| `shortName` | ✅ | Short abbreviation shown in tight spots |
| `description` | ✅ | 1–2 sentences on the homepage card |
| `accentColor` | ✅ | Hex colour — used for glow, badges, button accents |
| `theme` | ✅ | `"warm"`, `"cool"`, or `"dark"` — controls the title card visual style |
| `backgroundMode` | optional | `"cover"` (default) or `"tile"` — how `bg.jpg` is shown |

**Theme reference:**

| `"theme"` | Overlay gradient | Title style | Accent line colour |
|-----------|-----------------|-------------|-------------------|
| `"warm"` | Amber diagonal | Italic | Gold |
| `"cool"` | Cyan fade from top | Normal weight | Cyan |
| `"dark"` | Red radial vignette | Uppercase | Blood red |

---

## 📋 Step 3 — Create a Chapter Folder

Inside `comics/my-series/`, create a folder called `chapter-01/`:

```
comics/
└── my-series/
    ├── series.json
    └── chapter-01/
```

> ⚠️ **Zero-pad chapter folders too.** `chapter-01`, `chapter-02`... not `chapter-1`.

---

## 📋 Step 4 — Create `chapter.json`

Create a file called `chapter.json` inside `comics/my-series/chapter-01/`:

```json
{
  "title": "Chapter 1: The Beginning",
  "date": "2026-07-01"
}
```

**Field reference:**

| Field | Required? | What it does |
|-------|-----------|-------------|
| `title` | ✅ | Shown on chapter cards and in the reader |
| `date` | ✅ | `YYYY-MM-DD` format — shown on chapter card |
| `backgroundMode` | optional | Override the series background mode for this chapter only |

---

## 📋 Step 5 — Add Your Comic Images

Drop your images into `comics/my-series/chapter-01/`:

```
comics/
└── my-series/
    ├── series.json
    └── chapter-01/
        ├── chapter.json
        ├── 01.jpg
        ├── 02.jpg
        └── 03.jpg
```

Pages are sorted alphabetically by filename, so zero-padding is critical:

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `01.jpg` | `1.jpg` |
| `02.jpg` | `2.jpg` |
| `10.jpg` | `10.jpg` but with `1.jpg` also present — sorts before `2.jpg` |

**Supported image extensions:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

---

## 📋 Step 6 — Create `scan.js`

Create a file called `scan.js` in the project root. This is the full scanner:

```js
// scan.js — Walks comics/ and builds manifest.json + sitemap.xml
// Run: node scan.js

const fs   = require('fs');
const path = require('path');

const COMICS_DIR = path.join(__dirname, 'comics');
const OUT_MANIFEST = path.join(__dirname, 'manifest.json');
const OUT_SITEMAP  = path.join(__dirname, 'sitemap.xml');
const SITE_URL     = 'https://yourusername.github.io/your-repo'; // ← update this

const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ASSET_FILES = ['cover.jpg', 'cover.webp', 'header.png', 'bg.jpg', 'bg.webp', 'bg.png'];

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return null; }
}

function listImages(dir) {
  return fs.readdirSync(dir)
    .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()) && /^\d+/.test(f))
    .sort()
    .map(f => f);
}

const seriesList = [];

for (const seriesSlug of fs.readdirSync(COMICS_DIR).sort()) {
  const seriesDir = path.join(COMICS_DIR, seriesSlug);
  if (!fs.statSync(seriesDir).isDirectory()) continue;

  const seriesJson = readJson(path.join(seriesDir, 'series.json'));
  if (!seriesJson) { console.warn(`[skip] ${seriesSlug} — no series.json`); continue; }

  // Detect assets
  const assetsDir = path.join(seriesDir, 'assets');
  const hasCover  = fs.existsSync(path.join(assetsDir, 'cover.jpg')) ||
                    fs.existsSync(path.join(assetsDir, 'cover.webp'));
  const hasHeader = fs.existsSync(path.join(assetsDir, 'header.png'));
  const hasBg     = fs.existsSync(path.join(assetsDir, 'bg.jpg')) ||
                    fs.existsSync(path.join(assetsDir, 'bg.webp')) ||
                    fs.existsSync(path.join(assetsDir, 'bg.png'));
  const hasCursorPng = fs.existsSync(path.join(assetsDir, 'cursor.png'));
  const hasCursorGif = fs.existsSync(path.join(assetsDir, 'cursor.gif'));

  const chapters = [];

  for (const chapterSlug of fs.readdirSync(seriesDir).sort()) {
    const chapterDir = path.join(seriesDir, chapterSlug);
    if (!fs.statSync(chapterDir).isDirectory()) continue;
    if (chapterSlug === 'assets') continue;

    const chapterJson = readJson(path.join(chapterDir, 'chapter.json'));
    if (!chapterJson) { console.warn(`[skip] ${seriesSlug}/${chapterSlug} — no chapter.json`); continue; }

    const pages = listImages(chapterDir);
    if (pages.length === 0) { console.warn(`[warn] ${seriesSlug}/${chapterSlug} — no images`); }

    const chapterBg = fs.existsSync(path.join(chapterDir, 'bg.jpg')) ||
                      fs.existsSync(path.join(chapterDir, 'bg.webp'));

    chapters.push({
      slug:  chapterSlug,
      title: chapterJson.title,
      date:  chapterJson.date,
      pages: pages,
      ...(chapterJson.backgroundMode && { backgroundMode: chapterJson.backgroundMode }),
      ...(chapterBg && { hasBg: true }),
    });

    console.log(`  ✓ ${seriesSlug}/${chapterSlug} — ${pages.length} page(s)`);
  }

  seriesList.push({
    slug:        seriesSlug,
    title:       seriesJson.title,
    shortName:   seriesJson.shortName,
    description: seriesJson.description,
    accentColor: seriesJson.accentColor,
    theme:       seriesJson.theme,
    ...(seriesJson.backgroundMode && { backgroundMode: seriesJson.backgroundMode }),
    ...(hasCover  && { cover:  `comics/${seriesSlug}/assets/cover.jpg` }),
    ...(hasHeader && { header: `comics/${seriesSlug}/assets/header.png` }),
    ...(hasBg     && { bg:     `comics/${seriesSlug}/assets/bg.jpg` }),
    ...(hasCursorPng && { cursor:     `comics/${seriesSlug}/assets/cursor.png` }),
    ...(hasCursorGif && { cursorAnim: `comics/${seriesSlug}/assets/cursor.gif` }),
    chapters,
  });

  console.log(`✓ ${seriesSlug} — ${chapters.length} chapter(s)`);
}

// Write manifest.json
fs.writeFileSync(OUT_MANIFEST, JSON.stringify({ series: seriesList }, null, 2));
console.log(`\n✅ manifest.json written (${seriesList.length} series)`);

// Write sitemap.xml
const pages = ['index.html', 'series.html', 'reader.html', 'blog.html', 'about.html', 'archive.html'];
const urls  = pages.map(p => `  <url><loc>${SITE_URL}/${p}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
fs.writeFileSync(OUT_SITEMAP, sitemap);
console.log(`✅ sitemap.xml written`);
```

> ⚠️ **Update line 9:** Replace the `SITE_URL` value with your actual GitHub Pages URL.

---

## 📋 Step 7 — Run the Scanner

In your terminal:

```bash
node scan.js
```

You should see output like:

```
  ✓ my-series/chapter-01 — 3 page(s)
✓ my-series — 1 chapter(s)

✅ manifest.json written (1 series)
✅ sitemap.xml written
```

Two new files appear in your project root:
- `manifest.json` — all series and chapter data
- `sitemap.xml` — URL list for search engines

Open `manifest.json` in VS Code to see what it looks like. This is the data your frontend reads.

---

## 📋 Step 8 — Update `app.js` to Render the Series

Replace `js/app.js` with this version that reads the manifest and renders series cards:

```js
// app.js — Homepage: series cards + footer year

document.querySelectorAll('.js-year').forEach(function(el) {
  el.textContent = new Date().getFullYear();
});

// Emoji labels per series slug — add more as you add series
var SERIES_EMOJI = {
  'my-series': '⭐',
  // 'dio': '👿',
  // 'melvin': '🐰',
  // 'iagl': '🦆',
};

fetch('manifest.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    var grid = document.getElementById('series-grid');
    if (!grid) return;

    if (!data.series || data.series.length === 0) {
      grid.innerHTML = '<p class="loading">No series found. Run node scan.js.</p>';
      return;
    }

    grid.innerHTML = data.series.map(function(s) {
      var emoji = SERIES_EMOJI[s.slug] ? SERIES_EMOJI[s.slug] + ' ' : '';
      var firstChapter = s.chapters && s.chapters[0];
      var readHref = firstChapter
        ? 'reader.html?series=' + s.slug + '&chapter=' + firstChapter.slug + '&page=0'
        : '#';

      return '<div class="series-card">' +
        (s.cover ? '<img class="series-card-cover" src="' + s.cover + '" alt="' + s.title + '">' : '') +
        '<div class="series-card-body">' +
          '<div class="series-card-title">' + emoji + s.title + '</div>' +
          '<div class="series-card-desc">' + (s.description || '') + '</div>' +
          '<div class="series-card-meta">' + (s.chapters ? s.chapters.length : 0) + ' chapter(s)</div>' +
          '<div class="series-card-actions">' +
            '<a href="' + readHref + '" class="btn-read">Start Reading →</a>' +
            '<a href="series.html?series=' + s.slug + '" class="btn-archive">Archive ›</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  })
  .catch(function(err) {
    var grid = document.getElementById('series-grid');
    if (grid) grid.innerHTML = '<p class="loading">Could not load manifest. Run node scan.js and use a local server.</p>';
    console.error(err);
  });
```

---

## 📋 Step 9 — Add Series Card CSS

Add this to `css/style.css`:

```css
/* ── SERIES GRID ────────────────────────────────────── */
.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.series-card {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.series-card-cover {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
}

.series-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.series-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f0f0f0;
}

.series-card-desc {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;
}

.series-card-meta {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
}

.series-card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
}

.btn-read, .btn-archive {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-read {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}
.btn-read:hover { background: rgba(255,255,255,0.18); }

.btn-archive {
  color: rgba(255,255,255,0.5);
}
.btn-archive:hover { color: rgba(255,255,255,0.8); }
```

---

## 📋 Step 10 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. You should see your series card render with the title, description, and chapter count
4. If you added a `cover.jpg`, it should show as the card image

---

## 🧪 How to Know It's Working

- [ ] `node scan.js` runs without errors and prints your series/chapter names
- [ ] `manifest.json` exists in the project root and contains your series data
- [ ] The homepage loads and shows your series card
- [ ] The series title appears with the right emoji prefix

---

## 🐛 Common Mistakes

**"No series found"**
→ Make sure `series.json` exists directly inside `comics/my-series/` (not inside a subfolder). Same for `chapter.json` in the chapter folder.

**"fetch failed" / "Could not load manifest"**
→ You're opening the HTML file directly instead of using the local server. Run `npm run dev` and go to `http://localhost:3000`.

**Pages are missing from the reader**
→ You ran `scan.js` before adding the images. Drop the images in the chapter folder, then run `node scan.js` again.

**"Scanner shows 0 page(s)"**
→ File names must start with a number (the scanner filters by `/^\d+/`). A file named `page-01.jpg` won't be found; `01.jpg` will.

---

*Continue to → [Lesson 04: Wallpaper System](04-WALLPAPER-SYSTEM.md)*
