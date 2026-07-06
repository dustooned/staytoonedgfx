# 🌐 Lesson 09 — Going Live

> *Printing a comic and leaving it in a drawer is not publishing.
> Publishing is when other people can read it. This lesson is
> getting the drawer open — pushing your site to GitHub Pages
> and pointing your own domain name at it.*

---

## 🎭 The Big Picture

GitHub Pages is a free static site host built into GitHub. Every public GitHub repository can be a website. You push code, GitHub builds and serves it. No servers to manage, no hosting bills, no databases.

The flow:
```
Your local files  →  git push  →  GitHub  →  GitHub Pages  →  the internet
```

For a custom domain (`yoursite.com` instead of `yourusername.github.io/your-repo`), you add a `CNAME` file and configure DNS records.

---

## 🛒 What You Need for This Lesson

- [ ] A complete project ready to publish (all previous lessons done)
- [ ] A GitHub account
- [ ] Git installed and configured with your name and email
- [ ] (Optional) A custom domain name purchased from a registrar (Namecheap, Google Domains, Cloudflare, etc.)

---

## 📋 Step 1 — Final Pre-Launch Checklist

Before pushing, run through this:

**Content:**
- [ ] `node scan.js` runs without errors
- [ ] All chapter images load correctly at `http://localhost:3000`
- [ ] Series cards show on the homepage
- [ ] At least one chapter is fully readable in the reader

**Code:**
- [ ] `BASE_URL` in `scan.js` is set to your actual URL
- [ ] All donate links (`href="#"`) updated to your real Ko-fi/PayPal/etc. URL, or left as `#` if not ready
- [ ] `SHOW = true` in `construction.js` if you want the welcome overlay to show, `false` to hide it

**Assets:**
- [ ] `assets/logo.svg` exists (or `onerror` fallback is acceptable)
- [ ] Favicon files exist in `assets/` (or add them later — they're optional for launch)

---

## 📋 Step 2 — Create a GitHub Repository

If you haven't already (Lesson 02 covered this, but here's the full process):

