'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { SortOption } from "@/types";

interface SortControlsProps {
  onSortChange: (sort: SortOption) => void;
}

export function SortControls({ onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">
            <div className="flex items-center gap-2">
              <ArrowUpIcon className="w-4 h-4" />
              Newest First
            </div>
          </SelectItem>
          <SelectItem value="oldest">
            <div className="flex items-center gap-2">
              <ArrowDownIcon className="w-4 h-4" />
              Oldest First
            </div>
          </SelectItem>
          <SelectItem value="location">Location</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}