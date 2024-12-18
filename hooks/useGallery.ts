'use client';

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
  const [filters, setFilters] = useState<ImageFilters>(() => {
    // Initialize with default filters
    return {
      page: 1,
      per_page: 20,
      sort_by: 'capture_time',
      sort_order: 'desc'
    };
  });
  const [pagination, setPagination] = useState<ImageResponse['pagination'] | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load locations on mount
  useEffect(() => {
    console.log('Loading locations...');
    const loadLocations = async () => {
      try {
        const locationData = await fetchLocations();
        console.log('Loaded locations:', locationData);
        setLocations(locationData);
      } catch (err) {
        console.error('Error loading locations:', err);
        setError('Failed to load locations');
      }
    };

    loadLocations();
  }, []);

  // Load initial images when filters change (except page)
  useEffect(() => {
    console.log('Loading initial images with filters:', filters);
    const loadInitialImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchImages({ ...filters, page: 1 });
        console.log('Loaded initial images:', response);
        setImages(response.images);
        setPagination(response.pagination || { page: 1, total_pages: 1, total: response.images.length, per_page: 20 });
        setHasMore(response.pagination?.page < response.pagination?.total_pages || false);
      } catch (err) {
        console.error('Error loading initial images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadInitialImages();
  }, [
    filters.sort_by,
    filters.sort_order,
    filters.location,
    filters.start_date,
    filters.end_date
  ]);

  const loadMore = useCallback(async () => {
    if (!pagination || loading || !hasMore) {
      console.log('Skipping loadMore:', { pagination, loading, hasMore });
      return;
    }

    const nextPage = pagination.page + 1;
    console.log('Loading more images, page:', nextPage);
    try {
      setLoading(true);
      const response = await fetchImages({ ...filters, page: nextPage });
      console.log('Loaded more images:', response);
      setImages(prev => [...prev, ...response.images]);
      setPagination(response.pagination || pagination);
      setHasMore(response.pagination?.page < response.pagination?.total_pages || false);
    } catch (err) {
      console.error('Error loading more images:', err);
      setError('Failed to load more images');
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, hasMore, filters]);

  const updateFilters = useCallback((newFilters: Partial<ImageFilters>) => {
    console.log('Updating filters:', newFilters);
    setFilters(prev => {
      // Create a new filter object with the updates
      const updatedFilters = {
        ...prev,
        ...newFilters,
        // Reset page to 1 when filters change
        page: 1
      };
      
      // If sort settings are not being explicitly changed, preserve them
      if (!newFilters.sort_by && !newFilters.sort_order) {
        updatedFilters.sort_by = prev.sort_by;
        updatedFilters.sort_order = prev.sort_order;
      }
      
      return updatedFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    console.log('Resetting filters to default');
    setFilters({
      page: 1,
      per_page: 20,
      sort_by: 'capture_time',
      sort_order: 'desc'
    });
  }, []);

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