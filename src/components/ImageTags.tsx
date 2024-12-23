import React from 'react';
import { AnimalTag } from '@/types/gallery';

interface ImageTagsProps {
  tags?: AnimalTag[];
}

export default function ImageTags({ tags }: ImageTagsProps) {
  if (!tags || tags.length === 0) {
    return (
      <span className="text-sm text-gray-500">
        No animals detected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={`${tag.name}-${index}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          {tag.display}
        </span>
      ))}
    </div>
  );
} 