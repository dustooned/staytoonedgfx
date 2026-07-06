# ✍️ Lesson 10 — Interactive Typography

> *Imagine every letter in your site's title is a physical key on a piano.
> When your cursor hovers over one, it springs up — and the keys
> beside it rise a little too, then a little less, then barely at all.
> Pull your hand away and they all settle back down, like the sound
> fading after you've struck a note. That's the homepage hero.*

---

## 🎭 The Big Picture

The homepage hero title "Stay Tooned GFX" is not a plain `<h1>`. It's a row of individually animated `<span>` elements built by JS on page load, each one:

1. **Colored** by which word it belongs to — matching the SVG logo palette
2. **Scaled** when hovered — the hovered character grows, neighbors scale proportionally less, characters further away barely move at all
3. **Glowing** — a `drop-shadow` using that character's own word color fires on hover/focus

The math behind the scale: an **exponential falloff curve**

```
scale = 1 + (SCALE_MAX - 1) × e^(−FALLOFF × distance)
```

At distance 0 (the hovered character) you get `SCALE_MAX`. At distance 1, noticeably smaller. At distance 3+, nearly back to 1. It feels organic, like ripples.

---

## 🛒 What You Need for This Lesson

- [ ] A project from earlier lessons with `index.html` running locally
- [ ] Internet access (Google Fonts CDN) — or the Bungee Inline font downloaded locally
- [ ] The existing `.home-hero` section in `index.html`

---

## 📋 Step 1 — Add the Font

In `index.html`, inside `<head>`, add the Google Fonts link **after** your stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee+Inline&display=swap" rel="stylesheet">
```

**Why `preconnect`?** It tells the browser to open a connection to Google's font servers early, before it even starts parsing the font `<link>`. Shaves ~100–200ms off first load.

---

## 📋 Step 2 — Replace the `<h1>` in HTML

Find your hero section in `index.html`:

```html
<section class="home-hero">
  <h1>Stay Tooned GFX</h1>
  <p>Comics that wander freely, laugh strangely.</p>
</section>
```

Replace the `<h1>` line with:

```html
<div id="hero-phrase" class="hero-phrase" role="img" aria-label="Stay Tooned GFX"></div>
```

The div starts empty. JS fills it with character spans on page load.

> **Why `role="img"` + `aria-label`?** Screen readers would otherwise spell out each letter as a separate element. `role="img"` treats the whole container as a single image-like unit, and `aria-label` provides the text it announces.

---

## 📋 Step 3 — Add the CSS

In `css/style.css`, replace your existing `.home-hero h1` rule with these:

```css
/* ── HERO PHRASE CONTAINER ──────────────────────────── */
.hero-phrase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;   /* characters scale upward from baseline */
  line-height: 1;
  user-select: none;
  margin-bottom: 18px;
}

/* ── INDIVIDUAL CHARACTER SPANS ─────────────────────── */
.hero-char {
  display: inline-block;
  font-family: 'Bungee Inline', cursive;
  font-size: clamp(2.2rem, 6.5vw, 5.5rem);
  line-height: 1;

  /* Color is set per-word by JS via inline style.
     This fallback shows before JS runs. */
  color: #f5f0e8;

  /* Spring scale from the bottom — chars grow upward */
  transform: scale(1);
  transform-origin: center bottom;
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter    0.18s ease;

  outline: none;
  cursor: default;
}

/* Glow uses each character's own word color — set as --char-glow by JS */
.hero-char.is-active {
  filter: drop-shadow(0 0 18px var(--char-glow, rgba(255,210,80,0.65)))
          drop-shadow(0 0 6px  var(--char-glow, rgba(255,210,80,0.4)));
}

/* Keyboard focus — same glow but with a white edge for visibility */
.hero-char:focus-visible {
  filter: drop-shadow(0 0 18px var(--char-glow, rgba(255,210,80,0.65)))
          drop-shadow(0 0 4px  rgba(255,255,255,0.4));
}

