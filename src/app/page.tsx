import { getMovies, getSeries, getFeaturedMedia, getMultfilms, getDoramas, getLatestPremieres, getNewlyAddedMedia } from '@/lib/data';
import HeroSlider from '@/components/HeroSlider';
import MovieCard from '@/components/MovieCard';
import ContinueWatching from '@/components/ContinueWatching';
import SiteIntroSection from '@/components/SiteIntroSection';
import PlatformFeatures from '@/components/PlatformFeatures';
import AndroidAppShowcase from '@/components/AndroidAppShowcase';
import Link from 'next/link';

const ChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CATEGORIES = [
  { name: '🔥 Yangi qo\'shilganlar', href: '/catalog?sort=newest' },
  { name: '📺 Seriallar', href: '/catalog?type=series' },
  { name: '🐱‍🏍 Multfilmlar', href: '/catalog?genre=multfilm' },
  { name: '🎭 Dorama', href: '/catalog?genre=dorama' },
  { name: '⚡ 2025-2026 Premyeralar', href: '/catalog?year=2025' },
  { name: '🎬 Tarjima Kinolar', href: '/catalog?type=movie' },
  { name: '💥 Jangari', href: '/catalog?genre=jangari' },
  { name: '🎭 Drama', href: '/catalog?genre=drama' },
  { name: '🚀 Fantastika', href: '/catalog?genre=fantastika' },
  { name: '😂 Komediya', href: '/catalog?genre=komediya' },
  { name: '🔪 Triller', href: '/catalog?genre=triller' },
  { name: '🌟 Hind', href: '/catalog?genre=hind' },
  { name: '🥋 Koreya', href: '/catalog?genre=koreya' },
];

