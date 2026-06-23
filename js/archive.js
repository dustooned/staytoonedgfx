// ┌─────────────────────────────────────────────────────┐
// │  archive.js — Full Chapter Archive                  │
// │                                                     │
// │  Sections (Ctrl+F the emoji to jump):               │
// │  📅 AUTO YEAR                                       │
// │  📦 LOAD MANIFEST                                   │
// │  🗂️  RENDER ARCHIVE (grouped by series)             │
// │  ❌ ERROR STATE                                     │
// └─────────────────────────────────────────────────────┘

(async () => {

  // 📅 AUTO YEAR — fills every .js-year span in the footer
  document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  // 🎯 DOM TARGET
  const container = document.getElementById('archive-content');

  try {

    // 📦 LOAD MANIFEST
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    const { series } = await res.json();

    // 🚫 EMPTY STATE
    if (!series || series.length === 0) {
      container.innerHTML = '<p class="empty">No series yet. Add content and run <code>node scan.js</code>.</p>';
      return;
    }

    // ─────────────────────────────────────────────────────
    // 🗂️ RENDER ARCHIVE — one block per series,
    //    each block lists all chapters as compact rows.
    // ─────────────────────────────────────────────────────
    container.innerHTML = series.map(s => {
      const chapRows = s.chapters.map((ch, i) => {
        const num = String(i + 1).padStart(2, '0');

        const dateStr = ch.date
          ? new Date(ch.date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })
          : '';

        const pagesStr = ch.pageCount > 0
          ? `${ch.pageCount} pg`
          : 'coming soon';

        return `
          <a href="reader.html?s=${s.slug}&ch=${ch.slug}&p=1" class="archive-chapter-row">
            <span class="archive-chapter-num">${num}</span>
            <span class="archive-chapter-title">${ch.title}</span>
            ${dateStr ? `<span class="archive-chapter-date">${dateStr}</span>` : ''}
            <span class="archive-chapter-pages">${pagesStr}</span>
          </a>`;
      }).join('');

      const emptyState = s.chapters.length === 0
        ? '<p class="empty" style="padding:24px 20px">No chapters yet.</p>'
        : chapRows;

      return `
        <div class="archive-series">
          <div class="archive-series-header">
            <span class="archive-series-dot" style="background:${s.accentColor || '#fff'}"></span>
            <span class="archive-series-title">${s.title}</span>
            <a href="series.html?s=${s.slug}" class="archive-series-link">Series page ›</a>
          </div>
          ${emptyState}
        </div>`;
    }).join('');

  } catch (err) {
    // ❌ ERROR STATE
    container.innerHTML = '<p class="error">Could not load archive. Run <code>node scan.js</code> to generate the manifest.</p>';
    console.error(err);
  }

})();
