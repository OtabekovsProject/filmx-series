'use client';

import { useState, useEffect } from 'react';
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

const HISTORY_KEY = 'filmx_watch_history_v1';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load watch history', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const recordProgress = (
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

      const updated = [newEntry, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('filmx_history_updated'));
      } catch (e) {}
      return updated;
    });
  };

  const markAsWatched = (item: MediaItem) => {
    recordProgress(item, 100, 100);
  };

  const isWatched = (id: string): boolean => {
    const found = history.find((h) => h.id === id);
    return found ? found.progressPercent >= 90 : false;
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('filmx_history_updated'));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {}
    };

    window.addEventListener('filmx_history_updated', handleSync);
    return () => window.removeEventListener('filmx_history_updated', handleSync);
  }, []);

  return {
    history,
    recordProgress,
    markAsWatched,
    isWatched,
    removeHistoryItem,
    isLoaded
  };
}
