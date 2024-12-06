'use client';

import { GalleryImage } from "@/lib/api";
import { useState } from "react";
import { ImageCard } from "./ImageCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  isLoading?: boolean;
}

export function ImageGrid({ images, onImageClick, isLoading }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No images found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
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
  );
}