/* Spaces: preserve word gap, not interactive */
.hero-char.space {
  width: 0.3em;
  pointer-events: none;
}

/* Reduced motion: skip scale, keep glow */
@media (prefers-reduced-motion: reduce) {
  .hero-char { transition: filter 0.1s ease; }
}
```

### About `cubic-bezier(0.34, 1.56, 0.64, 1)`

This is a **spring** curve — it slightly overshoots 1.0 before settling. That brief bounce is what gives the key-press feeling. You can tweak it at [cubic-bezier.com](https://cubic-bezier.com).

### About `transform-origin: center bottom`

Characters grow upward from their baseline, not from their center. This keeps the text sitting on the same baseline line — if you used `center center` (the default), letters would grow in all directions and knock each other out of alignment.

---

## 📋 Step 4 — Create `js/hero-type.js`

Create `js/hero-type.js`:

```js
(function () {
  var container = document.getElementById('hero-phrase');
  if (!container) return;   // only runs on the homepage

  // ─── CONFIGURATION ──────────────────────────────────────────────
  var PHRASE       = 'Stay Tooned GFX';
  var SCALE_MAX    = 1.55;   // how large the hovered character gets
  var FALLOFF      = 1.1;    // higher = tighter spotlight; lower = wider wave
  var WORD_PALETTE = ['#f60047', '#48a6ff', '#ffca23', '#8fe900'];
  //                    red        blue       yellow     green
  //                  (pulled from the SVG logo — one color per word)

  // ─── HELPERS ────────────────────────────────────────────────────
  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // Exponential falloff: hovered char = SCALE_MAX, drops off with distance
  function getScale(distance) {
    return 1 + (SCALE_MAX - 1) * Math.exp(-FALLOFF * distance);
  }

  // ─── BUILD THE PHRASE ───────────────────────────────────────────
  // Only bind hover/focus events on devices with a fine pointer (mouse).
  // Touch devices still get the colored text — just no scale animation.
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var chars   = [];
  var wordIdx = 0;

  Array.from(PHRASE).forEach(function (ch) {
    var span = document.createElement('span');
    span.textContent = ch;
    span.setAttribute('aria-hidden', 'true');   // container's aria-label covers the text

    if (ch === ' ') {
      span.className = 'hero-char space';
      wordIdx++;   // next character belongs to the next word
    } else {
      span.className = 'hero-char';
      if (finePointer) span.setAttribute('tabindex', '0');

      // Assign word color and matching glow variable
      var color = WORD_PALETTE[wordIdx % WORD_PALETTE.length];
      span.style.color = color;
      span.style.setProperty('--char-glow', hexToRgba(color, 0.65));
    }

    chars.push(span);
    container.appendChild(span);
  });

  // ─── SCALE LOGIC ────────────────────────────────────────────────
  function applyScales(hoveredIndex) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chars.forEach(function (span, i) {
      if (span.classList.contains('space')) return;
      var dist  = Math.abs(i - hoveredIndex);
      var scale = reduced ? 1 : getScale(dist);
      span.style.transform = 'scale(' + scale.toFixed(3) + ')';
      span.classList.toggle('is-active', i === hoveredIndex);
    });
  }

  function resetScales() {
    chars.forEach(function (span) {
      if (span.classList.contains('space')) return;
      span.style.transform = 'scale(1)';
      span.classList.remove('is-active');
    });
  }

  // ─── EVENTS (mouse/keyboard only) ───────────────────────────────
  if (finePointer) {
    chars.forEach(function (span, i) {
      if (span.classList.contains('space')) return;

      span.addEventListener('mouseenter', function () { applyScales(i); });
      span.addEventListener('focus',      function () { applyScales(i); });
      span.addEventListener('blur',       function () {
        // Only reset if nothing else in the phrase has focus
        if (!chars.some(function (s) { return s === document.activeElement; })) {
          resetScales();
        }
      });
    });

    container.addEventListener('mouseleave', resetScales);
  }
})();
```

---

## 📋 Step 5 — Add the Script to `index.html`

Add `hero-type.js` **before** the other scripts in `index.html` so it runs as soon as the DOM is ready:

```html
  <script src="js/hero-type.js"></script>
  <script src="js/app.js"></script>
  ...
