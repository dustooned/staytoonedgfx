# 🎉 Lesson 07 — First-Visit Welcome Overlay

> *The first page of a comic book isn't a story page. It's the cover —
> the splash page — the thing that sets the tone before you've even
> turned to page one. The welcome overlay is your site's splash page.
> It only shows once, and then it's gone forever. Make it count.*

---

## 🎭 The Big Picture

The overlay has one job: **show itself to first-time visitors, never again to returning ones.**

It uses `localStorage` as its memory. When a visitor dismisses the overlay, we write a key to their browser's localStorage. Next time they visit — same device, same browser — the key is already there, so we skip the overlay entirely.

The system has two modes:
1. **During construction:** `SHOW = true` — every visitor sees it, once
2. **Disabled for launch:** `SHOW = false` — never shows at all

> 💡 **To test the overlay repeatedly:** Open DevTools (F12) → Application → Local Storage → find your site → delete the `stg-visited` key → refresh.

---

## 🛒 What You Need for This Lesson

- [ ] A project from earlier lessons
- [ ] One GIF placeholder for the character wave: `assets/wave.gif` (160×160px) — optional, the overlay handles a missing file gracefully

**For the character wave GIF:**
- Size: 160×160 px square
- Format: Animated GIF (or PNG if not animated yet)
- Content: Your main character waving hello, or a simple waving hand
- The `onerror` handler on the `<img>` tag shows placeholder text if the file is missing — so you can add it later

---

## 📋 Step 1 — Plan Your Copy

The overlay has three text areas you'll write:

1. **Title** — the hook. One line. Should make people smile or feel something.
   - Example: `"Oh. You actually showed up. 👀"`
   - Example: `"hey. you found it."`
   - Example: `"Welcome, stranger. Sit down."`

2. **Body** — 3–4 sentences about who you are, what the site is, why it's worth sticking around. Make it personal. No corporate voice.

3. **Form note** — a one-liner under the email field. Example: `"No spam. Just comics. Unsubscribe whenever."`

4. **Dismiss text** — the "no thanks" link. Make it feel like a choice, not a rejection.
   - Example: `"I'm already poking around, thanks →"`
   - Example: `"I'll find my own way"`

---

## 📋 Step 2 — Create `js/construction.js`

Create `js/construction.js`:

