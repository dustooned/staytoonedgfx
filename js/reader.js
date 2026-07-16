// ┌─────────────────────────────────────────────────────┐
// │  reader.js — Comic Reader                           │
// │                                                     │
// │  Sections (Ctrl+F the emoji to jump):               │
// │  📅 AUTO YEAR                                       │
// │  🔍 PARSE URL                                       │
// │  🖇️  DOM REFS                                       │
// │  📦 LOAD MANIFEST                                   │
// │  🎨 APPLY THEMING                                   │
// │  🎭 TITLE CARD                                      │
// │  🔙 BACK LINK                                       │
// │  📋 CHAPTER SELECTOR                                │
// │  🔘 SYNC BUTTONS                                    │
// │  📊 PROGRESS BAR                                    │
// │  🔮 PRELOAD NEXT PAGE                               │
// │  💾 READING PROGRESS (localStorage)                 │
// │  🖼️  STRIP MODE DETECTION                           │
// │  🔍 LIGHTBOX / ZOOM                                 │
// │  ⌨️  SHORTCUT OVERLAY                               │
// │  🖼️  RENDER CURRENT PAGE                            │
// │  ➡️  GO TO PAGE N                                   │
// │  ⏮ FIRST / ⏭ LATEST                               │
// │  🔘 BUTTON EVENTS                                   │
// │  📱 TOUCH SWIPE                                     │
// │  🖱️  CLICK TO NAVIGATE                              │
// │  ⌨️  KEYBOARD                                       │
// │  🚀 INITIAL RENDER                                  │
// └─────────────────────────────────────────────────────┘

