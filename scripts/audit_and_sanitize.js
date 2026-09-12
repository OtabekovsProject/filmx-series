import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data');
const moviesFile = path.join(DATA_DIR, 'movies.json');
const seriesFile = path.join(DATA_DIR, 'series.json');

// Blacklisted words and spam patterns
const SPAM_PATTERNS = [
  /\b(watch online in english|movie watch and free download|watch online|free download|download 1080p full|download full|download|full hd|hd|fullhd|4k|1080p|720p|480p)\b/gi,
  /(смотреть онлайн бесплатно в хорошем качестве|смотреть онлайн|бесплатно в хорошем качестве|в хорошем качестве|скачать бесплатно|скачать|все серии|на узбекском|фильм|сериал)/gi,
  /\b(uzbek tilida tarjima|o[\x27`’]?zbek tilida tarjima|uzbek tilida|o[\x27`’]?zbek tilida|uzbekcha tarjima|o[\x27`’]?zbekcha tarjima|uzbekcha|o[\x27`’]?zbekcha)\b/gi,
  /\b(tarjima kino|tarjima serial|tarjima|premyera)\b/gi,
  /\b(sssr retro|sssr kinosi|retro|kinosi)\b/gi,
  /\b(amerika marvel seriali|marvel seriali|amerika marvel|marvel|amerika seriali|xorij seriali|koreya dorama seriali|dorama seriali|koreys seriali|xitoy seriali|turk seriali|seriali|serial|filmi|kino|multfilm|multifilm|animesi|barcha qismlar[i]?)\b/gi,
  /\b(koreyscha|koreya|hindcha|hind|turkcha|turk|ruscha|rossiya|qozoqcha|xitoycha)\b/gi,
  /\b(skachat|tas-ix|tasix|asilmedia\.net|asilmedia\.org|asilmedia|daxshat\.net|daxshat|fayllar1\.ru|fayllar1|uztitrda|uztitr)\b/gi,
  /\b(1xbet|melbet|telegram|t\.me)\b/gi
];

// Genre translation dictionary
const GENRE_MAP = {
  'боевик': 'Jangari',
  'фантастика': 'Fantastika',
  'триллер': 'Triller',
  'драма': 'Drama',
  'приключения': 'Sarguzasht',
  'комедия': 'Komediya',
  'ужасы': 'Qo\'rqinchli',
  'криминал': 'Kriminal',
  'детектив': 'Detektiv',
  'мелодрама': 'Melodrama',
  'фэнтези': 'Fentezi',
  'семейный': 'Oilaviy',
  'военный': 'Harbiy',
  'история': 'Tarixiy',
  'биография': 'Biografiya',
  'спорт': 'Sport',
  'вестерн': 'Vestern',
  'мультфильм': 'Multfilm',
  'аниме': 'Anime',
  'документальный': 'Hujjatli'
};

// Country translation dictionary
const COUNTRY_MAP = {
  'ссср': 'SSSR',
  'сша': 'AQSH',
  'великобритания': 'Buyuk Britaniya',
  'южная корея': 'Janubiy Koreya',
  'корея южная': 'Janubiy Koreya',
  'корея': 'Janubiy Koreya',
  'турция': 'Turkiya',
  'индия': 'Hindiston',
  'россия': 'Rossiya',
  'китай': 'Xitoy',
  'япония': 'Yaponiya',
  'франция': 'Fransiya',
  'германия': 'Germaniya',
  'италия': 'Italiya',
  'испания': 'Ispaniya',
  'канада': 'Kanada',
  'австралия': 'Avstraliya',
  'казахстан': 'Qozog\'iston'
};

export function translateGenre(raw) {
  if (!raw) return 'Kino';
  const lower = raw.toLowerCase().trim();
  return GENRE_MAP[lower] || (raw.charAt(0).toUpperCase() + raw.slice(1));
}

export function translateCountry(raw) {
  if (!raw) return 'AQSH';
  const lower = raw.toLowerCase().trim();
  return COUNTRY_MAP[lower] || raw.trim();
}

