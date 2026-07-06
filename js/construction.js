// ┌─────────────────────────────────────────────────────┐
// │  construction.js — First Visit Welcome Overlay      │
// │                                                     │
// │  ✅ TO SHOW:  set SHOW = true  (default)            │
// │  🚫 TO HIDE:  set SHOW = false                      │
// │                                                     │
// │  Shows once per visitor via localStorage.           │
// │  Flip SHOW = false to disable entirely for launch.  │
// └─────────────────────────────────────────────────────┘

const SHOW       = true;
const VISITED_KEY = 'stg-visited';

if (SHOW && !localStorage.getItem(VISITED_KEY)) {

  // ── STYLES ────────────────────────────────────────────
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

    /* ── Character wave placeholder ── */
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
    #stg-ob-body strong {
      color: #ccc;
      font-weight: 600;
    }
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

  // ── HTML ──────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.id = 'stg-ob-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Welcome to Stay Tooned GFX');

  backdrop.innerHTML = `
    <div id="stg-ob-modal">

      <!-- 🖐️ Waving character — swap src when asset is ready -->
      <!-- Final file: assets/wave.gif  ~160×160px -->
      <div id="stg-ob-wave">
        <img
          src="assets/wave.gif"
          alt="A character waving hello"
          onerror="this.parentNode.innerHTML='wave.gif<br>160 × 160'"
        >
      </div>

      <div id="stg-ob-title">Oh. You actually showed up. 👀</div>

      <div id="stg-ob-body">
        Welcome to <strong>Stay Tooned GFX</strong> — a small, slightly
        unhinged corner of the internet where three comics live together
        under one extremely questionable roof.<br><br>
        There's a newspaper strip about surviving Tuesday.
        A disaster named Melvin doing disaster things.
        And a gothic horror story that takes itself too seriously,
        <em>on purpose.</em><br><br>
        Nobody sent you here. No algorithm. You just found it.
        That's genuinely weird and we love that about you.
        Stick around.
      </div>

      <!-- ─────────────────────────────────────────────
           MAILCHIMP EMBED
           Replace the form below with your Mailchimp
           embedded form code. Keep the note + dismiss.
           ───────────────────────────────────────────── -->
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

  // ── ANIMATE IN ────────────────────────────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => backdrop.classList.add('show'));
  });

  function dismiss() {
    localStorage.setItem(VISITED_KEY, '1');
    backdrop.style.transition = 'opacity 0.25s ease';
    backdrop.style.opacity = '0';
    setTimeout(() => backdrop.remove(), 260);
  }

  // ── DISMISS ───────────────────────────────────────────
  document.getElementById('stg-ob-dismiss').addEventListener('click', dismiss);

  // Click outside modal also dismisses
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) dismiss();
  });

  // ── FORM ──────────────────────────────────────────────
  // Remove this block once the real Mailchimp embed is in place
  document.getElementById('stg-ob-form').addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('stg-ob-submit');
    btn.textContent = 'You\'re in ✓';
    btn.style.background = '#4caf50';
    btn.style.color = '#fff';
    document.getElementById('stg-ob-email').disabled = true;
    btn.disabled = true;
    setTimeout(dismiss, 1400);
  });

}
