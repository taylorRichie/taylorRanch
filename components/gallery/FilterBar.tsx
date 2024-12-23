'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, FilterIcon, XCircleIcon, Heart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Location, ImageFilters, AnimalTag } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import { format } from "date-fns";
import { useGallery } from "@/hooks/useGallery";
import { fetchAnimalTags } from "@/lib/api";

interface FilterBarProps {
  onFilterChange: (filters: Partial<ImageFilters>) => void;
  locations: Location[];
  currentFilters?: Partial<ImageFilters>;
  showFavorites?: boolean;
  onToggleFavorites?: () => void;
  totalCount?: number;
  isMobile?: boolean;
  loading?: boolean;
  onClearFilters?: () => void;
}

export function FilterBar({ 
  onFilterChange, 
  locations, 
  currentFilters = {},
  showFavorites = false,
  onToggleFavorites,
  totalCount,
  isMobile = false,
  loading = false,
  onClearFilters
}: FilterBarProps) {
  const { favorites, isInitialized } = useFavorites();
  const { animalFilters, setAnimalFilter } = useGallery();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (currentFilters?.start_date && currentFilters?.end_date) {
      return {
        from: new Date(currentFilters.start_date),
        to: new Date(currentFilters.end_date)
      };
    }
    return undefined;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const favoritesCount = useMemo(() => 
    isInitialized ? favorites.length : 0
  , [favorites.length, isInitialized]);

  const [availableTags, setAvailableTags] = useState<AnimalTag[]>([]);
  
  // Load available tags on mount
  useEffect(() => {
    const loadTags = async () => {
      console.log('Starting to load tags...');
      try {
        const tags = await fetchAnimalTags();
        console.log('Successfully loaded tags:', tags);
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to load animal tags:', err);
      }
    };
    
    loadTags();
  }, []);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({ 
      start_date: range?.from ? format(range.from, 'yyyy-MM-dd\'T\'00:00:00') : undefined,
      end_date: range?.to 
        ? format(range.to, 'yyyy-MM-dd\'T\'23:59:59')
        : (range?.from ? format(range.from, 'yyyy-MM-dd\'T\'23:59:59') : undefined)
    });
  };

  const handleLocationChange = (newLocation: string) => {
    const locationValue = newLocation === 'all' ? undefined : newLocation;
    onFilterChange({ location: locationValue });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange({
        start_date: undefined,
        end_date: undefined,
        location: undefined,
        sort_by: currentFilters?.sort_by,
        sort_order: currentFilters?.sort_order
      });
      if (showFavorites) {
        onToggleFavorites?.();
      }
    }
    setIsDrawerOpen(false);
  };

  // Add a useEffect to monitor drawer state changes
  useEffect(() => {
    console.log('Drawer state changed:', isDrawerOpen);
  }, [isDrawerOpen]);

  return (
    <div className={cn(
      "flex gap-4",
      isMobile ? "flex-col" : "flex-row items-center"
    )}>
      {/* Date Picker */}
      <div className={isMobile ? "w-full" : "w-auto"}>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "justify-start text-left",
                isMobile && "w-full"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </>
                ) : (
                  dateRange.from.toLocaleDateString()
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={isMobile ? 1 : 2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Favorites Button */}
      <Button
        variant="outline"
        className={cn(
          "justify-start gap-2",
          isMobile && "w-full",
          showFavorites && "bg-[#01d3c7]/10 hover:bg-[#01d3c7]/20"
        )}
        onClick={() => {
          onToggleFavorites?.();
          setIsDrawerOpen(false);
        }}
      >
        <Heart className={cn(
          "h-4 w-4",
          showFavorites && "fill-[#01d3c7] text-[#01d3c7]"
        )} />
        Favorites ({favoritesCount})
      </Button>

      {/* Animal Tags */}
      {availableTags.length > 0 && (
        <div className={cn(
          "space-y-2",
          !isMobile && "flex items-center gap-2 space-y-0"
        )}>
          {isMobile && <h3 className="text-sm font-medium text-muted-foreground">Animal Filters</h3>}
          <div className={cn(
            "grid gap-2",
            isMobile ? "grid-cols-2" : "flex flex-row"
          )}>
            {availableTags
              .filter(tag => tag.name !== 'unknown')
              .map((tag) => (
                <Button
                  key={tag.name}
                  variant="outline"
                  size="sm"
                  className={cn(
                    animalFilters.includes(tag.name) && "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-100"
                  )}
                  onClick={() => setAnimalFilter(tag.name)}
                >
                  {tag.display}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Clear Filters - Only show in desktop view */}
      {!isMobile && (dateRange || showFavorites || animalFilters.length > 0) && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (onClearFilters) {
                onClearFilters();
              } else {
                clearFilters();
              }
            }}
            className="text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          {totalCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              {loading ? (
                "Loading..."
              ) : (
                `${totalCount.toLocaleString()} ${totalCount === 1 ? 'image' : 'images'}`
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}