import { Movie, Series, MediaItem } from '@/types';
import fs from 'fs';
import path from 'path';

// Initial curated fallback data with accurate series & episodes in case scraper is still running or offline
const FALLBACK_MOVIES: Movie[] = [
  {
    id: 'singam-3',
    type: 'movie',
    title: 'Singam 3',
    rawTitle: 'Singam 3 2024 Hind kino HD Uzbek tilida',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    year: 2024,
    country: 'Hindiston',
    genres: ['Jangari', 'Drama', 'Triller'],
    actors: ['Sallman Xon', 'Karina Kapur', 'Dipika Padukone', 'Akshay Kumar'],
    rating: 8.4,
    duration: '2 soat 24 daq',
    description: 'Jasur komissar Singam bu safar xalqaro jinoyat sindikatiga qarshi eng xavfli missiyani boshlaydi. Adolat va burch yo\'lida uning oldida hech qanday to\'siq tura olmaydi.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'forsaj-olga',
    type: 'movie',
    title: 'Forsaj: Olg\'a',
    rawTitle: 'Forsaj : Olg\'a 2024 HD Uzbek tilida Tarjima kino',
    poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop',
    year: 2024,
    country: 'AQSH',
    genres: ['Jangari', 'Poyga', 'Kriminal'],
    actors: ['Vin Dizel', 'Mishel Rodriges', 'Jeyson Steytem'],
    rating: 8.8,
    duration: '2 soat 18 daq',
    description: 'Eng tezkor avtomobillar, xavfli poygalar va oilani qutqarish yo\'lidagi shiddatli to\'qnashuvlar. Yangi dushman dunyoni ostin-ustun qilishga urinmoqda.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'interstellar',
    type: 'movie',
    title: 'Interstellar / Yulduzlararo',
    rawTitle: 'Interstellar 2014 HD Uzbek tilida Tarjima kino',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop',
    year: 2014,
    country: 'AQSH, Buyuk Britaniya',
    genres: ['Fantastika', 'Drama', 'Sarguzasht'],
    actors: ['Mettyu Makkonahi', 'Enn Heteuey', 'Jeskika Chesteyn'],
    rating: 9.6,
    duration: '2 soat 49 daq',
    description: 'Insoniyat yo\'qolib ketish xavfi ostida qolgan paytda, bir guruh tadqiqotchilar galaktikalararo tuynuk orqali yangi yashash sayyorasini izlashga otlanadilar.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'chegarasizlar-4',
    type: 'movie',
    title: 'Chegarasizlar 4 (Expendables)',
    rawTitle: 'Chegarasizlar 4 / Yengilmas Jamoa 4 HD Uzbek tilida',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop',
    year: 2023,
    country: 'AQSH',
    genres: ['Jangari', 'Triller', 'Sarguzasht'],
    actors: ['Silvestr Stallone', 'Jeyson Steytem', '50 Cent', 'Megan Foks'],
    rating: 7.8,
    duration: '1 soat 43 daq',
    description: 'Tajribali maxsus bo\'linma a\'zolari yadroviy tahdidga qarshi eng qaltis amaliyotni bajarishga kirishadilar.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  }
];

const FALLBACK_SERIES: Series[] = [
  {
    id: 'taxtlar-oyini',
    type: 'series',
    title: 'Taxtlar O\'yini (Game of Thrones)',
    rawTitle: 'Taxtlar O\'yini Aqsh Seriali Barcha Qismlar Uzbek tilida',
    poster: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    year: 2011,
    country: 'AQSH, Buyuk Britaniya',
    genres: ['Fentezi', 'Drama', 'Jangari'],
    actors: ['Piter Dinkleydj', 'Emiliya Klark', 'Kit Xarington', 'Lena Xidi'],
    rating: 9.8,
    description: 'Vesteros qit\'asining Temir Taxti uchun yettita shohlik o\'rtasidagi shafqatsiz kurash va Shimoldan kelayotgan sirli xavf.',
    totalSeasons: 8,
    totalEpisodes: 73,
    seasons: [
      {
        seasonNumber: 1,
        seasonTitle: '1-Mavsum (Fasl)',
        episodes: [
          {
            id: '1-1',
            episodeNumber: 1,
            title: '1-Fasl 1-Qism: Qish yaqinlashmoqda',
            duration: '61 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          {
            id: '1-2',
            episodeNumber: 2,
            title: '1-Fasl 2-Qism: Qirollik yo\'li',
            duration: '55 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          },
          {
            id: '1-3',
            episodeNumber: 3,
            title: '1-Fasl 3-Qism: Lord Snou',
            duration: '57 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: '1-4',
            episodeNumber: 4,
            title: '1-Fasl 4-Qism: Mayiblar va nomaqbullar',
            duration: '56 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: '1-5',
            episodeNumber: 5,
            title: '1-Fasl 5-Qism: Bo\'ri va Arslon',
            duration: '54 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: '1-6',
            episodeNumber: 6,
            title: '1-Fasl 6-Qism: Oltin toj',
            duration: '53 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          },
          {
            id: '1-7',
            episodeNumber: 7,
            title: '1-Fasl 7-Qism: G\'alaba yoki o\'lim',
            duration: '58 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          },
          {
            id: '1-8',
            episodeNumber: 8,
            title: '1-Fasl 8-Qism: O\'tkir uch',
            duration: '58 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            id: '1-9',
            episodeNumber: 9,
            title: '1-Fasl 9-Qism: Beylor',
            duration: '56 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4'
          },
          {
            id: '1-10',
            episodeNumber: 10,
            title: '1-Fasl 10-Qism: Olov va Qon',
            duration: '53 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          }
        ]
      },
      {
        seasonNumber: 2,
        seasonTitle: '2-Mavsum (Fasl)',
        episodes: [
          {
            id: '2-1',
            episodeNumber: 1,
            title: '2-Fasl 1-Qism: Shimol eslaydi',
            duration: '53 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
          },
          {
            id: '2-2',
            episodeNumber: 2,
            title: '2-Fasl 2-Qism: Qora tuproqlar',
            duration: '54 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'qonxor-itlar',
    type: 'series',
    title: 'Qonxo\'r Itlar (Bloodhounds)',
    rawTitle: 'Qonxor Itlar Janubiy Koreya Serial 2023 Barcha Qismlar',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1600&auto=format&fit=crop',
    year: 2023,
    country: 'Janubiy Koreya',
    genres: ['Jangari', 'Kriminal', 'Drama'],
    actors: ['U Do-xvan', 'Li San-i', 'Pax Son-un'],
    rating: 9.1,
    description: 'Ikki nafar yosh va iqtidorli bokschi shafqatsiz sudxo\'rlar to\'dasi qopqoniga tushib qolgan odamlarni qutqarish uchun xavfli jangga kirishadilar.',
    totalSeasons: 1,
    totalEpisodes: 8,
    seasons: [
      {
        seasonNumber: 1,
        seasonTitle: '1-Mavsum',
        episodes: [
          {
            id: '1-1',
            episodeNumber: 1,
            title: '1-Mavsum 1-Qism: Yangi boshlanish',
            duration: '62 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          },
          {
            id: '1-2',
            episodeNumber: 2,
            title: '1-Mavsum 2-Qism: Qarz va sadoqat',
            duration: '58 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
          },
          {
            id: '1-3',
            episodeNumber: 3,
            title: '1-Mavsum 3-Qism: Qasos yo\'li',
            duration: '60 daq',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
          }
        ]
      }
    ]
  }
];

// ═════════════════════════════════════════════════════════
// HIGH-PERFORMANCE IN-MEMORY CACHE
// Eliminates repetitive disk reads & JSON.parse on every request
// ═════════════════════════════════════════════════════════
let cachedMovies: Movie[] | null = null;
let cachedSeries: Series[] | null = null;
let cachedAllMedia: MediaItem[] | null = null;
let cachedMediaMap: Map<string, MediaItem> | null = null;

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(process.cwd(), 'src/data', filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return fallback;
}

export function getMovies(): Movie[] {
  if (cachedMovies) return cachedMovies;

  const scraped = readJsonFile<Movie[]>('movies.json', []);
  const combined = [...scraped, ...FALLBACK_MOVIES];
  const uniqueMap = new Map<string, Movie>();
  combined.forEach(m => {
    if (!uniqueMap.has(m.id)) uniqueMap.set(m.id, m);
  });
  cachedMovies = Array.from(uniqueMap.values());
  return cachedMovies;
}

export function getSeries(): Series[] {
  if (cachedSeries) return cachedSeries;

  const scraped = readJsonFile<Series[]>('series.json', []);
  const combined = [...scraped, ...FALLBACK_SERIES];
  const uniqueMap = new Map<string, Series>();
  combined.forEach(s => {
    if (!uniqueMap.has(s.id)) uniqueMap.set(s.id, s);
  });
  cachedSeries = Array.from(uniqueMap.values());
  return cachedSeries;
}

export function getAllMedia(): MediaItem[] {
  if (cachedAllMedia) return cachedAllMedia;
  cachedAllMedia = [...getMovies(), ...getSeries()];
  return cachedAllMedia;
}

export function getMediaById(id: string): MediaItem | undefined {
  if (!cachedMediaMap) {
    const all = getAllMedia();
    cachedMediaMap = new Map<string, MediaItem>();
    all.forEach(item => cachedMediaMap!.set(item.id, item));
  }
  return cachedMediaMap.get(id);
}

export function getFeaturedMedia(): MediaItem[] {
  const all = getAllMedia();
  return all.filter(item => item.rating >= 8.5).slice(0, 10);
}
