import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!url || !filename) {
    return new NextResponse('Missing url or filename', { status: 400 });
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return new NextResponse('Error downloading image', { status: 500 });
  }
} 