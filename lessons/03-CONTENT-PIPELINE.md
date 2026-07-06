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

In your `comics/` folder, create a folder for your series. Use a **slug** — lowercase, no spaces, hyphens instead of spaces:

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
| `"warm"` | Amber diagonal | Italic (Libre Baskerville) | Gold |
| `"cool"` | Cyan fade from top | Normal (Caveat) | Cyan |
| `"dark"` | Red radial vignette | Uppercase (UnifrakturMaguntia) | Blood red |

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
| `10.jpg` | `10.jpg` (sorts before `2.jpg` without zero-padding) |

**Supported image extensions:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`

> 💡 **Any image file in the chapter folder becomes a page.** The scanner includes all image files, sorted alphabetically. Use a consistent naming scheme (`01.jpg`, `02.jpg`, etc.) to control order.

---

## 📋 Step 6 — Create `scan.js`

Create `scan.js` in the project root. This is the scanner that builds the manifest:

```js
// scan.js — Walks comics/ and builds manifest.json + sitemap.xml
// Run: node scan.js

const fs   = require('fs');
const path = require('path');

const COMICS_DIR    = path.join(__dirname, 'comics');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const SITEMAP_PATH  = path.join(__dirname, 'sitemap.xml');
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

// Update this to your GitHub Pages URL (or custom domain when ready):
const BASE_URL = 'https://YOUR_USERNAME.github.io/YOUR_REPO';

function isImage(f) {
  return IMAGE_EXTS.has(path.extname(f).toLowerCase());
}

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

// Find the first matching file from a list of candidates
function firstExisting(dir, candidates) {
  return candidates.find(f => fs.existsSync(path.join(dir, f))) ?? null;
}

if (!fs.existsSync(COMICS_DIR)) {
  console.warn('comics/ not found — nothing to scan.');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ series: [] }, null, 2));
  process.exit(0);
}

const manifest = { series: [] };

const seriesSlugs = fs.readdirSync(COMICS_DIR)
  .filter(f => fs.statSync(path.join(COMICS_DIR, f)).isDirectory())
  .sort();

