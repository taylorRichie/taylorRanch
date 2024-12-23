export interface AnimalTag {
  type: 'animal';
  name: string;
  count: number;
  display: string;
}

export interface GalleryImage {
  id: number;
  capture_time: string;
  cdn_url: string;
  tags?: AnimalTag[];
  // ... other existing fields
} 