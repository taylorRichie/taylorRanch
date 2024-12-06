'use client';

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, X, Download, Maximize, Minimize, ThermometerIcon, Wind, Cloud, Moon } from "lucide-react";
import { useState, useCallback, TouchEvent, useEffect, useRef } from "react";
import { ImageMetadata } from "./ImageMetadata";
import { GalleryImage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ImageDetailProps {
  image: GalleryImage | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
}

export function ImageDetail({ 
  image, 
  onClose, 
  onPrevious, 
  onNext,
  showPrevious = false,
  showNext = false,
}: ImageDetailProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevious = useCallback(() => {
    if (onPrevious && !isAnimating) {
      setSlideDirection('right');
      setIsAnimating(true);
      setTimeout(() => {
        onPrevious();
        setIsAnimating(false);
        setSlideDirection(null);
      }, 200);
    }
  }, [onPrevious, isAnimating]);

  const handleNext = useCallback(() => {
    if (onNext && !isAnimating) {
      setSlideDirection('left');
      setIsAnimating(true);
      setTimeout(() => {
        onNext();
        setIsAnimating(false);
        setSlideDirection(null);
      }, 200);
    }
  }, [onNext, isAnimating]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart) {
      const currentTouch = e.touches[0].clientX;
      const distance = currentTouch - touchStart;
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance > 50 && showPrevious) {
      handlePrevious();
    } else if (swipeDistance < -50 && showNext) {
      handleNext();
    }
    setTouchStart(0);
    setSwipeDistance(0);
  };

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[100vw] w-full h-screen p-0 portrait:h-screen portrait:max-h-screen" hideCloseButton>
        <div ref={containerRef} className="relative h-full flex flex-col landscape:flex-row">
          {/* Main content area */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Mobile portrait header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm p-4 md:hidden landscape:hidden portrait:block">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {format(new Date(image.capture_time), 'PPpp')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {image.secondary_location 
                    ? `${image.primary_location} - ${image.secondary_location}`
                    : image.primary_location}
                </p>
              </div>
            </div>

            {/* Navigation arrows - always visible over image */}
            <div className="absolute inset-y-0 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 pointer-events-auto transition-transform duration-200",
                  isAnimating && "opacity-0",
                  showPrevious ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                )}
                onClick={handlePrevious}
                disabled={!showPrevious || isAnimating}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 pointer-events-auto transition-transform duration-200",
                  isAnimating && "opacity-0",
                  showNext ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                )}
                onClick={handleNext}
                disabled={!showNext || isAnimating}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Image */}
            <div 
              className={cn(
                "relative w-full h-full portrait:mt-[76px] portrait:mb-0 landscape:mt-0 md:mt-0",
                isAnimating && "transition-transform duration-200",
                slideDirection === "left" && "translate-x-[-100vw]",
                slideDirection === "right" && "translate-x-[100vw]"
              )}
              {...swipeHandlers}
            >
              <Image
                src={image.cdn_url}
                alt={`${image.primary_location} - ${image.secondary_location}`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Mobile portrait footer */}
          <div className="portrait:flex landscape:hidden md:hidden flex-col flex-1">
            <div className="bg-background/80 backdrop-blur-sm h-full pt-3 relative">
              {/* Weather data */}
              <div className="flex flex-col px-4 py-2">
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ThermometerIcon className="w-4 h-4" />
                    <span>{image.temperature}°{image.temperature_unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>{image.wind_speed} {image.wind_unit} {image.wind_direction}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <span>{image.raw_metadata.sun_status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>{image.raw_metadata.moon_phase}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute right-4 bottom-12 z-50">
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Close</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>

          {/* Sidebar - desktop and landscape */}
          <div className="hidden landscape:flex md:flex flex-col w-64 bg-background/80 backdrop-blur-sm border-l">
            <div className="p-4 flex-1">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {format(new Date(image.capture_time), 'PPpp')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {image.secondary_location 
                    ? `${image.primary_location} - ${image.secondary_location}`
                    : image.primary_location}
                </p>
              </div>
              <div className="mt-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ThermometerIcon className="w-4 h-4" />
                    <span>{image.temperature}°{image.temperature_unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>{image.wind_speed} {image.wind_unit} {image.wind_direction}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <span>{image.raw_metadata.sun_status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>{image.raw_metadata.moon_phase}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(image.cdn_url, '_blank')}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <DialogClose asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="ml-auto flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Bottom right controls - always visible */}
          <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 portrait:hidden">
            {isFullscreen && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-9 w-9"
              >
                <Minimize className="h-4 w-4" />
              </Button>
            )}
            <DialogClose asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}