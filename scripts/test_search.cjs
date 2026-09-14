const fs = require('fs');

const PHRASE_REPLACEMENTS = [
  [/\b(spider[- ]?man|spiderman|человек[- ]паук)\b/gi, 'orgimchak odam'],
  [/\b(iron[- ]?man|ironman|железный человек)\b/gi, 'temir odam'],
  [/\b(harry potter|гарри поттер)\b/gi, 'garri potter'],
  [/\b(avengers?|мстители)\b/gi, 'qasoskorlar'],
  [/\b(taxi|такси)\b/gi, 'taksi'],
  [/\b(captain america|первый мститель)\b/gi, 'kapitan amerika'],
  [/\b(fast (and|&) furious|форсаж)\b/gi, 'forsaj'],
  [/\b(doctor strange|доктор стрэндж)\b/gi, 'doktor strendj'],
  [/\b(john wick|джон уик)\b/gi, 'jon uik'],
  [/\b(home alone|один дома)\b/gi, 'uyda yolgiz'],
  [/\b(ant[- ]?man|человек[- ]муравей)\b/gi, 'chumoli odam'],
  [/\b(deadpool|дэдпул)\b/gi, 'dedpul'],
  [/\b(batman|бэтмен)\b/gi, 'betmen'],
  [/\b(superman|супермен)\b/gi, 'supermen'],
  [/\b(thor|тор)\b/gi, 'tor'],
  [/\b(venom|веном)\b/gi, 'venom'],
  [/\b(transformers|трансформеры)\b/gi, 'transformatorlar'],
  [/\b(lord of the rings|властелин колец)\b/gi, 'uzuklar hukumdori'],
  [/\b(pirates of the caribbean|пираты карибского моря)\b/gi, 'karib dengizi qaroqchilari'],
  [/\b(no way home|нет пути домой)\b/gi, 'uyga yol yoq'],
  [/\b(far from home|вдали от дома)\b/gi, 'uydan uzoqda'],
  [/\b(infinity war|война бесконечности)\b/gi, 'cheksizlik jangi'],
];

const SYNONYMS = {
  'endgame': ['intiho', 'yakuniy', 'финал', 'endgame'],
  'infinity': ['cheksizlik', 'бесконечности'],
  'ultron': ['altron', 'альтрон'],
  'goblet': ['olov'],
  'fire': ['olov'],
  'secrets': ['maxfiy'],
  'azkaban': ['azkaban'],
  'phoenix': ['feniks'],
  'hallows': ['ajal'],
  'stone': ['toshi', 'hikmatlar'],
  'chamber': ['xujra'],
  'prisoner': ['mahbusi'],
  'order': ['jamiyati'],
  'prince': ['shahzoda'],
  'deathly': ['ajal'],
  'garri': ['harry', 'garri', 'гарри'],
  'harry': ['garri', 'harry', 'гарри'],
  'potter': ['potter', 'поттер'],
  'qasoskorlar': ['avengers', 'qasoskorlar', 'мстители'],
  'avengers': ['qasoskorlar', 'avengers', 'мстители'],
  'avenger': ['qasoskorlar', 'avengers', 'мстители'],
  'taksi': ['taxi', 'taksi', 'такси'],
  'taxi': ['taksi', 'taxi', 'такси'],
  'orgimchak': ['spider', "o'rgimchak", 'orgimchak', 'паук'],
  'spider': ['orgimchak', "o'rgimchak", 'spider', 'паук'],
  'temir': ['iron', 'temir', 'железный'],
  'iron': ['temir', 'iron', 'железный'],
  'tor': ['thor', 'tor', 'тор'],
  'thor': ['tor', 'thor', 'тор'],
  'forsaj': ['fast', 'furious', 'forsaj', 'форсаж'],
  'furious': ['forsaj', 'fast', 'furious', 'форсаж'],
  'marvel': ['marvel', 'qasoskorlar', 'марвел'],
  'betmen': ['batman', 'betmen', 'бэтмен'],
  'batman': ['betmen', 'batman', 'бэтмен'],
  'uik': ['wick', 'uik', 'уик'],
  'wick': ['uik', 'wick', 'уик']
};

const STOP_WORDS = new Set([
  'kino', 'kinosi', 'kinolar', 'kinolari',
  'film', 'filmi', 'filmlar', 'filmlari',
  'serial', 'seriali', 'seriallar', 'seriallari',
  'multfilm', 'multfilmi', 'multfilmlar', 'multserial',
  'dorama', 'doramalar', 'barcha', 'qism', 'qismi', 'qismlar', 'qismlari',
  'uzbek', "o'zbek", 'ozbek', 'o`zbek', 'oʻzbek', 'tilida', 'tarjima',
  'hd', 'full', '1080p', '720p', 'skachat', 'onlayn', 'online', 'bepul', 'premyera',
  'part', 'season', 'the', 'of', 'and'
]);

