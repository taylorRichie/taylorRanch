'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DayRecord } from '@/lib/weather-api';
import { format } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface RecordCardProps {
  title: string;
  recordValue: string;
  icon: LucideIcon;
  iconColor: string;
  record: DayRecord;
  metrics: {
    highest: string;
    lowest: string;
    average: string;
    unit: string;
  };
}

export function WeatherRecordCard({ 
  title, 
  recordValue,
  icon: Icon, 
  iconColor, 
  record,
  metrics
}: RecordCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImages = record.images && record.images.length > 0;
  const [failedImages, setFailedImages] = useState(new Set());

  const nextValidIndex = (index: number) => {
    let nextIdx = index;
    while (failedImages.has(nextIdx) && nextIdx < record.images.length) {
      nextIdx++;
    }
    return nextIdx >= record.images.length ? currentIndex : nextIdx;
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      let prevIdx = currentIndex - 1;
      while (failedImages.has(prevIdx) && prevIdx > 0) {
        prevIdx--;
      }
      if (!failedImages.has(prevIdx)) {
        setCurrentIndex(prevIdx);
      }
    }
  };

  const nextImage = () => {
    if (currentIndex < record.images.length - 1) {
      const nextIdx = nextValidIndex(currentIndex + 1);
      if (nextIdx !== currentIndex) {
        setCurrentIndex(nextIdx);
      }
    }
  };

  const formatTemperature = (value: string, unit: string) => {
    return unit === '°F' ? `${value}${unit}` : value + unit;
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={iconColor} />
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="text-right space-y-0">
              <CardDescription className="text-xl font-semibold leading-tight">
                {formatTemperature(recordValue.slice(0, -2), recordValue.slice(-2))}
              </CardDescription>
              <span className="text-xs uppercase text-muted-foreground tracking-wider block -mt-1">
                Average
              </span>
            </div>
          </div>
          <CardDescription>
            {format(new Date(record.timestamp), 'PPPP')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasImages && (
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
            <Image
              src={record.images[currentIndex].cdn_url}
              alt={`${title} - Image ${currentIndex + 1} of ${record.images.length}`}
              fill
              priority={currentIndex === 0}
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setFailedImages(prev => new Set(prev).add(currentIndex));
                const nextIdx = nextValidIndex(currentIndex + 1);
                if (nextIdx !== currentIndex) {
                  setCurrentIndex(nextIdx);
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={prevImage}
                disabled={currentIndex === 0}
                className="bg-black/50 text-white p-2 rounded-full disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                disabled={currentIndex === record.images.length - 1}
                className="bg-black/50 text-white p-2 rounded-full disabled:opacity-50"
              >
                →
              </button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded">
              {currentIndex + 1} / {record.images.length}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Highest</p>
            <p className="font-medium">
              {formatTemperature(metrics.highest, metrics.unit)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-medium">
              {formatTemperature(metrics.average, metrics.unit)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lowest</p>
            <p className="font-medium">
              {formatTemperature(metrics.lowest, metrics.unit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 