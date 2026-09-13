import { getMovies, getSeries, getFeaturedMedia, getMultfilms, getDoramas, getLatestPremieres, getNewlyAddedMedia } from '@/lib/data';
import HeroSlider from '@/components/HeroSlider';
import MovieCard from '@/components/MovieCard';
import ContinueWatching from '@/components/ContinueWatching';
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

        {/* ── FilmX Presentation Banner ── */}
        <section className="section" style={{ marginBottom: '80px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(229,9,20,0.12) 0%, rgba(139,92,246,0.1) 50%, rgba(0,242,254,0.08) 100%)',
            border: '1px solid rgba(229,9,20,0.25)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '52px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 80px -20px rgba(229,9,20,0.2)',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(229,9,20,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff7485', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e50914', display: 'inline-block', boxShadow: '0 0 8px #e50914' }} />
                1,170+ kino · 300+ serial · 5,000+ qism · 1080p FHD & 4K
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '10px', lineHeight: 1.2 }}>
                O&apos;zbekcha tarjimada barcha{' '}
                <span style={{ background: 'linear-gradient(135deg, #e50914, #8b5cf6, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  1,470+ kino, serial va multfilm
                </span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.65, maxWidth: '500px' }}>
                Reklamasiz, ro&apos;yxatdan o&apos;tmasdan, bepul. Multfilmlar, Doramalar, Hind, AQSH, Koreya, Turkiya kinolari — 1080p Full HD va 4K sifatda!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <Link href="/catalog" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Katalogni Ko&apos;ring
              </Link>
              <Link href="/favorites" className="btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Sevimlilarim
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
