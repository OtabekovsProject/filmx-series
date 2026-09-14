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
  { label: 'Multfilmlar', href: '/catalog?genre=multfilm', match: 'multfilm' },
  { label: 'Dorama', href: '/catalog?genre=dorama', match: 'dorama' },
  { label: 'Katalog', href: '/catalog', exact: true },
  { label: 'Sevimlilar', href: '/favorites', exact: true },
];

import { usePwaInstall } from '@/hooks/usePwaInstall';

export default function Navbar() {
  const pathname = usePathname();
  const { favoritesCount, isLoaded } = useFavorites();
  const { canInstall, promptInstall } = usePwaInstall();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    const handleGlobalSearch = () => setIsSearchOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('filmx_open_search', handleGlobalSearch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('filmx_open_search', handleGlobalSearch);
    };
  }, []);

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
          <Link href="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/icons/icon-192x192.png" alt="FilmX" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 14px rgba(229,9,20,0.5)' }} />
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

            {/* Android APK Download Header Button */}
            <a
              href="https://github.com/OtabekovsProject/filmx-apk/releases/latest/download/FilmX-v1.0.apk"
              className="android-apk-header-btn"
              title="FilmX Android ilovasi (APK yuklab olish)"
              aria-label="FilmX Android ilovasini yuklab olish"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '999px',
                background: 'rgba(61, 220, 132, 0.12)',
                border: '1px solid rgba(61, 220, 132, 0.35)',
                color: '#3ddc84',
                fontSize: '12px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(61, 220, 132, 0.15)',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2876-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
              <span>Android Ilova</span>
            </a>

            {/* PWA Install Button (If supported by browser) */}
            {canInstall && (
              <button
                onClick={promptInstall}
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
