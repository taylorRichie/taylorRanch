import { cn } from "@/lib/utils";

export interface AnimalTag {
  type: 'animal';
  name: string;
  count: number;
  display: string;
}

interface ImageTagsProps {
  tags?: AnimalTag[];
}

export function ImageTags({ tags }: ImageTagsProps) {
  if (!tags || tags.length === 0) {
    return (
      <span className="text-sm text-gray-500">
        No animals detected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <span
          key={`${tag.name}-${index}`}
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          )}
        >
          {tag.display}
        </span>
      ))}
    </div>
  );
} 