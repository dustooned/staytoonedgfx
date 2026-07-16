// ┌─────────────────────────────────────────────────────┐
// │  app.js — Homepage                                  │
// │                                                     │
// │  Sections (Ctrl+F the emoji to jump):               │
// │  📅 AUTO YEAR                                       │
// │  🎯 DOM TARGETS                                     │
// │  📦 LOAD MANIFEST                                   │
// │  🃏 RENDER SERIES CARDS                             │
// │  🕐 RENDER LATEST UPDATES                           │
// │  ❌ ERROR STATE                                     │
// └─────────────────────────────────────────────────────┘

(async () => {

  // 📅 AUTO YEAR — fills every .js-year span in the footer
  document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  // 🎯 DOM TARGETS
  const grid         = document.getElementById('series-grid');
  const updatesEl    = document.getElementById('latest-updates');

  try {

    // 📦 LOAD MANIFEST
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    const { series } = await res.json();

    // 🎭 Series emoji labels by slug
    const SERIES_EMOJI = { dio: '👹', melvin: '🐰', iagl: '🦆', tucker: '😈' };

    // 🗂️ APPLY SAVED DRAG ORDER — restore user's custom card arrangement
    const savedOrder = getSavedSeriesOrder?.() ?? null;
    if (savedOrder?.length) {
      series.sort((a, b) => {
        const ia = savedOrder.indexOf(a.slug);
        const ib = savedOrder.indexOf(b.slug);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }

    // 🚫 EMPTY STATE
    if (!series || series.length === 0) {
      grid.innerHTML = '<p class="empty">No series found. Add a series folder and run <code>node scan.js</code>.</p>';
      return;
    }

    // ─────────────────────────────────────────────────────
    // 🃏 RENDER SERIES CARDS
    //    Each card: cover art, title, description, meta line,
    //    and two CTA buttons — Start Reading + Archive link.
    // ─────────────────────────────────────────────────────
    grid.innerHTML = series.map(s => {
      const latest       = s.chapters[s.chapters.length - 1];
      const firstChapter = s.chapters[0];

      // 🖼️ Cover image — explicit cover.jpg, else first page of chapter 1, else placeholder
      const coverSrc  = s.cover ?? firstChapter?.thumbnail ?? null;
      const coverHtml = coverSrc
        ? `<img class="series-card-cover" src="${coverSrc}" alt="${s.title} cover" loading="lazy">`
        : `<div class="series-card-cover-placeholder">📖</div>`;

      // 🔗 Start Reading link → chapter 1, page 1
      const startUrl = firstChapter
        ? `reader.html?s=${s.slug}&ch=${firstChapter.slug}&p=1`
        : `series.html?s=${s.slug}`;

      return `
        <div class="series-card" data-slug="${s.slug}" style="--card-accent:${s.accentColor || 'var(--series-accent)'}">
          <a href="series.html?s=${s.slug}" class="series-card-cover-wrap" tabindex="-1">
            ${coverHtml}
          </a>
          <div class="series-card-body">
            <span class="drag-handle" title="Drag to reorder" aria-hidden="true">⠿</span>
            <a href="series.html?s=${s.slug}" class="series-card-title-link">
              <div class="series-card-title">${SERIES_EMOJI[s.slug] ? SERIES_EMOJI[s.slug] + ' ' : ''}${s.title}</div>
            </a>
            <div class="series-card-desc">${s.description || ''}</div>
            <div class="series-card-meta">
              ${s.chapterCount} chapter${s.chapterCount !== 1 ? 's' : ''}
              ${latest ? ` &middot; Latest: ${latest.title}` : ''}
            </div>
            <div class="series-card-actions">
              <a href="${startUrl}" class="start-reading-btn">Start Reading →</a>
              <a href="series.html?s=${s.slug}" class="series-archive-link">Archive ›</a>
            </div>
          </div>
        </div>`;
    }).join('');

    // 🖱️ DRAG TO REORDER — enable after cards are in the DOM
    if (typeof initDragOrder === 'function') initDragOrder(grid);

    // ─────────────────────────────────────────────────────
    // 🕐 RENDER LATEST UPDATES
    //    Flattens all chapters across all series, sorts by
    //    date descending, shows the 6 most recent.
    // ─────────────────────────────────────────────────────
    if (updatesEl) {
      const allChapters = series.flatMap(s =>
        s.chapters.map(ch => ({
          ...ch,
          seriesSlug:  s.slug,
          seriesTitle: s.shortName || s.title,
          accentColor: s.accentColor || '#fff',
        }))
      );

      // Sort newest first by date string (YYYY-MM-DD sorts correctly as string)
      allChapters.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      const recent = allChapters.slice(0, 6);

      if (recent.length === 0) {
        updatesEl.innerHTML = '<p class="empty">No chapters yet — check back soon.</p>';
      } else {
        updatesEl.innerHTML = recent.map(ch => {
          const dateStr = ch.date
            ? new Date(ch.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })
            : '';
          const pagesStr = ch.pageCount > 0
            ? `${ch.pageCount} pg`
            : 'coming soon';

          return `
            <a href="reader.html?s=${ch.seriesSlug}&ch=${ch.slug}&p=1" class="update-row">
              <span class="update-series-dot" style="background:${ch.accentColor}"></span>
              <span class="update-series">${ch.seriesTitle}</span>
              <span class="update-chapter">${ch.title}</span>
              ${dateStr ? `<span class="update-date">${dateStr}</span>` : ''}
              <span class="update-pages">${pagesStr}</span>
            </a>`;
        }).join('');
      }
    }

  } catch (err) {
    // ❌ ERROR STATE
    grid.innerHTML = '<p class="error">Could not load series. Run <code>node scan.js</code> to generate the manifest.</p>';
    console.error(err);
  }

})();

