'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage } from '@/lib/api';

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

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <FilterBar 
          onFilterChange={updateFilters}
          locations={locations}
          currentFilters={filters}
        />
        <SortControls 
          onSortChange={(sort) => updateFilters(sort)}
          currentSort={{
            sort_by: filters.sort_by || 'capture_time',
            sort_order: filters.sort_order || 'desc'
          }}
        />
      </div>

      <ImageGrid 
        images={images}
        onImageClick={handleImageClick}
        isLoading={loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      <ImageDetail
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onPrevious={() => setSelectedImage(images[currentIndex - 1])}
        onNext={() => setSelectedImage(images[currentIndex + 1])}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < images.length - 1}
      />

      {error && (
        <div className="text-destructive text-center py-4">
          {error}
        </div>
      )}
    </main>
  );
}