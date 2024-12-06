'use client';

import { GalleryImage } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { ImageMetadata } from "./ImageMetadata";
import { format } from "date-fns";

interface ImageCardProps {
  image: GalleryImage;
  isLoaded: boolean;
  onLoad: () => void;
  onClick: () => void;
}

export function ImageCard({ image, isLoaded, onLoad, onClick }: ImageCardProps) {
  const captureDate = new Date(image.capture_time);
  const formattedDate = format(captureDate, 'MMM d, yyyy h:mm a');
  const locationDisplay = image.secondary_location 
    ? `${image.primary_location} - ${image.secondary_location}`
    : image.primary_location;

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-0 relative aspect-[4/3]">
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <NextImage
          src={image.cdn_url}
          alt={`Trail camera image from ${locationDisplay} on ${formattedDate}`}
          width={800}
          height={600}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={onLoad}
          priority={image.id <= 4}
          unoptimized
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <div className="w-full">
          <p className="text-sm font-medium">{formattedDate}</p>
          <p className="text-sm text-muted-foreground">{locationDisplay}</p>
          <ImageMetadata image={image} />
        </div>
      </CardFooter>
    </Card>
  );
}