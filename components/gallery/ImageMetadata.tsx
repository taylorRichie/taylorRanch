'use client';

import { GalleryImage } from "@/lib/api";
import { ThermometerIcon, CloudIcon, MoonIcon, WindIcon } from "lucide-react";

interface ImageMetadataProps {
  image: GalleryImage;
}

export function ImageMetadata({ image }: ImageMetadataProps) {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <ThermometerIcon className="w-4 h-4" />
        <span>{image.temperature}°{image.temperature_unit}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <WindIcon className="w-4 h-4" />
        <span>{image.wind_speed} {image.wind_unit} {image.wind_direction}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <CloudIcon className="w-4 h-4" />
        <span>{image.raw_metadata.sun_status}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <MoonIcon className="w-4 h-4" />
        <span>{image.raw_metadata.moon_phase}</span>
      </div>
    </div>
  );
}