import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Add color mapping for different animal types
const animalColors: Record<string, { bg: string, text: string, hover: string }> = {
  deer: { 
    bg: "bg-amber-100 dark:bg-amber-900", 
    text: "text-amber-800 dark:text-amber-100",
    hover: "hover:bg-amber-200 dark:hover:bg-amber-800"
  },
  rabbit: { 
    bg: "bg-blue-100 dark:bg-blue-900", 
    text: "text-blue-800 dark:text-blue-100",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-800"
  },
  coyote: {
    bg: "bg-purple-100 dark:bg-purple-900",
    text: "text-purple-800 dark:text-purple-100",
    hover: "hover:bg-purple-200 dark:hover:bg-purple-800"
  },
  unknown: { 
    bg: "bg-gray-100 dark:bg-gray-900", 
    text: "text-gray-800 dark:text-gray-100",
    hover: "hover:bg-gray-200 dark:hover:bg-gray-800"
  },
  // Add more animals as needed
};

export interface AnimalTag {
  type: 'animal';
  name: string;
  count: number;
  display: string;
}

interface ImageTagsProps {
  tags?: AnimalTag[];
  imageId?: number;
  onTagRemoved?: () => void;
}

// Add a helper function to format the display name
const formatDisplayName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export function ImageTags({ tags, imageId, onTagRemoved }: ImageTagsProps) {
  const [clickCount, setClickCount] = useState<{ [key: string]: number }>({});
  const [tagToRemove, setTagToRemove] = useState<AnimalTag | null>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleTagClick = async (tag: AnimalTag) => {
    if (!isDesktop || !imageId) return; // Only allow on desktop and when imageId is provided

    const newCount = (clickCount[tag.name] || 0) + 1;
    setClickCount(prev => ({ ...prev, [tag.name]: newCount }));

    if (newCount === 3) {
      setTagToRemove(tag);
      setClickCount(prev => ({ ...prev, [tag.name]: 0 }));
    }
  };

  const handleRemoveTag = async () => {
    if (!tagToRemove || !imageId) return;

    try {
      const response = await fetch(
        `/api/images/${imageId}/tags/${tagToRemove.name}`,
        { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        onTagRemoved?.();
        setTagToRemove(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to remove tag:', errorData);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  if (!tags || tags.length === 0) {
    return (
      <span className="text-sm text-gray-500">
        No animals detected
      </span>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => {
          const colors = animalColors[tag.name] || animalColors.unknown;
          const displayName = formatDisplayName(tag.name);
          
          return (
            <span
              key={`${tag.name}-${index}`}
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-default gap-1.5",
                colors.bg,
                colors.text,
                isDesktop && colors.hover
              )}
              onClick={() => handleTagClick(tag)}
            >
              {displayName}
              <span className={cn(
                "flex items-center justify-center rounded-full bg-white dark:bg-black",
                "w-4 h-4 text-[10px] font-semibold",
                colors.text
              )}>
                {tag.count}
              </span>
            </span>
          );
        })}
      </div>

      <AlertDialog open={!!tagToRemove} onOpenChange={() => setTagToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the &quot;{formatDisplayName(tagToRemove?.name || '')}&quot; tag from this image?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTag}>
              Yes, Remove Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 