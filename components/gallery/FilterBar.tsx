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
import { CalendarIcon, FilterIcon, XIcon, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Location, ImageFilters } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";

interface FilterBarProps {
  onFilterChange: (filters: Partial<ImageFilters>) => void;
  locations: Location[];
  currentFilters?: Partial<ImageFilters>;
  showFavorites?: boolean;
  onToggleFavorites?: () => void;
}

export function FilterBar({ 
  onFilterChange, 
  locations, 
  currentFilters = {},
  showFavorites = false,
  onToggleFavorites
}: FilterBarProps) {
  const { favorites, isInitialized } = useFavorites();
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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({ 
      start_date: range?.from?.toISOString(),
      end_date: range?.to?.toISOString() || (range?.from ? addDays(range.from, 1).toISOString() : undefined)
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
      location: undefined
    });
    if (showFavorites) {
      onToggleFavorites?.();
    }
    setIsDrawerOpen(false);
  };

  const FilterControls = () => (
    <div className="flex flex-col md:flex-row gap-4">
      <Button
        variant="outline"
        className={cn(
          "gap-2 w-full md:w-auto",
          showFavorites && "bg-primary/10 hover:bg-primary/20"
        )}
        onClick={() => {
          onToggleFavorites?.();
          setIsDrawerOpen(false);
        }}
      >
        <Heart className={cn(
          "h-4 w-4",
          showFavorites && "fill-current"
        )} />
        Favorites ({favoritesCount})
      </Button>

      <Select 
        value={currentFilters?.location || 'all'} 
        onValueChange={handleLocationChange}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc.primary_location} value={loc.primary_location}>
              {loc.secondary_location 
                ? `${loc.primary_location} - ${loc.secondary_location}`
                : loc.primary_location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          />
        </PopoverContent>
      </Popover>

      {(dateRange || currentFilters?.location) && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground md:ml-auto"
        >
          Clear Filters
        </Button>
      )}
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
              {(dateRange || currentFilters?.location || showFavorites) && (
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
        
        {(dateRange || currentFilters?.location || showFavorites) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4 mr-2" />
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