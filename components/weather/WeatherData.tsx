interface WeatherDataProps {
  timestamp: string;
}

export default function WeatherData({ timestamp }: WeatherDataProps) {
  return (
    <div className="space-y-1">
      {/* Placeholder for weather data */}
      <p className="text-sm text-muted-foreground">
        Weather data coming soon...
      </p>
    </div>
  );
} 