function normalizeStr(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BB\u02BC`']/g, "'")
    .replace(/[^a-z0-9а-яё']/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsWord(text, term) {
  if (!text || !term) return false;
  if (term.length > 3) return text.includes(term);
  const words = text.split(' ');
  return words.includes(term);
}

function calculateSearchScore(item, query) {
  const normQuery = normalizeStr(query);
  if (!normQuery) return 0;

  let expandedQuery = normQuery;
  for (const [pattern, repl] of PHRASE_REPLACEMENTS) {
    expandedQuery = expandedQuery.replace(pattern, repl);
  }

  const titleNorm = normalizeStr(item.title);
  const titleNoApos = titleNorm.replace(/'/g, '');
  const rawTitleNorm = normalizeStr(item.rawTitle || '');
  const rawTitleNoApos = rawTitleNorm.replace(/'/g, '');
  const genresNorm = normalizeStr((item.genres || []).join(' '));
  const countryNorm = normalizeStr(item.country || '');
  const descNorm = normalizeStr(item.description || '');

  let score = 0;

  const rawWords = expandedQuery.split(' ').filter(Boolean);
  const meaningfulWords = rawWords.filter(w => !STOP_WORDS.has(w));
  const wordsToMatch = meaningfulWords.length > 0 ? meaningfulWords : rawWords;
  const cleanQuery = wordsToMatch.join(' ');
  const cleanQueryNoApos = cleanQuery.replace(/'/g, '');

  const testQueries = [expandedQuery, cleanQuery, normQuery].filter(Boolean);
  let fullMatched = false;

  for (const tq of testQueries) {
    const tqNoApos = tq.replace(/'/g, '');
    if (titleNorm === tq || titleNoApos === tqNoApos) {
      score += 260;
      fullMatched = true;
      break;
    } else if (titleNorm.startsWith(tq + ' ') || titleNoApos.startsWith(tqNoApos + ' ')) {
      score += 190;
      fullMatched = true;
      break;
    } else if (titleNorm.includes(tq) || titleNoApos.includes(tqNoApos)) {
      score += 130;
      fullMatched = true;
      break;
    } else if (rawTitleNorm.includes(tq) || rawTitleNoApos.includes(tqNoApos)) {
      score += 90;
      fullMatched = true;
      break;
    }
  }

  let matchedWordCount = 0;

  for (const word of wordsToMatch) {
    const wordNoApos = word.replace(/'/g, '');
    let matched = false;

    if (containsWord(titleNorm, word) || containsWord(titleNoApos, wordNoApos)) {
      score += 40;
      matched = true;
    } else if (containsWord(rawTitleNorm, word) || containsWord(rawTitleNoApos, wordNoApos)) {
      score += 25;
      matched = true;
    }

    if (!matched) {
      const syns = SYNONYMS[word] || [];
      for (const syn of syns) {
        const synNoApos = syn.replace(/'/g, '');
        if (containsWord(titleNorm, syn) || containsWord(titleNoApos, synNoApos)) {
          score += 35;
          matched = true;
          break;
        }
        if (containsWord(rawTitleNorm, syn) || containsWord(rawTitleNoApos, synNoApos)) {
          score += 20;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      if (containsWord(genresNorm, word)) {
        score += 10;
        matched = true;
      } else if (containsWord(countryNorm, word)) {
        score += 8;
        matched = true;
      } else if (descNorm.includes(word)) {
        score += 5;
        matched = true;
      }
    }

    if (matched) matchedWordCount++;
  }

  if (!fullMatched && matchedWordCount < wordsToMatch.length && matchedWordCount < Math.ceil(wordsToMatch.length * 0.7)) {
    return 0;
  }

  if (item.rating) score += Math.min(10, item.rating);
  if (item.year && item.year >= 2020) score += 2;

  return score;
}

const movies = JSON.parse(fs.readFileSync('./src/data/movies.json', 'utf8'));
const series = JSON.parse(fs.readFileSync('./src/data/series.json', 'utf8'));
const allMedia = [...movies, ...series];

const testSuite = [
  'garri potter',
  'garri potter kinosi',
  'garri potter 1',
  'harry potter',
  'harry potter 2',
  'qasoskorlar',
  'qasoskorlar filmlari',
  'avengers',
  'taksi',
  'taksi kinolari',
  'taxi',
  "o'rgimchak odam",
  'orgimchak odam 1',
  'spiderman',
  'spider-man 1',
  'iron man',
  'iron man 1',
  'marvel'
];

console.log('Running Search Test Suite (' + testSuite.length + ' queries)...');
testSuite.forEach(q => {
  const top = allMedia
    .map(m => ({ title: m.title, score: calculateSearchScore(m, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  console.log(`[${q}] -> ` + top.map(x => `${x.title} (${x.score.toFixed(1)})`).join(' | '));
});
