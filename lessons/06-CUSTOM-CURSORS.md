# 🖱️ Lesson 06 — Custom Animated Cursors

> *The cursor is your reader's hand inside the world of your comic.
> On the Dio La Damned series, it could become a candle flame.
> On Melvin, a rubber duck. On It's a Good Life, a little quill.
> The key problem: browsers refuse to animate GIFs as CSS cursors —
> they just show a still frame. We have to trick the browser
> into thinking it's doing one thing while we do another.*

---

## 🎭 The Big Picture

The **fake cursor system** works by:

1. Hiding the real native cursor with CSS (`cursor: none !important`)
2. Creating an invisible `<div>` that follows the mouse
3. Setting that div's `background-image` to your cursor PNG/GIF — because `background-image` **does** animate GIFs, unlike `cursor: url()`

The div has `pointer-events: none` so it never blocks clicks or hovers. From the visitor's perspective, they see your animated cursor. The browser's native cursor is just gone.

---

## 🛒 What You Need for This Lesson

### For the code
- [ ] A project from earlier lessons with a header and navigation

### For the cursor assets — read carefully!

You need **two image files per cursor set**:

| File | State | Format |
|------|-------|--------|
| `cursor.png` | Idle — shown when the mouse is just moving | PNG-24/32 with transparency |
| `cursor.gif` | Hover — plays when over any link, button, or interactive element | Animated GIF |

**Canvas size: 32×32 px** (or 64×64 for sharper display on Retina screens)

**Critical design rule — the hotspot:**
The "click point" (hotspot) is always the **top-left corner (0,0)** of your image. Design your cursor so the active tip (pen nib, fingertip, arrow point) is in the **top-left corner** of the canvas.

```
✅ Correct: pen nib at top-left corner
+----------+
|\ ← nib   |
| \        |
|  \       |
|   )      |
+----------+

❌ Wrong: pen nib centred
+----------+
|          |
|    \     |
|     \    |
|      \   |
+----------+
```

**GIF tips:**
- 256 colours max (GIF format limitation) — keep palette simple
- Loop count = 0 (loop infinitely)
- 8–12 frames is enough — keeps file size small
- No anti-aliasing on transparent edges — GIF has binary transparency only (a pixel is either fully transparent or not). Hard edges look better at this size.
- Set background to transparent, not white

---

## 📋 Step 1 — Prepare Your Asset Files

**Site-wide cursors** (shown on all non-series pages):
```
assets/cursor.png    ← idle
assets/cursor.gif    ← animated hover
```

**Per-series cursors** (shown when reading a specific series):
```
comics/my-series/assets/cursor.png    ← idle
comics/my-series/assets/cursor.gif    ← animated hover
```

You can supply one or both. If you only have a PNG, the cursor will be static everywhere. If you only have a GIF, it's used for both states.

> 💡 **No cursor asset yet?** That's fine — `cursor.js` won't crash if the files don't exist. The browser will just silently show nothing (the native cursor is hidden, so you get no cursor at all). Start by using a simple PNG placeholder.

---

## 📋 Step 2 — Create `js/cursor.js`

Create `js/cursor.js`:

```js
// cursor.js — Animated fake cursor
//
// Replaces the native cursor with a positioned <div> so GIFs animate.
// CSS cursor: url() cannot animate GIFs — only static images work.
//
// Site-wide: assets/cursor.png (idle) + assets/cursor.gif (hover)
// Per-series: called via window.__cursorSetPaths(staticPath, animPath)

(function () {
  // Skip on touch devices — they don't have a cursor
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // Detect the base path — handles both root pages (css/style.css)
  // and posts/ subpages (../css/style.css)
  var base = (
    document.querySelector('link[rel="stylesheet"]')
      ?.getAttribute('href') || 'css/style.css'
  ).replace('css/style.css', '');

  var SRC_IDLE = base + 'assets/cursor.png';
  var SRC_ANIM = base + 'assets/cursor.gif';

  // ── Build the cursor element ──────────────────────────────────────
  var el = document.createElement('div');
  el.id = 'site-cursor';

  Object.assign(el.style, {
    position:        'fixed',
    top:             '0',
    left:            '0',
    width:           '32px',
    height:          '32px',
    backgroundImage: 'url(' + SRC_IDLE + ')',
    backgroundSize:  'contain',
    backgroundRepeat:'no-repeat',
    pointerEvents:   'none',      // never blocks clicks or hovers
    zIndex:          '99999',     // always on top of everything
    imageRendering:  'pixelated', // keeps pixel art sharp instead of blurry
    transform:       'translate(-100px, -100px)',  // start off-screen
    willChange:      'transform', // GPU hint for smooth movement
  });

  document.body.appendChild(el);

  // ── Hide the native cursor everywhere ────────────────────────────
  var hideStyle = document.createElement('style');
  hideStyle.textContent = '@media (pointer: fine) { * { cursor: none !important; } }';
  document.head.appendChild(hideStyle);

  // ── Mouse tracking + interactive state detection ─────────────────
  // Merged into mousemove: position + hover-state both checked every move.
  // This is simpler than separate mouseover/mouseout — no race condition.
  var INTERACTIVE = 'a, button, select, input, label, [role="button"], [tabindex]';
  var onInteractive = false;

  document.addEventListener('mousemove', function(e) {
    // Move the cursor div to follow the mouse
    el.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';

    // Check if mouse is over an interactive element
    var now = !!e.target.closest(INTERACTIVE);

    // Only update the image when the state changes (avoids flicker)
    if (now !== onInteractive) {
      onInteractive = now;
      el.style.backgroundImage = now
        ? 'url(' + SRC_ANIM + ')'
        : 'url(' + SRC_IDLE + ')';
    }
  }, { passive: true });

  // When mouse leaves the window, park the cursor off-screen
  document.addEventListener('mouseout', function(e) {
    if (!e.relatedTarget) el.style.transform = 'translate(-100px, -100px)';
  }, { passive: true });

  // ── Per-series cursor override API ───────────────────────────────
  // series.js and reader.js call this after loading the manifest:
  //   window.__cursorSetPaths('comics/iagl/assets/cursor.png', 'comics/iagl/assets/cursor.gif')
  window.__cursorSetPaths = function (staticPath, animPath) {
    SRC_IDLE = staticPath || SRC_IDLE;
    SRC_ANIM = animPath   || staticPath || SRC_IDLE;
    onInteractive = false;  // reset state
    el.style.backgroundImage = 'url(' + SRC_IDLE + ')';
  };

})();
```

