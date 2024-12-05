import { ThermometerIcon, WindIcon, SunIcon, MoonIcon } from "lucide-react";
import { formatTemperature, formatWindSpeed, getWindDirectionLabel } from "@/lib/weather-utils";
import { GalleryImage } from "@/types";

interface WeatherInfoProps {
  weather: NonNullable<GalleryImage['weather']>;
}

export function WeatherInfo({ weather }: WeatherInfoProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <ThermometerIcon className="w-4 h-4 text-muted-foreground" />
        {formatTemperature(weather.temperature)}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <WindIcon className="w-4 h-4 text-muted-foreground" />
        <span title={getWindDirectionLabel(weather.windDirection)}>
          {formatWindSpeed(weather.windSpeed)} {weather.windDirection}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <SunIcon className="w-4 h-4 text-muted-foreground" />
        {weather.sunStatus}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MoonIcon className="w-4 h-4 text-muted-foreground" />
        {weather.moonPhase}
      </div>
    </>
  );
}