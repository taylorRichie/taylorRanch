import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CameraIcon } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CameraIcon className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Taylor Ranch est 2017</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}