</body>
```

---

## 📋 Step 6 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. You should see "Stay Tooned GFX" in Bungee Inline, broken into colored words
4. Hover over any character — it should spring up, with neighbors rising proportionally
5. Move the cursor left and right through the letters — the wave follows your cursor
6. Tab through the characters — the glow should fire on each focused character

---

## 🧪 How to Know It's Working

- [ ] Title displays in Bungee Inline (chunky inline-stroke letters, not your site's regular font)
- [ ] "Stay" is red, "Tooned" is blue, "GFX" is yellow
- [ ] Hovered character scales up noticeably, neighbors scale down proportionally
- [ ] Mouse leaving the phrase resets all characters to `scale(1)`
- [ ] On mobile, characters show their colors but don't animate (check DevTools device mode)
- [ ] DevTools → Accessibility tree shows the container as `img` with name "Stay Tooned GFX"

---

## 🐛 Common Mistakes

**"All characters show in the fallback off-white color, not the word colors"**
→ JS didn't run or couldn't find `#hero-phrase`. Confirm `id="hero-phrase"` is on the div and `hero-type.js` is included in the page.

**"Font looks like a sans-serif, not Bungee Inline"**
→ Google Fonts link isn't loading. Check network tab for a failed request to `fonts.googleapis.com`. Also check the `font-family: 'Bungee Inline', cursive` in `.hero-char` CSS — the name must match exactly.

**"Characters don't animate on hover"**
→ The script checks `(pointer: fine)` and skips events on touch devices. If you're testing on a trackpad/mouse and it's not working, check the console for errors. Also confirm the `mouseenter` events are on `.hero-char` spans, not the container.

**"Scale animation looks jumpy, not springy"**
→ The `cubic-bezier(0.34, 1.56, 0.64, 1)` in `.hero-char` transition is the spring. If your browser doesn't support cubic-bezier (all modern browsers do), it'll fall back to linear. Check your CSS wasn't minified in a way that broke the values.

**"The phrase wraps weirdly on mobile"**
→ `flex-wrap: wrap` on `.hero-phrase` wraps at word boundaries (spaces). On narrow screens, "Stay", "Tooned", and "GFX" may stack on separate lines — that's intentional and fine. If you want to force them to always be on one line, add `white-space: nowrap` to `.hero-phrase` (but test at 375px first).

---

## 🔬 Going Deeper — The Exponential Falloff

The scale formula: `1 + (SCALE_MAX - 1) × e^(−FALLOFF × distance)`

Here's what different `FALLOFF` values feel like:

| FALLOFF | Feel | Good for |
|---------|------|---------|
| `0.5` | Wide, gentle wave — half the phrase moves | Large display text |
| `1.1` (default) | Medium spotlight — 3–4 characters affected | Most cases |
| `2.0` | Tight pulse — only immediate neighbors move | Small, dense type |
| `3.0+` | Nearly isolated — only the hovered char scales | Very large type |

And `SCALE_MAX`:

| SCALE_MAX | Feel |
|-----------|------|
| `1.2` | Subtle — barely noticeable |
| `1.55` (default) | Punchy but not silly |
| `1.8` | Very dramatic |
| `2.0+` | Chaotic / fun / hard to read |

---

## 🔊 Optional — Sound (demo only, pinned for later)

A standalone version of this system in `demos/typography/` includes a Web Audio bell tone per character. That's intentionally **not** on the homepage — sound without a master toggle is a bad UX pattern. When the atmosphere strip is built (master audio toggle in the header), this can be wired in there.

---

*Continue to → [Back to README](../README.md)*
