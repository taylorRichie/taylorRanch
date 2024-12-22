import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Thermometer, Wind, Clock } from 'lucide-react';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  dt: number;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

export function LiveWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/weather/current')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch weather');
        return res.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setWeather(data);
      })
      .catch(error => {
        console.error('Error fetching weather:', error);
        setError('Failed to load weather data');
      });
  }, []);

  if (error || !weather) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground">
      {/* Mobile layout (portrait) */}
      <div className="flex md:hidden items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{format(weather.dt * 1000, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          <span>
            {Math.round(weather.main.temp)}°F
            <span className="ml-1">
              (feels {Math.round(weather.main.feels_like)}°F)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          <span>{Math.round(weather.wind.speed)} mph {getWindDirection(weather.wind.deg)}</span>
        </div>
      </div>

      {/* Desktop/tablet layout (landscape) */}
      <div className="hidden md:flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{format(weather.dt * 1000, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          <span>
            {Math.round(weather.main.temp)}°F
            <span className="ml-1">
              (feels {Math.round(weather.main.feels_like)}°F)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          <span>{Math.round(weather.wind.speed)} mph {getWindDirection(weather.wind.deg)}</span>
        </div>
      </div>
    </div>
  );
} 