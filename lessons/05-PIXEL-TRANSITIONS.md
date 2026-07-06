# ✨ Lesson 05 — Pixel Dissolve Transitions

> *Think about how a comic switches between pages. It doesn't just
> snap. There's a panel border, a moment of black, a visual beat.
> That's what this system does for your website — instead of an
> instant white flash between pages, you get a randomised pixel
> wipe, like static clearing to reveal the next scene.*

---

## 🎭 The Big Picture

When a visitor clicks a link:
1. A `<canvas>` element fills the screen by drawing dark `12px` blocks in random order — **cover** phase
2. The browser navigates to the new page
3. The new page loads. Its `transition.js` checks: "did I arrive via a pixel wipe?" (`sessionStorage` flag)
4. If yes: the canvas starts solid, then clears blocks in random order — **reveal** phase
5. The canvas removes itself when finished

The blocks are randomised using a **Fisher-Yates shuffle** — the same algorithm used to shuffle a deck of cards.

**Nothing is required on each page except including the script.** One file, drop it in.

---

## 🛒 What You Need for This Lesson

- [ ] A project from earlier lessons with at least two HTML pages
- [ ] No external libraries — this is pure vanilla JS + Canvas API

---

## 📋 Step 1 — Understand the Canvas API

Before writing the code, a quick orientation:

The **Canvas API** lets you draw shapes, images, and pixels directly into a `<canvas>` HTML element using JavaScript.

```html
<canvas id="my-canvas"></canvas>
```

```js
var canvas = document.getElementById('my-canvas');
var ctx = canvas.getContext('2d');   // ctx = the "drawing pen"

ctx.fillStyle = 'red';              // set the pen colour
ctx.fillRect(10, 10, 50, 50);       // draw a red rectangle at x=10, y=10, 50×50
ctx.clearRect(10, 10, 50, 50);      // erase that rectangle
```

For the transition, we:
1. Create the canvas dynamically and set it to `position:fixed` covering the whole screen
2. Draw filled rectangles to "cover" the page
3. Clear rectangles to "reveal" the page

---

## 📋 Step 2 — The Fisher-Yates Shuffle

The magic that makes the dissolve look random is **shuffling the list of all grid blocks**.

Imagine a grid of 12×12px blocks covering a 1200×800 screen: that's 100 columns × 67 rows = 6,700 blocks. We put their coordinates in an array, then shuffle the array so we draw them in random order.

**Fisher-Yates** is the correct way to shuffle:

```js
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
```

The wrong way (which creates biased results): `arr.sort(() => Math.random() - 0.5)`.
Always use Fisher-Yates for randomising arrays.

---

## 📋 Step 3 — The `sessionStorage` Flag

We need a way to tell the new page "you were arrived at via a pixel-cover click."

**`sessionStorage`** is the right tool here:
- Persists across a single page navigation (unlike variables which reset)
- Clears when the tab is closed (unlike `localStorage` which persists forever)

On click: `sessionStorage.setItem('px-nav', '1')` → navigate  
On load: check for `px-nav` → if present, do the reveal → remove it

---

## 📋 Step 4 — Create `js/transition.js`

Create `js/transition.js`:

