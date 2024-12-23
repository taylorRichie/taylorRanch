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
import { Home, Images, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterIcon } from 'lucide-react';

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
    pagination,
    date,
    showFavorites,
    animalFilter,
    setShowFavorites
  } = useGallery();

  const { favorites, isInitialized } = useFavorites();
  
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      date ||
      showFavorites ||
      animalFilter
    );
  }, [date, showFavorites, animalFilter]);

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
  }, [setShowFavorites]);

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
  const filteredImages = images
    .filter(image => {
      // Date filter
      if (date) {
        const imageDate = new Date(image.capture_time);
        return (
          imageDate.getFullYear() === date.getFullYear() &&
          imageDate.getMonth() === date.getMonth() &&
          imageDate.getDate() === date.getDate()
        );
      }
      return true;
    })
    .filter(image => {
      // Favorites filter
      if (showFavorites) {
        return favorites.includes(image.id);
      }
      return true;
    })
    .filter(image => {
      // Animal filter
      if (animalFilter) {
        return image.tags?.some(tag => tag.name === animalFilter);
      }
      return true;
    });

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.id === selectedImage.id) 
    : -1;

  const loading = galleryLoading;
  const error = galleryError;

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="hidden md:block border-b">
        <div className="container mx-auto">
          <Tabs defaultValue="gallery">
            <TabsList className="w-full justify-center h-14">
              <TabsTrigger value="home" className="gap-2 text-base px-6" onClick={() => router.push('/')}>
                <Home className="h-5 w-5" />
                Home
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 text-base px-6">
                <Images className="h-5 w-5" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2 text-base px-6" onClick={() => router.push('/weather')}>
                <Cloud className="h-5 w-5" />
                Weather
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="gallery" className="h-full flex flex-col">
          <TabsContent value="gallery" className="flex-1">
            <div className="space-y-4">
              {/* Header with controls */}
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-20">
                <div className="flex justify-between items-center">
                  <div className="md:flex-1">
                    <div className="md:hidden">
                      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative">
                            <FilterIcon className="h-5 w-5" />
                            {hasActiveFilters && (
                              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
                            )}
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                          <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4">
                            <FilterBar
                              onFilterChange={handleFilterChange}
                              locations={locations}
                              currentFilters={filters}
                              showFavorites={showFavorites}
                              onToggleFavorites={() => handleToggleFavorites(!showFavorites)}
                              totalCount={filteredImages.length}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                    <div className="hidden md:block">
                      <FilterBar
                        onFilterChange={handleFilterChange}
                        locations={locations}
                        currentFilters={filters}
                        showFavorites={showFavorites}
                        onToggleFavorites={() => handleToggleFavorites(!showFavorites)}
                        totalCount={filteredImages.length}
                      />
                    </div>
                  </div>
                  <SortControls
                    onSortChange={handleFilterChange}
                    currentSort={{
                      sort_by: filters.sort_by || 'capture_time',
                      sort_order: filters.sort_order || 'desc'
                    }}
                  />
                </div>
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
        <nav className="w-full max-w-screen-xl mx-auto">
          <div className="flex justify-around items-center py-4 px-2">
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
              <Cloud className="h-5 w-5" />
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