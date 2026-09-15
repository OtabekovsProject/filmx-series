'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaItem } from '@/types';
import MovieCard from '@/components/MovieCard';
import { calculateSearchScore } from '@/lib/searchUtils';

interface CatalogViewProps {
  initialItems: MediaItem[];
}

const GENRES = [
  { label: 'Barchasi', value: 'all' },
  { label: '🐱‍🏍 Multfilm & Anime', value: 'multfilm' },
  { label: '🎭 Dorama', value: 'dorama' },
  { label: '💥 Jangari', value: 'jangari' },
  { label: '🚀 Fantastika', value: 'fantastika' },
  { label: '🎭 Drama', value: 'drama' },
  { label: '⚡ Triller', value: 'triller' },
  { label: '🗺️ Sarguzasht', value: 'sarguzasht' },
  { label: '😂 Komediya', value: 'komediya' },
  { label: '👻 Qo\'rqinchli', value: 'qo\'rqinchli' },
  { label: '🥋 Melodrama', value: 'melodrama' },
];

const COUNTRIES = [
  { label: 'Barcha davlatlar', value: 'all' },
  { label: '🇺🇸 AQSH', value: 'aqsh' },
  { label: '🇺🇿 O\'zbekiston', value: 'o\'zbekiston' },
  { label: '🇰🇷 Janubiy Koreya', value: 'koreya' },
  { label: '🇮🇳 Hindiston', value: 'hind' },
  { label: '🇹🇷 Turkiya', value: 'turkiya' },
  { label: '🇷🇺 Rossiya', value: 'rossiya' },
  { label: '🇨🇳 Xitoy', value: 'xitoy' },
  { label: '🇬🇧 Buyuk Britaniya', value: 'britaniya' },
];

