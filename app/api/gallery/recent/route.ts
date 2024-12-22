import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://wu.ly/reveal_gallery/api/images?per_page=10&sort_by=capture_time&sort_order=desc');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to include weather information
    const transformedImages = data.images.map((image: any) => ({
      id: image.id,
      capture_time: image.capture_time,
      cdn_url: image.cdn_url,
      location: image.secondary_location 
        ? `${image.primary_location} - ${image.secondary_location}`
        : image.primary_location,
      temperature: image.temperature,
      temperature_unit: image.temperature_unit,
      wind_speed: image.wind_speed,
      wind_direction: image.wind_direction,
      wind_unit: image.wind_unit
    }));

    return NextResponse.json({ images: transformedImages });
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent images' },
      { status: 500 }
    );
  }
} 