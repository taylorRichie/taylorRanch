'use client';

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LineChart, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Header() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isWeatherPage = pathname === '/weather';

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = mounted && (theme === "light" || resolvedTheme === "light")
    ? "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch_light.png"
    : "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch.png";

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm [.detail-view_&]:portrait:hidden">
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10"
        >
          {isWeatherPage ? (
            <Link href="/">
              <Images className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Gallery</span>
            </Link>
          ) : (
            <Link href="/weather">
              <LineChart className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Weather Trends</span>
            </Link>
          )}
        </Button>
      </div>
      <div className="h-[180px] flex items-center justify-center">
        <div className="w-[240px]">
          <Image
            src={logoUrl}
            alt="Taylor Ranch"
            width={480}
            height={128}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </header>
  );
} 