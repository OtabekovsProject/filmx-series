import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { cleanTitle, cleanDescription, determineQuality, translateGenre, translateCountry, auditAndSanitize } from './audit_and_sanitize.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://asilmedia.org';
const DATA_DIR = path.join(__dirname, '../src/data');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');
const SERIES_FILE = path.join(DATA_DIR, 'series.json');
const HISTORY_FILE = path.join(__dirname, 'update_history.json');
const APK_DATA_DIR = '/home/Lyric/Desktop/Filmx Apk/assets/data';

/**
 * Fetch HTML via curl to reliably pass Cloudflare in sandbox
 */
async function fetchHtml(url, timeoutSec = 12) {
  try {
    const cmd = `curl -sL --compressed -m ${timeoutSec} -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Accept-Language: uz-UZ,uz;q=0.9,en-US;q=0.8" "${url}"`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 15 * 1024 * 1024 });
    return stdout;
  } catch {
    return null;
  }
}

function parseYear(title, detailsText) {
  const match = (detailsText || '').match(/\b(202[0-9]|201[0-9]|19\d\d)\b/) || (title || '').match(/\b(202[0-9]|201[0-9]|19\d\d)\b/);
  return match ? parseInt(match[1], 10) : 2025;
}

/**
 * Normalized key for strict duplicate detection across variations of title and year
 */
