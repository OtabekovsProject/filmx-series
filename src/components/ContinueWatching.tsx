'use client';

import { useWatchHistory } from '@/hooks/useWatchHistory';
import Link from 'next/link';

export default function ContinueWatching() {
  const { history, removeHistoryItem, isLoaded } = useWatchHistory();

  if (!isLoaded || history.length === 0) return null;

  return (
    <section className="section" style={{ marginTop: '32px', marginBottom: '16px' }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-indicator" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 12px var(--accent-cyan)' }}></span>
          <h2 className="section-title">Ko'rishda davom eting</h2>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Oxirgi to'xtagan joyingizdan
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {history.slice(0, 4).map((record) => {
          const item = record.item;
          const href = item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`;
          return (
            <div
              key={record.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="continue-card"
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', width: '100%', height: '140px', background: '#000', overflow: 'hidden' }}>
                <img
                  src={item.backdrop || item.poster}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18, 21, 34, 0.95) 0%, transparent 70%)'
                }} />

                {/* Dismiss Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeHistoryItem(record.id);
                  }}
                  title="Ro'yxatdan o'chirish"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    zIndex: 2
                  }}
                >
                  ✕
                </button>

                {/* Play Button Overlay */}
                <Link
                  href={href}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="6 3 20 12 6 21 6 3"></polygon>
                    </svg>
                  </div>
                </Link>

                {/* Progress bar */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${record.progressPercent}%`,
                    background: 'var(--brand-gradient)',
                    boxShadow: '0 0 8px var(--brand-primary)'
                  }} />
                </div>
              </div>

              {/* Info Container */}
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <Link href={href}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </h4>
                  </Link>
                  <p style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {record.episodeTitle || (item.type === 'series' ? 'Serial davomi' : 'Film')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{record.progressPercent}% ko'rildi</span>
                  <Link href={href} style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Davom etish →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
