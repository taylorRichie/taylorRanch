import { NextResponse } from 'next/server';

// Use environment variable, with a clear error if it's missing
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const LAT = '40.3207';
const LON = '-111.0166';

if (!OPENWEATHER_API_KEY) {
  throw new Error('OPENWEATHER_API_KEY is not defined in environment variables');
}

export async function GET() {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeatherMap error response:', errorText);
      return NextResponse.json(
        { error: `OpenWeatherMap API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      main: {
        temp: data.current.temp,
        feels_like: data.current.feels_like
      },
      wind: {
        speed: data.current.wind_speed,
        deg: data.current.wind_deg
      },
      weather: data.current.weather,
      dt: data.current.dt
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 