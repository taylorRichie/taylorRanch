'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CalendarIcon, FilterIcon, XCircleIcon, Heart } from "lucide-react";
import { Rabbit as RabbitIcon } from "@/components/icons/rabbit";
import { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
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
}

export function FilterBar({ 
  onFilterChange, 
  locations, 
  currentFilters = {},
  showFavorites = false,
  onToggleFavorites,
  totalCount
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
    setIsDrawerOpen(false);
  };

  const FilterControls = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-full md:w-auto justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}>
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
                numberOfMonths={2}
                id="date-range-calendar"
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className={cn(
              "gap-2 md:w-auto",
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

          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
                    onClick={() => {
                      setAnimalFilter(tag.name);
                    }}
                  >
                    {tag.display}
                  </Button>
                ))}
            </div>
          )}
        </div>

        {(dateRange || showFavorites || animalFilters.length > 0) && (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            {totalCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {totalCount.toLocaleString()} {totalCount === 1 ? 'image' : 'images'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {/* Mobile Filter Button and Drawer */}
      <div className="md:hidden flex items-center gap-2">
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <FilterIcon className="h-5 w-5" />
              {(dateRange || showFavorites || animalFilters.length > 0) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>
        
        {(dateRange || showFavorites || animalFilters.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Desktop Filter Controls */}
      <div className="hidden md:block">
        <FilterControls />
      </div>
    </div>
  );
}