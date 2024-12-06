'use client';

import { GalleryImage } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [leftArrowAnimate, setLeftArrowAnimate] = useState(false);
  const [rightArrowAnimate, setRightArrowAnimate] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setLeftArrowAnimate(true);
    onPrevious();
    setTimeout(() => setLeftArrowAnimate(false), 200);
  };

  const handleNext = () => {
    setRightArrowAnimate(true);
    onNext();
    setTimeout(() => setRightArrowAnimate(false), 200);
  };

  // Reset image loaded state when image changes
  useEffect(() => {
    if (!image) return;
    setIsImageLoaded(false);
  }, [image]);

  useEffect(() => {
    if (!image) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      } else if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, hasPrevious, hasNext, onPrevious, onNext, onClose, isFullscreen]);

  useEffect(() => {
    function handleFullscreenChange() {
      const isNowFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isNowFullscreen);
      
      // Ensure image stays visible during transitions
      if (!isNowFullscreen) {
        // Small delay to let the transition complete
        setTimeout(() => {
          setIsImageLoaded(true);
        }, 100);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleDownload = async () => {
    if (!image) return;
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

  const toggleFullscreen = async () => {
    if (!fullscreenContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await fullscreenContainerRef.current.requestFullscreen();
        // Ensure image is visible after entering fullscreen
        setTimeout(() => {
          setIsImageLoaded(true);
        }, 100);
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  if (!image) return null;

  const formattedDate = format(new Date(image.capture_time), 'MMMM d, yyyy h:mm a');
  const locationDisplay = image.secondary_location 
    ? `${image.primary_location} - ${image.secondary_location}`
    : image.primary_location;

  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent 
        className={cn(
          "w-[90vw] h-[90vh] max-w-6xl max-h-[1000px] p-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] overflow-visible",
          isFullscreen && "w-screen h-screen max-w-none max-h-none translate-x-0 translate-y-0 top-0 left-0",
          "[&>button]:hidden" // Hide the default close button
        )}
      >
        <div 
          ref={fullscreenContainerRef} 
          className={cn(
            "flex flex-col h-full relative",
            isFullscreen && "fixed inset-0 bg-background z-50"
          )}
        >
          {/* Navigation Arrows */}
          <div className={cn(
            "absolute inset-0 pointer-events-none z-50",
            "flex items-center justify-between px-4"
          )}>
            {/* Left Arrow */}
            <div 
              style={{
                transform: `translateX(${!isFullscreen ? '-80px' : '0px'}) translateX(${leftArrowAnimate ? '-10px' : '0px'})`
              }}
              className="pointer-events-auto transition-transform duration-200"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      className="h-12 w-12 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                      <ChevronLeftIcon className="h-8 w-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right Arrow */}
            <div 
              style={{
                transform: `translateX(${!isFullscreen ? '80px' : '0px'}) translateX(${rightArrowAnimate ? '10px' : '0px'})`
              }}
              className="pointer-events-auto transition-transform duration-200"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="h-12 w-12 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                      <ChevronRightIcon className="h-8 w-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <DialogHeader className={cn(
            "p-6 flex-none bg-background",
            isFullscreen && "absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm"
          )}>
            <div className="flex justify-between items-center gap-8">
              <div>
                <DialogTitle className="text-2xl mb-2">{formattedDate}</DialogTitle>
                <p className="text-muted-foreground">{locationDisplay}</p>
              </div>

              <div className="flex items-center gap-8">
                <ImageMetadata image={image} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground flex-none"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className={cn(
            "relative flex-1 min-h-0 bg-muted",
            isFullscreen && "h-screen"
          )}>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <div className="absolute inset-0">
              <NextImage
                src={image.cdn_url}
                alt={`Trail camera image from ${locationDisplay} on ${formattedDate}`}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
                priority
                unoptimized
                sizes="100vw"
              />
            </div>
          </div>

          <div className={cn(
            "p-6 flex-none bg-background",
            isFullscreen && "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm"
          )}>
            <div className="flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDownload}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download image</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}