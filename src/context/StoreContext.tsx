'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MediaItem } from '@/types';

export interface WatchHistoryItem {
  id: string;
  item: MediaItem;
  currentTime: number;
  duration: number;
  progressPercent: number;
  episodeId?: string;
  episodeTitle?: string;
  updatedAt: number;
}

interface StoreContextType {
  // Favorites
  favorites: MediaItem[];
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: MediaItem) => void;
  clearFavorites: () => void;
  favoritesCount: number;

  // Watch History
  history: WatchHistoryItem[];
  recordProgress: (
    item: MediaItem,
    currentTime: number,
    duration: number,
    episodeId?: string,
    episodeTitle?: string
  ) => void;
  markAsWatched: (item: MediaItem) => void;
  isWatched: (id: string) => boolean;
  getProgress: (id: string) => WatchHistoryItem | undefined;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;

  // Status
  isLoaded: boolean;
}

const FAVORITES_KEY = 'filmx_favorites_v1';
const HISTORY_KEY = 'filmx_watch_history_v1';

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (only once for entire app!)
  useEffect(() => {
    try {
      const storedFav = localStorage.getItem(FAVORITES_KEY);
      if (storedFav) {
        const parsedFav = JSON.parse(storedFav);
        if (Array.isArray(parsedFav)) setFavorites(parsedFav);
      }

      const storedHist = localStorage.getItem(HISTORY_KEY);
      if (storedHist) {
        const parsedHist = JSON.parse(storedHist);
        if (Array.isArray(parsedHist)) setHistory(parsedHist);
      }
    } catch (e) {
      console.error('Failed to load storage in StoreProvider:', e);
    } finally {
      setIsLoaded(true);
    }

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        try {
          setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      } else if (e.key === HISTORY_KEY) {
        try {
          setHistory(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Set of favorite IDs for ultra-fast O(1) membership checks
  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback((item: MediaItem) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      const updated = exists
        ? prev.filter((fav) => fav.id !== item.id)
        : [item, ...prev];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Store: failed to save favorites', err);
      }
      return updated;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch {}
  }, []);

  const recordProgress = useCallback(
    (
      item: MediaItem,
      currentTime: number,
      duration: number,
      episodeId?: string,
      episodeTitle?: string
    ) => {
      if (!duration || duration <= 0) return;
      const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100));

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.id !== item.id);
        const newEntry: WatchHistoryItem = {
          id: item.id,
          item,
          currentTime,
          duration,
          progressPercent,
          episodeId,
          episodeTitle,
          updatedAt: Date.now()
        };

        const updated = [newEntry, ...filtered].slice(0, 30);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    },
    []
  );

  const markAsWatched = useCallback((item: MediaItem) => {
    recordProgress(item, 100, 100);
  }, [recordProgress]);

  const isWatched = useCallback((id: string): boolean => {
    const found = history.find((h) => h.id === id);
    return found ? found.progressPercent >= 85 : false;
  }, [history]);

  const getProgress = useCallback((id: string): WatchHistoryItem | undefined => {
    return history.find((h) => h.id === id);
  }, [history]);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({
    favorites,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length,

    history,
    recordProgress,
    markAsWatched,
    isWatched,
    getProgress,
    removeHistoryItem,
    clearHistory,

    isLoaded
  }), [
    favorites,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    history,
    recordProgress,
    markAsWatched,
    isWatched,
    getProgress,
    removeHistoryItem,
    clearHistory,
    isLoaded
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    // Fallback safe dummy context if rendered outside provider
    return {
      favorites: [],
      favoriteIds: new Set(),
      isFavorite: () => false,
      toggleFavorite: () => {},
      clearFavorites: () => {},
      favoritesCount: 0,
      history: [],
      recordProgress: () => {},
      markAsWatched: () => {},
      isWatched: () => false,
      getProgress: () => undefined,
      removeHistoryItem: () => {},
      clearHistory: () => {},
      isLoaded: false
    };
  }
  return context;
}
