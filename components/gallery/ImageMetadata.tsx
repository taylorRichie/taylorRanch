'use client';

import { GalleryImage } from "@/lib/api";
import { ThermometerIcon, CloudIcon, MoonIcon, WindIcon } from "lucide-react";

interface ImageMetadataProps {
  image: GalleryImage;
}

export function ImageMetadata({ image }: ImageMetadataProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <ThermometerIcon className="w-4 h-4" />
        <span>{image.temperature}°{image.temperature_unit}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <WindIcon className="w-4 h-4" />
        <span>{image.wind_speed} {image.wind_unit} {image.wind_direction}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <CloudIcon className="w-4 h-4" />
        <span>{image.raw_metadata.sun_status}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <MoonIcon className="w-4 h-4" />
        <span>{image.raw_metadata.moon_phase}</span>
      </div>
    </div>
  );
}