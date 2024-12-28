import type { NextApiRequest, NextApiResponse } from 'next';
import { WeatherResponse } from '@/lib/weather-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherResponse>
) {
  const { interval, start_date, end_date } = req.query;
  
  try {
    // Build the URL with query parameters
    const params = new URLSearchParams();
    if (interval) params.append('interval', interval as string);
    if (start_date) params.append('start_date', start_date as string);
    if (end_date) params.append('end_date', end_date as string);
    
    // Fetch historical weather data
    const response = await fetch(`https://wu.ly/reveal_gallery/api/weather?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' } as any);
  }
} 