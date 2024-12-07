'use client';

import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, X, Download, Maximize, Minimize, ThermometerIcon, Wind, Cloud, Moon, Heart } from "lucide-react";
import { useState, useCallback, TouchEvent, useEffect, useRef } from "react";
import { ImageMetadata } from "./ImageMetadata";
import { GalleryImage } from "@/lib/api";
import { cn } from "@/lib/utils";
import * as FileSaver from 'file-saver';
import { useTheme } from "next-themes";
import { useFavorites } from "@/hooks/useFavorites";

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
  const { theme, resolvedTheme } = useTheme();
  const { favorites, toggleFavorite } = useFavorites();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftArrowAnimating, setLeftArrowAnimating] = useState(false);
  const [rightArrowAnimating, setRightArrowAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number }[]>([]);
  const [nextHeartId, setNextHeartId] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = mounted && (theme === "light" || resolvedTheme === "light")
    ? "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch_light.png"
    : "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch.png";

  const handlePrevious = useCallback(() => {
    if (onPrevious) {
      setLeftArrowAnimating(true);
      setTimeout(() => setLeftArrowAnimating(false), 200);
      onPrevious();
    }
  }, [onPrevious]);

  const handleNext = useCallback(() => {
    if (onNext) {
      setRightArrowAnimating(true);
      setTimeout(() => setRightArrowAnimating(false), 200);
      onNext();
    }
  }, [onNext]);

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

  const base64ToFile = (base64Data: string, filename: string, contentType: string) => {
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new File(byteArrays, filename, { type: contentType });
  };

  const handleDownload = useCallback(async () => {
    if (!image) return;
    
    const filename = `${image.primary_location}-${format(new Date(image.capture_time), 'yyyy-MM-dd-HH-mm-ss')}.jpg`;
    
    // Check if Web Share API is available
    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      try {
        // Fetch the image first
        const response = await fetch(image.cdn_url);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: 'image/jpeg' });

        await navigator.share({
          title: filename,
          text: `Image from ${image.primary_location}`,
          files: [file]
        });
      } catch (error) {
        // If share fails (user cancels or error), fall back to download
        console.error('Error sharing:', error);
        window.location.href = `/api/download?url=${encodeURIComponent(image.cdn_url)}&filename=${encodeURIComponent(filename)}`;
      }
    } else {
      // Fall back to regular download on desktop or if share API is not available
      window.location.href = `/api/download?url=${encodeURIComponent(image.cdn_url)}&filename=${encodeURIComponent(filename)}`;
    }
  }, [image]);

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

  // Add keyboard navigation with animations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && showPrevious) {
        setLeftArrowAnimating(true);
        setTimeout(() => setLeftArrowAnimating(false), 200);
        handlePrevious();
      } else if (e.key === 'ArrowRight' && showNext) {
        setRightArrowAnimating(true);
        setTimeout(() => setRightArrowAnimating(false), 200);
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, showPrevious, showNext, onClose]);

  // Add detail-view class to html element when dialog is open
  useEffect(() => {
    if (image) {
      document.documentElement.classList.add('detail-view');
    } else {
      document.documentElement.classList.remove('detail-view');
    }
    return () => {
      document.documentElement.classList.remove('detail-view');
    };
  }, [image]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (image) {
      toggleFavorite(image.id);
      if (!favorites.includes(image.id)) {
        setFloatingHearts(hearts => [...hearts, { id: nextHeartId }]);
        setNextHeartId(id => id + 1);
      }
    }
  }, [image, toggleFavorite, favorites, nextHeartId]);

  const removeHeart = useCallback((heartId: number) => {
    setFloatingHearts(hearts => hearts.filter(heart => heart.id !== heartId));
  }, []);

  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[100vw] w-full h-screen p-0 portrait:h-screen portrait:max-h-screen" hideCloseButton>
        <DialogTitle className="sr-only">Image Details</DialogTitle>
        <div ref={containerRef} className="relative h-full flex flex-col landscape:flex-row">
          {/* Main content area */}
          <div className="relative flex-1 flex flex-col portrait:min-h-0">
            {/* Mobile portrait header */}
            <div className="portrait:h-[128px] bg-background/80 backdrop-blur-sm md:hidden landscape:hidden portrait:block">
              <div className="h-full flex items-center justify-center">
                <div className="w-[180px]">
                  <Image
                    src={logoUrl}
                    alt="Taylor Ranch"
                    width={360}
                    height={96}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Image container */}
            <div className="relative portrait:h-auto min-h-0 portrait:flex portrait:flex-col portrait:items-center landscape:flex-1 landscape:flex landscape:items-center landscape:justify-center">
              {/* Navigation arrows */}
              <div className="absolute inset-y-0 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 pointer-events-auto transition-transform duration-200",
                    showPrevious ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                  )}
                  onClick={handlePrevious}
                  disabled={!showPrevious}
                >
                  <ChevronLeft className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    leftArrowAnimating && "-translate-x-2"
                  )} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 pointer-events-auto transition-transform duration-200",
                    showNext ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                  )}
                  onClick={handleNext}
                  disabled={!showNext}
                >
                  <ChevronRight className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    rightArrowAnimating && "translate-x-2"
                  )} />
                </Button>
              </div>

              {/* Image */}
              <div 
                className="relative portrait:w-full portrait:aspect-[4/3] landscape:w-full landscape:h-full"
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
            <div className="portrait:block landscape:hidden md:hidden">
              <div className="bg-background/80 backdrop-blur-sm p-4">
                <div className="flex flex-row gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">
                      {format(new Date(image.capture_time), 'PPpp')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {image.secondary_location 
                        ? `${image.primary_location} - ${image.secondary_location}`
                        : image.primary_location}
                    </p>
                  </div>
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
              </div>
            </div>

            {/* Controls - moved outside footer for fixed positioning */}
            <div className="portrait:block landscape:hidden md:hidden">
              <div className="fixed right-2 bottom-[48px] z-50 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className="h-9 w-9 relative"
                >
                  <Heart className={cn(
                    "h-4 w-4 transition-colors",
                    image && favorites.includes(image.id) && "fill-[#01d3c7] text-[#01d3c7]"
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  className="h-9 w-9"
                >
                  <Download className="h-4 w-4" />
                </Button>
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

          {/* Desktop/Landscape sidebar */}
          <div className={cn(
            "hidden landscape:flex md:flex flex-col w-64 bg-background/80 backdrop-blur-sm border-l",
            isFullscreen && "landscape:hidden"
          )}>
            <div className="p-4 landscape:pt-0 flex-1">
              <Image
                src={logoUrl}
                alt="Taylor Ranch"
                width={224}
                height={60}
                className="w-full landscape:w-[70%] object-contain mb-4 mx-auto"
                priority
              />
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
                onClick={handleFavoriteClick}
                className="h-8 w-8 relative"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-colors",
                  image && favorites.includes(image.id) && "fill-[#01d3c7] text-[#01d3c7]"
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
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
                  className="ml-auto gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Bottom right controls - only visible in fullscreen mode */}
          {isFullscreen && (
            <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavoriteClick}
                className="h-9 w-9 relative"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-colors",
                  image && favorites.includes(image.id) && "fill-[#01d3c7] text-[#01d3c7]"
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
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                className="h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-9 w-9"
              >
                <Minimize className="h-4 w-4" />
              </Button>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}