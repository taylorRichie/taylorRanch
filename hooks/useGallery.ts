import { useState, useEffect } from 'react';
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

  // Load images when filters change
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchImages(filters);
        setImages(response.images);
        setPagination(response.pagination);
      } catch (err) {
        setError('Failed to load images');
        console.error('Error loading images:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [filters]);

  const updateFilters = (newFilters: Partial<ImageFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when any filter except page changes
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
    resetFilters
  };
} 