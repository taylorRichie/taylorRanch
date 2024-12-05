'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { placeholderImages } from '@/lib/placeholder-data';
import { FilterOptions, GalleryImage, SortOption } from '@/types';

export default function Home() {
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>(placeholderImages);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const locations = Array.from(new Set(placeholderImages.map(img => img.location)));

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...placeholderImages];

    if (filters.dateRange) {
      filtered = filtered.filter(img => {
        const imgDate = new Date(img.timestamp);
        return imgDate >= filters.dateRange!.start && imgDate <= filters.dateRange!.end;
      });
    }

    if (filters.location) {
      filtered = filtered.filter(img => img.location === filters.location);
    }

    setFilteredImages(filtered);
  };

  const handleSortChange = (sort: SortOption) => {
    const sorted = [...filteredImages];
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'location':
        sorted.sort((a, b) => a.location.localeCompare(b.location));
        break;
    }
    setFilteredImages(sorted);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const currentIndex = selectedImage ? filteredImages.findIndex(img => img.id === selectedImage.id) : -1;

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <FilterBar 
          onFilterChange={handleFilterChange}
          locations={locations}
        />
        <SortControls onSortChange={handleSortChange} />
      </div>

      <ImageGrid 
        images={filteredImages}
        onImageClick={handleImageClick}
      />

      <ImageDetail
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onPrevious={() => setSelectedImage(filteredImages[currentIndex - 1])}
        onNext={() => setSelectedImage(filteredImages[currentIndex + 1])}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < filteredImages.length - 1}
      />
    </main>
  );
}