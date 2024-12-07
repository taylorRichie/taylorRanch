'use client';

import React from 'react';
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { GalleryImage, ImageFilters } from '@/lib/api';

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
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    console.log('Loaded favorites from localStorage:', parsed);
    return Array.isArray(parsed) ? parsed : [];
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

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = getFavoritesFromStorage();
    setFavorites(storedFavorites);
    setIsInitialized(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const jsonString = JSON.stringify(favorites);
      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Saving to localStorage:', {
        key: STORAGE_KEY,
        value: jsonString
      });
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }, [favorites, isInitialized]);

  const toggleFavorite = useCallback((imageId: number) => {
    setFavorites(prev => {
      const isCurrentlyFavorited = prev.includes(imageId);
      const newFavorites = isCurrentlyFavorited
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId];
      
      console.log('Toggling favorite:', {
        imageId,
        wasSelected: isCurrentlyFavorited,
        newFavorites
      });
      
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((imageId: number) => {
    return favorites.includes(imageId);
  }, [favorites]);

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    isInitialized
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 