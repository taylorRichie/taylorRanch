import { useState, useEffect, useCallback } from 'react';
import { fetchImages, fetchLocations, ImageFilters, ImageResponse, Location } from '@/lib/api';

interface UseGalleryReturn {
  images: any[];
  locations: Location[];
  loading: boolean;
  error: string | null;
  filters: ImageFilters;
  pagination: ImageResponse['pagination'] | null;
  updateFilters: (newFilters: Partial<ImageFilters>) => void;
  resetFilters: () => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const defaultFilters: ImageFilters = {
  page: 1,
  per_page: 20,
  sort_by: 'capture_time',
  sort_order: 'desc'
};

export function useGallery(): UseGalleryReturn {
  const [images, setImages] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilters>(defaultFilters);
  const [pagination, setPagination] = useState<ImageResponse['pagination'] | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationData = await fetchLocations();
        setLocations(locationData);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error loading locations:', err);
      }
    };

    loadLocations();
  }, []);

  // Load initial images when filters change (except page)
  useEffect(() => {
    const loadInitialImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchImages({ ...filters, page: 1 });
        setImages(response.images);
        setPagination(response.pagination);
        setHasMore(response.pagination.page < response.pagination.total_pages);
      } catch (err) {
        setError('Failed to load images');
        console.error('Error loading images:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only reset and reload if filters other than page changed
    const filtersWithoutPage = { ...filters };
    delete filtersWithoutPage.page;
    loadInitialImages();
  }, [JSON.stringify({ ...filters, page: undefined })]);

  const loadMore = useCallback(async () => {
    if (!pagination || loading || !hasMore) return;

    const nextPage = pagination.page + 1;
    try {
      setLoading(true);
      const response = await fetchImages({ ...filters, page: nextPage });
      setImages(prev => [...prev, ...response.images]);
      setPagination(response.pagination);
      setHasMore(response.pagination.page < response.pagination.total_pages);
    } catch (err) {
      setError('Failed to load more images');
      console.error('Error loading more images:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, hasMore, filters]);

  const updateFilters = (newFilters: Partial<ImageFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Only reset page if filters other than page are changing
      page: 'page' in newFilters ? newFilters.page! : 1
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    images,
    locations,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    resetFilters,
    loadMore,
    hasMore
  };
} 