1. Go to [github.com](https://github.com) and click **New** (green button)
2. Repository name: `your-site-name` (use lowercase, hyphens)
3. Visibility: **Public** (required for free GitHub Pages)
4. Do NOT add a README or .gitignore — you have your own
5. Click **Create repository**

GitHub shows you setup commands. You'll use them in the next step.

---

## 📋 Step 3 — Initialize Git and Push

In your terminal, in your project folder:

```bash
git init
git add .
git commit -m "initial site: complete webcomic scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

> 💡 **Authentication:** GitHub no longer accepts passwords via HTTPS. You'll need a Personal Access Token (PAT). Create one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Give it the `repo` scope. Use it in place of your password when prompted.
>
> Or use SSH — [GitHub's SSH guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

---

## 📋 Step 4 — Enable GitHub Pages

1. In your GitHub repo, click the **Settings** tab (top bar)
2. In the left sidebar, click **Pages**
3. Under **Source**, select: **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**

Wait 1–2 minutes. GitHub Pages will show:
> "Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO/"

Open that URL — your site is live! 🎉

---

## 📋 Step 5 — Custom Domain (Optional)

If you have a domain name (like `yoursite.com`), you can point it at your GitHub Pages site.

### 5a — Create the CNAME file

In your project root, create a file called `CNAME` (no extension) containing just your domain:

```
yoursite.com
```

Commit and push it:

```bash
git add CNAME
git commit -m "add custom domain CNAME"
git push
```

### 5b — Configure DNS records

At your domain registrar (where you bought the domain), add these DNS records:

**A records** (point the root domain to GitHub's servers):
| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

**CNAME record** (point the www subdomain):
| Type | Host | Value |
|------|------|-------|
| CNAME | www | YOUR_USERNAME.github.io |

> ⚠️ DNS propagation can take up to 48 hours. Usually it's 15–30 minutes.

### 5c — Configure GitHub Pages for your domain

1. In GitHub → Settings → Pages → Custom domain
2. Enter `yoursite.com` (or `www.yoursite.com`)
3. Click Save
4. Wait for the "DNS check successful" message
5. Check "Enforce HTTPS" — GitHub auto-provisions an SSL certificate

---

## 📋 Step 6 — Ongoing Update Workflow

Every time you add new comics or make changes:

```bash
node scan.js          # ALWAYS run this after adding/changing comic files
git add .
git commit -m "add: chapter X of Series Name"
git push
```

GitHub Pages rebuilds automatically after every push. Your live site updates within **1–2 minutes**.

**For non-comic changes** (about page, blog post, CSS fixes):

```bash
git add about.html          # add specific files
git commit -m "about: update bio text"
git push
```

No `node scan.js` needed for changes that don't affect the `comics/` folder.

---

## 📋 Step 7 — The `scan.js` Pipeline in Full

This is the complete pipeline to run every time you publish new comic content:

```
[ ] Export art at correct pixel dimensions (see Lesson 01 / IMAGE-SPECS.txt)
[ ] Rename files with zero-padded numbers: 01.jpg, 02.jpg, 03.jpg...
[ ] Place in the correct chapter folder: comics/series/chapter-XX/
[ ] Create or update chapter.json if it's a new chapter
[ ] Run: node scan.js
[ ] Check scanner output for any [warn] or [skip] messages
[ ] Test locally: npm run dev → http://localhost:3000
[ ] git add .
[ ] git commit -m "add: [series] chapter [N], pages [X–Y]"
[ ] git push
[ ] Wait 1–2 min → hard refresh live site: Ctrl+Shift+R
```

---

## 🧪 How to Know It's Working

- [ ] `https://YOUR_USERNAME.github.io/YOUR_REPO/` loads your site
- [ ] Series cards render correctly
- [ ] The reader works (navigate a chapter end-to-end)
- [ ] BG Remote appears in the header and cycles states
- [ ] Pixel transitions fire between pages
- [ ] Custom cursor appears (if you have cursor assets)
- [ ] Welcome overlay appears on first visit (if `SHOW = true`)
- [ ] Custom domain resolves (if set up) — HTTPS should be green

---

## 🐛 Common Mistakes

**"Site shows a 404 after pushing"**
→ Check GitHub → Settings → Pages — make sure Source is set to main branch, / (root). The build can take 2–3 minutes the first time.

**"Changes aren't showing on the live site"**
→ Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac). GitHub Pages caches aggressively. If it still doesn't update, wait 2 minutes and hard-refresh again.

**"Custom domain shows 'not secure' (no HTTPS)"**
→ GitHub auto-provisions SSL but it takes 10–30 minutes after setting the custom domain. Also make sure the DNS records are correct and propagated before enabling HTTPS.

**"www.yoursite.com works but yoursite.com doesn't (or vice versa)"**
→ You need both the A records (for the root domain) AND the CNAME record (for www). Both must be present.

**"The scanner ran but new pages aren't showing"**
→ You ran `scan.js` but forgot to push (`git push`). Or you forgot to run `scan.js` after adding the files.

---

## 📎 Quick Reference — Git Commands You'll Use Every Day

| Command | What it does |
|---------|-------------|
| `git status` | Show what's changed since last commit |
| `git add .` | Stage all changed files |
| `git add [file]` | Stage a specific file |
| `git commit -m "message"` | Save a snapshot with a description |
| `git push` | Upload commits to GitHub |
| `git log --oneline -5` | Show the last 5 commits (quick history) |
| `git diff` | See exactly what changed |

---

## 🏁 You Made It

If you've worked through all nine lessons, you've built:

✅ A static webcomic site with multiple series  
✅ Automatic content detection via `scan.js`  
✅ Animated TV-static wallpaper with 3-state BG Remote control  
✅ Pixel-dissolve page transitions  
✅ Custom animated cursors (per-series)  
✅ A first-visit welcome overlay  
✅ Per-series visual theming (backgrounds, accent colours, font treatments)  
✅ A live site on GitHub Pages (free forever)  

The next steps are up to you:
- Fill in your real comic content
- Wire up Mailchimp when you're ready for a newsletter
- Add your real donate link
- Add `assets/wave.gif` when your character wave is ready
- Set `construction.js` `SHOW = false` when you go fully public

**Keep making comics. 🦆**

---

*← Back to [Lesson 08: Series Theming](08-SERIES-THEMING.md)*  
*↑ Up to [Welcome / Overview](00-WELCOME.md)*
