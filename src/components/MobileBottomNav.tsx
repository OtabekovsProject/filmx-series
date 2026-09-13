'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favoritesCount, isLoaded } = useFavorites();
  const { canInstall, promptInstall } = usePwaInstall();
  const [mounted, setMounted] = useState(false);
  const [searchString, setSearchString] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateSearch = () => {
      if (typeof window !== 'undefined') {
        setSearchString(window.location.search);
      }
    };
    updateSearch();
    window.addEventListener('popstate', updateSearch);
    return () => window.removeEventListener('popstate', updateSearch);
  }, [pathname]);

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('filmx_open_search'));
  };

  const isHome = mounted && pathname === '/';
  const isSeries = mounted && pathname === '/catalog' && searchString.includes('type=series');
  const isMovies = mounted && pathname === '/catalog' && searchString.includes('type=movie');
  const isFavorites = mounted && pathname === '/favorites';

  return (
    <nav className="mobile-bottom-dock" aria-label="Mobil navigatsiya">
      <div className="mobile-dock-inner">
        {/* 1. Asosiy */}
        <Link href="/" className={`mobile-dock-item ${isHome ? 'active' : ''}`}>
          <div className="mobile-dock-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="mobile-dock-label">Asosiy</span>
          {isHome && <span className="mobile-dock-indicator" />}
        </Link>

        {/* 2. Seriallar */}
        <Link href="/catalog?type=series" className={`mobile-dock-item ${isSeries ? 'active' : ''}`}>
          <div className="mobile-dock-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSeries ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </div>
          <span className="mobile-dock-label">Seriallar</span>
          {isSeries && <span className="mobile-dock-indicator" />}
        </Link>

        {/* 3. Qidiruv (Center highlight) */}
        <button onClick={handleOpenSearch} className="mobile-dock-item mobile-dock-search" aria-label="Kino qidirish">
          <div className="mobile-dock-search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="mobile-dock-label">Qidiruv</span>
        </button>

        {/* 4. Kinolar */}
        <Link href="/catalog?type=movie" className={`mobile-dock-item ${isMovies ? 'active' : ''}`}>
          <div className="mobile-dock-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isMovies ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="mobile-dock-label">Kinolar</span>
          {isMovies && <span className="mobile-dock-indicator" />}
        </Link>

        {/* 5. Sevimlilar */}
        <Link href="/favorites" className={`mobile-dock-item ${isFavorites ? 'active' : ''}`}>
          <div className="mobile-dock-icon" style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorites ? '#e50914' : 'none'} stroke={isFavorites ? '#e50914' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isLoaded && favoritesCount > 0 && (
              <span className="mobile-dock-badge">{favoritesCount}</span>
            )}
          </div>
          <span className="mobile-dock-label">Sevimlilar</span>
          {isFavorites && <span className="mobile-dock-indicator" />}
        </Link>

        {/* 6. PWA Install (only if installable) */}
        {canInstall && (
          <button onClick={promptInstall} className="mobile-dock-item mobile-dock-install" aria-label="Ilovani o'rnatish">
            <div className="mobile-dock-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span className="mobile-dock-label" style={{ color: '#00f2fe' }}>O&apos;rnatish</span>
          </button>
        )}
      </div>
    </nav>
  );
}
