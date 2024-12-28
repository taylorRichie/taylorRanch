import type { NextApiRequest, NextApiResponse } from 'next';
import { WeatherData } from '@/types/weather';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherData>
) {
  try {
    // Fetch weather data from OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const lat = '40.014984'; // Taylor Ranch latitude
    const lon = '-105.120880'; // Taylor Ranch longitude
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    // Transform OpenWeather data to match our WeatherData type
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      temperature_unit: 'F',
      wind_speed: Math.round(data.wind.speed),
      wind_direction: getWindDirection(data.wind.deg),
      wind_unit: 'mph',
      pressure: {
        value: data.main.pressure,
        unit: 'hPa'
      },
      sun_status: getSunStatus(data.sys.sunrise, data.sys.sunset),
      moon_phase: getMoonPhase(new Date())
    };

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      temperature: 0,
      temperature_unit: 'F',
      wind_speed: 0,
      wind_direction: 'N',
      wind_unit: 'mph',
      pressure: {
        value: 0,
        unit: 'hPa'
      },
      sun_status: 'unknown',
      moon_phase: 'unknown'
    });
  }
}

// Helper function to convert wind degrees to cardinal direction
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

// Helper function to determine if sun is up or down
function getSunStatus(sunrise: number, sunset: number): string {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  return now > sunrise && now < sunset ? 'day' : 'night';
}

// Helper function to calculate moon phase
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