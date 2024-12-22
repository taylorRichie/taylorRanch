'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Thermometer, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface GalleryImage {
  id: number;
  capture_time: string;
  cdn_url: string;
  location: string;
  temperature: number;
  temperature_unit: string;
  wind_speed: number;
  wind_direction: string;
  wind_unit: string;
}

export function ImageCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gallery/recent')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch images');
        return res.json();
      })
      .then(data => {
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images);
        }
      })
      .catch(err => {
        console.error('Error loading images:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
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
      <CardContent className="space-y-4">
        {/* Location, Date, and Weather */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {currentImage.location}
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

        {/* Image */}
        <div className="relative aspect-video">
          <img
            src={currentImage.cdn_url}
            alt={`Captured at ${currentImage.location}`}
            className="object-cover w-full h-full rounded-md"
          />
          
          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
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