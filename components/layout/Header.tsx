import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Image from "next/image";

export function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container relative h-[180px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[240px]">
            <Image
              src="https://revealgallery.nyc3.cdn.digitaloceanspaces.com/images/TaylorRanch.png"
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