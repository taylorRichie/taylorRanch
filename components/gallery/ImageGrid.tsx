'use client';

import { GalleryImage } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { ImageCard } from "./ImageCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  isLoading?: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ImageGrid({ images, onImageClick, isLoading, onLoadMore, hasMore }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore, onLoadMore]);

  if (images.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No images found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            isLoaded={loadedImages.has(image.id)}
            onLoad={() => handleImageLoad(image.id)}
            onClick={() => onImageClick(image)}
          />
        ))}
      </div>

      <div 
        ref={observerTarget} 
        className="h-4 w-full my-8"
      >
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}