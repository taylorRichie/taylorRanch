'use client';

import { GalleryImage } from "@/types";
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
  MinimizeIcon
} from "lucide-react";
import NextImage from "next/image";
import { ImageMetadata } from "./ImageMetadata";
import { WeatherInfo } from "./WeatherInfo";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!image) return;

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
    const response = await fetch(image.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = image.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "max-w-7xl h-[90vh] p-0 flex flex-col",
        isFullscreen && "!w-screen !h-screen !max-w-none !rounded-none"
      )}>
        <DialogHeader className={cn(
          "p-6",
          isFullscreen && "hidden"
        )}>
          <DialogTitle className="text-2xl">{image.filename}</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 bg-muted flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <NextImage
              src={image.url}
              alt={image.filename}
              fill
              className="object-contain w-full h-full"
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
          "p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          isFullscreen && "hidden"
        )}>
          <ImageMetadata image={image} />
          {image.weather && <WeatherInfo weather={image.weather} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}