```js
// construction.js — First-Visit Welcome Overlay
//
// Shows once per visitor using localStorage as memory.
//
// ✅ TO SHOW: set SHOW = true  (default)
// 🚫 TO HIDE: set SHOW = false  (use when site is fully launched)
//
// TO TEST AGAIN: DevTools → Application → Local Storage → delete 'stg-visited'

const SHOW        = true;
const VISITED_KEY = 'stg-visited';

if (SHOW && !localStorage.getItem(VISITED_KEY)) {

  // ── STYLES ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #stg-ob-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.93);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      opacity: 0;
      transition: opacity 0.35s ease;
    }

    #stg-ob-backdrop.show {
      opacity: 1;
    }

    #stg-ob-modal {
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 14px;
      max-width: 480px;
      width: 100%;
      padding: 44px 44px 36px;
      text-align: center;
      transform: scale(0.86) translateY(28px);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.85);
    }

    #stg-ob-backdrop.show #stg-ob-modal {
      transform: scale(1) translateY(0);
    }

    /* ── Character wave image placeholder ── */
    #stg-ob-wave {
      width: 160px;
      height: 160px;
      margin: 0 auto 24px;
      border-radius: 12px;
      border: 2px dashed #333;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0e0e0e;
      overflow: hidden;
      font-size: 0.65rem;
      color: #444;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.5;
    }

    #stg-ob-wave img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    #stg-ob-title {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: #f0f0f0;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    #stg-ob-body {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.92rem;
      color: #888;
      line-height: 1.7;
      margin-bottom: 28px;
      text-align: left;
    }

    #stg-ob-body strong { color: #ccc; font-weight: 600; }
    #stg-ob-body em { color: #aaa; font-style: italic; }

    #stg-ob-form {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    #stg-ob-email {
      flex: 1;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 11px 14px;
      color: #e8e8e8;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    #stg-ob-email:focus { border-color: #555; }
    #stg-ob-email::placeholder { color: #555; }

    #stg-ob-submit {
      background: #f0f0f0;
      color: #0e0e0e;
      border: none;
      border-radius: 8px;
      padding: 11px 18px;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }
    #stg-ob-submit:hover { background: #fff; }

    #stg-ob-note {
      font-size: 0.76rem;
      color: #444;
      margin-bottom: 24px;
    }

    #stg-ob-dismiss {
      display: inline-block;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.82rem;
      color: #444;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      transition: color 0.2s;
    }
    #stg-ob-dismiss:hover { color: #777; }

    @media (max-width: 480px) {
      #stg-ob-modal { padding: 36px 24px 28px; }
      #stg-ob-form  { flex-direction: column; }
      #stg-ob-wave  { width: 120px; height: 120px; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.id = 'stg-ob-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Welcome');

  backdrop.innerHTML = `
    <div id="stg-ob-modal">

      <!-- Character wave image. Replace src with your real file when ready. -->
      <!-- Final size: 160×160px animated GIF. onerror shows placeholder text. -->
      <div id="stg-ob-wave">
        <img
          src="assets/wave.gif"
          alt="A character waving hello"
          onerror="this.parentNode.innerHTML='wave.gif<br>160 × 160'"
        >
      </div>

      <!-- ▼▼▼ EDIT YOUR COPY HERE ▼▼▼ -->
      <div id="stg-ob-title">Oh. You actually showed up. 👀</div>

      <div id="stg-ob-body">
        Welcome to <strong>My Webcomic Site</strong> — a small corner
        of the internet where [your series names] live under one roof.<br><br>
        [Write 2–3 sentences about your site and yourself.
        Be personal. Be weird. Make them want to stay.]<br><br>
        Nobody sent you here. You just found it.
        That's genuinely weird and we love that about you.
      </div>
      <!-- ▲▲▲ END COPY ▲▲▲ -->

      <!-- ─────────────────────────────────────────────────────────
           MAILCHIMP EMBED
           Replace the form below with your Mailchimp embedded
           form code. Keep the note + dismiss button below it.
           ───────────────────────────────────────────────────────── -->
      <form id="stg-ob-form" action="#" method="post">
        <input
          id="stg-ob-email"
          type="email"
          name="EMAIL"
          placeholder="your@email.com"
          required
        >
        <button id="stg-ob-submit" type="submit">Keep me posted</button>
      </form>
      <!-- END MAILCHIMP EMBED -->

      <div id="stg-ob-note">No spam. Just comics. Unsubscribe whenever.</div>
      <button id="stg-ob-dismiss">I'm already poking around, thanks →</button>

    </div>
  `;

  document.body.appendChild(backdrop);

  // ── ANIMATE IN ────────────────────────────────────────────────────────
  // Double requestAnimationFrame ensures the initial opacity:0 is painted
  // before we add the .show class — otherwise the transition doesn't play.
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      backdrop.classList.add('show');
    });
  });

  // ── DISMISS ───────────────────────────────────────────────────────────
  function dismiss() {
    localStorage.setItem(VISITED_KEY, '1');    // remember this visitor
    backdrop.style.transition = 'opacity 0.25s ease';
    backdrop.style.opacity    = '0';
    setTimeout(function() { backdrop.remove(); }, 260);
  }

  // Click the dismiss button
  document.getElementById('stg-ob-dismiss').addEventListener('click', dismiss);

  // Click outside the modal (on the dark backdrop) also dismisses
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) dismiss();
  });

  // ── FORM SUBMIT (placeholder — replace with Mailchimp handler) ────────
  // Remove this block once the real Mailchimp embed is in place.
  document.getElementById('stg-ob-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var submitBtn = document.getElementById('stg-ob-submit');
    submitBtn.textContent = "You're in ✓";
    submitBtn.style.background = '#4caf50';
    submitBtn.style.color = '#fff';
    document.getElementById('stg-ob-email').disabled = true;
    submitBtn.disabled = true;
    setTimeout(dismiss, 1400);   // auto-dismiss 1.4s after success
  });

}
```

