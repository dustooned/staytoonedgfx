// pwa-install.js — custom "Install App" prompt banner
// Shows once; respects a 30-day snooze if the user dismisses.

(function () {

  const SNOOZE_KEY  = 'stg-pwa-snoozed';
  const SNOOZE_DAYS = 30;

  // Don't show if already running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone) return; // iOS Safari

  // Don't show if snoozed
  const snoozedUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
  if (Date.now() < snoozedUntil) return;

  let deferredPrompt = null;

  function createBanner() {
    const banner = document.createElement('div');
    banner.id        = 'pwa-banner';
    banner.className = 'pwa-banner';
    banner.setAttribute('role', 'banner');
    banner.innerHTML = `
      <span class="pwa-banner-text">📱 Add <strong>Stay Tooned GFX</strong> to your home screen</span>
      <button class="pwa-banner-install" id="pwa-install-btn">Install</button>
      <button class="pwa-banner-dismiss" id="pwa-dismiss-btn" aria-label="Dismiss">✕</button>
    `;
    document.body.appendChild(banner);

    // Animate in after a tick so the CSS transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('pwa-banner--show')));

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      removeBanner(banner);
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      localStorage.setItem(SNOOZE_KEY, Date.now() + SNOOZE_DAYS * 864e5);
      removeBanner(banner);
    });
  }

  function removeBanner(banner) {
    banner.classList.remove('pwa-banner--show');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    createBanner();
  });

  // Hide banner if app gets installed via browser UI
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-banner');
    if (banner) removeBanner(banner);
  });

})();
