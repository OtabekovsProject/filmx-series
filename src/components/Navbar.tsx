'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import SearchModal from '@/components/SearchModal';

const NAV_ITEMS = [
  { label: 'Bosh sahifa', href: '/', exact: true },
  { label: 'Seriallar', href: '/catalog?type=series', match: 'series' },
  { label: 'Kinolar', href: '/catalog?type=movie', match: 'movie' },
  { label: 'Katalog', href: '/catalog', exact: true },
  { label: 'Sevimlilar', href: '/favorites', exact: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { favoritesCount, isLoaded } = useFavorites();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleGlobalSearch = () => setIsSearchOpen(true);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('filmx_open_search', handleGlobalSearch);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('filmx_open_search', handleGlobalSearch);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (!mounted) return false;
    if (item.exact && item.href === '/') return pathname === '/';
    if (item.exact) return pathname === item.href;
    if (item.match) return pathname.includes(item.match) || pathname.includes(item.href);
    return false;
  };

  return (
    <>
      <header
        className={`header ${scrolled ? 'header-scrolled' : ''}`}
      >
        <div className="container header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo">
            <span style={{
              background: 'linear-gradient(135deg, #00f2fe 0%, #8b5cf6 50%, #e50914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              letterSpacing: '-1px',
            }}>FilmX</span>
            <span className="logo-badge">HD</span>
          </Link>

          {/* Navigation */}
          <nav aria-label="Asosiy menyu">
            <ul className="nav-links">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                      {item.label}
                      {item.label === 'Sevimlilar' && isLoaded && favoritesCount > 0 && (
                        <span style={{
                          background: 'var(--brand-gradient)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: '10px',
                          boxShadow: '0 0 10px rgba(229,9,20,0.5)',
                          marginLeft: '2px',
                        }}>
                          {favoritesCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Spotlight Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="search-trigger-btn"
              aria-label="Qidiruv (Ctrl+K)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Tezkor qidiruv...</span>
              <kbd style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--text-muted)',
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '5px',
                border: '1px solid rgba(255,255,255,0.12)',
                fontFamily: 'monospace',
              }}>⌘K</kbd>
            </button>

            {/* PWA Install Button (If supported by browser) */}
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="pwa-install-header-btn"
                title="FilmX ilovasini o'rnatish"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>O&apos;rnatish</span>
              </button>
            )}

            {/* Quick Favorites Link for Mobile/Tablet */}
            <Link
              href="/favorites"
              className="header-fav-btn"
              title="Sevimlilar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isLoaded && favoritesCount > 0 && (
                <span className="header-fav-badge">{favoritesCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spotlight Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