---

## 📋 Step 3 — Add the Script to Your Pages

The overlay script should be loaded **last** — after all other scripts:

```html
  <script src="js/app.js"></script>
  <script src="js/transition.js"></script>
  <script src="js/wallpaper.js"></script>
  <script src="js/cursor.js"></script>
  <script src="js/construction.js"></script>   ← add this last
</body>
```

---

## 📋 Step 4 — Wire Mailchimp (When Ready)

1. Log into Mailchimp → **Audience → Signup Forms → Embedded Forms**
2. Copy the embed code
3. In `construction.js`, find the `<!-- MAILCHIMP EMBED -->` comment block
4. Replace the placeholder `<form id="stg-ob-form">` block with your Mailchimp code
5. Delete the placeholder submit handler at the bottom of the file (also marked with a comment)
6. Push the changes

---

## 📋 Step 5 — Test It

1. Start your server: `npm run dev`
2. Open `http://localhost:3000`
3. The overlay should appear with a scale+fade animation
4. If `assets/wave.gif` is missing, the placeholder text `wave.gif / 160 × 160` should show
5. Click the dismiss button — it should fade out
6. Refresh the page — the overlay should **not** appear again
7. Open DevTools → Application → Local Storage → delete `stg-visited` → refresh → overlay appears again

---

## 🧪 How to Know It's Working

- [ ] Overlay appears on first visit with animation
- [ ] Clicking dismiss closes it with fade-out
- [ ] Clicking outside the modal (on the dark backdrop) also dismisses
- [ ] After dismissal, page refresh shows no overlay
- [ ] Deleting `stg-visited` from localStorage and refreshing shows overlay again
- [ ] Setting `SHOW = false` and refreshing shows no overlay regardless of localStorage

---

## 🐛 Common Mistakes

**"The overlay keeps showing every time I refresh"**
→ localStorage is working but `SHOW = true` is set so it always checks. Wait — this is correct behavior if the `stg-visited` key was never set. Make sure you're actually clicking dismiss (or submitting the form) for the key to be written.

**"The animation doesn't play — overlay just appears instantly"**
→ The double `requestAnimationFrame` pattern is required. If you remove it and set the class directly, the browser never gets a chance to paint the initial `opacity: 0` state.

**"The backdrop doesn't cover the whole page"**
→ `position: fixed; inset: 0` should work. Check that nothing with a higher `z-index` is blocking it. The overlay uses `z-index: 9999`.

**"The character wave image shows broken"**
→ The `onerror` handler shows placeholder text. Drop the real GIF at `assets/wave.gif` when you have it.

---

## 🔧 Customisation Reference

| Thing to change | Where |
|----------------|-------|
| Title text | `<div id="stg-ob-title">` inside `backdrop.innerHTML` |
| Body copy | `<div id="stg-ob-body">` inside `backdrop.innerHTML` |
| Dismiss button text | `<button id="stg-ob-dismiss">` |
| Form note | `<div id="stg-ob-note">` |
| Wave image size | `#stg-ob-wave` CSS: `width` and `height` |
| Overlay dark level | `#stg-ob-backdrop` CSS: `background: rgba(0,0,0,0.93)` |
| Animation speed | `#stg-ob-modal` CSS: `transition` property |
| Auto-dismiss delay after form submit | `setTimeout(dismiss, 1400)` — change `1400` to ms |
| localStorage key | `const VISITED_KEY = 'stg-visited'` |

---

*Continue to → [Lesson 08: Series Theming](08-SERIES-THEMING.md)*
