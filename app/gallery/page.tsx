'use client';

import { useState, useEffect, useMemo } from 'react';
import { FilterBar } from '@/components/gallery/FilterBar';
import { SortControls } from '@/components/gallery/SortControls';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ImageDetail } from '@/components/gallery/ImageDetail';
import { useGallery, useGalleryStore } from '@/hooks/useGallery';
import { GalleryImage, ImageFilters, AnimalTag } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home, Images, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterIcon, XCircleIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ImageCard } from '@/components/gallery/ImageCard';

export default function GalleryPage() {
  const router = useRouter();

  const {
    images,
    locations,
    loading: galleryLoading,
    error: galleryError,
    isInitialized: galleryInitialized,
    filters,
    updateFilters,
    resetFilters,
    loadMore,
    hasMore,
    pagination,
    date,
    showFavorites,
    animalFilters,
    setShowFavorites,
    setAnimalFilter
  } = useGallery();

  const { favorites, isInitialized: favoritesInitialized } = useFavorites();
  
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Current check for active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      date ||
      showFavorites ||
      animalFilters.length > 0
    );
  }, [date, showFavorites, animalFilters]);

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
    if (!favoritesInitialized) return [];
    return images.filter(image => favorites.includes(image.id));
  }, [images, favorites, favoritesInitialized]);

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
      if (animalFilters.length > 0) {
        return image.tags?.some((tag: AnimalTag) => 
          animalFilters.includes(tag.name)
        );
      }
      return true;
    });

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.id === selectedImage.id) 
    : -1;

  const loading = galleryLoading;
  const error = galleryError;

  // Add console logs to track state changes
  useEffect(() => {
    console.log('Gallery State:', {
      loading: galleryLoading,
      error: galleryError,
      imagesLength: images.length,
      filteredImagesLength: filteredImages.length
    });
  }, [galleryLoading, galleryError, images.length, filteredImages.length]);

  const handleClearFilters = () => {
    // Reset date and location filters
    updateFilters({
      start_date: undefined,
      end_date: undefined,
      location: undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order
    });
    
    // Reset favorites if active
    if (showFavorites) {
      handleToggleFavorites(false);
    }
    
    // Reset animal filters
    if (animalFilters.length > 0) {
      // Toggle off each active filter
      animalFilters.forEach(filter => {
        setAnimalFilter(filter);
      });
    }
    
    // Close the drawer
    setIsDrawerOpen(false);
  };

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
                    <div className="md:hidden flex items-center gap-2">
                      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="relative"
                            onClick={() => {
                              console.log('Filter icon clicked');
                            }}
                          >
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
                              isMobile={true}
                              onFilterChange={handleFilterChange}
                              locations={locations}
                              currentFilters={filters}
                              showFavorites={showFavorites}
                              onToggleFavorites={() => handleToggleFavorites(!showFavorites)}
                              totalCount={filteredImages.length}
                              loading={loading}
                              onClearFilters={handleClearFilters}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>

                      {/* Mobile Clear Filters Button */}
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleClearFilters}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <div className="hidden md:block">
                      <FilterBar
                        onFilterChange={handleFilterChange}
                        locations={locations}
                        currentFilters={filters}
                        showFavorites={showFavorites}
                        onToggleFavorites={() => handleToggleFavorites(!showFavorites)}
                        totalCount={filteredImages.length}
                        loading={loading}
                        onClearFilters={handleClearFilters}
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

              {/* Loading State */}
              {galleryLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size="lg" className="text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Loading images...</p>
                </div>
              )}

              {/* Error State */}
              {!galleryLoading && galleryError && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{galleryError}</p>
                </div>
              )}

              {/* No Images State - only show after initialization */}
              {galleryInitialized && !galleryLoading && !galleryError && filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No images found</p>
                </div>
              )}

              {/* Images Grid */}
              {!galleryLoading && !galleryError && filteredImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              )}
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