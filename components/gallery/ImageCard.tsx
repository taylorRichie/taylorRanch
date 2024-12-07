'use client';

import { GalleryImage } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface ImageCardProps {
  image: GalleryImage;
  isLoaded: boolean;
  onLoad: () => void;
  onClick: () => void;
}

export function ImageCard({ image, isLoaded, onLoad, onClick }: ImageCardProps) {
  const { isFavorite, toggleFavorite, isInitialized } = useFavorites();
  const captureDate = new Date(image.capture_time);
  const formattedDate = format(captureDate, 'MMM d, yyyy h:mm a');
  const locationDisplay = image.secondary_location 
    ? `${image.primary_location} - ${image.secondary_location}`
    : image.primary_location;

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isInitialized) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(image.id);
  };

  const isImageFavorite = isFavorite(image.id);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div 
        className="cursor-pointer"
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
      </div>
      <CardFooter className="flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm font-medium">{formattedDate}</p>
          <p className="text-sm text-muted-foreground">{locationDisplay}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            isInitialized && isImageFavorite && "text-red-500 hover:text-red-600"
          )}
          onClick={handleFavoriteClick}
          disabled={!isInitialized}
        >
          <Heart className={cn(
            "h-5 w-5",
            isInitialized && isImageFavorite && "fill-current"
          )} />
        </Button>
      </CardFooter>
    </Card>
  );
} 