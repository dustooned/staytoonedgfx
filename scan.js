#!/usr/bin/env node
// ┌─────────────────────────────────────────────────────┐
// │  scan.js — Manifest + Sitemap Generator             │
// │  Run this after adding or editing any series,       │
// │  chapter, or pages: node scan.js                    │
// │                                                     │
// │  Walks comics/ and writes:                          │
// │    manifest.json  — site data for the frontend      │
// │    sitemap.xml    — search engine index             │
// └─────────────────────────────────────────────────────┘

const fs   = require('fs');
const path = require('path');

// 📂 CONFIG — paths and supported image extensions
const COMICS_DIR    = path.join(__dirname, 'comics');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const SITEMAP_PATH  = path.join(__dirname, 'sitemap.xml');
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

// 🌐 BASE URL — update this to your live domain
const BASE_URL = 'https://staytoonedgfx.com';

// 🖼️ IMAGE DETECTION — returns true for supported image files
function isImage(f) {
  return IMAGE_EXTS.has(path.extname(f).toLowerCase());
}

// 📖 READ JSON HELPER — returns null on missing/invalid file instead of throwing
function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

// 🔍 FIND FIRST EXISTING FILE — checks a list of candidate filenames in a directory
function firstExisting(dir, candidates) {
  return candidates.find(f => fs.existsSync(path.join(dir, f))) ?? null;
}

// ─────────────────────────────────────────────────────
// 🔄 MAIN SCAN — walks comics/ and builds manifest
// ─────────────────────────────────────────────────────
function scanComics() {

  // 🚫 GUARD — create empty manifest if comics/ doesn't exist yet
  if (!fs.existsSync(COMICS_DIR)) {
    console.warn('comics/ directory not found — nothing to scan.');
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ series: [] }, null, 2));
    return;
  }

  // 📁 LIST SERIES FOLDERS — sorted alphabetically
  const seriesSlugs = fs.readdirSync(COMICS_DIR)
    .filter(f => fs.statSync(path.join(COMICS_DIR, f)).isDirectory())
    .sort();

  const manifest = { series: [] };

  // ─────────────────────────────────────────────────
  // 📚 SERIES LOOP
  // ─────────────────────────────────────────────────
  for (const slug of seriesSlugs) {
    const seriesDir  = path.join(COMICS_DIR, slug);
    const seriesData = readJSON(path.join(seriesDir, 'series.json'));

    // 🚫 Skip folders without a series.json
    if (!seriesData) {
      console.warn(`  [skip] comics/${slug} — no series.json found`);
      continue;
    }

    // 🖼️ SERIES ASSETS — looks in assets/ subfolder first, falls back to series root
    const assetsDir    = path.join(seriesDir, 'assets');
    const assetBase    = fs.existsSync(assetsDir) ? assetsDir : seriesDir;
    const assetPrefix  = fs.existsSync(assetsDir) ? `comics/${slug}/assets` : `comics/${slug}`;

    const cover       = firstExisting(assetBase, ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp']);
    const headerImage = firstExisting(assetBase, ['header.png', 'header.jpg', 'header.webp']);
    const background  = firstExisting(assetBase, ['bg.jpg', 'bg.jpeg', 'bg.png', 'bg.webp', 'background.jpg', 'background.png']);
    const cursorStatic = firstExisting(assetBase, ['cursor.png', 'cursor.cur']);
    const cursorAnim   = firstExisting(assetBase, ['cursor.gif']);

    // 📁 LIST CHAPTER FOLDERS — sorted alphabetically (skip assets/ subfolder)
    const chapterSlugs = fs.readdirSync(seriesDir)
      .filter(f => f !== 'assets' && fs.statSync(path.join(seriesDir, f)).isDirectory())
      .sort();

    // ───────────────────────────────────────────────
    // 📖 CHAPTER LOOP
    // ───────────────────────────────────────────────
    const chapters = [];

    for (const chSlug of chapterSlugs) {
      const chDir  = path.join(seriesDir, chSlug);
      const chData = readJSON(path.join(chDir, 'chapter.json')) ?? { title: chSlug };

      // 🖼️ CHAPTER ASSETS — background override for this chapter
      const chBg = firstExisting(chDir, ['bg.jpg', 'bg.jpeg', 'bg.png', 'bg.webp', 'background.jpg', 'background.png']);

      // 📄 PAGE LIST — all image files sorted alphabetically
      const pages = fs.readdirSync(chDir)
        .filter(isImage)
        .sort()
        .map(f => `comics/${slug}/${chSlug}/${f}`);

      if (pages.length === 0) {
        console.warn(`  [warn] comics/${slug}/${chSlug} — no image files found`);
      }

      chapters.push({
        slug:           chSlug,
        title:          chData.title          ?? chSlug,
        date:           chData.date           ?? null,
        backgroundMode: chData.backgroundMode ?? null,   // 🖼️ null = inherit from series
        pageCount:      pages.length,
        thumbnail:      pages[0]              ?? null,
        pages,
        background: chBg ? `comics/${slug}/${chSlug}/${chBg}` : null,
      });
    }

    // ✅ ADD SERIES TO MANIFEST
    manifest.series.push({
      slug,
      title:          seriesData.title          ?? slug,
      shortName:      seriesData.shortName      ?? slug.toUpperCase(),
      description:    seriesData.description    ?? '',
      accentColor:    seriesData.accentColor    ?? '#ffffff',
      theme:          seriesData.theme          ?? null,   // 🎨 warm | cool | dark
      backgroundMode: seriesData.backgroundMode ?? 'cover', // 🖼️ "cover" | "tile"
      cover:        cover       ? `${assetPrefix}/${cover}`       : null,
      headerImage:  headerImage ? `${assetPrefix}/${headerImage}` : null,
      background:   background  ? `${assetPrefix}/${background}`  : null,
      cursor:       cursorStatic ? `${assetPrefix}/${cursorStatic}` : null,
      cursorAnim:   cursorAnim   ? `${assetPrefix}/${cursorAnim}`   : null,
      chapterCount: chapters.length,
      chapters,
    });

    console.log(`  ✓  ${seriesData.title ?? slug} (${chapters.length} chapter${chapters.length !== 1 ? 's' : ''})`);
  }

  // 💾 WRITE MANIFEST
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest.json written — ${manifest.series.length} series total.`);

  // ─────────────────────────────────────────────────────
  // 🗺️ WRITE SITEMAP — helps search engines index the site
  // ─────────────────────────────────────────────────────
  const staticPages = [
    '',              // homepage
    'about.html',
    'blog.html',
    'archive.html',
  ];

  const seriesPages = manifest.series.map(s => `series.html?s=${s.slug}`);

  const readerPages = manifest.series.flatMap(s =>
    s.chapters.map(ch => `reader.html?s=${s.slug}&ch=${ch.slug}&p=1`)
  );

  const allUrls = [...staticPages, ...seriesPages, ...readerPages];

  const today   = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${BASE_URL}/${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemapXml);
  console.log(`sitemap.xml written — ${allUrls.length} URLs.\n`);
}

// 🚀 RUN
console.log('Scanning comics/…\n');
scanComics();
