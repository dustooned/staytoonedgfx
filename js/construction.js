// ┌─────────────────────────────────────────────────────┐
// │  construction.js — Under Construction Overlay       │
// │                                                     │
// │  ✅ TO SHOW:  set SHOW = true  (current)            │
// │  🚫 TO HIDE:  set SHOW = false                      │
// │                                                     │
// │  That's it. One line. No other changes needed.      │
// └─────────────────────────────────────────────────────┘

const SHOW = true;

if (SHOW) {

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
      max-width: 460px;
      width: 100%;
      padding: 52px 44px 40px;
      text-align: center;
      transform: scale(0.86) translateY(28px);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.85);
    }
    #stg-ob-backdrop.show #stg-ob-modal {
      transform: scale(1) translateY(0);
    }
    #stg-ob-emoji {
      font-size: 2.8rem;
      margin-bottom: 20px;
      display: block;
    }
    #stg-ob-title {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 1.6rem;
      font-weight: 600;
      color: #f0f0f0;
      margin-bottom: 14px;
      line-height: 1.25;
    }
    #stg-ob-body {
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.95rem;
      color: #999;
      line-height: 1.65;
      margin-bottom: 32px;
    }
    #stg-ob-body strong {
      color: #ccc;
      font-weight: 500;
    }
    #stg-ob-form {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
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
    #stg-ob-email:focus {
      border-color: #555;
    }
    #stg-ob-email::placeholder {
      color: #555;
    }
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
    #stg-ob-submit:hover {
      background: #fff;
    }
    #stg-ob-note {
      font-size: 0.78rem;
      color: #555;
      margin-bottom: 28px;
    }
    #stg-ob-dismiss {
      display: inline-block;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 0.82rem;
      color: #444;
      text-decoration: none;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      transition: color 0.2s;
    }
    #stg-ob-dismiss:hover {
      color: #777;
    }
    @media (max-width: 480px) {
      #stg-ob-modal {
        padding: 40px 28px 32px;
      }
      #stg-ob-form {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.id = 'stg-ob-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Site under construction');

  backdrop.innerHTML = `
    <div id="stg-ob-modal">
      <span id="stg-ob-emoji">🎨</span>
      <div id="stg-ob-title">Hey, we're rebuilding!</div>
      <div id="stg-ob-body">
        The old place is getting a full makeover.<br>
        <strong>New site. Better comics. Same good vibes.</strong><br><br>
        Drop your email and we'll shoot you a message
        the moment the lights come back on. No spam —
        just the good stuff.
      </div>

      <!-- ─────────────────────────────────────────────
           MAILCHIMP EMBED
           Replace the form below with your Mailchimp
           embedded form code. Keep the #stg-ob-note
           and #stg-ob-dismiss elements below it.
           ───────────────────────────────────────────── -->
      <form id="stg-ob-form" action="#" method="post">
        <input
          id="stg-ob-email"
          type="email"
          name="EMAIL"
          placeholder="your@email.com"
          required
        >
        <button id="stg-ob-submit" type="submit">Notify me</button>
      </form>
      <!-- END MAILCHIMP EMBED -->

      <div id="stg-ob-note">No spam. Unsubscribe anytime.</div>
      <button id="stg-ob-dismiss">I'll poke around anyway →</button>
    </div>
  `;

  document.body.appendChild(backdrop);

  // ── ANIMATE IN ────────────────────────────────────────
  // Double rAF ensures the initial state is painted before
  // the .show class triggers the transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      backdrop.classList.add('show');
    });
  });

  // ── DISMISS ───────────────────────────────────────────
  document.getElementById('stg-ob-dismiss').addEventListener('click', () => {
    backdrop.style.transition = 'opacity 0.25s ease';
    backdrop.style.opacity = '0';
    setTimeout(() => backdrop.remove(), 260);
  });

  // ── FORM PLACEHOLDER HANDLER ──────────────────────────
  // Remove this block once you paste in the real Mailchimp embed
  document.getElementById('stg-ob-form').addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('stg-ob-submit');
    btn.textContent = 'Thanks! ✓';
    btn.style.background = '#4caf50';
    btn.style.color = '#fff';
    document.getElementById('stg-ob-email').disabled = true;
    btn.disabled = true;
  });

}
