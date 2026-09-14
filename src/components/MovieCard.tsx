'use client';

import Link from 'next/link';
import { MediaItem } from '@/types';
import { useState, memo } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface MovieCardProps {
  item: MediaItem;
  variant?: 'default' | 'wide' | 'compact' | 'list';
}

const GENRE_COLORS: Record<string, string> = {
  'jangari': '#e50914',
  'drama': '#8b5cf6',
  'komediya': '#f59e0b',
  'triller': '#00f2fe',
  'fantastika': '#3b82f6',
  'hind': '#f97316',
  'koreya': '#10b981',
  'melodrama': '#ec4899',
  'animatsiya': '#06b6d4',
  'default': '#e50914',
};

function getGenreColor(genres: string[] = []) {
  const first = (genres[0] || '').toLowerCase();
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (first.includes(key)) return color;
  }
  return GENRE_COLORS.default;
}

function MovieCardComponent({ item, variant = 'default' }: MovieCardProps) {
  const [imgSrc, setImgSrc] = useState(item.poster);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const { isWatched } = useWatchHistory();

  const favorited = isLoaded && isFavorite(item.id);
  const watched = isWatched(item.id);

  const href = item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`;
  const isSeries = item.type === 'series';
  const accentColor = getGenreColor(item.genres);
  const episodeCount = isSeries ? (item as any).totalEpisodes : null;

  // ═════════════════════════════════════════════
  // LIST / COMPACT HORIZONTAL VIEW
  // ═════════════════════════════════════════════
  if (variant === 'list') {
    return (
      <div className="media-list-item">
        <Link href={href} className="media-list-poster-wrap">
          {!imgLoaded && <div className="poster-skeleton skeleton" />}
          <img
            src={imgSrc}
            alt={item.title}
            className="media-list-poster-img"
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgSrc('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop');
              setImgLoaded(true);
            }}
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
          <div className="card-neon-line" style={{ background: accentColor }} />
        </Link>

        <div className="media-list-content">
          <div className="media-list-header">
            <Link href={href} className="media-list-title-link">
              <h3 className="media-list-title">{item.title}</h3>
            </Link>
            <div className="media-list-badges">
              <span className="badge-hd">
                {item.quality?.includes('4K') ? '4K' : 'FHD'}
              </span>
              {isSeries ? (
                <span className="badge-type" style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', borderColor: 'rgba(139,92,246,0.3)' }}>
                  📺 {episodeCount ? `${episodeCount} qism` : 'Serial'}
                </span>
              ) : (
                <span className="badge-type">🎬 Kino</span>
              )}
              {watched && (
                <span style={{
                  background: 'rgba(16,185,129,0.18)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.35)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  ✓ Ko'rilgan
                </span>
              )}
            </div>
          </div>

          <div className="media-list-meta">
            <span className="media-list-year">{item.year}</span>
            {item.country && (
              <>
                <span className="meta-dot">•</span>
                <span className="media-list-country">{item.country}</span>
              </>
            )}
            {(item as any).duration && (
              <>
                <span className="meta-dot">•</span>
                <span>{(item as any).duration}</span>
              </>
            )}
            {item.genres && item.genres.length > 0 && (
              <>
                <span className="meta-dot">•</span>
                <div className="media-list-genres">
                  {item.genres.slice(0, 3).map((g, i) => (
                    <span key={i} className="genre-pill-mini">{g}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {item.description && (
            <p className="media-list-desc">
              {item.description.slice(0, 140)}{item.description.length > 140 ? '...' : ''}
            </p>
          )}
        </div>

        <div className="media-list-actions">
          <div className="card-rating" style={{ position: 'static', padding: '6px 12px', fontSize: '13px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{item.rating ? item.rating.toFixed(1) : '8.5'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(item);
              }}
              className="favorite-list-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: favorited ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${favorited ? '#e50914' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: favorited ? '#e50914' : '#fff',
                transition: 'all 0.2s'
              }}
              title={favorited ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <Link href={href} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px', whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Tomosha
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // DEFAULT GRID VIEW
  // ═════════════════════════════════════════════
  return (
    <Link href={href} className="media-card" style={{ textDecoration: 'none' }}>
      {/* Poster */}
      <div className="poster-wrap">
        {!imgLoaded && <div className="poster-skeleton skeleton" />}

        <img
          src={imgSrc}
          alt={item.title}
          className="poster-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop');
            setImgLoaded(true);
          }}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />

        {/* Top Badges */}
        <div className="card-badges">
          <span className="badge-hd">
            {item.quality?.includes('4K') ? '4K' : 'FHD'}
          </span>
          {isSeries && (
            <span className="badge-type">
              {episodeCount ? `${episodeCount} Qism` : 'Serial'}
            </span>
          )}
          {watched && (
            <span style={{
              background: 'rgba(16,185,129,0.92)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 7px',
              borderRadius: '4px'
            }}>
              ✓ Ko'rildi
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {isLoaded && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(item);
            }}
            className={`favorite-card-btn ${favorited ? 'active' : ''}`}
            title={favorited ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: favorited ? 'rgba(229,9,20,0.92)' : 'rgba(7,10,18,0.88)',
              border: `1px solid ${favorited ? '#ff385c' : 'rgba(255,255,255,0.22)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
              color: '#fff',
              boxShadow: favorited ? '0 0 14px rgba(229,9,20,0.6)' : '0 3px 10px rgba(0,0,0,0.5)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={favorited ? '#fff' : 'none'}
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Star Rating */}
        <div className="card-rating">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{item.rating ? item.rating.toFixed(1) : '8.5'}</span>
        </div>

        {/* Neon bottom accent line */}
        <div
          className="card-neon-line"
          style={{ background: accentColor }}
        />
      </div>

      {/* Card Body */}
      <div className="card-body">
        <h3 className="card-title" title={item.title}>{item.title}</h3>
        <div className="card-info">
          <span className="card-genres">
            {item.genres?.slice(0, 2).join(', ') || item.country || ''}
          </span>
          <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-dim)' }}>
            {item.year}
          </span>
        </div>
      </div>
    </Link>
  );
}

const MovieCard = memo(MovieCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.poster === next.item.poster &&
    prev.item.rating === next.item.rating &&
    prev.variant === next.variant
  );
});

export default MovieCard;
