import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch the most recent hour of weather data
    const response = await fetch('https://wu.ly/reveal_gallery/api/weather?interval=hour&per_page=1');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Get the most recent data point
    const latestWeather = data.weather_data[0];
    
    // Transform to match the WeatherSnapshot component's expected format
    const transformedData = {
      temperature: latestWeather.temperature.average,
      temperature_unit: latestWeather.temperature.unit,
      wind_speed: latestWeather.wind.average,
      wind_direction: latestWeather.wind.common_direction,
      wind_unit: latestWeather.wind.unit,
      timestamp: latestWeather.timestamp
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching latest weather:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest weather' },
      { status: 500 }
    );
  }
} 