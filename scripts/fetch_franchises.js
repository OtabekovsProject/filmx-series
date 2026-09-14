import * as cheerio from 'cheerio';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const BASE_URL = 'https://asilmedia.org';

async function fetchHtml(url) {
  try {
    const cmd = `curl -sL --compressed -m 18 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Accept-Language: uz-UZ,uz;q=0.9,en-US;q=0.8,ru;q=0.7" "${url}"`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 15 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    return null;
  }
}

// Search asilmedia and return detail page URLs
export async function searchAsilmedia(query) {
  const encoded = encodeURIComponent(query);
  const searchUrl = `${BASE_URL}/?do=search&subaction=search&story=${encoded}`;
  const html = await fetchHtml(searchUrl);
  if (!html) return [];

  const $ = cheerio.load(html);
  const urls = new Set();

  $('a[href*=".html"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
    if (
      fullUrl.includes('asilmedia.org/') &&
      /\/\d+-[a-zA-Z0-9_-]+\.html$/.test(fullUrl) &&
      !fullUrl.includes('/rules') &&
      !fullUrl.includes('/user/')
    ) {
      urls.add(fullUrl);
    }
  });

  return Array.from(urls);
}

// Clean title into pure brand name
function cleanMovieTitle(raw) {
  let title = raw
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\b(uzbek|o'zbek|ozbek|tilida|tarjima|kino|film|premyera|full|hd|tas-ix|skachat|download|barcha qismlar|kinoteatr|tv|dublyaj)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Clean trailing dash or slash
  title = title.replace(/[\/\-_:]+$/, '').trim();
  return title || raw;
}

// Extract movie details
export function parseAsilmediaPage(html, url) {
  if (!html) return null;
  const $ = cheerio.load(html);

  const rawTitle = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
  if (!rawTitle) return null;

  const title = cleanMovieTitle(rawTitle);

  // Poster
  let poster = $('img[src*="/uploads/mini/fullstory/"], img[src*="/uploads/mini/banner/"], .fs-poster img, .short-story img').first().attr('src') || '';
  if (!poster) {
    poster = $('img[src*="/uploads/mini/"]').first().attr('src') || '';
  }
  if (poster && !poster.startsWith('http')) {
    poster = `${BASE_URL}${poster.startsWith('/') ? '' : '/'}${poster}`;
  }

  // Year
  let year = 2022;
  const yearText = $('span.fs-meta__value[itemprop="dateCreated"], a[href*="/year/"]').first().text().trim();
  const yearMatch = (yearText || '').match(/\b(19\d\d|20\d\d)\b/) || rawTitle.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // Country
  let country = 'AQSH';
  const countryRaw = $('a[href*="/world/"], .fs-meta__item:contains("Mamlakat") .fs-meta__value').first().text().trim();
  if (countryRaw) {
    if (countryRaw.toLowerCase().includes('angliya') || countryRaw.toLowerCase().includes('britaniya')) country = 'Buyuk Britaniya';
    else if (countryRaw.toLowerCase().includes('frans')) country = 'Fransiya';
    else if (countryRaw.toLowerCase().includes('aqsh') || countryRaw.toLowerCase().includes('amerika')) country = 'AQSH';
    else if (countryRaw.toLowerCase().includes('korey')) country = 'Janubiy Koreya';
    else if (countryRaw.toLowerCase().includes('hind')) country = 'Hindiston';
    else country = countryRaw;
  }

  // Genres
  const genres = [];
  $('span.fs-meta__value[itemprop="genre"] a, a[href*="/genre/"]').each((_, a) => {
    const gText = $(a).text().trim();
    if (gText && !genres.includes(gText)) genres.push(gText);
  });

  // Description
  let description = $('meta[name="description"]').attr('content') ||
                    $('.fs-desc, .full-text, .fs-story, #fs-desc').text().trim() ||
                    'Ushbu asarda ajoyib voqealar va hayajonli sarguzashtlar aks etgan.';
  description = description.replace(/asilmedia/gi, 'FilmX').replace(/\s+/g, ' ').trim();

  // Rating
  let rating = 8.5;
  const ratingText = $('.fs-rating, .rating-num, [itemprop="ratingValue"]').first().text().trim();
  const parsedRating = parseFloat(ratingText);
  if (!isNaN(parsedRating) && parsedRating > 0) {
    rating = parsedRating <= 1 ? +(parsedRating * 10).toFixed(1) : +parsedRating.toFixed(1);
    if (rating < 6) rating = 8.2;
  }

  // Stream links collection
  const streamLinks = [];

  // Priority 1: tabs with data-url
  $('.fs-player__tab[data-url], button[data-url]').each((_, el) => {
    const dUrl = $(el).attr('data-url');
    const name = $(el).attr('data-name') || $(el).text().trim();
    if (dUrl && (dUrl.includes('.mp4') || dUrl.includes('fayllar'))) {
      streamLinks.push({ url: dUrl, label: name });
    }
  });

  // Priority 2: fs-download__item
  $('a.fs-download__item, a[href*="fayllar1.ru"]').each((_, el) => {
    const href = $(el).attr('href');
    const label = $(el).text().trim();
    if (href && (href.includes('.mp4') || href.includes('fayllar'))) {
      streamLinks.push({ url: href, label });
    }
  });

  // Priority 3: iframe src
  $('iframe[data-player-src], iframe[src*=".mp4"]').each((_, el) => {
    const src = $(el).attr('data-player-src') || $(el).attr('src');
    if (src && (src.includes('.mp4') || src.includes('fayllar'))) {
      streamLinks.push({ url: src, label: '1080p' });
    }
  });

  // Priority 4: episodes raw data
  $('#episodes-raw-data a').each((_, el) => {
    let href = $(el).attr('href');
    const label = $(el).attr('data-label') || $(el).text().trim();
    if (href) {
      href = href.replace(/^http:\/\/83\.69\.139\.204\/hdd\d+\//i, 'https://fayllar1.ru/15/');
      streamLinks.push({ url: href, label });
    }
  });

  // Find best video url
  let bestVideoUrl = '';
  const link1080 = streamLinks.find(l => (l.label || '').includes('1080') || (l.url || '').includes('1080'));
  const link720 = streamLinks.find(l => (l.label || '').includes('720') || (l.url || '').includes('720'));
  const link480 = streamLinks.find(l => (l.label || '').includes('480') || (l.url || '').includes('480'));

  if (link1080) bestVideoUrl = link1080.url;
  else if (link720) bestVideoUrl = link720.url;
  else if (link480) bestVideoUrl = link480.url;
  else if (streamLinks.length > 0) bestVideoUrl = streamLinks[0].url;

  // Optimize subdomain for 0s lag
  if (bestVideoUrl.startsWith('https://fayllar1.ru/')) {
    bestVideoUrl = bestVideoUrl.replace(/^https?:\/\/fayllar1\.ru\/(\d+)\//i, 'https://$1.fayllar1.ru/$1/');
  }

  const id = path.basename(url, '.html');

  return {
    id,
    type: 'movie',
    title,
    rawTitle,
    url,
    poster: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    backdrop: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    year,
    country,
    genres: genres.length ? genres : ['Jangari', 'Fantastika', 'Sarguzasht'],
    rating,
    description: description.slice(0, 350),
    quality: link1080 ? '1080p Full HD' : (link720 ? '720p HD' : 'Full HD'),
    videoUrl: bestVideoUrl,
    views: Math.floor(45000 + Math.random() * 95000),
  };
}