(async () => {

  // 📅 AUTO YEAR — fills every .js-year span in the footer
  document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  // 🔍 PARSE URL — ?s=series&ch=chapter&p=pageNumber
  const params      = new URLSearchParams(location.search);
  const seriesSlug  = params.get('s');
  const chapterSlug = params.get('ch');
  let   page        = Math.max(1, parseInt(params.get('p')) || 1);

  if (!seriesSlug || !chapterSlug) { location.href = 'index.html'; return; }

  // 🖇️ DOM REFS — title card
  const titlecardSeries  = document.getElementById('titlecard-series');
  const titlecardChapter = document.getElementById('titlecard-chapter');

  // 🖇️ DOM REFS — toolbar & page
  const backLink    = document.getElementById('back-link');
  const chSelect    = document.getElementById('chapter-select');
  const pageDisplay = document.getElementById('page-display');

  // 🖇️ DOM REFS — top nav buttons
  const btnFirst  = document.getElementById('btn-first');
  const btnPrev   = document.getElementById('btn-prev');
  const pageCount = document.getElementById('page-count');
  const btnNext   = document.getElementById('btn-next');
  const btnLatest = document.getElementById('btn-latest');

  // 🖇️ DOM REFS — bottom nav (mirror of top)
  const btnFirstB  = document.getElementById('btn-first-b');
  const btnPrevB   = document.getElementById('btn-prev-b');
  const pageCountB = document.getElementById('page-count-b');
  const btnNextB   = document.getElementById('btn-next-b');
  const btnLatestB = document.getElementById('btn-latest-b');

  // 🖇️ DOM REFS — progress bar, lightbox, shortcut overlay
  const progressFill    = document.getElementById('progress-fill');
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightbox-img');
  const lightboxClose   = document.getElementById('lightbox-close');
  const btnZoom         = document.getElementById('btn-zoom');
  const shortcutOverlay = document.getElementById('shortcut-overlay');
  const btnHelp         = document.getElementById('btn-help');

  try {

    // 📦 LOAD MANIFEST
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    const { series } = await res.json();

    // 🔎 FIND SERIES + CHAPTER
    const s = series.find(x => x.slug === seriesSlug);
    if (!s) { location.href = 'index.html'; return; }

    const chIdx = s.chapters.findIndex(c => c.slug === chapterSlug);
    if (chIdx === -1) { location.href = `series.html?s=${seriesSlug}`; return; }

    const chapter     = s.chapters[chIdx];
    const prevChapter = s.chapters[chIdx - 1] ?? null;
    const nextChapter = s.chapters[chIdx + 1] ?? null;
    const pages       = chapter.pages;
    const total       = pages.length;

    // 🏷️ PAGE TITLE
    document.title = `${chapter.title} — ${s.title} — Stay Tooned GFX`;

    // 🎨 APPLY THEMING
    // Chapter-level bg overrides series-level bg (drop bg.jpg in chapter folder)
    const root = document.documentElement;
    const bg      = chapter.background      || s.background;
    const bgPause = chapter.backgroundPause || s.backgroundPause;
    const bgMode  = chapter.backgroundMode ?? s.backgroundMode ?? 'cover';
    if (bg) {
      root.style.setProperty('--series-bg', `url(${bg})`);
      if (bgPause) root.style.setProperty('--series-bg-pause', `url(${bgPause})`);
      document.body.classList.add('has-series-bg');
      if (bgMode === 'tile') document.body.classList.add('bg-tile');
    }
    if (s.accentColor) root.style.setProperty('--series-accent', s.accentColor);
    if (s.theme)       document.body.setAttribute('data-theme', s.theme);

    // 🖱️ CUSTOM CURSOR — hand off to cursor.js fake cursor
    if (s.cursor || s.cursorAnim) {
      if (typeof window.__cursorSetPaths === 'function') {
        window.__cursorSetPaths(s.cursor, s.cursorAnim);
      }
    }

    // 🎭 TITLE CARD — series logo image or styled text + chapter name
    titlecardSeries.innerHTML = s.headerImage
      ? `<img src="${s.headerImage}" alt="${s.title}" class="series-header-img">`
      : `<span class="title-card-series-name">${s.title}</span>`;
    titlecardChapter.textContent = chapter.title;

    // 🔙 BACK LINK → series archive
    backLink.href        = `series.html?s=${seriesSlug}`;
    backLink.textContent = `← ${s.title}`;

    // 📋 CHAPTER SELECTOR DROPDOWN
    chSelect.innerHTML = s.chapters.map(ch =>
      `<option value="${ch.slug}" ${ch.slug === chapterSlug ? 'selected' : ''}>${ch.title}</option>`
    ).join('');
    chSelect.addEventListener('change', () => {
      chSelect.blur();
      location.href = `reader.html?s=${seriesSlug}&ch=${chSelect.value}&p=1#comic`;
    });

    // ─────────────────────────────────────────────────────
    // 🔘 SYNC BUTTONS — enable/disable based on position
    // ─────────────────────────────────────────────────────
    function syncButtons() {
      const atFirst = page <= 1;
      const atLast  = page >= total;
      const noPages = total === 0;

      const disableFirst  = noPages || (atFirst && !prevChapter);
      const disablePrev   = noPages || (atFirst && !prevChapter);
      const disableNext   = noPages || (atLast  && !nextChapter);
      const disableLatest = noPages || (atLast  && !nextChapter);

      btnFirst.disabled   = btnFirstB.disabled  = disableFirst;
      btnPrev.disabled    = btnPrevB.disabled   = disablePrev;
      btnNext.disabled    = btnNextB.disabled   = disableNext;
      btnLatest.disabled  = btnLatestB.disabled = disableLatest;

      const label = total > 0 ? `${page} / ${total}` : '— / —';
      pageCount.textContent  = label;
      pageCountB.textContent = label;
    }

    // ─────────────────────────────────────────────────────
    // 📊 PROGRESS BAR — fills based on page / total
    // ─────────────────────────────────────────────────────
    function updateProgressBar() {
      if (!progressFill || total === 0) return;
      const pct = total <= 1 ? 100 : ((page - 1) / (total - 1)) * 100;
      progressFill.style.width = Math.round(pct) + '%';
    }

    // ─────────────────────────────────────────────────────
    // 🔮 PRELOAD NEXT PAGE — loads adjacent images in background
    // ─────────────────────────────────────────────────────
    function preloadAdjacent() {
      [pages[page], pages[page - 2]].forEach(src => {
        if (src) { const img = new Image(); img.src = src; }
      });
    }

    // ─────────────────────────────────────────────────────
    // 💾 READING PROGRESS — saves last-read page per chapter
    //    key: stg-{series}-{chapter}  value: page number
    // ─────────────────────────────────────────────────────
    const progressKey = `stg-${seriesSlug}-${chapterSlug}`;

    function saveProgress() {
      try { localStorage.setItem(progressKey, page); } catch (_) {}
    }

    // ─────────────────────────────────────────────────────
    // 🖼️ STRIP MODE DETECTION
    //    Tracks whether the current image is a wide strip (>2:1).
    //    Used to trigger landscape lock when opening zoom on mobile.
    // ─────────────────────────────────────────────────────
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    let isStripMode = false;

    function checkStripMode(img) {
      isStripMode = img.naturalWidth / img.naturalHeight > 2.0;
      pageDisplay.classList.toggle('strip-mode', isStripMode);
    }

    // ─────────────────────────────────────────────────────
    // 📐 LANDSCAPE LOCK
    //    On Android: tapping zoom on a wide strip enters native
    //    fullscreen and locks landscape for comfortable reading.
    //    On iOS: fullscreen + lock are unsupported — silently skipped.
    //    Releasing exits fullscreen and unlocks orientation.
    // ─────────────────────────────────────────────────────
    async function tryLandscapeLock() {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape-primary');
        }
      } catch (_) {}
    }

    function releaseLandscapeLock() {
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {}
    }

    // Exit fullscreen via OS back button also closes lightbox
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && lightbox.classList.contains('show')) closeLightbox();
    });

    // ─────────────────────────────────────────────────────
    // 🔍 LIGHTBOX / ZOOM
    //    Opens the current page full-screen for detailed viewing.
    //    Triggered by the ⤢ toolbar button or Z key.
    //    On touch + wide strip: also locks landscape orientation.
    //    Supports pinch-to-zoom and pan (drag) when zoomed.
    //    Close via ✕ button, click-outside (at 1×), Esc, or Z.
    // ─────────────────────────────────────────────────────
    let lbScale     = 1;
    let lbPanX      = 0;
    let lbPanY      = 0;
    let lbPinchDist = 0;
    let lbScaleBase = 1;
    let lbDragX     = 0;
    let lbDragY     = 0;
    let lbPanBaseX  = 0;
    let lbPanBaseY  = 0;
    let lbDragging  = false;

    function lbApplyTransform() {
      lightboxImg.style.transform =
        `scale(${lbScale}) translate(${lbPanX / lbScale}px, ${lbPanY / lbScale}px)`;
    }

    function lbReset() {
      lbScale = 1; lbPanX = 0; lbPanY = 0; lbDragging = false;
      lightboxImg.style.transform = '';
      lightbox.classList.remove('is-zoomed', 'is-dragging');
    }

    function openLightbox() {
      const img = pageDisplay.querySelector('.comic-page-img');
      if (!img) return;
      lbReset();
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('show');
      lightbox.classList.toggle('lb-strip', isStripMode);
      document.body.style.overflow = 'hidden';
      if (isTouchDevice && isStripMode) tryLandscapeLock();
    }

    function closeLightbox() {
      lightbox.classList.remove('show', 'lb-strip');
      document.body.style.overflow = '';
      lbReset();
      releaseLandscapeLock();
    }

    // Pinch to zoom
    lightbox.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lbPinchDist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        lbScaleBase = lbScale;
        lbDragging  = false;
      } else if (e.touches.length === 1 && lbScale > 1) {
        lbDragging  = true;
        lbDragX     = e.touches[0].clientX;
        lbDragY     = e.touches[0].clientY;
        lbPanBaseX  = lbPanX;
        lbPanBaseY  = lbPanY;
        lightbox.classList.add('is-dragging');
      }
    }, { passive: false });

    lightbox.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        lbScale = Math.min(5, Math.max(1, lbScaleBase * (dist / lbPinchDist)));
        if (lbScale <= 1) { lbPanX = 0; lbPanY = 0; }
        lightbox.classList.toggle('is-zoomed', lbScale > 1);
        lbApplyTransform();
      } else if (e.touches.length === 1 && lbDragging && lbScale > 1) {
        e.preventDefault();
        lbPanX = lbPanBaseX + (e.touches[0].clientX - lbDragX);
        lbPanY = lbPanBaseY + (e.touches[0].clientY - lbDragY);
        lbApplyTransform();
      }
    }, { passive: false });

    lightbox.addEventListener('touchend', e => {
      lightbox.classList.remove('is-dragging');
      if (e.touches.length < 2) lbDragging = false;
      if (lbScale < 1.05) { lbScale = 1; lbPanX = 0; lbPanY = 0; lbApplyTransform(); }
    }, { passive: true });

    btnZoom.addEventListener('click', openLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    // Only close on click-outside when not zoomed in (avoids closing mid-pan)
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox && lbScale <= 1) closeLightbox();
    });

    // ─────────────────────────────────────────────────────
    // ⌨️ SHORTCUT OVERLAY — press ? or the ? button to toggle
    // ─────────────────────────────────────────────────────
    function toggleShortcutOverlay() {
      shortcutOverlay.classList.toggle('show');
    }

    btnHelp.addEventListener('click', toggleShortcutOverlay);
    shortcutOverlay.addEventListener('click', e => {
      if (e.target === shortcutOverlay) shortcutOverlay.classList.remove('show');
    });

    // ─────────────────────────────────────────────────────
    // 🖼️ RENDER CURRENT PAGE
    // ─────────────────────────────────────────────────────
    function render() {
      page = Math.max(1, Math.min(page, total || 1));

      if (total === 0) {
        pageDisplay.innerHTML = '<p class="empty">No pages in this chapter yet.</p>';
        syncButtons();
        updateProgressBar();
        return;
      }

      const img     = new Image();
      img.className = 'comic-page-img';
      img.alt       = `Page ${page} of ${total}`;

      img.onload = () => {
        checkStripMode(img);
        preloadAdjacent();
      };

      img.src = pages[page - 1];

      // If image was already cached, onload won't fire — run detection manually
      if (img.complete) {
        checkStripMode(img);
        preloadAdjacent();
      }

      pageDisplay.innerHTML = '';
      pageDisplay.classList.remove('comic-page-placeholder');
      pageDisplay.appendChild(img);

      syncButtons();
      updateProgressBar();
      saveProgress();

      // 🎉 CONFETTI — fire on last page of this chapter
      if (page === total && typeof window.triggerConfetti === 'function') {
        setTimeout(window.triggerConfetti, 400);
      }

      // 🔗 Keep URL in sync without a full reload
      const url = new URL(location.href);
      url.searchParams.set('p', page);
      history.replaceState(null, '', url);
    }

    // ─────────────────────────────────────────────────────
    // ➡️ GO TO PAGE N — crosses chapter boundaries
    // ─────────────────────────────────────────────────────
    function go(n) {
      if (n < 1 && prevChapter) {
        location.href = `reader.html?s=${seriesSlug}&ch=${prevChapter.slug}&p=${prevChapter.pageCount}#comic`;
        return;
      }
      if (n > total && nextChapter) {
        location.href = `reader.html?s=${seriesSlug}&ch=${nextChapter.slug}&p=1#comic`;
        return;
      }
      page = Math.max(1, Math.min(n, total));
      render();
    }

    // ⏮ FIRST — page 1 of the very first chapter
    function goFirst() {
      if (s.chapters[0].slug !== chapterSlug) {
        location.href = `reader.html?s=${seriesSlug}&ch=${s.chapters[0].slug}&p=1#comic`;
      } else { go(1); }
    }

    // ⏭ LATEST — last page of the most recent chapter
    function goLatest() {
      const last = s.chapters[s.chapters.length - 1];
      if (last.slug !== chapterSlug) {
        location.href = `reader.html?s=${seriesSlug}&ch=${last.slug}&p=${last.pageCount || 1}#comic`;
      } else { go(total); }
    }

    // 🔘 BUTTON EVENTS — top nav
    btnFirst.addEventListener('click',  goFirst);
    btnPrev.addEventListener('click',   () => go(page - 1));
    btnNext.addEventListener('click',   () => go(page + 1));
    btnLatest.addEventListener('click', goLatest);

    // 🔘 BUTTON EVENTS — bottom nav (mirrors top)
    btnFirstB.addEventListener('click',  goFirst);
    btnPrevB.addEventListener('click',   () => go(page - 1));
    btnNextB.addEventListener('click',   () => go(page + 1));
    btnLatestB.addEventListener('click', goLatest);

    // ─────────────────────────────────────────────────────
    // 📱 TOUCH SWIPE — left = next, right = prev
    //    Threshold 40px, must be more horizontal than vertical
    // ─────────────────────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;

    pageDisplay.addEventListener('touchstart', e => {
      if (e.touches.length > 1) { touchStartX = NaN; return; } // pinch — skip swipe
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    pageDisplay.addEventListener('touchend', e => {
      if (isNaN(touchStartX)) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? go(page + 1) : go(page - 1);
      }
    }, { passive: true });

    // 🖱️ CLICK TO NAVIGATE — right half = next, left half = prev
    //    Disabled in strip mode (need horizontal scroll instead)
    pageDisplay.addEventListener('click', e => {
      if (pageDisplay.classList.contains('strip-mode')) return;
      const mid = pageDisplay.getBoundingClientRect().left + pageDisplay.offsetWidth / 2;
      e.clientX >= mid ? go(page + 1) : go(page - 1);
    });

    // ─────────────────────────────────────────────────────
    // ⌨️ KEYBOARD — arrows, space, Z (zoom), ? (shortcuts)
    // ─────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

      // Lightbox: arrows navigate pages in-place, Esc/Z closes
      if (lightbox.classList.contains('show')) {
        if (e.key === 'Escape' || e.key === 'z' || e.key === 'Z') { closeLightbox(); return; }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(page - 1);
          lbReset();
          lightboxImg.src = pages[page - 1];
          lightboxImg.alt = `Page ${page} of ${total}`;
          return;
        }
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          go(page + 1);
          lbReset();
          lightboxImg.src = pages[page - 1];
          lightboxImg.alt = `Page ${page} of ${total}`;
          return;
        }
        return;
      }

      // Shortcut overlay — close on Esc or ?
      if (shortcutOverlay.classList.contains('show')) {
        if (e.key === 'Escape' || e.key === '?') shortcutOverlay.classList.remove('show');
        return;
      }

      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(page - 1); }
      if (e.key === 'ArrowRight' || e.key === ' ')  { e.preventDefault(); go(page + 1); }
      if (e.key === 'z' || e.key === 'Z')              openLightbox();
      if (e.key === '?')                               toggleShortcutOverlay();
    });

    // 🚀 INITIAL RENDER
    render();

  } catch (err) {
    // ❌ ERROR STATE
    pageDisplay.innerHTML = '<p class="error">Could not load comic data.</p>';
    console.error(err);
  }

})();
