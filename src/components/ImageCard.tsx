import { ImageTags } from "@/components/gallery/ImageTags";
import { GalleryImage } from '@/lib/api';

interface ImageCardProps {
  image: GalleryImage;
}

export default function ImageCard({ image }: ImageCardProps) {
  return (
    <div className="relative">
      {/* Existing image card content ... */}
      
      {/* Add tags at the bottom of the card */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
        <ImageTags tags={image.tags} />
      </div>
    </div>
  );
} 