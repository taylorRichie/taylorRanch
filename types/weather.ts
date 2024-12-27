export interface WeatherData {
  temperature: number;
  temperature_unit: string;
  wind_speed: number;
  wind_direction: string;
  wind_unit: string;
  pressure: {
    value: number;
    unit: string;
  };
  sun_status: string;
  moon_phase: string;
} 