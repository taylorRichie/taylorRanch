'use client';

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryImage } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import { format } from "date-fns";
import { ImageTags } from "./ImageTags";

interface FloatingHeartProps {
  x: number;
  y: number;
  onComplete: () => void;
}

function FloatingHeart({ x, y, onComplete }: FloatingHeartProps) {
  return (
    <div 
      className="absolute pointer-events-none z-50 inset-0 flex items-center justify-center"
      style={{ 
        animation: 'float-heart 1s ease-out forwards'
      }}
      onAnimationEnd={onComplete}
    >
      <Heart className="h-4 w-4 text-[#01d3c7] fill-[#01d3c7]" />
    </div>
  );
}

interface ImageCardProps {
  image: GalleryImage;
  onClick?: () => void;
  isLoaded?: boolean;
  onLoad?: () => void;
}

export function ImageCard({ image, onClick, isLoaded, onLoad }: ImageCardProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(image.id);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number }[]>([]);
  const [nextHeartId, setNextHeartId] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're unfavoriting and in the favorites view
    if (isFavorite && window.location.hash === '#favorites') {
      setIsRemoving(true);
      // Wait for animation to complete before actually removing
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      setFloatingHearts(hearts => [...hearts, { id: nextHeartId }]);
      setNextHeartId(id => id + 1);
    }
    
    toggleFavorite(image.id);
  }, [image.id, toggleFavorite, nextHeartId, isFavorite]);

  const removeHeart = useCallback((heartId: number) => {
    setFloatingHearts(hearts => hearts.filter(heart => heart.id !== heartId));
  }, []);

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200",
      isRemoving && "animate-fade-out"
    )}>
      <CardContent className="p-0 cursor-pointer" onClick={onClick}>
        <div className="relative aspect-[4/3]">
          <Image
            src={image.cdn_url}
            alt={`${image.primary_location} - ${image.secondary_location}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            onLoad={onLoad}
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col">
        <div className="w-full flex justify-between items-start">
          <div className="text-sm">
            <p className="font-medium truncate">
              {format(new Date(image.capture_time), 'MMM d, yyyy, h:mm:ss aa')}
            </p>
            <p className="text-muted-foreground truncate">
              {image.secondary_location 
                ? `${image.primary_location} - ${image.secondary_location}`
                : image.primary_location}
            </p>
            <ImageTags tags={image.tags} />
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={handleFavoriteClick}
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors",
                isFavorite && "fill-[#01d3c7] text-[#01d3c7]"
              )} />
              {floatingHearts.map(heart => (
                <FloatingHeart
                  key={heart.id}
                  x={0}
                  y={0}
                  onComplete={() => removeHeart(heart.id)}
                />
              ))}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 