'use client';

import { GalleryImage } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { ImageCard } from "./ImageCard";
import { Spinner } from "@/components/ui/spinner";

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  loading?: boolean;
  error?: string | null;
}

export function ImageGrid({ images, onImageClick, loading, error }: ImageGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" className="text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No images found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(image)}
        />
      ))}
    </div>
  );
}