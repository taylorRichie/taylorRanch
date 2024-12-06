'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownIcon, ArrowUpIcon, ThermometerIcon, ClockIcon } from "lucide-react";
import { ImageFilters } from "@/lib/api";

interface SortControlsProps {
  onSortChange: (sort: Pick<ImageFilters, 'sort_by' | 'sort_order'>) => void;
  currentSort: Pick<ImageFilters, 'sort_by' | 'sort_order'>;
}

export function SortControls({ onSortChange, currentSort }: SortControlsProps) {
  const handleSortChange = (value: string) => {
    switch (value) {
      case 'newest':
        onSortChange({ sort_by: 'capture_time', sort_order: 'desc' });
        break;
      case 'oldest':
        onSortChange({ sort_by: 'capture_time', sort_order: 'asc' });
        break;
      case 'temperature_high':
        onSortChange({ sort_by: 'temperature', sort_order: 'desc' });
        break;
      case 'temperature_low':
        onSortChange({ sort_by: 'temperature', sort_order: 'asc' });
        break;
      default:
        onSortChange({ sort_by: 'capture_time', sort_order: 'desc' });
    }
  };

  const getCurrentSortValue = () => {
    if (currentSort.sort_by === 'capture_time') {
      return currentSort.sort_order === 'desc' ? 'newest' : 'oldest';
    } else if (currentSort.sort_by === 'temperature') {
      return currentSort.sort_order === 'desc' ? 'temperature_high' : 'temperature_low';
    }
    return 'newest';
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Newest First
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Oldest First
            </div>
          </SelectItem>
          <SelectItem value="temperature_high">
            <div className="flex items-center gap-2">
              <ThermometerIcon className="w-4 h-4" />
              Warmest First
            </div>
          </SelectItem>
          <SelectItem value="temperature_low">
            <div className="flex items-center gap-2">
              <ThermometerIcon className="w-4 h-4" />
              Coldest First
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}