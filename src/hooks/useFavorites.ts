'use client';

import { useStore } from '@/context/StoreContext';

export function useFavorites() {
  const { favorites, isFavorite, toggleFavorite, clearFavorites, favoritesCount, isLoaded } = useStore();

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoritesCount,
    isLoaded
  };
}
