// ┌─────────────────────────────────────────────────────┐
// │  series.js — Series Archive Page                    │
// │                                                     │
// │  Sections (Ctrl+F the emoji to jump):               │
// │  📅 AUTO YEAR                                       │
// │  🔍 PARSE URL                                       │
// │  📦 LOAD MANIFEST                                   │
// │  🎨 APPLY THEMING                                   │
// │  🏷️  SOCIAL META                                    │
// │  🎭 TITLE CARD                                      │
// │  🗂️  CHAPTERS GRID                                  │
// │  💾 READING PROGRESS (continue reading badges)      │
// └─────────────────────────────────────────────────────┘

(async () => {

  // 📅 AUTO YEAR — fills every .js-year span in the footer
  document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  // 🔍 PARSE URL — get series slug from ?s=
  const params = new URLSearchParams(location.search);
  const slug   = params.get('s');
  if (!slug) { location.href = 'index.html'; return; }

  // 🎯 DOM TARGETS
  const titleCardContent = document.getElementById('title-card-content');
  const grid             = document.getElementById('chapters-grid');

  try {

    // 📦 LOAD MANIFEST
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    const { series } = await res.json();

    // 🔎 FIND THIS SERIES
    const s = series.find(x => x.slug === slug);
    if (!s) { location.href = 'index.html'; return; }

    // 🏷️ PAGE TITLE
    document.title = `${s.title} — Stay Tooned GFX`;

    // 🎨 APPLY SERIES THEMING
    // Sets CSS variables and data-theme so the CSS themes kick in
    const root = document.documentElement;
    if (s.background) {
      root.style.setProperty('--series-bg', `url(${s.background})`);
      document.body.classList.add('has-series-bg');
      if (s.backgroundMode === 'tile') document.body.classList.add('bg-tile');
    }
    if (s.accentColor) root.style.setProperty('--series-accent', s.accentColor);
    if (s.theme)       document.body.setAttribute('data-theme', s.theme);

    // 🖱️ CUSTOM CURSOR — hand off to cursor.js fake cursor
    if (s.cursor || s.cursorAnim) {
      if (typeof window.__cursorSetPaths === 'function') {
        window.__cursorSetPaths(s.cursor, s.cursorAnim);
      }
    }

    // 🎭 RENDER TITLE CARD
    // Shows header image (logo/title treatment) if available, otherwise styled text
    titleCardContent.innerHTML = `
      ${s.headerImage
        ? `<img src="${s.headerImage}" alt="${s.title}" class="series-header-img">`
        : `<h1 class="title-card-series-name">${s.title}</h1>`}
      ${s.description ? `<p class="title-card-desc">${s.description}</p>` : ''}
    `;

    // 🚫 EMPTY STATE
    if (!s.chapters || s.chapters.length === 0) {
      grid.innerHTML = '<p class="empty">No chapters yet — check back soon.</p>';
      return;
    }

    // ─────────────────────────────────────────────────────
    // 💾 READING PROGRESS — check localStorage for each chapter
    //    Shows a "Continue · p.N" badge on chapters in progress
    // ─────────────────────────────────────────────────────
    function getSavedPage(chSlug) {
      try {
        const val = localStorage.getItem(`stg-${slug}-${chSlug}`);
        return val ? parseInt(val) : null;
      } catch (_) { return null; }
    }

    // 🗂️ RENDER CHAPTERS GRID
    grid.innerHTML = s.chapters.map(ch => {

      // 🖼️ Chapter thumbnail (first page) or placeholder
      const thumbHtml = ch.thumbnail
        ? `<img class="chapter-thumb" src="${ch.thumbnail}" alt="${ch.title}" loading="lazy">`
        : `<div class="chapter-thumb-placeholder">📄</div>`;

      // 📆 Format date if present
      const dateStr = ch.date
        ? new Date(ch.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

      // 💾 Continue reading — link to last saved page if exists
      const savedPage  = getSavedPage(ch.slug);
      const resumeUrl  = savedPage && savedPage > 1
        ? `reader.html?s=${slug}&ch=${ch.slug}&p=${savedPage}`
        : `reader.html?s=${slug}&ch=${ch.slug}&p=1`;
      const progressBadge = savedPage && savedPage > 1 && ch.pageCount > 0
        ? `<span class="progress-badge">▶ p.${savedPage}</span>`
        : '';

      return `
        <a href="${resumeUrl}" class="chapter-card">
          ${thumbHtml}
          <div class="chapter-card-body">
            <div class="chapter-card-title">${ch.title} ${progressBadge}</div>
            <div class="chapter-card-meta">
              ${ch.pageCount} page${ch.pageCount !== 1 ? 's' : ''}${dateStr ? ` &middot; ${dateStr}` : ''}
            </div>
          </div>
        </a>`;
    }).join('');

  } catch (err) {
    // ❌ ERROR STATE
    titleCardContent.innerHTML = '<p class="error">Could not load series data.</p>';
    grid.innerHTML = '';
    console.error(err);
  }

})();
