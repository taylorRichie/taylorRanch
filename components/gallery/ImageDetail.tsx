'use client';

import { GalleryImage } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  XIcon
} from "lucide-react";
import NextImage from "next/image";
import { ImageMetadata } from "./ImageMetadata";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ImageDetailProps {
  image: GalleryImage | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ImageDetail({ 
  image, 
  onClose, 
  onPrevious, 
  onNext,
  hasPrevious,
  hasNext
}: ImageDetailProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!image) return;
    setIsImageLoaded(false);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      } else if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      } else if (e.key === 'f') {
        setIsFullscreen(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, hasPrevious, hasNext, onPrevious, onNext, onClose, isFullscreen]);

  if (!image) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(image.cdn_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trail-camera-${format(new Date(image.capture_time), 'yyyy-MM-dd-HH-mm')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const formattedDate = format(new Date(image.capture_time), 'MMMM d, yyyy h:mm a');
  const locationDisplay = image.secondary_location 
    ? `${image.primary_location} - ${image.secondary_location}`
    : image.primary_location;

  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "max-w-7xl h-[90vh] p-0 flex flex-col",
        isFullscreen && "!w-screen !h-screen !max-w-none !rounded-none"
      )}>
        <DialogHeader className={cn(
          "p-6 flex-none",
          isFullscreen && "hidden"
        )}>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl mb-2">{formattedDate}</DialogTitle>
              <p className="text-muted-foreground">{locationDisplay}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 bg-muted flex items-center justify-center overflow-hidden">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <div className="relative w-full h-full">
            <NextImage
              src={image.cdn_url}
              alt={`Trail camera image from ${locationDisplay} on ${formattedDate}`}
              fill
              className={cn(
                "object-contain w-full h-full transition-opacity duration-300",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
              priority
              unoptimized
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={onPrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <MinimizeIcon className="h-4 w-4" />
                  ) : (
                    <MaximizeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className={cn(
          "p-6 flex-none",
          isFullscreen && "hidden"
        )}>
          <ImageMetadata image={image} />
        </div>
      </DialogContent>
    </Dialog>
  );
}