---

## 📋 Step 3 — Add the Script to Your Pages

Add `cursor.js` to every page — it should be loaded **after** other scripts:

```html
  <script src="js/app.js"></script>
  <script src="js/transition.js"></script>
  <script src="js/wallpaper.js"></script>
  <script src="js/cursor.js"></script>   ← add this last
</body>
```

---

## 📋 Step 4 — Wire Per-Series Cursors (Optional)

If you want each comic series to have its own cursor when the reader is in that series, you need to call `window.__cursorSetPaths()` from wherever you load the manifest for that series.

In your `series.js` or `reader.js`, after loading the series data from the manifest, add:

```js
// After you have the series object from the manifest:
if (typeof window.__cursorSetPaths === 'function') {
  window.__cursorSetPaths(
    series.cursor     || null,   // idle PNG path
    series.cursorAnim || null    // animated GIF path
  );
}
```

The paths come from the manifest (put there by `scan.js` when it finds `cursor.png` / `cursor.gif` in `comics/[series]/assets/`).

---

## 📋 Step 5 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. The native cursor should disappear
4. Your custom cursor PNG should appear and follow the mouse
5. Hover over a link or button — the animated GIF should swap in
6. Move off the link — the static PNG should return

---

## 🧪 How to Know It's Working

- [ ] Native cursor is hidden on desktop (pointer: fine devices)
- [ ] Custom cursor div follows mouse movement
- [ ] Cursor changes to animated GIF when hovering links/buttons
- [ ] Cursor parks off-screen when mouse leaves the window
- [ ] On mobile/tablet (touch device), the native cursor behaviour is unchanged (no `cursor: none`)

---

## 🐛 Common Mistakes

**"The cursor disappeared and nothing replaced it"**
→ The cursor image file is missing or has the wrong path. Check that `assets/cursor.png` exists. The div is there but showing nothing because `background-image` of a missing file renders transparent.

**"The GIF shows but doesn't animate"**
→ You used CSS `cursor: url()` somewhere that's overriding. Check your CSS for any `cursor:` declarations — they should all be gone, or overridden by the `cursor: none !important` rule.

**"The cursor is in the wrong position"**
→ The hotspot is at the top-left of the image. If your cursor art has the active tip somewhere else (like centered), move it to the top-left corner of the canvas in your image editor.

**"Interactive elements on touch feel weird"**
→ The `(pointer: fine)` check at the top should prevent `cursor.js` from running on touch devices at all. Touch devices don't have a hover state, so this is correct.

**"cursor.js runs but `__cursorSetPaths` isn't being called"**
→ Make sure `cursor.js` is loaded before `series.js` / `reader.js` call `__cursorSetPaths`, OR make sure those scripts check `typeof window.__cursorSetPaths === 'function'` before calling.

---

## 📐 Cursor Asset Specs Summary

| Property | Value |
|----------|-------|
| Canvas size | 32×32 px (or 64×64 for Retina) |
| Hotspot | Top-left corner (0,0) |
| PNG format | PNG-24 or PNG-32 with alpha channel |
| GIF format | Animated, loop count 0, 256 colours max |
| GIF frames | 8–12 frames, under 100KB |
| Background | Transparent for both |
| Anti-aliasing on transparent edges | None (GIF = binary transparency) |

---

*Continue to → [Lesson 07: Welcome Overlay](07-WELCOME-OVERLAY.md)*
