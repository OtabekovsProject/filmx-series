'use client';

import { useStore, WatchHistoryItem } from '@/context/StoreContext';
export type { WatchHistoryItem };

export function useWatchHistory() {
  const {
    history,
    recordProgress,
    markAsWatched,
    isWatched,
    getProgress,
    removeHistoryItem,
    clearHistory,
    isLoaded
  } = useStore();

  return {
    history,
    recordProgress,
    markAsWatched,
    isWatched,
    getProgress,
    removeHistoryItem,
    clearHistory,
    isLoaded
  };
}
