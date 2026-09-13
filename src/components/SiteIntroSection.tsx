'use client';

import Link from 'next/link';
import LiveStatsShowcase from '@/components/LiveStatsShowcase';

interface SiteIntroSectionProps {
  totalMovies: number;
  totalSeries: number;
}

export default function SiteIntroSection({ totalMovies, totalSeries }: SiteIntroSectionProps) {
  return (
    <section className="site-intro-section" style={{
      position: 'relative',
      margin: '20px 0 40px',
      padding: '40px 32px',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(229, 9, 20, 0.15), rgba(7, 10, 18, 0.95))',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow accents */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229, 9, 20, 0.25) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-80px',
        right: '15%',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
        {/* Top Mini Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#f87171',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(229, 9, 20, 0.2)'
        }}>
          <span style={{ color: '#fbbf24' }}>✨</span>
          <span>FilmX — O&apos;zbekistondagi Eng Ilg&apos;or Bepul Kinoportal</span>
        </div>

        {/* Main Hero Showcase Title */}
        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 46px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#fff',
          marginBottom: '16px'
        }}>
          Cheksiz Kinolar, Seriallar va Premyeralar Olamiga Xush Kelibsiz!
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '28px',
          maxWidth: '740px',
          margin: '0 auto 28px'
        }}>
          FilmX platformasida <strong style={{ color: '#fff' }}>1,480+ dan ortiq</strong> jahon durdonalari, yangi seriallar,
          koreys doramalari va multfilmlarni professional o&apos;zbek tilidagi tarjimada,
          <strong style={{ color: '#34d399' }}> Tas-ix cheksiz tezlikda</strong> va hech qanday reklamasiz 1080p Full HD sifatda tomosha qiling.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <Link
            href="/catalog?sort=newest"
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '999px',
              boxShadow: '0 8px 25px rgba(229, 9, 20, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🚀 Tomoshani boshlash</span>
          </Link>

          <Link
            href="/catalog?type=series"
            className="btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📺 Seriallar To&apos;plami</span>
          </Link>

          <Link
            href="/catalog?genre=multfilm"
            className="btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🐱‍🏍 Multfilmlar &amp; Dorama</span>
          </Link>
        </div>
      </div>

      {/* Real-time Live Stats Showcase */}
      <LiveStatsShowcase
        totalMovies={totalMovies}
        totalSeries={totalSeries}
        totalEpisodes={5000}
      />
    </section>
  );
}
