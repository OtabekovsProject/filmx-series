'use client';

import { useFavorites } from '@/hooks/useFavorites';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function FavoritesPage() {
  const { favorites, isLoaded, clearFavorites } = useFavorites();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');

  const filtered = useMemo(() => {
    if (filterType === 'all') return favorites;
    return favorites.filter(item => item.type === filterType);
  }, [favorites, filterType]);

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(229, 9, 20, 0.15)',
            color: 'var(--brand-primary)',
            fontSize: '20px'
          }}>
            ❤️
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Mening Sevimlilarim</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Siz saqlab qo'ygan barcha sevimli kinolar va seriallar to'plami.
        </p>
      </div>

      {/* Filter Tabs & Actions */}
      {favorites.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Barchasi ({favorites.length})
            </button>
            <button
              className={`filter-btn ${filterType === 'movie' ? 'active' : ''}`}
              onClick={() => setFilterType('movie')}
            >
              Kinolar ({favorites.filter(f => f.type === 'movie').length})
            </button>
            <button
              className={`filter-btn ${filterType === 'series' ? 'active' : ''}`}
              onClick={() => setFilterType('series')}
            >
              Seriallar ({favorites.filter(f => f.type === 'series').length})
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Rostdan ham barcha sevimlilarni ro'yxatdan o'chirmoqchimisiz?")) {
                clearFavorites();
              }
            }}
            style={{
              background: 'rgba(229, 9, 20, 0.12)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              color: '#ff7485',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🗑️ Ro&apos;yxatni tozalash
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoaded ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          Yuklanmoqda...
        </div>
      ) : filtered.length > 0 ? (
        <div className="media-grid">
          {filtered.map(item => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            Hozircha sevimlilar ro'yxatingiz bo'sh
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
            O'zingizga yoqqan istalgan kino yoki serial kartochkasidagi yurakcha (❤️) belgisini bosib, uni bu yerga saqlab qo'yishingiz mumkin.
          </p>
          <Link href="/catalog" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 28px' }}>
            Katalogni ko'rish
          </Link>
        </div>
      )}
    </div>
  );
}
