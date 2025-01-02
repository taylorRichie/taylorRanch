'use client';

import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { Cloud, ThermometerIcon, Wind } from 'lucide-react';

export function LiveWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenWeather API key is not configured');
      }

      const lat = '40.014984';
      const lon = '-105.120880';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Weather API error:', errorData);
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.main.temp),
        temperature_unit: 'F',
        wind_speed: Math.round(data.wind.speed),
        wind_direction: getWindDirection(data.wind.deg),
        wind_unit: 'mph',
        pressure: {
          value: data.main.pressure,
          unit: 'hPa'
        },
        sun_status: data.weather[0].main,
        moon_phase: getMoonPhase(new Date())
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading weather...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="flex flex-col text-sm text-muted-foreground">
      {/* Date & Time - only visible on desktop */}
      <div className="mb-1 hidden md:block">
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric'
        })}
      </div>
      
      {/* Weather info - horizontal on mobile, vertical on desktop */}
      <div className="flex md:flex-col gap-4 md:gap-1">
        <div className="flex items-center gap-1">
          <ThermometerIcon className="h-4 w-4" />
          <span>{weather.temperature}°{weather.temperature_unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-4 w-4" />
          <span>{weather.wind_speed} {weather.wind_unit} {weather.wind_direction}</span>
        </div>
        <div className="flex items-center gap-1">
          <Cloud className="h-4 w-4" />
          <span>{weather.sun_status.charAt(0).toUpperCase() + weather.sun_status.slice(1).toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions (same as before)
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

function getSunStatus(sunrise: number, sunset: number): string {
  const now = Math.floor(Date.now() / 1000);
  return now > sunrise && now < sunset ? 'day' : 'night';
}

function getMoonPhase(date: Date): string {
  const phases = ['new', 'waxing crescent', 'first quarter', 'waxing gibbous', 
                 'full', 'waning gibbous', 'last quarter', 'waning crescent'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const c = Math.floor((year + 1) / 100);
  const g = 2 - c + Math.floor(c / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + g - 1524.5;
  
  const phase = ((jd - 2451550.1) / 29.530588853) % 1;
  const index = Math.floor(phase * 8);
  
  return phases[index];
} 