for (const slug of seriesSlugs) {
  const seriesDir  = path.join(COMICS_DIR, slug);
  const seriesData = readJSON(path.join(seriesDir, 'series.json'));

  if (!seriesData) {
    console.warn(`[skip] ${slug} — no series.json`);
    continue;
  }

  // Look for assets in comics/slug/assets/ subfolder
  const assetsDir   = path.join(seriesDir, 'assets');
  const assetBase   = fs.existsSync(assetsDir) ? assetsDir : seriesDir;
  const assetPrefix = fs.existsSync(assetsDir)
    ? `comics/${slug}/assets`
    : `comics/${slug}`;

  // Detect series asset files
  const cover       = firstExisting(assetBase, ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp']);
  const headerImage = firstExisting(assetBase, ['header.png', 'header.jpg', 'header.webp']);
  const background  = firstExisting(assetBase, ['bg.jpg', 'bg.jpeg', 'bg.png', 'bg.webp']);
  const cursor      = firstExisting(assetBase, ['cursor.png']);
  const cursorAnim  = firstExisting(assetBase, ['cursor.gif']);

  // Walk chapter folders (skip the assets/ subfolder)
  const chapterSlugs = fs.readdirSync(seriesDir)
    .filter(f => f !== 'assets' && fs.statSync(path.join(seriesDir, f)).isDirectory())
    .sort();

  const chapters = [];

  for (const chSlug of chapterSlugs) {
    const chDir  = path.join(seriesDir, chSlug);
    const chData = readJSON(path.join(chDir, 'chapter.json')) ?? { title: chSlug };

    // All image files in the chapter folder become pages, sorted alphabetically
    const pages = fs.readdirSync(chDir)
      .filter(isImage)
      .sort()
      .map(f => `comics/${slug}/${chSlug}/${f}`);  // full relative path for <img src>

    const chBackground = firstExisting(chDir, ['bg.jpg', 'bg.jpeg', 'bg.png', 'bg.webp']);

    if (pages.length === 0) {
      console.warn(`  [warn] ${slug}/${chSlug} — no image files`);
    }

    chapters.push({
      slug:           chSlug,
      title:          chData.title          ?? chSlug,
      date:           chData.date           ?? null,
      backgroundMode: chData.backgroundMode ?? null,
      pageCount:      pages.length,
      thumbnail:      pages[0]              ?? null,   // first page, used as chapter card preview
      pages,
      background: chBackground ? `comics/${slug}/${chSlug}/${chBackground}` : null,
    });

    console.log(`  ✓ ${slug}/${chSlug} — ${pages.length} page(s)`);
  }

  manifest.series.push({
    slug,
    title:          seriesData.title          ?? slug,
    shortName:      seriesData.shortName      ?? slug.toUpperCase(),
    description:    seriesData.description    ?? '',
    accentColor:    seriesData.accentColor    ?? '#ffffff',
    theme:          seriesData.theme          ?? null,
    backgroundMode: seriesData.backgroundMode ?? 'cover',
    cover:        cover       ? `${assetPrefix}/${cover}`       : null,
    headerImage:  headerImage ? `${assetPrefix}/${headerImage}` : null,  // title card logo
    background:   background  ? `${assetPrefix}/${background}`  : null,  // page background
    cursor:       cursor      ? `${assetPrefix}/${cursor}`      : null,
    cursorAnim:   cursorAnim  ? `${assetPrefix}/${cursorAnim}`  : null,
    chapterCount: chapters.length,
    chapters,
  });

  console.log(`✓ ${seriesData.title} (${chapters.length} chapter(s))`);
}

// Write manifest.json
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`\n✅ manifest.json written (${manifest.series.length} series)`);

