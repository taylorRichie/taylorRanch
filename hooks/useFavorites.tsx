'use client';

import React from 'react';
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

const STORAGE_KEY = 'taylorRanch_favorites';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (imageId: number) => void;
  isFavorite: (imageId: number) => boolean;
  isInitialized: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  isInitialized: false
});

// Helper function to safely get favorites from localStorage
const getFavoritesFromStorage = (): number[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading favorites:', e);
    return [];
  }
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedFavorites = getFavoritesFromStorage();
    setFavorites(storedFavorites);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      console.log('Saved favorites to localStorage:', favorites);
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }, [favorites, isInitialized]);

  const toggleFavorite = useCallback((imageId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId];
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((imageId: number): boolean => {
    return favorites.includes(imageId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider 
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isInitialized
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 