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
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Location, ImageFilters } from "@/lib/api";

interface FilterBarProps {
  onFilterChange: (filters: Partial<ImageFilters>) => void;
  locations: Location[];
  currentFilters?: Partial<ImageFilters>;
}

export function FilterBar({ onFilterChange, locations, currentFilters = {} }: FilterBarProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (currentFilters?.start_date && currentFilters?.end_date) {
      return {
        from: new Date(currentFilters.start_date),
        to: new Date(currentFilters.end_date)
      };
    }
    return undefined;
  });

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
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
      <FilterIcon className="w-5 h-5 text-muted-foreground" />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(
            "w-[300px] justify-start text-left font-normal",
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

      <Select 
        value={currentFilters?.location || 'all'} 
        onValueChange={handleLocationChange}
      >
        <SelectTrigger className="w-[180px]">
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

      {(dateRange || currentFilters?.location) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}