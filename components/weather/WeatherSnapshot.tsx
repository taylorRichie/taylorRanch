'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Wind, Clock, Camera } from 'lucide-react';
import { format } from 'date-fns';

interface LatestWeather {
  temperature: number;
  temperature_unit: string;
  wind_speed: number;
  wind_direction: string;
  wind_unit: string;
  timestamp: string;
}

interface OpenWeatherData {
  main: {
    temp: number;
    feels_like: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  dt: number;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

export function WeatherSnapshot() {
  const [latestWeather, setLatestWeather] = useState<LatestWeather | null>(null);
  const [currentWeather, setCurrentWeather] = useState<OpenWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest image weather data
    fetch('/api/weather/latest')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch weather data');
        return res.json();
      })
      .then(data => {
        setLatestWeather(data);
      })
      .catch(error => {
        console.error('Error fetching latest weather:', error);
        setError('Failed to load latest weather data');
      });

    // Fetch current weather from our proxy endpoint
    fetch('/api/weather/current')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch current weather');
        return res.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setCurrentWeather(data);
      })
      .catch(error => {
        console.error('Error fetching current weather:', error);
        setError('Failed to load current weather data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentWeather && (
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Live Weather
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(currentWeather.dt * 1000, 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span>
                  {Math.round(currentWeather.main.temp)}°F
                  <span className="text-sm text-muted-foreground ml-2">
                    Feels like {Math.round(currentWeather.main.feels_like)}°F
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>
                  {Math.round(currentWeather.wind.speed)} mph from {getWindDirection(currentWeather.wind.deg)}
                </span>
              </div>
            </div>
          )}

          {latestWeather && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last Image
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(latestWeather.timestamp), 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span>
                  {latestWeather.temperature}°{latestWeather.temperature_unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>
                  {latestWeather.wind_speed} {latestWeather.wind_unit} from {latestWeather.wind_direction}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 