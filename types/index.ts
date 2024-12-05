export interface GalleryImage {
  id: number;
  url: string;
  filename: string;
  timestamp: string;
  location: string;
  weather?: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    sunStatus: string;
    moonPhase: string;
  };
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  weather?: {
    minTemp?: number;
    maxTemp?: number;
    sunStatus?: string;
  };
}

export type SortOption = 'newest' | 'oldest' | 'location';