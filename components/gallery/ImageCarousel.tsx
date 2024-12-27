'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Thermometer, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { fetchImages, GalleryImage } from '@/lib/api';

export function ImageCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const response = await fetchImages({
          page: 1,
          per_page: 10,
          sort_by: 'capture_time',
          sort_order: 'desc'
        });
        setImages(response.images);
      } catch (error) {
        console.error('Failed to load carousel images:', error);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error || images.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {error || 'No images available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <Card className="relative group w-full">
      <CardHeader>
        <CardTitle>Recent Images</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {currentImage.primary_location}
                {currentImage.secondary_location && ` - ${currentImage.secondary_location}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(currentImage.capture_time), 'PPp')}
              </p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                <span>{currentImage.temperature}°{currentImage.temperature_unit}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-4 w-4" />
                <span>{currentImage.wind_speed} {currentImage.wind_unit} {currentImage.wind_direction}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full">
          <Image
            src={currentImage.cdn_url}
            alt={`Captured at ${currentImage.primary_location}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-background/80 hover:bg-background/90",
              currentIndex === 0 && "hidden"
            )}
            onClick={previousImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-background/80 hover:bg-background/90",
              currentIndex === images.length - 1 && "hidden"
            )}
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 