```js
(function () {
  // ── CONFIG ──────────────────────────────────────────────────────────
  var BLOCK    = 12;        // pixel block size in px — bigger = chunkier look
  var DURATION = 450;       // ms for a full dissolve (cover or reveal)
  var COLOR    = '#080808'; // block fill colour (near-black, matches site bg)

  // ── CANVAS SETUP ────────────────────────────────────────────────────
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  canvas.id  = 'pixel-transition';

  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',   // clicks pass through the canvas
    zIndex:        '99998',  // below cursor (99999) but above everything else
  });

  // Resize canvas to fill the screen (canvas has its own pixel dimensions)
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── BUILD THE BLOCK GRID ─────────────────────────────────────────────
  // Creates an array of [x, y] coordinates for every block on screen,
  // then Fisher-Yates shuffles it so blocks appear in random order.
  function makeBlocks() {
    var cols   = Math.ceil(canvas.width  / BLOCK);
    var rows   = Math.ceil(canvas.height / BLOCK);
    var blocks = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        blocks.push([c * BLOCK, r * BLOCK]);
      }
    }

    // Fisher-Yates shuffle
    for (var i = blocks.length - 1; i > 0; i--) {
      var j   = Math.floor(Math.random() * (i + 1));
      var tmp = blocks[i];
      blocks[i] = blocks[j];
      blocks[j] = tmp;
    }

    return blocks;
  }

  // ── ANIMATION LOOP ───────────────────────────────────────────────────
  // Draws or clears `perFrame` blocks each requestAnimationFrame tick
  // so the total dissolve takes approximately DURATION milliseconds.
  function animate(blocks, fill, onDone) {
    var total    = blocks.length;
    var done     = 0;
    // How many blocks to draw per frame to finish in DURATION ms at 60fps
    var perFrame = Math.max(1, Math.ceil(total / (DURATION / (1000 / 60))));

    ctx.fillStyle = COLOR;

    (function step() {
      var end = Math.min(done + perFrame, total);
      while (done < end) {
        var b = blocks[done++];
        if (fill) ctx.fillRect(b[0], b[1], BLOCK, BLOCK);  // cover
        else      ctx.clearRect(b[0], b[1], BLOCK, BLOCK);  // reveal
      }
      if (done < total) {
        requestAnimationFrame(step);   // keep going
      } else if (onDone) {
        onDone();                       // finished
      }
    }());
  }

  // ── COVER: fill screen with blocks, then call onDone ─────────────────
  function cover(onDone) {
    resize();
    if (!canvas.parentNode) document.body.appendChild(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animate(makeBlocks(), true, onDone);
  }

  // ── REVEAL: clear blocks from a solid-filled canvas, then remove it ──
  function reveal() {
    resize();
    if (!canvas.parentNode) document.body.appendChild(canvas);
    ctx.fillStyle = COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // start solid
    animate(makeBlocks(), false, function () {
      canvas.remove();   // clean up when done
    });
  }

  // ── INTERCEPT INTERNAL LINK CLICKS ───────────────────────────────────
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;

    // Let modified clicks (Ctrl, Cmd, Shift) navigate normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Let new-tab links navigate normally
    if (a.target === '_blank') return;

    // Parse the href
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }

    // Skip external links
    if (url.origin !== location.origin) return;

    // Skip same-page navigation (different hash only)
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (url.hash && url.pathname === location.pathname) return;

    // It's an internal cross-page link — do the pixel wipe!
    e.preventDefault();
    sessionStorage.setItem('px-nav', '1');         // flag for the next page
    cover(function () { window.location.href = a.href; });  // navigate after cover
  }, false);

  // ── REVEAL ON LOAD ────────────────────────────────────────────────────
  // If we arrived via a pixel-cover click, do the reveal animation.
  if (sessionStorage.getItem('px-nav')) {
    sessionStorage.removeItem('px-nav');
    reveal();
  }
})();
```

---

## 📋 Step 5 — Add the Script to Every Page

The transition only works when it's included on **both** the page you're leaving and the page you're arriving at.

In every HTML file, add it near the bottom before `</body>`:

```html
  <script src="js/app.js"></script>
  <script src="js/transition.js"></script>   ← add this
  <script src="js/wallpaper.js"></script>
</body>
```

For pages in subdirectories (like `posts/`), adjust the path:

```html
  <script src="../js/transition.js"></script>
```

---

## 📋 Step 6 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. Click any link to another page
4. Watch: the screen should dissolve to dark in randomised pixel blocks
5. The next page should reveal by clearing blocks in random order

---

## 🧪 How to Know It's Working

- [ ] Clicking a link to another page triggers the pixel cover animation
- [ ] The new page reveals via pixel clear animation
- [ ] External links (different domain) navigate without the transition
- [ ] Right-clicking a link (or Ctrl+clicking) opens normally without triggering the transition
- [ ] `#anchor` links on the same page don't trigger the transition

---

## 🐛 Common Mistakes

**"The cover works but reveal doesn't happen on the new page"**
→ `transition.js` is missing from the destination page. Both pages need the script.

**"The transition flashes white briefly"**
→ The browser's default page transition happens before the cover finishes if `window.location.href` is set too early. The `cover(function() { navigate })` callback approach fixes this — navigation happens inside the `onDone` callback, only after the cover is complete.

**"Modified-click links still get the transition"**
→ Make sure the modifier key checks are in the click handler: `if (e.metaKey || e.ctrlKey || ...)`.

**"The blocks look too chunky / too fine"**
→ Adjust `var BLOCK = 12` at the top of the file. Smaller number = finer grain, larger = chunkier pixel blocks.

---

## 🔬 Going Deeper

**Changing the dissolve speed:**
Change `var DURATION = 450` — lower is faster, higher is slower. At `200ms` it's snappy; at `800ms` it feels dramatic.

**Changing the colour:**
Change `var COLOR = '#080808'` — try `#ffffff` for a white dissolve, or try a colour that matches a series accent.

**Triggering a transition programmatically:**
The `cover()` and `reveal()` functions are inside the IIFE (immediately-invoked function expression) — they're private. If you want to call them from outside, expose them:

```js
// At the end, before the closing }());
window.__pixelCover  = cover;
window.__pixelReveal = reveal;
```

Then call `window.__pixelCover(function() { /* do something */ })` from anywhere.

---

*Continue to → [Lesson 06: Custom Cursors](06-CUSTOM-CURSORS.md)*