const YEAR_RANGES = [
  { label: 'Barcha yillar', value: 'all' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2020 — 2023', value: '2020-2023' },
  { label: '2010 — 2019', value: '2010-2019' },
  { label: '2000 — 2009', value: '2000-2009' },
  { label: 'Retro (< 2000)', value: 'retro' },
];

const RATING_FILTERS = [
  { label: 'Barcha reytinglar', value: '0' },
  { label: '⭐ 8.0+', value: '8' },
  { label: '⭐ 7.0+', value: '7' },
  { label: '⭐ 6.0+', value: '6' },
];

export default function CatalogView({ initialItems }: CatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state initialization
  const initialType = searchParams.get('type') || 'all';
  const initialGenre = searchParams.get('genre') || 'all';
  const initialCountry = searchParams.get('country') || 'all';
  const initialYear = searchParams.get('year') || 'all';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialQ = searchParams.get('q') || searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [countryFilter, setCountryFilter] = useState(initialCountry);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [ratingFilter, setRatingFilter] = useState('0');
  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search: 300ms delay to avoid re-filtering 1500+ items on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Sync state if URL changes
  useEffect(() => {
    const t = searchParams.get('type');
    const g = searchParams.get('genre');
    const q = searchParams.get('q') || searchParams.get('search');
    if (t) setTypeFilter(t);
    if (g) setGenreFilter(g);
    if (q !== null && q !== undefined) setQuery(q);
  }, [searchParams]);

  // Reset pagination on filter changes
  useEffect(() => {
    setVisibleCount(24);
  }, [debouncedQuery, typeFilter, genreFilter, countryFilter, yearFilter, ratingFilter, sortBy]);

  // IntersectionObserver infinite scroll — auto-load more as user scrolls
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 24);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = initialItems.filter((item) => {
      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Genre
      if (genreFilter !== 'all') {
        const lowerGenre = genreFilter.toLowerCase();
        let matches = false;
        if (lowerGenre === 'multfilm' || lowerGenre === 'animatsiya') {
          matches = !!(item.genres?.some((g) => {
            const lg = g.toLowerCase();
            return lg.includes('mult') || lg.includes('anim') || lg.includes('anime');
          }) || item.title.toLowerCase().includes('multfilm') || item.title.toLowerCase().includes('anime'));
        } else if (lowerGenre === 'dorama') {
          matches = !!(item.genres?.some((g) => g.toLowerCase().includes('dorama') || g.toLowerCase().includes('koreys')) ||
                    item.country?.toLowerCase().includes('koreya') ||
                    item.title.toLowerCase().includes('dorama'));
        } else {
          const genreMatch = item.genres?.some((g) => g.toLowerCase().includes(lowerGenre));
          const titleMatch = item.title?.toLowerCase().includes(lowerGenre);
          matches = !!(genreMatch || titleMatch);
        }
        if (!matches) return false;
      }

      // Country
      if (countryFilter !== 'all') {
        const lowerCountry = countryFilter.toLowerCase();
        const countryMatch = item.country?.toLowerCase().includes(lowerCountry);
        const titleMatch = item.title?.toLowerCase().includes(lowerCountry);
        if (!countryMatch && !titleMatch) return false;
      }

      // Year
      if (yearFilter !== 'all') {
        if (yearFilter === '2026' && item.year !== 2026) return false;
        if (yearFilter === '2025' && item.year !== 2025) return false;
        if (yearFilter === '2024' && item.year !== 2024) return false;
        if (yearFilter === '2020-2023' && (item.year < 2020 || item.year > 2023)) return false;
        if (yearFilter === '2010-2019' && (item.year < 2010 || item.year > 2019)) return false;
        if (yearFilter === '2000-2009' && (item.year < 2000 || item.year > 2009)) return false;
        if (yearFilter === 'retro' && item.year >= 2000) return false;
      }

      // Rating
      const minRate = parseFloat(ratingFilter);
      if (minRate > 0 && (item.rating || 0) < minRate) {
        return false;
      }

      // Search Query
      if (debouncedQuery.trim()) {
        const score = calculateSearchScore(item, debouncedQuery);
        if (score <= 0) return false;
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (debouncedQuery.trim()) {
        const scoreA = calculateSearchScore(a, debouncedQuery);
        const scoreB = calculateSearchScore(b, debouncedQuery);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (sortBy === 'added' || sortBy === 'newest') {
        const dateA = (a as any).addedAt ? new Date((a as any).addedAt).getTime() : 0;
        const dateB = (b as any).addedAt ? new Date((b as any).addedAt).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.year - a.year) || (b.rating - a.rating);
      }
      if (sortBy === 'oldest') {
        return (a.year - b.year);
      }
      if (sortBy === 'rating') {
        return (b.rating - a.rating) || (b.year - a.year);
      }
      if (sortBy === 'episodes') {
        const epsA = a.type === 'series' ? (a as any).totalEpisodes || 1 : 1;
        const epsB = b.type === 'series' ? (b as any).totalEpisodes || 1 : 1;
        return epsB - epsA;
      }
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [initialItems, debouncedQuery, typeFilter, genreFilter, countryFilter, yearFilter, ratingFilter, sortBy]);

  const hasActiveFilters =
    typeFilter !== 'all' ||
    genreFilter !== 'all' ||
    countryFilter !== 'all' ||
    yearFilter !== 'all' ||
    ratingFilter !== '0' ||
    query.trim().length > 0;

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setGenreFilter('all');
    setCountryFilter('all');
    setYearFilter('all');
    setRatingFilter('0');
    setSortBy('newest');
    router.replace('/catalog');
  };

  return (
    <div className="container" style={{ padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px) 80px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff7485', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e50914', display: 'inline-block' }} />
            {initialItems.length}+ Asar • 5,600+ Qism • 1080p Full HD &amp; 4K • O&apos;zbek tilida
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            FilmX To&apos;liq Katalogi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '650px' }}>
            Barcha saralangan tarjima kinolar, premyeralar va to&apos;liq qismli seriallar to&apos;plami. Istalgan janr, davlat yoki yil bo&apos;yicha saralang.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`catalog-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            title="Kataklar ko'rinishi (Grid)"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'var(--brand-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Katak
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`catalog-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            title="Qatorlar ko'rinishi (List)"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'var(--brand-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Ro'yxat
          </button>
        </div>
      </div>

      {/* Main Filter Console */}
      <div className="filter-console" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(14px, 3vw, 24px)',
        marginBottom: '28px',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Row 1: Search & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '520px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Film nomi, aktyor yoki mavzu bo'yicha qidirish..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                paddingLeft: '46px',
                paddingRight: '36px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(7, 10, 18, 0.7)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Stats & Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              Natija: <strong style={{ color: '#fff', fontSize: '15px' }}>{filteredItems.length}</strong> / {initialItems.length}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tartiblash:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'rgba(7, 10, 18, 0.85)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">🔥 Yangi qo&apos;shilganlar &amp; Yil</option>
                <option value="rating">⭐ Eng yuqori reyting (IMDb/Kino)</option>
                <option value="episodes">📺 Ko&apos;p qismlilar (Seriallar)</option>
                <option value="alpha">🔤 Alifbo bo&apos;yicha (A-Z)</option>
                <option value="oldest">🕰️ Klassika (Eng eskilari)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Type Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, minWidth: '60px' }}>Turi:</span>
          {[
            { label: 'Barchasi', value: 'all' },
            { label: '🎬 To\'liq Kinolar', value: 'movie' },
            { label: '📺 Ko\'p Qismli Seriallar', value: 'series' },
          ].map((t) => (
            <button
              key={t.value}
              className={`filter-btn ${typeFilter === t.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(t.value)}
              style={{ padding: '7px 16px', fontSize: '13px' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Row 3: Genres */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, minWidth: '60px', marginTop: '6px' }}>Janr:</span>
          <div className="catalog-genres-scroll" style={{ flex: 1, minWidth: '240px' }}>
            {GENRES.map((g) => (
              <button
                key={g.value}
                className={`filter-btn ${genreFilter === g.value ? 'active' : ''}`}
                onClick={() => setGenreFilter(g.value)}
                style={{ padding: '6px 13px', fontSize: '12px' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Country & Year & Rating Selectors */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Country select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>🌍 Davlat:</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{
                background: 'rgba(7, 10, 18, 0.85)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Year select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>📅 Yil:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                background: 'rgba(7, 10, 18, 0.85)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {YEAR_RANGES.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>

          {/* Rating select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>⭐ Reyting:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                background: 'rgba(7, 10, 18, 0.85)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {RATING_FILTERS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                background: 'rgba(229, 9, 20, 0.15)',
                color: '#ff4d6d',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: 'auto'
              }}
            >
              ✕ Barcha filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Tanlangan filtrlar:</span>
          {query && (
            <span style={{ background: 'rgba(229, 9, 20, 0.2)', border: '1px solid rgba(229, 9, 20, 0.4)', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Qidiruv: &ldquo;{query}&rdquo;
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#ff7485', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
          {typeFilter !== 'all' && (
            <span style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Tur: {typeFilter === 'movie' ? 'Kinolar' : 'Seriallar'}
              <button onClick={() => setTypeFilter('all')} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
          {genreFilter !== 'all' && (
            <span style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#d8b4fe', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Janr: {genreFilter}
              <button onClick={() => setGenreFilter('all')} style={{ background: 'none', border: 'none', color: '#d8b4fe', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
          {countryFilter !== 'all' && (
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Davlat: {countryFilter}
              <button onClick={() => setCountryFilter('all')} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
          {yearFilter !== 'all' && (
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fcd34d', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Yil: {yearFilter}
              <button onClick={() => setYearFilter('all')} style={{ background: 'none', border: 'none', color: '#fcd34d', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
          {ratingFilter !== '0' && (
            <span style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)', color: '#fef08a', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Reyting: {ratingFilter}+
              <button onClick={() => setRatingFilter('0')} style={{ background: 'none', border: 'none', color: '#fef08a', cursor: 'pointer', padding: 0, fontWeight: 700 }}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* Grid or List Display */}
      {filteredItems.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="media-grid">
              {filteredItems.slice(0, visibleCount).map((item) => (
                <MovieCard key={item.id} item={item} variant="default" />
              ))}
            </div>
          ) : (
            <div className="media-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredItems.slice(0, visibleCount).map((item) => (
                <MovieCard key={item.id} item={item} variant="list" />
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          {visibleCount < filteredItems.length && (
            <div ref={loadMoreRef} style={{ textAlign: 'center', marginTop: '48px', padding: '20px 0' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-card)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)'
              }}>
                <span className="loading-spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(229,9,20,0.3)',
                  borderTopColor: '#e50914',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }} />
                <span>
                  {Math.min(visibleCount, filteredItems.length)} / {filteredItems.length} ko'rsatilmoqda
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            Hech qanday film yoki serial topilmadi
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '450px', margin: '0 auto 24px' }}>
            Kiritilgan so'z yoki tanlangan parametrlar bo'yicha ma'lumot topilmadi. Filtrlarni o'zgartirib ko'ring.
          </p>
          <button
            onClick={resetFilters}
            className="btn-primary"
            style={{ padding: '12px 28px' }}
          >
            Filtrlarni tozalash
          </button>
        </div>
      )}
    </div>
  );
}
