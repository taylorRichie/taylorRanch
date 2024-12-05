import { GalleryImage } from '@/types';

// Using Picsum Photos for reliable placeholder images
export const placeholderImages: GalleryImage[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/${i + 1}/800/600`,
  filename: `TRAIL_${String(i + 1).padStart(3, '0')}.jpg`,
  timestamp: new Date(2024, 0, 1 + i).toISOString(),
  location: ['North Trail', 'South Ridge', 'East Creek', 'West Valley'][i % 4],
  weather: {
    temperature: 15 + Math.random() * 20,
    windSpeed: 5 + Math.random() * 15,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][i % 8],
    pressure: 1000 + Math.random() * 30,
    sunStatus: ['day', 'night', 'dawn', 'dusk'][i % 4],
    moonPhase: ['new', 'waxing', 'full', 'waning'][i % 4],
  },
}));