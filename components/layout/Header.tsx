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
    <header className="border-b w-full">
      <div className="container mx-auto px-4 relative flex flex-col items-center">
        {/* Theme toggle */}
        <div className="absolute right-2 top-2 z-50">
          <ThemeToggle />
        </div>

        {/* Logo - full width and centered */}
        <div className="w-full flex justify-center py-6">
          <div className="w-full md:w-[640px] h-[180px] md:h-[210px] relative">
            <Image
              src={logoUrl}
              alt="Taylor Ranch"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Weather */}
        <div className="w-full flex justify-center md:justify-end md:absolute md:right-8 md:top-16 pb-4 md:pb-0">
          <LiveWeather />
        </div>
      </div>
    </header>
  );
} 