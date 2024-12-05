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
import { FilterOptions } from "@/types";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
}

export function FilterBar({ onFilterChange, locations }: FilterBarProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [location, setLocation] = useState<string>();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({ 
      dateRange: range ? {
        start: range.from!,
        end: range.to || addDays(range.from!, 1)
      } : undefined,
      location 
    });
  };

  const handleLocationChange = (newLocation: string) => {
    const locationValue = newLocation === 'all' ? undefined : newLocation;
    setLocation(locationValue);
    onFilterChange({ 
      dateRange: dateRange ? {
        start: dateRange.from!,
        end: dateRange.to || addDays(dateRange.from!, 1)
      } : undefined,
      location: locationValue
    });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setLocation(undefined);
    onFilterChange({});
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

      <Select value={location} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(dateRange || location) && (
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