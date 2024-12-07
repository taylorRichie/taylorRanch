import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://wu.ly/reveal_gallery/api/weather/records');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weather records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather records' },
      { status: 500 }
    );
  }
} 