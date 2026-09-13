'use client';

import { MediaItem } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFavorites } from '@/hooks/useFavorites';

interface HeroSliderProps {
  items: MediaItem[];
}

const CARD_NEON_THEMES = [
  { border: '#e50914', glow: 'rgba(229, 9, 20, 0.65)', accent: '#ff385c', label: 'IJRODA' },
  { border: '#00f2fe', glow: 'rgba(0, 242, 254, 0.65)', accent: '#4facfe', label: 'TRENDDA' },
  { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.65)', accent: '#c084fc', label: 'TOP 10' },
  { border: '#ffb703', glow: 'rgba(255, 183, 3, 0.65)', accent: '#ffd60a', label: 'YANGI' },
];

const AUTO_ROTATE_MS = 5000; // Har 5 soniyada (mobil uchun optimallashtirilgan)

export default function HeroSlider({ items }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = touchStartYRef.current - endY;

    // Horizontal swipe threshold > 40px and dominant over vertical scroll
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped left -> Next slide
        setCurrentIndex(prev => (prev + 1) % items.length);
      } else {
        // Swiped right -> Prev slide
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Faqat slider ekranda ko'ringanda va hover/touch bo'lmagandagina aylansin (mobil batareya va CPU tejash)
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (items.length <= 1 || isPaused || !isInView) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [items.length, isPaused, isInView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.matches(':hover')) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  const current = items[currentIndex];
  const watchHref = current ? (current.type === 'series' ? `/series/${current.id}` : `/movie/${current.id}`) : '#';
  const backdrop = current ? (current.backdrop || current.poster) : '';
  const isHeroFav = current ? isFavorite(current.id) : false;

  // Kartalarni memoizatsiya qilish
  const displayedCards = useMemo(() => {
    if (!items || items.length === 0) return [];
    const cardCount = Math.min(4, items.length);
    return Array.from({ length: cardCount }, (_, offset) => {
      const itemIndex = (currentIndex + offset) % items.length;
      return {
        item: items[itemIndex],
        index: itemIndex,
        slot: offset,
        theme: CARD_NEON_THEMES[offset % CARD_NEON_THEMES.length],
      };
    });
  }, [items, currentIndex]);

  if (!items || items.length === 0 || !current) return null;

  return (
    <div
      ref={containerRef}
      className="hero-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      aria-label="Premyeralar slayderi"
    >
      {/* Animated Background */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${backdrop})` }}
      />
      <div className="hero-bg-overlay" />

      <div className="hero-inner container">
        {/* LEFT: Content */}
        <div key={current.id} className="hero-left hero-fade-in">
          {/* Live Badge */}
          <div className="hero-live-badge">
            <span className="hero-live-dot" />
            <span>{current.type === 'series' ? '📺 Serial' : '🎬 Premyera'} • 1080p FHD & 4K</span>
          </div>

          {/* Title */}
          <h2 className="hero-main-title">{current.title}</h2>

          {/* Meta */}
          <div className="hero-meta-row">
            <span className="hero-rating-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffb703">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {current.rating?.toFixed(1) || '8.5'}
            </span>
            <span className="hero-meta-pill">{current.year}</span>
            {current.country && <span className="hero-meta-pill">{current.country}</span>}
            {current.genres?.slice(0, 2).map((g, i) => (
              <span key={i} className="hero-meta-genre">{g}</span>
            ))}
          </div>

          {/* Description */}
          <p className="hero-description">{current.description}</p>

          {/* CTA Buttons */}
          <div className="hero-cta-row">
            <Link href={watchHref} className="hero-btn-play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Tomosha Qilish
            </Link>
            <Link href={watchHref} className="hero-btn-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {current.type === 'series' ? 'Barcha qismlar' : "Batafsil"}
            </Link>
            <button
              type="button"
              onClick={() => toggleFavorite(current)}
              className="hero-btn-fav"
              style={{
                background: isHeroFav ? 'rgba(229,9,20,0.22)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isHeroFav ? '#e50914' : 'rgba(255,255,255,0.14)'}`,
                color: isHeroFav ? '#e50914' : '#fff',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title={isHeroFav ? "Sevimlilardan o'chirish" : "Sevimlilarga saqlash"}
              aria-label="Sevimlilarga saqlash"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isHeroFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Slide Dots */}
          {items.length > 1 && (
            <div className="hero-dots">
              {items.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Pure Standalone Dynamic Movie Cards (Ortiqcha Narsalarsiz Kartalar) */}
        <div
          className="hero-right"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="hero-pure-grid">
            {displayedCards.map(({ item, index, slot, theme }) => {
              const isActive = slot === 0;
              const cardHref = item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`;
              const isFav = isFavorite(item.id);

              return (
                <div
                  key={`${slot}-${item.id}`}
                  onClick={() => {
                    if (isActive) {
                      router.push(cardHref);
                    } else {
                      goTo(index);
                    }
                  }}
                  className={`hero-pure-card ${isActive ? 'active' : ''}`}
                  style={{
                    borderColor: isActive ? theme.border : 'rgba(255, 255, 255, 0.12)',
                    boxShadow: isActive
                      ? `0 0 24px ${theme.glow}, 0 14px 34px rgba(0, 0, 0, 0.75)`
                      : '0 6px 20px rgba(0, 0, 0, 0.45)',
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isActive) {
                        router.push(cardHref);
                      } else {
                        goTo(index);
                      }
                    }
                  }}
                  aria-label={`${item.title} kartasi`}
                >
                  {/* Poster Image */}
                  <div className="hero-card-image-wrap">
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading={isActive ? "eager" : "lazy"}
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop';
                      }}
                    />
                    <div className="hero-card-gradient" />
                  </div>

                  {/* Top Bar: Status Badge (Left) & Favorite (Right) */}
                  <div className="hero-card-top-bar">
                    {isActive ? (
                      <span className="hero-card-now-playing" style={{ background: theme.border }}>
                        <span className="hero-card-pulse" />
                        IJRODA
                      </span>
                    ) : (
                      <span
                        className="hero-card-slot-tag"
                        style={{ color: theme.border, borderColor: theme.border }}
                      >
                        {theme.label}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      className={`hero-card-fav-btn ${isFav ? 'active' : ''}`}
                      aria-label="Sevimlilarga qo'shish"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={isFav ? '#e50914' : 'none'}
                        stroke={isFav ? '#e50914' : '#fff'}
                        strokeWidth="2.2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Play Hover Button */}
                  <Link
                    href={cardHref}
                    onClick={(e) => e.stopPropagation()}
                    className="hero-card-play-hover"
                    aria-label={`${item.title} tomosha qilish`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </Link>

                  {/* Bottom Info: Title, Star Rating, Duration/Episodes */}
                  <div className="hero-card-info">
                    <h4 className="hero-card-title">{item.title}</h4>
                    <div className="hero-card-meta">
                      <span className="hero-card-star-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb703">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {item.rating?.toFixed(1) || '8.5'}
                      </span>
                      <span>•</span>
                      <span>
                        {item.type === 'series'
                          ? `${(item as any).totalEpisodes || '?'} qism`
                          : ((item as any).duration || `${item.year}`)}
                      </span>
                    </div>
                  </div>

                  {/* Live Progress Bar for Active Card / Static Accent for others */}
                  {isActive ? (
                    <div
                      key={currentIndex}
                      className="hero-card-progress-bar"
                      style={{
                        background: `linear-gradient(90deg, ${theme.border}, #ffffff)`,
                        boxShadow: `0 0 10px ${theme.glow}`,
                      }}
                    />
                  ) : (
                    <div
                      className="hero-card-accent-bar"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
