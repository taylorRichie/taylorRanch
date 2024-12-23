import ImageTags from '@/components/ImageTags';
import WeatherData from '@/components/WeatherData';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

async function getImageDetails(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch image details');
  }

  return res.json();
}

export default async function ImageDetail({ params }: { params: { id: string } }) {
  const image = await getImageDetails(params.id);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main Image */}
        <div className="flex-grow">
          <div className="relative aspect-video">
            <Image
              src={image.cdn_url}
              alt={`Wildlife captured at ${image.location}`}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3 space-y-4">
          {/* Timestamp */}
          <div className="text-lg font-semibold">
            {formatDate(image.capture_time)}
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Animals Detected</h3>
            <ImageTags tags={image.tags} />
          </div>

          {/* Weather Data */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Weather Conditions</h3>
            <WeatherData timestamp={image.capture_time} />
          </div>
        </div>
      </div>
    </div>
  );
} 