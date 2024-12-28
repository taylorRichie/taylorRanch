import type { NextApiRequest, NextApiResponse } from 'next';
import { WeatherData } from '@/types/weather';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherData>
) {
  try {
    // ... existing weather fetching code ...
    const weatherData: WeatherData = {
      // your weather data structure
    };

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({
      temperature: 0,
      temperature_unit: '',
      wind_speed: 0,
      wind_direction: '',
      wind_unit: '',
      pressure: {
        value: 0,
        unit: ''
      },
      sun_status: '',
      moon_phase: ''
    });
  }
} 