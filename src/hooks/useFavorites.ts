'use client';

import { useState, useEffect } from 'react';
import { MediaItem } from '@/types';

const FAVORITES_KEY = 'filmx_favorites_v1';

export function useFavorites() {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleFavorite = (item: MediaItem) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      let updated: MediaItem[];
      if (exists) {
        updated = prev.filter((fav) => fav.id !== item.id);
      } else {
        updated = [item, ...prev];
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('filmx_favorites_updated'));
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e);
      }
      return updated;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        } else {
          setFavorites([]);
        }
      } catch (e) {}
    };

    window.addEventListener('filmx_favorites_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('filmx_favorites_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.length,
    isLoaded
  };
}
