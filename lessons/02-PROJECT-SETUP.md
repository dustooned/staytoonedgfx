# 🏗️ Lesson 02 — Project Setup

> *Every comic series starts with a blank page. Every website starts with
> an empty folder. We're going to fill both — but carefully. The folder
> structure we build here is the backbone everything else hangs on.*

---

## 🎭 The Big Picture

Think of this lesson as **building the comic book store before stocking it.**

We're creating the building (folder structure), the sign out front (HTML pages), the wiring (CSS), and getting the keys made (GitHub). By the end of this lesson, you'll have a real blank site live on the internet. Nothing fancy — just the scaffolding, proving everything connects.

---

## 🛒 What You Need for This Lesson

- [ ] VS Code installed (Lesson 01)
- [ ] Node.js installed (Lesson 01)
- [ ] Git installed (Lesson 01)
- [ ] GitHub account (Lesson 01)
- [ ] Your terminal open in the folder where you want to work

---

## 📋 Step 1 — Create the Project Folder

Open your terminal and navigate to where you want to work. Then:

```bash
mkdir my-webcomic-site
cd my-webcomic-site
```

Open VS Code in this folder:

```bash
code .
```

You should see an empty folder open in VS Code's sidebar.

---

## 📋 Step 2 — Create the Folder Structure

In the terminal (still in your project folder), run:

```bash
mkdir css js assets comics posts
mkdir assets/templates
```

Your folder now looks like this:

```
my-webcomic-site/
├── css/
├── js/
├── assets/
│   └── templates/
├── comics/
└── posts/
```

---

## 📋 Step 3 — Create `package.json`

This file lets you run short commands instead of long ones. Type this in the terminal:

```bash
npm init -y
```

Then open `package.json` in VS Code and replace its contents with:

```json
{
  "name": "my-webcomic-site",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "scan": "node scan.js",
    "dev": "npx serve . -l 3000"
  }
}
```

Now you can type `npm run scan` instead of `node scan.js`, and `npm run dev` to start a local preview server.

---

## 📋 Step 4 — Create `index.html`

Create a file called `index.html` in the project root. This is your homepage.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="My webcomic site — [your tagline here]">
  <title>My Webcomic Site</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="assets/favicon.ico" sizes="any">
</head>
<body class="page-home">

  <!-- SITE HEADER -->
  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="site-logo">
        <img src="assets/logo.svg" alt="My Webcomic Site" onerror="this.style.display='none'">
      </a>
      <nav class="site-nav">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="blog.html">Blog</a>
        <a href="#" class="nav-donate" target="_blank" rel="noopener">Donate</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="section">
      <p class="section-title">Series</p>
      <div id="series-grid" class="series-grid">
        <p class="loading">Loading series…</p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-copy">&copy; <span class="js-year"></span> My Webcomic Site</p>
      <nav class="footer-nav">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="blog.html">Blog</a>
        <a href="#" target="_blank" rel="noopener">Donate</a>
      </nav>
    </div>
  </footer>

  <script src="js/app.js"></script>
</body>
</html>
```

---

## 📋 Step 5 — Create Minimal CSS

Create `css/style.css`. This is just enough to see your structure working:

```css
/* ── RESET & BASE ───────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; }

body {
  background: #0e0e0e;
  color: #e8e8e8;
  font-family: 'DM Sans', system-ui, sans-serif;
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }

/* ── HEADER ─────────────────────────────────────────── */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(14, 14, 14, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.site-logo img { height: 36px; width: auto; }

.site-nav {
  display: flex;
  gap: 20px;
  margin-left: auto;
}

.site-nav a {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  transition: color 0.15s;
}
.site-nav a:hover { color: #fff; }

/* ── MAIN CONTENT ───────────────────────────────────── */
main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.section { margin-bottom: 48px; }
.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 20px;
}

.loading { color: rgba(255,255,255,0.3); font-style: italic; }

/* ── FOOTER ─────────────────────────────────────────── */
.site-footer {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 32px 24px;
  margin-top: 80px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.3); }

.footer-nav {
  display: flex;
  gap: 16px;
  margin-left: auto;
}
.footer-nav a { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
.footer-nav a:hover { color: rgba(255,255,255,0.8); }
```

---

## 📋 Step 6 — Create a Minimal `app.js`

Create `js/app.js`. For now, just fill in the current year in the footer:

```js
// Set footer year
document.querySelectorAll('.js-year').forEach(function(el) {
  el.textContent = new Date().getFullYear();
});
```

We'll expand this in Lesson 03 when the content pipeline is ready.

---

## 📋 Step 7 — Create a `.gitignore` File

Create `.gitignore` in the project root. This tells Git to ignore files we don't want to commit:

```
node_modules/
.DS_Store
Thumbs.db
*.log
```

---

## 📋 Step 8 — Test Locally

You can't just open `index.html` as a file — the JavaScript that fetches data needs an actual server (file:// doesn't support `fetch()`).

Start the dev server:

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

You should see:
- A dark page with a sticky header
- "Series" heading
- "Loading series…" placeholder text (no series yet — that's Lesson 03)

If you see that, everything is wired up. 🎉

---

## 📋 Step 9 — Initialize Git and Push to GitHub

First, create a new repository on GitHub:
1. Go to [github.com](https://github.com) → click **New** (the green button)
2. Name it `my-webcomic-site` (or whatever you want)
3. Keep it **Public** (required for free GitHub Pages)
4. **Don't** add a README or .gitignore (you already have one)
5. Click **Create repository**

GitHub will show you a set of commands. Use these in your terminal:

```bash
git init
git add .
git commit -m "initial commit: blank webcomic site scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repo name.

---

## 📋 Step 10 — Enable GitHub Pages

1. In your GitHub repo, click **Settings** (top tab bar)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select: **Deploy from a branch**
4. Branch: **main** → Folder: **/ (root)**
5. Click **Save**

Wait 1–2 minutes. GitHub will show you a URL like:
`https://YOUR_USERNAME.github.io/YOUR_REPO/`

Open it in your browser. You should see your blank site live on the internet.

---

## 🧪 How to Know It's Working

- [ ] `npm run dev` starts a local server at `http://localhost:3000`
- [ ] The page loads dark with the header and "Series" section
- [ ] Your GitHub repo has your files in it
- [ ] `https://YOUR_USERNAME.github.io/YOUR_REPO/` shows the same page live

---

## 🐛 Common Mistakes

**"The page is blank / shows raw HTML"**
→ Make sure you're going to `http://localhost:3000` — NOT opening the file directly in the browser.

**"Permission denied when pushing to GitHub"**
→ You may need to authenticate. GitHub now requires a Personal Access Token instead of a password. Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token → use it as your password when Git asks.

**"GitHub Pages shows a 404"**
→ Make sure Settings → Pages → Source is set to `main` branch, `/(root)`. The build takes 1–2 minutes after each push.

**"My local server won't start"**
→ Another app might be using port 3000. Try `npx serve . -l 4000` and go to `http://localhost:4000` instead.

---

*Continue to → [Lesson 03: Content Pipeline](03-CONTENT-PIPELINE.md)*
