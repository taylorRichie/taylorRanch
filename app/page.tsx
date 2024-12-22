'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageCarousel } from '@/components/gallery/ImageCarousel';
import { WeatherSnapshot } from '@/components/weather/WeatherSnapshot';
import { Home, Images, Cloud } from 'lucide-react';

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
      
      <div className="hidden md:block border-b">
        <div className="container mx-auto">
          <Tabs defaultValue="home" onValueChange={handleTabChange}>
            <TabsList className="w-full justify-center h-14">
              <TabsTrigger value="home" className="gap-2 text-base px-6">
                <Home className="h-5 w-5" />
                Home
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 text-base px-6">
                <Images className="h-5 w-5" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2 text-base px-6">
                <Cloud className="h-5 w-5" />
                Weather
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-8 pb-[80px] md:pb-8">
        <Tabs defaultValue="home" className="h-full flex flex-col" onValueChange={handleTabChange}>
          <TabsContent value="home" className="flex-1">
            <ImageCarousel />
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <nav className="w-full max-w-screen-xl mx-auto">
          <div className="flex justify-around items-center py-4 px-2">
            <button 
              onClick={() => router.push('/')}
              className="flex flex-col items-center gap-1 text-xs font-medium text-primary"
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
              <Cloud className="h-5 w-5" />
              <span>Weather</span>
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}