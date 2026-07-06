# 🛠️ Lesson 01 — Your Toolkit

> *Before a comic artist can draw, they need a desk, the right pens, and paper.
> Before you can build a webcomic site, you need a code editor, some tools,
> and your art ready to go. Let's set up your desk.*

---

## 🎭 The Big Picture

This lesson is pure **prep**. Nothing goes live. Nothing breaks. You're just making sure all the tools are installed and your first set of comic images are ready to upload.

Think of it like gathering your supplies before an inking session. Rush this step and you'll be hunting for your brush pen mid-page. Do it right and the actual drawing flows.

---

## 🛒 What You Need for This Lesson

Nothing — this lesson IS the setup.

---

## 📋 Step 1 — Install VS Code

VS Code is your code editor. It's free, fast, and industry-standard.

1. Go to [https://code.visualstudio.com](https://code.visualstudio.com)
2. Click the big download button for your OS
3. Install it (default settings are fine)
4. Open VS Code — you should see a blank welcome screen

**Recommended extensions** (search in the Extensions sidebar `Ctrl+Shift+X`):

| Extension | Why |
|-----------|-----|
| `Prettier` | Auto-formats your code on save |
| `Live Server` | Right-click HTML → Open in browser with live reload |
| `CSS Variable Autocomplete` | Hints for `var(--something)` |

---

## 📋 Step 2 — Install Node.js

Node.js runs the scanner script (`scan.js`) that reads your comics folder and builds the site's data files.

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the recommended one, not the "Current")
3. Install it (default settings are fine)

**Verify it worked.** Open a terminal and type:

```
node --version
```

You should see something like `v20.11.0`. Any version ≥ 18 works.

> 💡 **Windows users:** After installing Node.js, close and reopen your terminal — it needs to reload the PATH.

---

## 📋 Step 3 — Install Git

Git is version control. It tracks every change you make and is how you push your site to GitHub Pages.

1. Go to [https://git-scm.com](https://git-scm.com)
2. Download and install (default settings are fine on all platforms)

**Verify it worked:**

```
git --version
```

You should see something like `git version 2.43.0`.

**Configure your identity** (Git needs this before you can commit):

```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## 📋 Step 4 — Create a GitHub Account

If you don't have one:

1. Go to [https://github.com](https://github.com)
2. Click **Sign up** — it's free
3. Choose a username. This becomes part of your site URL: `https://yourusername.github.io/your-repo`
4. Verify your email

---

## 📋 Step 5 — Prepare Your Comic Art

This is the most important prep step. The site is **very specific about file names and sizes**. Get this wrong and your images won't show up.

### 🗂️ Required folder structure for your art

Your comics will live in a folder called `comics/` inside the project. Each series gets its own subfolder, and each chapter gets its own subfolder inside that:

```
comics/
└── your-series-name/       ← lowercase, no spaces, use hyphens
    ├── series.json          ← you'll create this
    └── chapter-01/          ← zero-padded chapter numbers
        ├── chapter.json     ← you'll create this
        ├── 01.jpg           ← zero-padded page numbers
        ├── 02.jpg
        └── 03.jpg
```

> ⚠️ **Zero-padding is not optional.** Computers sort files alphabetically.
> `1, 10, 11, 2, 3` is alphabetical order.
> `01, 02, 03, 10, 11` is the correct reading order.
> Always use at least two digits: `01`, `02`, `03`...

### 📐 Export sizes

Export your art at these web-ready sizes (resize down from your master file — never up):

| Page format | Export width | Height | Format | Quality |
|-------------|-------------|--------|--------|---------|
| Portrait comic page | **900 px** | auto (aspect ratio) | JPEG / WebP | 85% |
| Newspaper strip (wide) | **1200 px** | auto (will be short) | JPEG / WebP | 85% |
| 2-page spread | **1400 px** | auto | JPEG / WebP | 85% |
| Series cover image | **600 × 800 px** | fixed 800 | JPEG / WebP | 85% |
| Series header/logo | **500 px** max wide | auto | **PNG** (transparency) | — |
| Background art | **1920 px** | ~1080 | JPEG / WebP | 80% |
| Background tile | **200–400 px square** | same as width | JPEG / WebP / PNG | 80% |

> 💡 **What format to use?** WebP is smaller and better quality. JPEG works everywhere.
> PNG is for things that need transparency (like logos and headers).
> GIF is only for animated things (the wallpaper tile, cursors).

### 🔧 Resize tools

| Tool | How to use |
|------|-----------|
| **Squoosh** (browser, free) | [squoosh.app](https://squoosh.app) — drag and drop, export as WebP |
| **XnConvert** (desktop, free) | Batch resize a whole folder at once |
| **Photoshop** | File → Export → Export As → WebP or JPEG, set quality |
| **Clip Studio Paint** | File → Export (Single Layer) → choose format, set width |

---

## 📋 Step 6 — Prepare Your First Chapter

For your first run through these lessons, you just need a handful of images to test with. You don't need a finished chapter.

**Minimum working set:**

```
comics/
└── my-series/
    └── chapter-01/
        ├── 01.jpg    ← at least 3-5 images
        ├── 02.jpg
        └── 03.jpg
```

Name your series folder something descriptive but simple. Lowercase, hyphens instead of spaces:

- ✅ `my-comic`, `the-adventures-of-duck`, `neo-noir-strip`
- ❌ `My Comic`, `The Adventures Of Duck`, `neo noir strip`

---

## 📋 Step 7 — Optional: Prepare Your Brand Assets

These aren't required for Lesson 2, but gather them when you have them:

| Asset | Size | File |
|-------|------|------|
| Site logo | SVG or PNG, ~72px tall | `assets/logo.svg` |
| Favicon | 512×512 PNG to start | `assets/` |
| About photo | 400×400 px minimum | `assets/artist.png` |
| Series cover | 600×800 px | `comics/[series]/assets/cover.jpg` |
| Series header/logo | 500px wide, PNG with transparency | `comics/[series]/assets/header.png` |

---

## 🧪 How to Know You're Ready

Before moving to Lesson 02, check:

- [ ] VS Code installed and opens
- [ ] `node --version` prints a version number
- [ ] `git --version` prints a version number
- [ ] GitHub account created
- [ ] At least one chapter folder with 3+ images, named `01.jpg`, `02.jpg`, `03.jpg`
- [ ] Images exported at the right pixel width

---

## 🐛 Common Mistakes

**"node is not recognized as a command"**
→ Close and reopen the terminal after installing Node.js. The PATH needs to reload.

**"git is not recognized as a command"**
→ Same fix — close and reopen the terminal.

**Images won't show up on the site**
→ Check the filenames. They must be lowercase and zero-padded (`01.jpg`, not `1.JPG`). GitHub is case-sensitive.

**"My strip is showing in portrait mode"**
→ The strip auto-detection triggers when width is more than 2× the height. A 1200×500 image = 2.4:1 → strip mode activates. If it's not triggering, your image isn't wide enough relative to its height.

---

*Continue to → [Lesson 02: Project Setup](02-PROJECT-SETUP.md)*
