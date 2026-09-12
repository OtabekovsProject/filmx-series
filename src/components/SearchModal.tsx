'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  poster: string;
  year: number;
  rating: number;
  genres: string[];
  country: string;
  quality?: string;
  totalEpisodes?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

let searchCache: SearchItem[] | null = null;

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>(() => searchCache || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (searchCache && searchCache.length > 0) {
        setItems(searchCache);
      } else {
        // Load search index once and cache in memory
        fetch('/api/search')
          .then(res => res.json())
          .then(data => {
            if (data?.items) {
              searchCache = data.items;
              setItems(data.items);
            }
          })
          .catch(() => {});
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase().trim();
    return items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.genres?.some(g => g.toLowerCase().includes(q)) ||
      item.country?.toLowerCase().includes(q) ||
      item.year.toString().includes(q)
    ).slice(0, 10);
  }, [query, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          const item = results[selectedIndex];
          const href = item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`;
          onClose();
          router.push(href);
        } else if (query.trim()) {
          onClose();
          router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, onClose, router]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 15, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 20px 40px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(229, 9, 20, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '14px'
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="930+ ta kino yoki serial nomini qidiring..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'inherit'
            }}
          />
          <span style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '12px' }}>
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const href = item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(229, 9, 20, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    style={{
                      width: '46px',
                      height: '62px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: item.type === 'series' ? 'var(--brand-gradient)' : 'rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.type === 'series' ? 'SERIAL' : 'KINO'}
                      </span>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isSelected ? '#fff' : 'var(--text-main)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.title}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{item.year}</span>
                      <span>•</span>
                      <span>{item.country}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-cyan)' }}>{item.genres?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 700 }}>
                    ★ {item.rating?.toFixed(1) || '8.5'}
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              "{query}" bo'yicha hech narsa topilmadi.
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-dim)'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>↑↓ tanlash</span>
            <span>↵ ochish</span>
            <span>ESC chiqish</span>
          </div>
          {query.trim() && (
            <Link
              href={`/catalog?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}
            >
              Barcha natijalarni katalogda ko'rish →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