// Write sitemap.xml
const staticPages  = ['', 'about.html', 'blog.html', 'archive.html'];
const seriesPages  = manifest.series.map(s => `series.html?s=${s.slug}`);
const readerPages  = manifest.series.flatMap(s =>
  s.chapters.map(ch => `reader.html?s=${s.slug}&ch=${ch.slug}&p=1`)
);
const allUrls = [...staticPages, ...seriesPages, ...readerPages];
const today   = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>\n    <loc>${BASE_URL}/${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(SITEMAP_PATH, sitemap);
console.log(`✅ sitemap.xml written (${allUrls.length} URLs)`);
```

> ⚠️ **Update line 11:** Replace `BASE_URL` with your actual GitHub Pages URL.

---

## 📋 Step 7 — Run the Scanner

```bash
node scan.js
```

Expected output:

```
  ✓ my-series/chapter-01 — 3 page(s)
✓ My Series (1 chapter(s))

✅ manifest.json written (1 series)
✅ sitemap.xml written (3 URLs)
```

Open `manifest.json` to see what the frontend will read. Key fields to know:

```json
{
  "series": [{
    "slug": "my-series",
    "title": "My Series",
    "accentColor": "#4fc3f7",
    "theme": "cool",
    "cover": null,
    "headerImage": null,
    "background": null,
    "cursor": null,
    "chapterCount": 1,
    "chapters": [{
      "slug": "chapter-01",
      "title": "Chapter 1: The Beginning",
      "date": "2026-07-01",
      "pageCount": 3,
      "thumbnail": "comics/my-series/chapter-01/01.jpg",
      "pages": [
        "comics/my-series/chapter-01/01.jpg",
        "comics/my-series/chapter-01/02.jpg",
        "comics/my-series/chapter-01/03.jpg"
      ]
    }]
  }]
}
```

> **Note the field names** — these are what your frontend JS will read:
> - `headerImage` — the series title card logo/treatment
> - `background` — the series/chapter background image
> - `pageCount` — number of pages (integer)
> - `thumbnail` — full path to the first page image
> - Pages are **full relative paths** (e.g. `comics/my-series/chapter-01/01.jpg`) so they can be used directly as `<img src>` values

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

      // URL params: ?s= for series slug, ?ch= for chapter slug, ?p= for page (1-indexed)
      var readHref = firstChapter
        ? 'reader.html?s=' + s.slug + '&ch=' + firstChapter.slug + '&p=1'
        : 'series.html?s=' + s.slug;

      var coverHtml = s.cover
        ? '<img class="series-card-cover" src="' + s.cover + '" alt="' + s.title + '">'
        : '<div class="series-card-cover-placeholder">📖</div>';

      return '<div class="series-card" style="--card-accent:' + (s.accentColor || '#fff') + '">' +
        '<a href="series.html?s=' + s.slug + '" class="series-card-cover-wrap">' + coverHtml + '</a>' +
        '<div class="series-card-body">' +
          '<div class="series-card-title">' + emoji + s.title + '</div>' +
          '<div class="series-card-desc">' + (s.description || '') + '</div>' +
          '<div class="series-card-meta">' + s.chapterCount + ' chapter(s)</div>' +
          '<div class="series-card-actions">' +
            '<a href="' + readHref + '" class="start-reading-btn">Start Reading →</a>' +
            '<a href="series.html?s=' + s.slug + '" class="series-archive-link">Archive ›</a>' +
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

> **URL parameter convention used throughout this codebase:**
> - `?s=` — series slug (e.g. `?s=my-series`)
> - `?ch=` — chapter slug (e.g. `?ch=chapter-01`)
> - `?p=` — page number, **1-indexed** (e.g. `?p=1` for page 1)
>
> You'll see this same pattern in `series.js` and `reader.js`.

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

.series-card-cover,
.series-card-cover-placeholder {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: #1a1a1a;
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

.start-reading-btn, .series-archive-link {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.start-reading-btn {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}
.start-reading-btn:hover { background: rgba(255,255,255,0.18); }

.series-archive-link { color: rgba(255,255,255,0.5); }
.series-archive-link:hover { color: rgba(255,255,255,0.8); }
```

---

## 📋 Step 10 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. You should see your series card render with title, description, and chapter count
4. If you added a `cover.jpg`, it should show as the card image
5. Click "Start Reading →" — the URL should be `reader.html?s=my-series&ch=chapter-01&p=1`
6. Click "Archive ›" — the URL should be `series.html?s=my-series`

---

## 🧪 How to Know It's Working

- [ ] `node scan.js` prints your series/chapter names without errors
- [ ] `manifest.json` exists and contains your series data with correct field names
- [ ] Pages in the manifest are full paths like `comics/my-series/chapter-01/01.jpg`
- [ ] Homepage loads and shows your series card
- [ ] "Start Reading" link URL contains `?s=`, `?ch=`, `?p=`

---

## 🐛 Common Mistakes

**"No series found"**
→ Make sure `series.json` exists directly inside `comics/my-series/` and `chapter.json` inside the chapter folder. The scanner skips folders without these files.

**"fetch failed" / "Could not load manifest"**
→ You're opening the HTML file directly instead of using the local server. Run `npm run dev` and go to `http://localhost:3000`.

**Pages are missing from the reader**
→ You ran `scan.js` before adding the images. Drop the images in, then run `node scan.js` again.

**"Scanner shows 0 page(s)"**
→ The scanner includes any file with an image extension (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`). If you have 0 pages, there are genuinely no supported image files in the chapter folder.

**Images don't load in the reader**
→ Check your `manifest.json` — pages should be full paths like `comics/my-series/chapter-01/01.jpg`, not just `01.jpg`. If you see just filenames, the scan.js pages mapping is missing the `comics/${slug}/${chSlug}/` prefix.

---

*Continue to → [Lesson 04: Wallpaper System](04-WALLPAPER-SYSTEM.md)*
