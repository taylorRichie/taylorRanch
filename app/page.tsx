'use client';

import { useState, useEffect, useMemo } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage, ImageFilters } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';

export default function Home() {
  const {
    images,
    locations,
    loading: galleryLoading,
    error: galleryError,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    hasMore,
    pagination
  } = useGallery();

  const { favorites, isInitialized } = useFavorites();
  
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Sync favorites state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setShowFavorites(window.location.hash === '#favorites');
    };

    // Set initial state
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleToggleFavorites = (newShowFavorites: boolean) => {
    setShowFavorites(newShowFavorites);
    window.location.hash = newShowFavorites ? '#favorites' : '';
  };

  const handleFilterChange = (newFilters: Partial<ImageFilters>) => {
    updateFilters(newFilters);
  };

  // Filter images for favorites view
  const favoriteImages = useMemo(() => {
    if (!isInitialized) return [];
    return images.filter(image => favorites.includes(image.id));
  }, [images, favorites, isInitialized]);

  // Apply filters to either the main gallery or favorites
  const filteredImages = showFavorites ? favoriteImages : images;

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.id === selectedImage.id) 
    : -1;

  const loading = galleryLoading;
  const error = galleryError;

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <FilterBar 
              onFilterChange={handleFilterChange}
              locations={locations}
              currentFilters={filters}
              showFavorites={showFavorites}
              onToggleFavorites={() => handleToggleFavorites(!showFavorites)}
              totalCount={showFavorites ? filteredImages.length : pagination?.total}
            />
            
            {/* Sort Controls - Always visible */}
            <SortControls 
              onSortChange={(sort) => handleFilterChange(sort)}
              currentSort={{
                sort_by: filters.sort_by || 'capture_time',
                sort_order: filters.sort_order || 'desc'
              }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        <ImageGrid 
          images={filteredImages}
          onImageClick={handleImageClick}
          isLoading={loading}
          onLoadMore={loadMore}
          hasMore={!showFavorites && hasMore}
        />
      </div>

      {selectedImage && (
        <ImageDetail
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={currentIndex < filteredImages.length - 1 
            ? () => setSelectedImage(filteredImages[currentIndex + 1])
            : undefined}
          onPrevious={currentIndex > 0
            ? () => setSelectedImage(filteredImages[currentIndex - 1])
            : undefined}
        />
      )}
    </main>
  );
}