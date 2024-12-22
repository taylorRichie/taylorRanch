'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageCarousel } from '@/components/gallery/ImageCarousel';
import { WeatherSnapshot } from '@/components/weather/WeatherSnapshot';
import { Home, Images, LineChart } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'gallery':
        router.push('/gallery');
        break;
      case 'weather':
        router.push('/weather');
        break;
      // Home tab stays on the current page
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 pb-[80px] md:pb-8">
        <Tabs defaultValue="home" className="h-full flex flex-col" onValueChange={handleTabChange}>
          <div className="hidden md:block">
            <TabsList>
              <TabsTrigger value="home" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Images className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2">
                <LineChart className="h-4 w-4" />
                Weather
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="home" className="flex-1">
            <ImageCarousel />
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <nav className="container mx-auto px-4">
          <div className="flex justify-around py-4">
            <button 
              onClick={() => router.push('/')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => router.push('/gallery')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <Images className="h-5 w-5" />
              <span>Gallery</span>
            </button>
            <button 
              onClick={() => router.push('/weather')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <LineChart className="h-5 w-5" />
              <span>Weather</span>
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}