import { CalendarIcon, MapPinIcon } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";
import { GalleryImage } from "@/types";

interface ImageMetadataProps {
  image: GalleryImage;
}

export function ImageMetadata({ image }: ImageMetadataProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        {formatDateTime(image.timestamp)}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
        {image.location}
      </div>
    </>
  );
}