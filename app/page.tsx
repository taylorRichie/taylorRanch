'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';

export default function Home() {
  const {
    images,
    locations,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    hasMore
  } = useGallery();

  const { favorites, isInitialized } = useFavorites();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const filteredImages = images.filter(img => 
    !showFavorites || !isInitialized || favorites.includes(img.id)
  );

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.id === selectedImage.id) 
    : -1;

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <FilterBar 
              onFilterChange={updateFilters}
              locations={locations}
              currentFilters={filters}
              showFavorites={showFavorites}
              onToggleFavorites={() => setShowFavorites(!showFavorites)}
            />
            <SortControls 
              onSortChange={(sort) => updateFilters(sort)}
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
          hasMore={hasMore && !showFavorites}
        />

        <ImageDetail
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onPrevious={() => setSelectedImage(filteredImages[currentIndex - 1])}
          onNext={() => setSelectedImage(filteredImages[currentIndex + 1])}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < filteredImages.length - 1}
        />

        {error && (
          <div className="text-destructive text-center py-4">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}