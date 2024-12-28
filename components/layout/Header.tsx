'use client';

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LiveWeather } from '@/components/weather/LiveWeather';
import { WeatherData } from '@/types/weather';

export function Header() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/weather?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchWeather();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const logoUrl = mounted && (theme === "light" || resolvedTheme === "light")
    ? "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch_light.png"
    : "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch.png";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 relative">
        {/* Theme toggle - absolute positioned to container edges */}
        <div className="absolute right-2 top-2 z-50">
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center py-6">
          {/* Logo - centered with responsive sizing */}
          <div className="w-[540px] h-[180px] md:w-[640px] md:h-[210px] relative z-10">
            <Image
              src={logoUrl}
              alt="Taylor Ranch"
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Weather - below logo on mobile, right side on desktop */}
          <div className="w-full md:absolute md:right-8 md:top-16 md:w-auto mt-0 md:mt-0">
            <LiveWeather />
          </div>
        </div>
      </div>
    </header>
  );
} 