export const API_BASE_URL = '/api';

// Types
export interface AnimalTag {
  type: 'animal';
  name: string;
  count: number;
  display: string;
}

export interface GalleryImage {
  id: number;
  reveal_id: string;
  cdn_url: string;
  capture_time: string;
  created_at: string;
  primary_location: string;
  secondary_location: string;
  temperature: number;
  temperature_unit: string;
  wind_speed: number;
  wind_direction: string;
  wind_unit: string;
  raw_metadata: {
    moon_phase: string;
    sun_status: string;
    pressure: {
      value: number;
      unit: string;
    };
  };
  tags?: AnimalTag[];
}

export interface ImageFilters {
  page?: number;
  per_page?: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'capture_time' | 'temperature' | 'created_at';
  sort_order?: 'asc' | 'desc';
  ids?: string;
  tag?: string[];
}

export interface Location {
  primary_location: string;
  secondary_location?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ImageResponse {
  images: GalleryImage[];
  pagination: PaginationData;
  filters: {
    start_date: string | null;
    end_date: string | null;
    location: string | null;
  };
  sorting: {
    sort_by: string;
    sort_order: string;
  };
}

// API Functions
export async function fetchImages(filters: ImageFilters): Promise<ImageResponse> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (key === 'tag' && Array.isArray(value)) {
        // Join multiple tags with commas for AND logic
        if (value.length > 0) {
          params.append('tags', value.join(','));
        }
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  const url = `${API_BASE_URL}/images?${params.toString()}`;
  console.log('Fetching images with URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export async function fetchLocations(): Promise<Location[]> {
  const url = `${API_BASE_URL}/locations`;
  console.log('Fetching locations from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received locations:', data);
    return data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

export async function fetchAnimalTags(): Promise<AnimalTag[]> {
  const url = `${API_BASE_URL}/tags`;
  console.log('Fetching animal tags from URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Tags API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tags API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received tags data:', data);

    // Transform the data to include display names
    const transformedTags = data.tags.map((tag: any) => ({
      type: 'animal',
      name: tag.name,
      count: parseInt(tag.count, 10),
      display: tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
    }));

    return transformedTags;
  } catch (error) {
    console.error('Error fetching animal tags:', error);
    throw error;
  }
}

// Helper function to build location display label
export function buildLocationLabel(location: Location): string {
  return location.secondary_location
    ? `${location.primary_location} - ${location.secondary_location}`
    : location.primary_location;
} 