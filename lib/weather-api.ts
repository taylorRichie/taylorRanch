export type WeatherInterval = 'hour' | 'day' | 'week';

export interface WeatherMeasurement {
  average: number;
  min: number;
  max: number;
  unit: string;
}

export interface WindData extends WeatherMeasurement {
  common_direction: string;
}

export interface WeatherDataPoint {
  timestamp: string;
  temperature: WeatherMeasurement;
  wind: WindData;
  reading_count: number;
}

export interface WeatherMetadata {
  interval: WeatherInterval;
  start_date: string;
  end_date: string;
  total_intervals: number;
}

export interface WeatherResponse {
  weather_data: WeatherDataPoint[];
  metadata: WeatherMetadata;
}

export async function fetchWeatherData(params: {
  interval: WeatherInterval;
  start_date?: string;
  end_date?: string;
}): Promise<WeatherResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('interval', params.interval);
  
  if (params.start_date) {
    searchParams.append('start_date', params.start_date);
  }
  if (params.end_date) {
    searchParams.append('end_date', params.end_date);
  }

  const response = await fetch(`/api/weather?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
} 

export interface WeatherMetrics {
  average: number;
  max: number;
  min: number;
  unit: string;
}

export interface WindMetrics extends WeatherMetrics {
  common_direction: string;
}

export interface ImageData {
  capture_time: string;
  cdn_url: string;
  id: number;
}

export interface DayRecord {
  images: ImageData[];
  temperature: WeatherMetrics;
  timestamp: string;
  wind: WindMetrics;
}

export interface WeatherRecords {
  coldest_day: DayRecord;
  hottest_day: DayRecord;
  windiest_day: DayRecord;
}

export async function fetchWeatherRecords(): Promise<WeatherRecords> {
  const response = await fetch('/api/weather/records');
  if (!response.ok) {
    throw new Error('Failed to fetch weather records');
  }
  return response.json();
} 