export default function HomePage() {
  const movies = getMovies();
  const series = getSeries();
  const featured = getFeaturedMedia();
  const multfilms = getMultfilms();
  const doramas = getDoramas();
  const latestPremieres = getLatestPremieres();
  const newlyAdded = getNewlyAddedMedia();
  const totalEpisodes = series.reduce((sum, s) => sum + (s.totalEpisodes || (s.seasons ? s.seasons.reduce((acc, sn) => acc + (sn.episodes?.length || 0), 0) : 0) || 0), 0);

  const trendingSeries = series.slice(0, 10);
  const latestMovies = movies.slice(0, 12);
  const topRated = [...movies, ...series]
    .sort((a, b) => b.rating - a.rating)
    .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
    .slice(0, 10);

  const topMultfilms = multfilms.slice(0, 8);
  const topDoramas = doramas.slice(0, 8);
  const topPremieres = latestPremieres.slice(0, 8);
  const hindMovies = movies.filter(m => m.country?.toLowerCase().includes('hind') || m.genres?.some(g => g.toLowerCase().includes('hind'))).slice(0, 6);
  const thrillers = [...movies, ...series].filter(m => m.genres?.some(g => g.toLowerCase().includes('triller'))).slice(0, 6);

  return (
    <div>
      {/* Featured Hero Banner */}
      <HeroSlider items={featured.length > 0 ? featured : series.slice(0, 5)} />

      <div className="container">
        {/* Semantic H1 for SEO */}
        <h1 className="sr-only">
          FilmX — O&apos;zbek tilidagi eng so&apos;nggi tarjima kinolar, premyeralar, multfilmlar, doramalar va yangi seriallar portali
        </h1>

        {/* ── Modern Site Introduction Showcase with Real-Time Stats ── */}
        <SiteIntroSection
          totalMovies={movies.length}
          totalSeries={series.length}
          totalEpisodes={totalEpisodes}
        />

        {/* Continue Watching (client-side) */}
        <ContinueWatching />

        {/* Category Quick Filter Row */}
        <div className="quick-filters-row">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="filter-btn"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* ── Section: Yangi qo'shilgan premyeralar ── */}
        {newlyAdded.length > 0 && (
          <section className="section" style={{ position: 'relative' }}>
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 0 14px rgba(16, 185, 129, 0.7)' }} />
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🔥 Yangi qo&apos;shilgan asarlar</span>
                  <span style={{ 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    color: '#34d399', 
                    border: '1px solid rgba(16, 185, 129, 0.35)', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '999px', 
                    letterSpacing: '0.5px' 
                  }}>
                    YANGI PREMYERA
                  </span>
                </h2>
              </div>
              <Link href="/catalog?sort=newest" className="section-link">
                <span>Barchasi</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {newlyAdded.slice(0, 8).map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 1: Seriallar ── */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-indicator" />
              <h2 className="section-title">📺 Seriallar — Barcha qismlari bilan</h2>
            </div>
            <Link href="/catalog?type=series" className="section-link">
              <span>Barchasini ko&apos;rish</span>
              <ChevronRight />
            </Link>
          </div>
          <div className="media-grid">
            {trendingSeries.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ── Section 2: Multfilmlar & Animatsiya ── */}
        {topMultfilms.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }} />
                <h2 className="section-title">🐱‍🏍 Multfilmlar & Animatsiya — Yangi premyeralar</h2>
              </div>
              <Link href="/catalog?genre=multfilm" className="section-link">
                <span>Barchasini ko&apos;rish ({multfilms.length})</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {topMultfilms.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 3: Doramalar & Sharq Seriallari ── */}
        {topDoramas.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }} />
                <h2 className="section-title">🎭 Dorama & Sharq Seriallari (O&apos;zbek tilida)</h2>
              </div>
              <Link href="/catalog?genre=dorama" className="section-link">
                <span>Barchasini ko&apos;rish ({doramas.length})</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {topDoramas.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 4: 2024-2026 Premyeralar ── */}
        {topPremieres.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} />
                <h2 className="section-title">⚡ 2024-2026 Yangi Premyeralar (Faqat Yangilar)</h2>
              </div>
              <Link href="/catalog?year=2025" className="section-link">
                <span>Barcha premyeralar ({latestPremieres.length})</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {topPremieres.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 5: Yangi Kinolar ── */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)' }} />
              <h2 className="section-title">🎬 So&apos;nggi Premyera Kinolar (HD)</h2>
            </div>
            <Link href="/catalog?type=movie" className="section-link">
              <span>Barchasini ko&apos;rish</span>
              <ChevronRight />
            </Link>
          </div>
          <div className="media-grid">
            {latestMovies.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ── Section 6: Eng yuqori reytingli ── */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #ffb703, #ff8500)' }} />
              <h2 className="section-title">⭐ Eng Yuqori Baholangan Asarlar</h2>
            </div>
            <Link href="/catalog" className="section-link">
              <span>To&apos;liq katalog</span>
              <ChevronRight />
            </Link>
          </div>
          <div className="media-grid">
            {topRated.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ── Section 7: Hind Kinolari ── */}
        {hindMovies.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />
                <h2 className="section-title">🌟 Hind Kinolari</h2>
              </div>
              <Link href="/catalog?genre=hind" className="section-link">
                <span>Barchasini ko&apos;rish</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {hindMovies.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 8: Thrillers ── */}
        {thrillers.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-indicator" style={{ background: 'linear-gradient(135deg, #8b5cf6, #00f2fe)' }} />
                <h2 className="section-title">🔪 Eng Yaxshi Thrillerlar</h2>
              </div>
              <Link href="/catalog?genre=triller" className="section-link">
                <span>Barchasini ko&apos;rish</span>
                <ChevronRight />
              </Link>
            </div>
            <div className="media-grid">
              {thrillers.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Official Android App Showcase & APK Download ── */}
        <AndroidAppShowcase />

        {/* ── Platform Core Features & Benefits Showcase ── */}
        <PlatformFeatures />
      </div>
    </div>
  );
}