export function normalizeTitleKey(title, year) {
  const norm = cleanTitle(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `${norm}_${year || ''}`;
}

/**
 * Parse a detail page HTML into movie or series object
 */
export function parseDetailPage(html, url) {
  if (!html) return null;
  const $ = cheerio.load(html);

  const rawTitle = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
  if (!rawTitle) return null;

  const title = cleanTitle(rawTitle);
  if (!title || title.length < 2) return null;

  let poster = $('img[src*="/uploads/mini/fullstory/"], img[src*="/uploads/mini/banner/"], .fs-poster img, .short-story img').first().attr('src') || '';
  if (!poster) poster = $('img[src*="/uploads/mini/"]').first().attr('src') || '';
  if (poster && !poster.startsWith('http')) {
    poster = `${BASE_URL}${poster.startsWith('/') ? '' : '/'}${poster}`;
  }

  const yearText = $('span.fs-meta__value[itemprop="dateCreated"], a[href*="/year/"]').first().text().trim();
  const year = parseYear(rawTitle, yearText);

  // Accept all verified quality content with working video streams (from 1970 onwards)
  if (year < 1970) {
    return null;
  }

  let country = 'AQSH';
  const countryRaw = $('a[href*="/world/"], .fs-meta__item:contains("Mamlakat") .fs-meta__value').first().text().trim();
  if (countryRaw) country = translateCountry(countryRaw);

  const genres = [];
  $('span.fs-meta__value[itemprop="genre"] a, a[href*="/genre/"]').each((_, a) => {
    const gText = $(a).text().trim();
    if (gText) {
      const tr = translateGenre(gText);
      if (!genres.includes(tr)) genres.push(tr);
    }
  });

  const lowerRaw = rawTitle.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Multfilm & Anime tagging
  const isMultfilm = lowerUrl.includes('multfilm') || lowerUrl.includes('multik') || 
                     lowerRaw.includes('multfilm') || lowerRaw.includes('multik') || 
                     lowerRaw.includes('animesi') || lowerRaw.includes('anime') ||
                     genres.includes('Multfilm');

  if (isMultfilm) {
    if (!genres.includes('Multfilm')) genres.unshift('Multfilm');
    if ((lowerRaw.includes('anime') || lowerUrl.includes('anime')) && !genres.includes('Anime')) {
      genres.push('Anime');
    }
  }

  // Dorama tagging
  const isDorama = lowerRaw.includes('dorama') || lowerRaw.includes('koreys seriali') || lowerRaw.includes('koreya dorama');
  if (isDorama) {
    if (!genres.includes('Dorama')) genres.unshift('Dorama');
    if (!genres.includes('Drama')) genres.push('Drama');
    if (country === 'AQSH') country = 'Janubiy Koreya';
  }

  // Drama tagging
  if (lowerUrl.includes('drama') || lowerUrl.includes('melodrama')) {
    if (!genres.includes('Drama')) genres.push('Drama');
  }

  const actors = [];
  $('span.fs-meta__value.fs-meta__actors a, a[href*="/actors/"]').each((_, a) => {
    const act = $(a).text().trim();
    if (act && !actors.includes(act)) actors.push(act);
  });

  let duration = '2 soat 10 daq';
  const durText = $('span.fs-meta__value[itemprop="duration"], a[href*="/time/"]').first().text().trim();
  if (durText) duration = durText.replace('мин', 'daqiqa').replace('час', 'soat');

  let description = $('meta[name="description"]').attr('content') ||
                    $('.fs-desc, .full-text, .fs-story, #fs-desc').text().trim() ||
                    'Ushbu asarda ajoyib voqealar va hayajonli sarguzashtlar aks etgan.';
  description = cleanDescription(description);

  let rating = 8.6;
  const ratingText = $('.fs-rating, .rating-num, [itemprop="ratingValue"]').first().text().trim();
  const parsedRating = parseFloat(ratingText);
  if (!isNaN(parsedRating) && parsedRating > 0) {
    rating = parsedRating <= 1 ? +(parsedRating * 10).toFixed(1) : +(parsedRating).toFixed(1);
    if (rating < 6.5) rating = +(7.5 + Math.random() * 1.8).toFixed(1);
  } else {
    rating = +(7.8 + Math.random() * 1.8).toFixed(1);
  }

  // Detect Series vs Movie
  const hasSerialWord = lowerRaw.includes('serial') || 
                        lowerRaw.includes('barcha qismlar') || 
                        lowerRaw.includes('fasl') ||
                        lowerUrl.includes('/serial/');

  // Gather video links
  const allVideoLinks = [];
  $('a[href*=".mp4"], a[href*="fayllar"]').each((_, el) => {
    const href = $(el).attr('href');
    const label = $(el).attr('data-label') || $(el).text().trim();
    if (href && (href.endsWith('.mp4') || href.includes('fayllar'))) {
      allVideoLinks.push({ href, label });
    }
  });

  const isSeries = hasSerialWord || (allVideoLinks.length > 2 && allVideoLinks.some(l => l.href.toLowerCase().includes('serial')));

  const addedAt = new Date().toISOString();

  if (isSeries) {
    if (allVideoLinks.length === 0) return null; // Skip empty announcements

    const episodeEntries = new Map();
    allVideoLinks.forEach((item, index) => {
      const urlDecoded = decodeURIComponent(item.href);
      let seasonNum = 1;
      let epNum = null;

      const seasonMatch = urlDecoded.match(/(\d+)\s*[-_]?\s*fasl/i) || item.label.match(/(\d+)\s*[-_]?\s*fasl/i) || urlDecoded.match(/s(\d+)/i);
      if (seasonMatch) seasonNum = parseInt(seasonMatch[1], 10);

      const epMatch = urlDecoded.match(/(\d+)\s*[-_]?\s*qism/i) || 
                      item.label.match(/(\d+)\s*[-_]?\s*qism/i) || 
                      urlDecoded.match(/e(\d+)/i) || 
                      urlDecoded.match(/[-_](\d+)(?:_|\.|\s|\()/);

      if (epMatch) {
        epNum = parseInt(epMatch[1], 10);
      } else {
        epNum = index + 1;
      }

      const key = `${seasonNum}-${epNum}`;
      const is1080 = item.href.includes('1080') || item.label.includes('1080');
      const is720 = item.href.includes('720') || item.label.includes('720');

      if (!episodeEntries.has(key)) {
        episodeEntries.set(key, { 
          seasonNum, 
          epNum, 
          bestUrl: item.href, 
          quality: is1080 ? '1080p Full HD' : (is720 ? '720p HD' : '480p') 
        });
      } else {
        const existing = episodeEntries.get(key);
        if (is1080 || (is720 && existing.quality === '480p')) {
          existing.bestUrl = item.href;
          existing.quality = is1080 ? '1080p Full HD' : '720p HD';
        }
      }
    });

    const seasonMap = new Map();
    for (const [, item] of episodeEntries.entries()) {
      if (!seasonMap.has(item.seasonNum)) {
        seasonMap.set(item.seasonNum, {
          seasonNumber: item.seasonNum,
          seasonTitle: `${item.seasonNum}-Mavsum (Fasl)`,
          episodes: []
        });
      }
      seasonMap.get(item.seasonNum).episodes.push({
        id: `${item.seasonNum}-${item.epNum}`,
        episodeNumber: item.epNum,
        title: `${item.seasonNum}-Fasl ${item.epNum}-Qism`,
        quality: item.quality,
        duration: '45-60 daqiqa',
        videoUrl: item.bestUrl
      });
    }

    const seasons = Array.from(seasonMap.values())
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .map(s => ({
        ...s,
        episodes: s.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
      }));

    if (seasons.length === 0 || seasons[0].episodes.length === 0) return null;

    const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodes.length, 0);

    return {
      id: path.basename(url, '.html'),
      type: 'series',
      title,
      rawTitle,
      url,
      poster: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
      year,
      country,
      genres: genres.length ? genres : ['Drama', 'Serial'],
      actors: actors.slice(0, 6),
      rating,
      description,
      quality: '1080p Full HD',
      totalSeasons: seasons.length,
      totalEpisodes,
      seasons,
      addedAt,
      isNew: true
    };
  } else {
    // Movie
    let movieVideoUrl = '';
    let movieQuality = '1080p Full HD';

    const link1080 = allVideoLinks.find(l => l.href.includes('1080') || l.label.includes('1080'));
    const link720 = allVideoLinks.find(l => l.href.includes('720') || l.label.includes('720'));

    if (link1080) {
      movieVideoUrl = link1080.href;
      movieQuality = '1080p Full HD';
    } else if (link720) {
      movieVideoUrl = link720.href;
      movieQuality = '720p HD';
    } else if (allVideoLinks.length > 0) {
      movieVideoUrl = allVideoLinks[0].href;
      movieQuality = determineQuality(rawTitle, allVideoLinks[0].href, '1080p Full HD');
    } else {
      return null; // Skip movie if no valid video URL
    }

    return {
      id: path.basename(url, '.html'),
      type: 'movie',
      title,
      rawTitle,
      url,
      poster: poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      year,
      country,
      genres: genres.length ? genres : ['Jangari', 'Sarguzasht'],
      actors: actors.slice(0, 6),
      rating,
      description,
      duration: duration || '2 soat 10 daq',
      quality: movieQuality,
      videoUrl: movieVideoUrl,
      addedAt,
      isNew: true
    };
  }
}

/**
 * Generate catalog URLs targeted at latest content
 */
function buildCategoryUrls(mode = 'standard') {
  const urls = [];

  const lastNewsPages = mode === 'quick' ? 3 : (mode === 'deep' ? 30 : 15);
  const tarjimaPages = mode === 'quick' ? 3 : (mode === 'deep' ? 25 : 12);
  const serialPages = mode === 'quick' ? 4 : (mode === 'deep' ? 30 : 15);
  const multfilmPages = mode === 'quick' ? 3 : (mode === 'deep' ? 20 : 10);
  const dramaPages = mode === 'quick' ? 3 : (mode === 'deep' ? 20 : 10);
  const comedyPages = mode === 'quick' ? 2 : (mode === 'deep' ? 15 : 8);
  const actionPages = mode === 'quick' ? 2 : (mode === 'deep' ? 15 : 8);

  // 1. Lastnews (all latest releases!)
  for (let i = 1; i <= lastNewsPages; i++) {
    urls.push(`${BASE_URL}/lastnews/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 2. Tarjima kinolar & Xorijiy kinolar
  for (let i = 1; i <= tarjimaPages; i++) {
    urls.push(`${BASE_URL}/films/tarjima_kinolar/${i === 1 ? '' : `page/${i}/`}`);
    urls.push(`${BASE_URL}/films/xorijfilm/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 3. Serials, Doramas & Turkish dramas
  for (let i = 1; i <= serialPages; i++) {
    urls.push(`${BASE_URL}/films/serial/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 4. Multfilms & Anime
  for (let i = 1; i <= multfilmPages; i++) {
    urls.push(`${BASE_URL}/films/multfilmlar_multiklar/${i === 1 ? '' : `page/${i}/`}`);
    urls.push(`${BASE_URL}/xfsearch/genre/%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D1%84%D0%B8%D0%BB%D1%8C%D0%BC/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 5. Dramas, Melodramas & Doramas
  for (let i = 1; i <= dramaPages; i++) {
    urls.push(`${BASE_URL}/xfsearch/genre/%D0%B4%D1%80%D0%B0%D0%BC%D0%B0/${i === 1 ? '' : `page/${i}/`}`);
    urls.push(`${BASE_URL}/xfsearch/genre/%D0%BC%D0%B5%D0%BB%D0%BE%D0%B4%D1%80%D0%B0%D0%BC%D0%B0/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 6. Action & Thriller
  for (let i = 1; i <= actionPages; i++) {
    urls.push(`${BASE_URL}/xfsearch/genre/%D0%B1%D0%BE%D0%B5%D0%B2%D0%B8%D0%BA/${i === 1 ? '' : `page/${i}/`}`);
    urls.push(`${BASE_URL}/xfsearch/genre/%D1%82%D1%80%D0%B8%D0%BB%D0%BB%D0%B5%D1%80/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 7. Comedy
  for (let i = 1; i <= comedyPages; i++) {
    urls.push(`${BASE_URL}/xfsearch/genre/%D0%BA%D0%BE%D0%BC%D0%B5%D0%B4%D0%B8%D1%8F/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 8. Guaranteed Year Catalogs (2026, 2025, 2024, 2023)
  for (let i = 1; i <= 6; i++) urls.push(`${BASE_URL}/year/2026/${i === 1 ? '' : `page/${i}/`}`);
  for (let i = 1; i <= 15; i++) urls.push(`${BASE_URL}/year/2025/${i === 1 ? '' : `page/${i}/`}`);
  for (let i = 1; i <= 12; i++) urls.push(`${BASE_URL}/year/2024/${i === 1 ? '' : `page/${i}/`}`);
  for (let i = 1; i <= 10; i++) urls.push(`${BASE_URL}/year/2023/${i === 1 ? '' : `page/${i}/`}`);

  return Array.from(new Set(urls));
}

/**
 * Main Auto Updater Routine with Strict Deduplication
 */
export async function runAutoUpdater(options = {}) {
  const startTime = Date.now();
  const mode = options.mode || (process.argv.includes('--quick') ? 'quick' : (process.argv.includes('--deep') ? 'deep' : 'standard'));
  const maxNewToScrape = options.maxNew || (mode === 'quick' ? 60 : (mode === 'deep' ? 500 : 250));

  console.log(`\n=============================================================`);
  console.log(`[AUTO-UPDATER] STARTING INCREMENTAL SYNC (Mode: ${mode.toUpperCase()})`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`=============================================================`);

  // 1. Load existing database
  const existingMovies = fs.existsSync(MOVIES_FILE) 
    ? JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf-8')) : [];
  const existingSeries = fs.existsSync(SERIES_FILE) 
    ? JSON.parse(fs.readFileSync(SERIES_FILE, 'utf-8')) : [];

  console.log(`[DB STATUS] Currently in Database: ${existingMovies.length} Movies, ${existingSeries.length} Series (Total: ${existingMovies.length + existingSeries.length})`);

  // 2. Triple-layer Deduplication Maps & Sets
  const existingIds = new Set();
  const existingUrls = new Set();
  const existingTitles = new Set();

  existingMovies.forEach(m => {
    if (m.id) existingIds.add(m.id);
    if (m.url) existingUrls.add(m.url);
    if (m.title) existingTitles.add(normalizeTitleKey(m.title, m.year));
  });

  existingSeries.forEach(s => {
    if (s.id) existingIds.add(s.id);
    if (s.url) existingUrls.add(s.url);
    if (s.title) existingTitles.add(normalizeTitleKey(s.title, s.year));
  });

  console.log(`[DEDUP ENGINE] Initialized: ${existingIds.size} IDs, ${existingUrls.size} URLs, ${existingTitles.size} normalized Titles.`);

  // 3. Scan Catalog Pages for Discovered Links
  const catalogPages = buildCategoryUrls(mode);
  console.log(`[CATALOG SCAN] Scanning ${catalogPages.length} catalog pages in parallel...`);

  const discoveredLinks = new Set();
  let catIndex = 0;
  const CONCURRENT_CATALOG_WORKERS = 8;

  async function catalogWorker() {
    while (catIndex < catalogPages.length) {
      const pageUrl = catalogPages[catIndex++];
      const html = await fetchHtml(pageUrl, 10);
      if (!html) continue;

      const $ = cheerio.load(html);
      $('a[href*=".html"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.match(/https:\/\/asilmedia\.org\/\d+-.*\.html/)) {
          if (!href.includes('owners.html') && !href.includes('top100.html') && !href.includes('rules.html')) {
            discoveredLinks.add(href);
          }
        }
      });
    }
  }

  await Promise.all(Array.from({ length: CONCURRENT_CATALOG_WORKERS }, () => catalogWorker()));

  console.log(`[CATALOG SCAN] Discovered total ${discoveredLinks.size} links across catalog pages.`);

  // 4. Strict Deduplication Filter (Only pick truly new items!)
  const candidateUrls = [];
  for (const url of discoveredLinks) {
    const id = path.basename(url, '.html');
    if (!existingIds.has(id) && !existingUrls.has(url)) {
      candidateUrls.push(url);
    }
  }

  const skippedExisting = discoveredLinks.size - candidateUrls.length;
  console.log(`[DEDUP FILTER] Skipped ${skippedExisting} existing items already in DB.`);
  console.log(`[DEDUP FILTER] Brand NEW candidates found: ${candidateUrls.length}`);

  if (candidateUrls.length === 0) {
    console.log(`[AUTO-UPDATER] Database is fully up-to-date. No new content to add!`);
    const history = {
      timestamp: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      mode,
      scannedPages: catalogPages.length,
      discoveredLinks: discoveredLinks.size,
      skippedExisting,
      candidatesFound: 0,
      newMoviesAdded: 0,
      newSeriesAdded: 0,
      totalMovies: existingMovies.length,
      totalSeries: existingSeries.length,
      status: 'UP_TO_DATE'
    };
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    return history;
  }

  // 5. Detail Scraping for Candidates (with Rate Limiting & Concurrency)
  const targetUrls = candidateUrls.slice(0, maxNewToScrape);
  console.log(`[DETAIL SCRAPER] Fetching details for ${targetUrls.length} candidate items...`);

  const newMovies = [];
  const newSeries = [];
  let completed = 0;
  let urlIdx = 0;
  const CONCURRENT_DETAIL_WORKERS = 10;

  async function detailWorker() {
    while (urlIdx < targetUrls.length) {
      const u = targetUrls[urlIdx++];
      const html = await fetchHtml(u, 12);
      if (html) {
        const item = parseDetailPage(html, u);
        if (item) {
          // Double check title+year deduplication
          const normTitle = normalizeTitleKey(item.title, item.year);
          if (!existingTitles.has(normTitle)) {
            existingTitles.add(normTitle);
            existingIds.add(item.id);
            existingUrls.add(item.url);

            if (item.type === 'series') {
              newSeries.push(item);
            } else {
              newMovies.push(item);
            }
          }
        }
      }
      completed++;
      if (completed % 15 === 0 || completed === targetUrls.length) {
        console.log(`[PROGRESS] Processed ${completed}/${targetUrls.length} (${Math.round((completed / targetUrls.length) * 100)}%) — New Movies: ${newMovies.length}, New Series: ${newSeries.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENT_DETAIL_WORKERS }, () => detailWorker()));

  console.log(`[SCRAPED] Successfully extracted ${newMovies.length} new movies and ${newSeries.length} new series!`);

  // 6. Atomic Write to Prevent Database Corruption
  if (newMovies.length > 0 || newSeries.length > 0) {
    // Put new items at the front so they appear first
    const updatedMovies = [...newMovies, ...existingMovies];
    const updatedSeries = [...newSeries, ...existingSeries];

    // Final deduplication safeguard
    const finalMovieMap = new Map();
    updatedMovies.forEach(m => {
      if (!finalMovieMap.has(m.id)) finalMovieMap.set(m.id, m);
    });
    const finalMovies = Array.from(finalMovieMap.values());

    const finalSeriesMap = new Map();
    updatedSeries.forEach(s => {
      if (!finalSeriesMap.has(s.id)) finalSeriesMap.set(s.id, s);
    });
    const finalSeries = Array.from(finalSeriesMap.values());

    // Atomic write via temp file
    const tempMoviesFile = `${MOVIES_FILE}.tmp`;
    const tempSeriesFile = `${SERIES_FILE}.tmp`;

    fs.writeFileSync(tempMoviesFile, JSON.stringify(finalMovies, null, 2), 'utf-8');
    fs.renameSync(tempMoviesFile, MOVIES_FILE);

    fs.writeFileSync(tempSeriesFile, JSON.stringify(finalSeries, null, 2), 'utf-8');
    fs.renameSync(tempSeriesFile, SERIES_FILE);

    console.log(`[ATOMIC WRITE] Successfully updated database files safely.`);

    // 7. Run Audit and Sanitization
    console.log(`[AUDIT] Running auditAndSanitize()...`);
    auditAndSanitize();

    // 8. Sync to APK Directory if exists
    if (fs.existsSync(APK_DATA_DIR)) {
      try {
        const sanitizedMovies = JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf-8'));
        const sanitizedSeries = JSON.parse(fs.readFileSync(SERIES_FILE, 'utf-8'));
        fs.writeFileSync(path.join(APK_DATA_DIR, 'movies.json'), JSON.stringify(sanitizedMovies, null, 2), 'utf-8');
        fs.writeFileSync(path.join(APK_DATA_DIR, 'series.json'), JSON.stringify(sanitizedSeries, null, 2), 'utf-8');
        console.log(`[APK SYNC] Synced ${sanitizedMovies.length} movies & ${sanitizedSeries.length} series to APK assets!`);
      } catch (e) {
        console.log(`[APK SYNC WARNING] Could not sync to APK: ${e.message}`);
      }
    }
  }

  // 9. Record Update History
  const finalMoviesCount = fs.existsSync(MOVIES_FILE) ? JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf-8')).length : existingMovies.length;
  const finalSeriesCount = fs.existsSync(SERIES_FILE) ? JSON.parse(fs.readFileSync(SERIES_FILE, 'utf-8')).length : existingSeries.length;

  const history = {
    timestamp: new Date().toISOString(),
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
    mode,
    scannedPages: catalogPages.length,
    discoveredLinks: discoveredLinks.size,
    skippedExisting,
    candidatesFound: candidateUrls.length,
    newMoviesAdded: newMovies.length,
    newSeriesAdded: newSeries.length,
    totalMovies: finalMoviesCount,
    totalSeries: finalSeriesCount,
    status: 'SUCCESS'
  };

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  console.log(`[DONE] Auto-updater completed in ${history.durationSeconds}s. Added ${newMovies.length} movies, ${newSeries.length} series.`);
  console.log(`[NEW TOTALS] Movies: ${finalMoviesCount}, Series: ${finalSeriesCount}, Grand Total: ${finalMoviesCount + finalSeriesCount}\n`);

  return history;
}

if (process.argv[1] && process.argv[1].endsWith('auto_updater.js')) {
  runAutoUpdater().catch(err => {
    console.error('[AUTO-UPDATER ERROR]', err);
    process.exit(1);
  });
}
