export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatWindSpeed(speed: number): string {
  return `${speed.toFixed(1)} km/h`;
}

export function getWindDirectionLabel(direction: string): string {
  const directions: Record<string, string> = {
    'N': 'North',
    'NE': 'Northeast',
    'E': 'East',
    'SE': 'Southeast',
    'S': 'South',
    'SW': 'Southwest',
    'W': 'West',
    'NW': 'Northwest'
  };
  return directions[direction] || direction;
}