'use client';

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = mounted && (theme === "light" || resolvedTheme === "light")
    ? "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch_light.png"
    : "https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch.png";

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm [.detail-view_&]:portrait:hidden">
      <div className="container relative h-[180px]">
        <div className="absolute inset-0 flex items-center justify-center">
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
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 