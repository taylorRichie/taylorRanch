'use client';

import { GalleryImage } from "@/types";
import { useState } from "react";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
}

export function ImageGrid({ images, onImageClick }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

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