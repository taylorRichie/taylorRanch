'use client';

import { useState, useEffect, useMemo } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage, ImageFilters } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home, Images, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const router = useRouter();

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
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 pb-[80px] md:pb-8">
        <Tabs defaultValue="gallery" className="h-full flex flex-col">
          {/* Tabs list - hidden on mobile, shown on desktop */}
          <div className="hidden md:block">
            <TabsList>
              <TabsTrigger value="home" className="gap-2" onClick={() => router.push('/')}>
                <Home className="h-4 w-4" />
                Home
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Images className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2" onClick={() => router.push('/weather')}>
                <LineChart className="h-4 w-4" />
                Weather
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gallery" className="flex-1">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Gallery</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  {showFavorites ? 'Show All' : 'Show Favorites'}
                </Button>
              </div>

              <ImageGrid
                images={filteredImages}
                onImageClick={(image) => setSelectedImage(image)}
                loading={loading}
                error={error}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <nav className="container mx-auto px-4">
          <div className="flex justify-around py-4">
            <button 
              onClick={() => router.push('/')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => router.push('/gallery')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-primary"
            >
              <Images className="h-5 w-5" />
              <span>Gallery</span>
            </button>
            <button 
              onClick={() => router.push('/weather')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <LineChart className="h-5 w-5" />
              <span>Weather</span>
            </button>
          </div>
        </nav>
      </div>

      {selectedImage && (
        <ImageDetail
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onPrevious={currentIndex > 0 ? () => setSelectedImage(filteredImages[currentIndex - 1]) : undefined}
          onNext={currentIndex < filteredImages.length - 1 ? () => setSelectedImage(filteredImages[currentIndex + 1]) : undefined}
          showPrevious={currentIndex > 0}
          showNext={currentIndex < filteredImages.length - 1}
        />
      )}
    </main>
  );
}