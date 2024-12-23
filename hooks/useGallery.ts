'use client';

import { useEffect } from 'react';
import { fetchImages, fetchLocations, ImageFilters, ImageResponse, Location } from '@/lib/api';
import { create } from 'zustand';

interface GalleryState {
  date: Date | null;
  showFavorites: boolean;
  animalFilter: string | null;
  images: any[];
  locations: Location[];
  loading: boolean;
  error: string | null;
  filters: ImageFilters;
  pagination: ImageResponse['pagination'] | null;
  hasMore: boolean;
}

interface GalleryActions {
  setDate: (date: Date | null) => void;
  setShowFavorites: (show: boolean) => void;
  setAnimalFilter: (animal: string | null) => void;
  setImages: (images: any[]) => void;
  setLocations: (locations: Location[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: ImageResponse['pagination'] | null) => void;
  setHasMore: (hasMore: boolean) => void;
  updateFilters: (newFilters: Partial<ImageFilters>) => void;
  resetFilters: () => void;
  loadMore: () => Promise<void>;
}

const defaultFilters: ImageFilters = {
  page: 1,
  per_page: 20,
  sort_by: 'capture_time',
  sort_order: 'desc'
};

export const useGalleryStore = create<GalleryState & GalleryActions>((set, get) => ({
  // State
  date: null,
  showFavorites: false,
  animalFilter: null,
  images: [],
  locations: [],
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: null,
  hasMore: true,

  // Actions
  setDate: (date) => set({ date }),
  setShowFavorites: (show) => set({ showFavorites: show }),
  setAnimalFilter: (animal) => set({ animalFilter: animal }),
  setImages: (images) => set({ images }),
  setLocations: (locations) => set({ locations }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  setHasMore: (hasMore) => set({ hasMore }),

  updateFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: 1
      }
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  loadMore: async () => {
    const state = get();
    if (!state.pagination || state.loading || !state.hasMore) return;

    const nextPage = state.pagination.page + 1;
    try {
      set({ loading: true });
      const response = await fetchImages({ ...state.filters, page: nextPage });
      set((state) => ({
        images: [...state.images, ...response.images],
        pagination: response.pagination || state.pagination,
        hasMore: response.pagination?.page < (response.pagination?.total_pages || 0)
      }));
    } catch (err) {
      set({ error: 'Failed to load more images' });
    } finally {
      set({ loading: false });
    }
  }
}));

// Custom hook to handle side effects
export function useGallery() {
  const store = useGalleryStore();

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      const { setLoading, setError, setLocations } = useGalleryStore.getState();
      try {
        setLoading(true);
        const locationData = await fetchLocations();
        setLocations(locationData);
      } catch (err) {
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Load initial images when filters change
  useEffect(() => {
    const { filters, setLoading, setError, setImages, setPagination, setHasMore } = useGalleryStore.getState();
    
    const loadInitialImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchImages({ ...filters, page: 1 });
        setImages(response.images);
        setPagination(response.pagination || { page: 1, total_pages: 1, total: response.images.length, per_page: 20 });
        setHasMore(response.pagination?.page < (response.pagination?.total_pages || 0));
      } catch (err) {
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadInitialImages();
  }, [store.filters]);

  return store;
} 