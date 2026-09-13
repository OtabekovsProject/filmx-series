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

async function fetchHtml(url) {
  try {
    const cmd = `curl -sL --compressed -m 12 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Accept-Language: uz-UZ,uz;q=0.9,en-US;q=0.8" "${url}"`;
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

function parseDetailPage(html, url) {
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

  // STRICT NEW FILTER: User explicitly requested: "yangi kinolarni qo`sh eskilarini emas"
  // Only accept content from 2021 onwards (focusing on 2023, 2024, 2025, 2026)
  if (year < 2021 && !rawTitle.toLowerCase().includes('2024') && !rawTitle.toLowerCase().includes('2025') && !rawTitle.toLowerCase().includes('2026')) {
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

  // Handle Multfilm & Anime tagging
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

  // Handle Dorama tagging
  const isDorama = lowerRaw.includes('dorama') || lowerRaw.includes('koreys seriali') || lowerRaw.includes('koreya dorama');
  if (isDorama) {
    if (!genres.includes('Dorama')) genres.unshift('Dorama');
    if (!genres.includes('Drama')) genres.push('Drama');
    if (country === 'AQSH') country = 'Janubiy Koreya';
  }

  // Handle Drama tagging
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

  if (isSeries) {
    // Only accept serials that have actual episodes
    if (allVideoLinks.length === 0) {
      return null; // Skip empty announcements/unreleased serials
    }

    const episodeEntries = new Map();
    allVideoLinks.forEach((item, index) => {
      const urlDecoded = decodeURIComponent(item.href);
      let seasonNum = 1;
      let epNum = null;

      // Season extraction
      const seasonMatch = urlDecoded.match(/(\d+)\s*[-_]?\s*fasl/i) || item.label.match(/(\d+)\s*[-_]?\s*fasl/i) || urlDecoded.match(/s(\d+)/i);
      if (seasonMatch) seasonNum = parseInt(seasonMatch[1], 10);

      // Episode extraction
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

    if (seasons.length === 0 || seasons[0].episodes.length === 0) {
      return null;
    }

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
      seasons
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
      // If no mp4 link found at all, check if it's trailer only, otherwise skip
      return null;
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
      videoUrl: movieVideoUrl
    };
  }
}

export async function runEnhancedScraper(maxItemsToAdd = 500) {
  console.log('==============================================================');
  console.log('[ENHANCED SCRAPER] STARTING THOROUGH ASILMEDIA SCRAPER');
  console.log('Target: Multfilms, Serials, Doramas, Dramas, New 2024-2026 Releases');
  console.log('==============================================================');

  const categoryPages = [];

  // 1. Multfilms & Anime (High Priority!)
  for (let i = 1; i <= 30; i++) {
    categoryPages.push(`${BASE_URL}/films/multfilmlar_multiklar/${i === 1 ? '' : `page/${i}/`}`);
  }
  for (let i = 1; i <= 30; i++) {
    categoryPages.push(`${BASE_URL}/xfsearch/genre/%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D1%84%D0%B8%D0%BB%D1%8C%D0%BC/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 2. Serials & Doramas (High Priority!)
  for (let i = 1; i <= 35; i++) {
    categoryPages.push(`${BASE_URL}/films/serial/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 3. Dramas & Melodramas (High Priority!)
  for (let i = 1; i <= 30; i++) {
    categoryPages.push(`${BASE_URL}/xfsearch/genre/%D0%B4%D1%80%D0%B0%D0%BC%D0%B0/${i === 1 ? '' : `page/${i}/`}`);
  }
  for (let i = 1; i <= 30; i++) {
    categoryPages.push(`${BASE_URL}/xfsearch/genre/%D0%BC%D0%B5%D0%BB%D0%BE%D0%B4%D1%80%D0%B0%D0%BC%D0%B0/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 4. Lastnews & Premyera (All newest releases!)
  for (let i = 1; i <= 35; i++) {
    categoryPages.push(`${BASE_URL}/lastnews/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 5. Tarjima kinolar
  for (let i = 1; i <= 35; i++) {
    categoryPages.push(`${BASE_URL}/films/tarjima_kinolar/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 6. Xorijiy kinolar
  for (let i = 1; i <= 20; i++) {
    categoryPages.push(`${BASE_URL}/films/xorijfilm/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 7. Hind kinolar
  for (let i = 1; i <= 15; i++) {
    categoryPages.push(`${BASE_URL}/films/hindkino/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 8. Rus kinolar
  for (let i = 1; i <= 15; i++) {
    categoryPages.push(`${BASE_URL}/films/rusfilm/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 9. 2025 & 2024 Year Catalogs (Guaranteed new releases)
  for (let i = 1; i <= 25; i++) {
    categoryPages.push(`${BASE_URL}/year/2025/${i === 1 ? '' : `page/${i}/`}`);
  }
  for (let i = 1; i <= 30; i++) {
    categoryPages.push(`${BASE_URL}/year/2024/${i === 1 ? '' : `page/${i}/`}`);
  }
  for (let i = 1; i <= 25; i++) {
    categoryPages.push(`${BASE_URL}/year/2023/${i === 1 ? '' : `page/${i}/`}`);
  }

  // 10. More multfilms & anime
  for (let i = 31; i <= 45; i++) {
    categoryPages.push(`${BASE_URL}/films/multfilmlar_multiklar/page/${i}/`);
    categoryPages.push(`${BASE_URL}/xfsearch/genre/%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D1%84%D0%B8%D0%BB%D1%8C%D0%BC/page/${i}/`);
  }

  // 11. More serials
  for (let i = 36; i <= 50; i++) {
    categoryPages.push(`${BASE_URL}/films/serial/page/${i}/`);
  }

  console.log(`[ENHANCED SCRAPER] Generated ${categoryPages.length} catalog page URLs across all genres.`);
  console.log(`[ENHANCED SCRAPER] Scanning catalog pages in parallel with 15 workers...`);

  const discoveredLinks = new Set();
  let catIndex = 0;

  async function catWorker() {
    while (catIndex < categoryPages.length) {
      const pageUrl = categoryPages[catIndex++];
      const html = await fetchHtml(pageUrl);
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

  await Promise.all(Array.from({ length: 15 }, () => catWorker()));

  // Load current database
  const existingMovies = fs.existsSync(path.join(DATA_DIR, 'movies.json')) 
    ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'movies.json'), 'utf-8')) : [];
  const existingSeries = fs.existsSync(path.join(DATA_DIR, 'series.json')) 
    ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'series.json'), 'utf-8')) : [];

  const existingIds = new Set([
    ...existingMovies.map(m => m.id),
    ...existingSeries.map(s => s.id)
  ]);

  const existingUrls = new Set([
    ...existingMovies.map(m => m.url),
    ...existingSeries.map(s => s.url)
  ]);

  const candidateUrls = Array.from(discoveredLinks).filter(u => {
    const id = path.basename(u, '.html');
    return !existingIds.has(id) && !existingUrls.has(u);
  });

  const targetUrls = candidateUrls.slice(0, maxItemsToAdd);
  console.log(`[ENHANCED SCRAPER] Total discovered links: ${discoveredLinks.size}`);
  console.log(`[ENHANCED SCRAPER] Candidate new items not in DB: ${candidateUrls.length}`);
  console.log(`[ENHANCED SCRAPER] Scraping details for ${targetUrls.length} items with 20 parallel workers...`);

  const newMovies = [];
  const newSeries = [];
  let completed = 0;
  let urlIdx = 0;

  async function detailWorker() {
    while (urlIdx < targetUrls.length) {
      const u = targetUrls[urlIdx++];
      const html = await fetchHtml(u);
      if (html) {
        const item = parseDetailPage(html, u);
        if (item) {
          if (item.type === 'series') {
            newSeries.push(item);
          } else {
            newMovies.push(item);
          }
        }
      }
      completed++;
      if (completed % 25 === 0 || completed === targetUrls.length) {
        console.log(`[PROGRESS] Scraped ${completed}/${targetUrls.length} (${Math.round((completed / targetUrls.length) * 100)}%) — New Movies: ${newMovies.length}, New Series: ${newSeries.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: 20 }, () => detailWorker()));

  // Combine and deduplicate
  const combinedMovies = [...newMovies, ...existingMovies];
  const combinedSeries = [...newSeries, ...existingSeries];

  const uniqueMoviesMap = new Map();
  combinedMovies.forEach(m => {
    if (!uniqueMoviesMap.has(m.id)) uniqueMoviesMap.set(m.id, m);
  });
  const finalMovies = Array.from(uniqueMoviesMap.values());

  const uniqueSeriesMap = new Map();
  combinedSeries.forEach(s => {
    if (!uniqueSeriesMap.has(s.id)) uniqueSeriesMap.set(s.id, s);
  });
  const finalSeries = Array.from(uniqueSeriesMap.values());

  fs.writeFileSync(path.join(DATA_DIR, 'movies.json'), JSON.stringify(finalMovies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(DATA_DIR, 'series.json'), JSON.stringify(finalSeries, null, 2), 'utf-8');

  console.log(`[FINISHED] Scraping complete! Added ${newMovies.length} new movies and ${newSeries.length} new series.`);
  console.log(`[DATABASE STATS] Movies: ${finalMovies.length}, Series: ${finalSeries.length}, Total: ${finalMovies.length + finalSeries.length}`);

  // Run audit and sanitize to polish titles, genres, actors, etc.
  console.log(`[AUDIT] Running auditAndSanitize...`);
  auditAndSanitize();

  // Re-read sanitized files to ensure identical copy for APK
  const sanitizedMovies = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'movies.json'), 'utf-8'));
  const sanitizedSeries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'series.json'), 'utf-8'));

  // Copy to APK assets
  const apkDataDir = '/home/Lyric/Desktop/Filmx Apk/assets/data';
  if (fs.existsSync(apkDataDir)) {
    fs.writeFileSync(path.join(apkDataDir, 'movies.json'), JSON.stringify(sanitizedMovies, null, 2), 'utf-8');
    fs.writeFileSync(path.join(apkDataDir, 'series.json'), JSON.stringify(sanitizedSeries, null, 2), 'utf-8');
    console.log(`[SYNC] Successfully synced sanitized data to APK: ${sanitizedMovies.length} movies, ${sanitizedSeries.length} series!`);
  }
if (process.argv[1] && process.argv[1].endsWith('enhanced_scraper.js')) {
  runEnhancedScraper(900);
}
