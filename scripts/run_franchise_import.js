import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchAsilmedia, parseAsilmediaPage } from './fetch_franchises.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchHtml(url) {
  try {
    const cmd = `curl -sL --compressed -m 18 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Accept-Language: uz-UZ,uz;q=0.9,en-US;q=0.8,ru;q=0.7" "${url}"`;
    const { stdout } = await execAsync(cmd, { maxBuffer: 15 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    return null;
  }
}

const SEARCH_QUERIES = [
  // Garri Potter
  'Garri Potter',
  'Harry Potter',
  'Jodu saltanati',
  // Taksi
  'Taksi',
  'Taxi',
  // Marvel & Avengers
  'Qasoskorlar',
  'Mstiteli',
  'Avengers',
  'Tor',
  'Thor',
  // Spider-Man
  'Orgimchak odam',
  'chelovek pauk',
  'spider-man',
  // MCU core heroes
  'Temir odam',
  'Kapitan Amerika',
  'Birinchi qasoskor',
  'Doktor Strenj',
  'Doctor Strange',
  'Qora Pantera',
  'Galaktika qoriqchilari',
  'Dedpul',
  'Deadpool',
  'Venom',
  'Chumoli odam'
];

// Direct known high-priority URLs to ensure 100% coverage
const PRIORITY_DIRECT_URLS = [
  // Garri Potter 1-8
  'https://asilmedia.org/9060-garri-potter-1-hikmatlar-toshi-uzbek-tarjima-2001-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9061-garri-potter-2-maxfiy-xujra-uzbek-tarjima-2002-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9062-garri-potter-3-azkaban-mahbusi-uzbek-tarjima-2004-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9063-garri-potter-4-alanga-kubogi-uzbek-tarjima-2005-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9064-garri-potter-5-feniks-jamiyati-uzbek-tarjima-2007-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9065-garri-potter-6-tilsim-shahzodasi-uzbek-tarjima-2009-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9066-garri-potter-7-ajal-tuhfasi-1-uzbek-tarjima-2010-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9067-garri-potter-8-ajal-tuhfasi-2-uzbek-tarjima-2011-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/13628-garri-potterning-20-yilligi-xogvartsga-qaytish-garri-potter-9-uzbekcha-subtitrda-2022-ozbekcha-tarjima-kino-hd.html',
  'https://asilmedia.org/8226-jodu-saltanati-1-fantasticheskie-tvari-i-gde-oni-obitayut-uzbek-ozbek-tilida-tas-ix-skachat-download.html',

  // Taksi 1-5
  'https://asilmedia.org/11126-taksi-1-taxi-1-uzbek-tilida-1998-ozbekcha-tarjima-kino-hd.html',
  'https://asilmedia.org/11127-taksi-2-taxi-2-uzbek-tilida-2000-ozbekcha-tarjima-kino-hd.html',
  'https://asilmedia.org/11136-taksi-3-taxi-3-uzbek-tilida-2003-ozbekcha-tarjima-kino-hd.html',
  'https://asilmedia.org/11463-taksi-4-taxi-4-uzbek-tilida-2007-ozbekcha-tarjima-kino-hd.html',
  'https://asilmedia.org/7346-taksi-5-uzbek-ozbek-tilida-tas-ix-skachat-download.html',

  // Qasoskorlar (Avengers)
  'https://asilmedia.org/8366-qasoskorlar-1-mstiteli-1-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8370-qasoskorlar-2-altron-davri-mstiteli-era-altrona-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8842-qasosorlar-cheksizlik-jangi-mstitel-voyna-beskonechnosti-uzbek-tarjima-2018-hd-ozbek-tilida-tas-ix-skachat.html',
  'https://asilmedia.org/9075-qasoskorlar-4-yakuniy-jang-4k-uzbek-tilida-2019-ozbek-tarjima-tas-ix-skachat.html',
  'https://asilmedia.org/8978-qasoskorlar-4-intiho-uzbek-tilida-2019-hd-ozbek-tarjima-tas-ix-skachat.html',

  // Tor (Thor) 1-4
  'https://asilmedia.org/8364-tor-1-tor-1-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8368-tor-2-tor-2-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8560-tor-3-ragnaryok-tor-ragnarek-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/9607-tor-4-mhabbat-otashi-2021-tor-lyubov-i-grom-thor-love-and-thunder-2021-tas-ix-skachat.html',

  // Temir odam (Iron Man) 1-3
  'https://asilmedia.org/8200-temir-odam-1-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8348-temir-odam-2-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8367-temir-odam-3-zheleznyy-chelovek-3-uzbek-ozbek-tilida-tas-ix-skachat-download.html',

  // Kapitan Amerika 1-4
  'https://asilmedia.org/8365-birinchi-qasoskor-1-pervyy-mstitel-1-2011-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8369-birinchi-qasoskor-2-kapitan-amerika-2-pervyy-mstitel-2-2011-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/8559-birinchi-qasoskor-3-kapitan-amerika-3-pervyy-mstitel-3-protivostoyanie-2011-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/16813-kapitan-amerika-yangi-dunyo-uzbek-tilida-2025-ozbekcha-tarjima-kino-full-hd-tas-ix-skachat.html',

  // O'rgimchak odam (Spider-Man)
  'https://asilmedia.org/8854-orgimchak-odam-1-uzbek-tarjima-hd-2019-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/7020-orgimchak-odam-2-ozbek-tilida-tas-ix.html',
  'https://asilmedia.org/8379-orgimchak-odam-uydan-uzoqda-chelovek-pauk-vdali-ot-doma-uzbek-ozbek-tilida-tas-ix-skachat-download.html',

  // Doktor Strendj & Boshqa Marvel
  'https://asilmedia.org/7434-doktor-strenj-uzbek-ozbek-tilida-tas-ix-skachat-download.html',
  'https://asilmedia.org/14173-doktor-strjendzh-2-v-multivselennoj-bezumija-film-2022-smotret-onlajn-besplatno-v-horoshem-kachestve.html',
  'https://asilmedia.org/17099-momaqaldiroqlar-premyera-marvel-filmi-uzbek-tilida-2025-ozbekcha-tarjima-kino-full-hd-tas-ix-skachat.html',
  'https://asilmedia.org/17305-temir-yurak-temir-ayol-metal-qiz-2025-uzbek-tilida-ozbekcha-tarjima-kino-full-hd-tas-ix-skachat.html',
];

async function main() {
  console.log('🚀 Starting deep franchise collection from Asilmedia...');

  const allUrls = new Set(PRIORITY_DIRECT_URLS);

  for (const q of SEARCH_QUERIES) {
    try {
      const urls = await searchAsilmedia(q);
      urls.forEach(u => allUrls.add(u));
    } catch (e) {
      console.warn(`Search error for ${q}:`, e.message);
    }
  }

  console.log(`Total URLs to process: ${allUrls.size}`);

  const webMoviesPath = path.join(__dirname, '../src/data/movies.json');
  const apkMoviesPath = '/home/Lyric/Desktop/Filmx Apk/assets/data/movies.json';

  const existingMovies = JSON.parse(fs.readFileSync(webMoviesPath, 'utf8'));
  const existingIdSet = new Set(existingMovies.map(m => m.id));
  const existingTitleSet = new Set(existingMovies.map(m => (m.title || '').toLowerCase().trim()));

  console.log(`Currently in database: ${existingMovies.length} movies.`);

  const newMovies = [];
  let counter = 0;

  for (const url of Array.from(allUrls)) {
    counter++;
    const id = path.basename(url, '.html');
    if (existingIdSet.has(id)) {
      continue;
    }

    const html = await fetchHtml(url);
    if (!html) continue;

    const movie = parseAsilmediaPage(html, url);
    if (!movie || !movie.videoUrl || !movie.title) {
      continue;
    }

    // Check franchise relevance
    const text = (movie.title + ' ' + (movie.rawTitle || '') + ' ' + movie.id).toLowerCase();
    const isTargetFranchise =
      text.includes('garri potter') ||
      text.includes('harry potter') ||
      text.includes('jodu saltanati') ||
      text.includes('taksi') ||
      text.includes('taxi') ||
      text.includes('qasoskor') ||
      text.includes('mstitel') ||
      text.includes('avengers') ||
      text.includes('tor') ||
      text.includes('thor') ||
      text.includes('temir odam') ||
      text.includes('iron man') ||
      text.includes('kapitan amerika') ||
      text.includes('birinchi qasoskor') ||
      text.includes('strenj') ||
      text.includes('strange') ||
      text.includes('orgimchak') ||
      text.includes('o\'rgimchak') ||
      text.includes('pauk') ||
      text.includes('pantera') ||
      text.includes('galaktika') ||
      text.includes('dedpul') ||
      text.includes('deadpool') ||
      text.includes('venom') ||
      text.includes('chumoli') ||
      text.includes('marvel');

    if (!isTargetFranchise) continue;

    const normTitle = movie.title.toLowerCase().trim();
    if (existingTitleSet.has(normTitle)) {
      continue;
    }

    existingIdSet.add(movie.id);
    existingTitleSet.add(normTitle);
    newMovies.push(movie);
    console.log(`[${newMovies.length}] ✅ Added: (${movie.year}) ${movie.title} [${movie.quality}]`);
  }

  console.log(`\n🎉 Extracted ${newMovies.length} new franchise movies!`);

  if (newMovies.length > 0) {
    const combined = [...newMovies, ...existingMovies];

    fs.writeFileSync(webMoviesPath, JSON.stringify(combined, null, 2), 'utf8');
    console.log(`✅ Web movies.json updated: ${combined.length} items`);

    if (fs.existsSync(path.dirname(apkMoviesPath))) {
      fs.writeFileSync(apkMoviesPath, JSON.stringify(combined, null, 2), 'utf8');
      console.log(`✅ APK movies.json updated: ${combined.length} items`);
    }
  }
}

main().catch(console.error);