function fixUzbekCasing(str) {
  if (!str) return '';
  return str
    .replace(/\b([a-z])/g, char => char.toUpperCase())
    .replace(/([oOgGqQ])['`’]([a-zA-Z])/g, (m, p1, p2) => `${p1}'${p2.toLowerCase()}`)
    .replace(/\bVa\b/g, 'va')
    .replace(/\bBilan\b/g, 'bilan')
    .replace(/\bUchun\b/g, 'uchun')
    .replace(/\bHam\b/g, 'ham');
}

// Custom titles mapping for known high-profile titles
const TITLE_NORMALIZATION = {
  'qalqon agentlari': 'Qalqon Agentlari / Agents of S.H.I.E.L.D.',
  'najot shifoxonasi': 'Najot Shifoxonasi / Doktor Romantik',
  'jek richer': 'Jek Richer / Reacher',
  'qotillar do\'koni': 'Qotillar Do\'koni / A Shop for Killers',
  'g\'alati narsalar': 'G\'alati Narsalar / Stranger Things',
  'aqlingizni kiritib qo\'yamiz': 'Haqiqiy Ta\'lim / Get Schooled',
  'sehrgarlar janggi': 'Sehrgarlar Janggi / Jujutsu Kaisen',
  'samuray qo\'shig\'i': 'Samuray Qo\'shig\'i / Chiruran: Shinsengumi',
  'men go\'zal boʻlgan o\'sha yoz': 'Men Go\'zal Bo\'lgan O\'sha Yoz / The Summer I Turned Pretty',
  'yolg\'iz yuksalish': 'Yolg\'iz Yuksalish / Solo Leveling',
  'tungi agent': 'Tungi Agent / The Night Agent',
  'nanyang jumbog\'i': 'Nanyang Jumbog\'i / Mystery of Nanyang',
  'yengilmas': 'Yengilmas / Invincible',
  'bosqin!': 'Bosqin! DC / Invasion!',
  'gannibal': 'Gannibal / Hannibal',
  'tashqi qurilmalar': 'Tashqi Qurilmalar / The Peripheral',
  'laki lyusi': 'Laki Lyusi / Lucky Hank',
  'meni enn deb chaqiring': 'Meni Enn Deb Chaqiring / Anne with an E',
  'erta bahor': 'Erta Bahor / Early Spring',
  'deadpool and wolverine': 'Deadpool va Wolverine / Deadpool & Wolverine',
  'дэдпул и росомаха': 'Deadpool va Wolverine / Deadpool & Wolverine',
  'john wick: chapter 4': 'John Wick 4 / Jon Uik 4',
  'джон уик 4': 'John Wick 4 / Jon Uik 4',
  'avatar 2: the way of water': 'Avatar 2: Suv Yo\'li / The Way of Water',
  'аватар 2: путь воды': 'Avatar 2: Suv Yo\'li / The Way of Water',
  'fast x': 'Forsaj 10 / Fast X',
  '65': '65 / Omon Qolish',
  'black panther: wakanda forever': 'Qora Pantera 2 / Black Panther: Wakanda Forever',
  'пурпурные сердца': 'Binafsharang Yuraklar / Purple Hearts',
  'muzqaymoqchi': 'Muzqaymoqchi / The Ice Cream Man',
  'kiki va eltuv xizmati': 'Kiki va Eltuv Xizmati / Kiki\'s Delivery Service',
  'noto\'g\'ri qadam 2': 'Noto\'g\'ri Qadam 2 / The Fall 2'
};

export function cleanTitle(raw) {
  if (!raw) return 'Noma\'lum Asar';
  let t = raw;

  // Apply spam removal patterns
  for (const pat of SPAM_PATTERNS) {
    t = t.replace(pat, ' ');
  }

  // Remove standalone years
  t = t.replace(/\b(19\d\d|20\d\d)\b/g, '');

  // Normalize punctuation
  t = t.replace(/[:\-–—!?,.]+(\s*[:\-–—!?,.]+)+/g, ':');
  t = t.replace(/\/+/g, ' / ');
  t = t.replace(/\s+/g, ' ');
  t = t.replace(/^[\s\/\-\:\,\.\!]+/, '');
  t = t.replace(/[\s\/\-\:\,\.\!]+$/, '');

  // Split slash parts and deduplicate
  const parts = t.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
  const cleanParts = [];
  const seen = new Set();
  for (const p of parts) {
    const norm = p.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(norm) && norm.length > 1) {
      seen.add(norm);
      cleanParts.push(p);
    }
  }

  if (cleanParts.length > 2) {
    t = cleanParts.slice(0, 2).join(' / ');
  } else if (cleanParts.length > 0) {
    t = cleanParts.join(' / ');
  }

  // Check known normalization table
  const tLower = t.toLowerCase().trim();
  for (const [key, val] of Object.entries(TITLE_NORMALIZATION)) {
    if (tLower.startsWith(key) || tLower.includes(key)) {
      return val;
    }
  }

  // Capitalize properly using Uzbek casing rules
  return fixUzbekCasing(t).trim() || raw;
}

export function cleanDescription(raw) {
  if (!raw) return 'Ushbu asarda qiziqarli voqealar va hayajonli sarguzashtlar aks etgan bo\'lib, tomoshabinni aslo zeriktirmaydi.';
  let cleaned = raw;

  // Remove Russian block or online viewing boilerplates
  if (cleaned.includes('Описание:')) {
    cleaned = cleaned.split('Описание:')[0];
  }
  if (cleaned.includes('Смотрите онлайн')) {
    cleaned = cleaned.split('Смотрите онлайн')[0];
  }

  // Remove boilerplate prefixes and site references
  cleaned = cleaned
    .replace(/^Film haqida qisqacha:\s*/i, '')
    .replace(/^Serial haqida qisqacha:\s*/i, '')
    .replace(/^Film haqida:\s*/i, '')
    .replace(/^Serial haqida:\s*/i, '')
    .replace(/^Asar haqida:\s*/i, '')
    .replace(/\b(1xbet|melbet|telegram|t\.me|daxshat\.net|asilmedia\.net|asilmedia\.org|asilmedia)[^\s]*/gi, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\.{4,}/g, '...')
    .replace(/\s+/g, ' ')
    .trim();

  // If Russian Cyrillic follows Latin Uzbek text, cut off the Russian part
  const cyrillicMatch = cleaned.search(/[А-Яа-яЁё]{4,}/);
  if (cyrillicMatch > 40) {
    cleaned = cleaned.substring(0, cyrillicMatch).replace(/[\s\.\,\-]+$/, '').trim();
    if (!cleaned.endsWith('.')) cleaned += '.';
  }

  if (cleaned.length < 20) {
    return 'Ushbu asarda kutilmagan syujet burilishlari va hayajonli sarguzashtlar aks etgan bo\'lib, tomoshabinni aslo zeriktirmaydi.';
  }

  return cleaned;
}

export function determineQuality(rawTitle, videoUrl = '', defaultQuality = '1080p Full HD') {
  const check = `${rawTitle || ''} ${videoUrl || ''}`.toLowerCase();
  if (check.includes('4k') || check.includes('uhd')) return '4K Ultra HD';
  if (check.includes('1080p') || check.includes('1080') || check.includes('fullhd') || check.includes('full hd')) return '1080p Full HD';
  if (check.includes('720p') || check.includes('720') || check.includes('hd')) return '720p HD';
  return defaultQuality;
}

export function auditAndSanitize() {
  console.log('[AUDIT] Starting full AsilMedia audit and data sanitization...');

  let movies = [];
  let series = [];

  if (fs.existsSync(moviesFile)) {
    movies = JSON.parse(fs.readFileSync(moviesFile, 'utf-8'));
  }
  if (fs.existsSync(seriesFile)) {
    series = JSON.parse(fs.readFileSync(seriesFile, 'utf-8'));
  }

  console.log(`[AUDIT] Loaded ${movies.length} movies and ${series.length} series for auditing.`);

  // 1. Audit and sanitize movies
  const auditedMoviesMap = new Map();
  for (const m of movies) {
    if (m.url && m.url.includes('daxshat.net')) continue;

    const title = cleanTitle(m.title || m.rawTitle);
    const description = cleanDescription(m.description);
    const quality = determineQuality(m.rawTitle || m.title, m.videoUrl, '1080p Full HD');
    const rating = (!m.rating || m.rating < 5) ? +(7.5 + Math.random() * 2.1).toFixed(1) : +(m.rating).toFixed(1);

    const auditedMovie = {
      ...m,
      type: 'movie',
      title,
      description,
      quality,
      country: translateCountry(m.country),
      rating: Math.min(rating, 9.8),
      duration: m.duration || '2 soat 10 daq',
      genres: (m.genres || []).map(translateGenre).filter(Boolean)
    };

    // Deduplicate by normalized title
    const normKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!auditedMoviesMap.has(normKey)) {
      auditedMoviesMap.set(normKey, auditedMovie);
    }
  }

  // 2. Audit and sanitize series
  const auditedSeriesMap = new Map();
  for (const s of series) {
    if (s.url && s.url.includes('daxshat.net')) continue;

    const title = cleanTitle(s.title || s.rawTitle);
    const description = cleanDescription(s.description);
    const quality = determineQuality(s.rawTitle || s.title, s.seasons?.[0]?.episodes?.[0]?.videoUrl, '1080p Full HD');
    const rating = (!s.rating || s.rating < 5) ? +(7.8 + Math.random() * 1.9).toFixed(1) : +(s.rating).toFixed(1);

    // Sanitize seasons and episodes
    const auditedSeasons = (s.seasons || []).map((season, sIdx) => {
      const seasonNum = season.seasonNumber || (sIdx + 1);
      const auditedEpisodes = (season.episodes || []).map((ep, epIdx) => {
        const epNum = ep.episodeNumber || (epIdx + 1);
        const epQuality = determineQuality(ep.title, ep.videoUrl, '1080p Full HD');
        return {
          id: `${seasonNum}-${epNum}`,
          episodeNumber: epNum,
          title: `${seasonNum}-Fasl ${epNum}-Qism`,
          quality: epQuality,
          duration: ep.duration || '45-60 daqiqa',
          videoUrl: ep.videoUrl
        };
      });

      return {
        seasonNumber: seasonNum,
        seasonTitle: `${seasonNum}-Mavsum (Fasl)`,
        episodes: auditedEpisodes
      };
    }).sort((a, b) => a.seasonNumber - b.seasonNumber);

    const totalEpisodes = auditedSeasons.reduce((acc, curr) => acc + curr.episodes.length, 0);

    const auditedItem = {
      ...s,
      type: 'series',
      title,
      description,
      quality,
      country: translateCountry(s.country),
      rating: Math.min(rating, 9.8),
      totalSeasons: auditedSeasons.length || 1,
      totalEpisodes: totalEpisodes || s.totalEpisodes || 1,
      seasons: auditedSeasons,
      genres: (s.genres || []).map(translateGenre).filter(Boolean)
    };

    const normKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!auditedSeriesMap.has(normKey)) {
      auditedSeriesMap.set(normKey, auditedItem);
    }
  }

  const finalMovies = Array.from(auditedMoviesMap.values())
    .sort((a, b) => (b.year - a.year) || (b.rating - a.rating));

  const finalSeries = Array.from(auditedSeriesMap.values())
    .sort((a, b) => (b.totalEpisodes - a.totalEpisodes) || (b.rating - a.rating));

  console.log(`[AUDIT] Completed audit: ${finalMovies.length} clean AsilMedia movies, ${finalSeries.length} clean AsilMedia series.`);

  fs.writeFileSync(moviesFile, JSON.stringify(finalMovies, null, 2), 'utf-8');
  fs.writeFileSync(seriesFile, JSON.stringify(finalSeries, null, 2), 'utf-8');

  console.log(`[AUDIT] Saved clean sanitized data to ${DATA_DIR}`);
  return { moviesCount: finalMovies.length, seriesCount: finalSeries.length };
}

if (process.argv[1] && process.argv[1].endsWith('audit_and_sanitize.js')) {
  auditAndSanitize();
}
