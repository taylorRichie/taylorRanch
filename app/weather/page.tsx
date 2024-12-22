'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Cloud, Thermometer, Wind, Home, Images } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { fetchWeatherData, type WeatherResponse, type WeatherInterval, type WeatherRecords } from '@/lib/weather-api';
import { cn } from '@/lib/utils';
import { WeatherRecordCard } from '@/components/weather/WeatherRecordCard';
import { fetchWeatherRecords } from '@/lib/weather-api';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Custom tooltip component with dark theme
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-md">
        <p className="font-medium">{format(new Date(label), 'PPp')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeatherPage() {
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = subDays(end, 7);
    return {
      from: startOfDay(start),
      to: endOfDay(end)
    };
  });
  const [interval, setInterval] = useState<WeatherInterval>('hour');
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherRecords, setWeatherRecords] = useState<WeatherRecords | null>(null);

  // Fetch data when date range or interval changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setLoading(true);
      fetchWeatherData({
        interval,
        start_date: format(dateRange.from, "yyyy-MM-dd'T'00:00:00"),
        end_date: format(dateRange.to, "yyyy-MM-dd'T'23:59:59")
      })
        .then((data) => {
          const sortedData = {
            ...data,
            weather_data: [...data.weather_data].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          };
          setWeatherData(sortedData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [dateRange, interval]);

  useEffect(() => {
    fetchWeatherRecords()
      .then(setWeatherRecords)
      .catch(console.error);
  }, []);

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (interval) {
      case 'hour':
        return format(date, 'MMM d, h aa');
      case 'day':
        return format(date, 'MMM d');
      case 'week':
        return format(date, 'MMM d');
      default:
        return format(date, 'MMM d');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="hidden md:block border-b">
        <div className="container mx-auto">
          <Tabs defaultValue="weather">
            <TabsList className="w-full justify-center h-14">
              <TabsTrigger value="home" className="gap-2 text-base px-6" onClick={() => router.push('/')}>
                <Home className="h-5 w-5" />
                Home
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2 text-base px-6" onClick={() => router.push('/gallery')}>
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

      <div className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="weather" className="h-full flex flex-col">
          <TabsContent value="weather" className="flex-1">
            <div className="space-y-8">
              <section>
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-20 py-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn(
                          "w-full md:w-auto justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, 'LLL dd, y')} -{' '}
                                {format(dateRange.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(dateRange.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex gap-2">
                      <Button
                        variant={interval === 'hour' ? 'default' : 'outline'}
                        onClick={() => setInterval('hour')}
                      >
                        Hourly
                      </Button>
                      <Button
                        variant={interval === 'day' ? 'default' : 'outline'}
                        onClick={() => setInterval('day')}
                      >
                        Daily
                      </Button>
                      <Button
                        variant={interval === 'week' ? 'default' : 'outline'}
                        onClick={() => setInterval('week')}
                      >
                        Weekly
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={weatherData?.weather_data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="timestamp" 
                              tickFormatter={formatXAxis}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              label={{ 
                                value: weatherData?.weather_data[0]?.temperature.unit, 
                                angle: -90, 
                                position: 'insideLeft' 
                              }} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="temperature.average"
                              stroke="#8884d8"
                              name="Average"
                              unit={weatherData?.weather_data[0]?.temperature.unit}
                            />
                            <Line
                              type="monotone"
                              dataKey="temperature.max"
                              stroke="#82ca9d"
                              name="Max"
                              unit={weatherData?.weather_data[0]?.temperature.unit}
                            />
                            <Line
                              type="monotone"
                              dataKey="temperature.min"
                              stroke="#ff7300"
                              name="Min"
                              unit={weatherData?.weather_data[0]?.temperature.unit}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Wind Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={weatherData?.weather_data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="timestamp" 
                              tickFormatter={formatXAxis}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              label={{ 
                                value: weatherData?.weather_data[0]?.wind.unit, 
                                angle: -90, 
                                position: 'insideLeft' 
                              }} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="wind.average"
                              stroke="#8884d8"
                              name="Average"
                              unit={weatherData?.weather_data[0]?.wind.unit}
                            />
                            <Line
                              type="monotone"
                              dataKey="wind.max"
                              stroke="#82ca9d"
                              name="Max"
                              unit={weatherData?.weather_data[0]?.wind.unit}
                            />
                            <Line
                              type="monotone"
                              dataKey="wind.min"
                              stroke="#ff7300"
                              name="Min"
                              unit={weatherData?.weather_data[0]?.wind.unit}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-6">Weather Records</h2>
                {weatherRecords ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    <WeatherRecordCard
                      title="Hottest Day"
                      recordValue={`${weatherRecords.hottest_day.temperature.average}°F`}
                      icon={Thermometer}
                      iconColor="text-red-500"
                      record={weatherRecords.hottest_day}
                      metrics={{
                        highest: weatherRecords.hottest_day.temperature.max.toString(),
                        average: weatherRecords.hottest_day.temperature.average.toString(),
                        lowest: weatherRecords.hottest_day.temperature.min.toString(),
                        unit: '°F'
                      }}
                    />
                    <WeatherRecordCard
                      title="Coldest Day"
                      recordValue={`${weatherRecords.coldest_day.temperature.average}°F`}
                      icon={Thermometer}
                      iconColor="text-blue-500"
                      record={weatherRecords.coldest_day}
                      metrics={{
                        highest: weatherRecords.coldest_day.temperature.max.toString(),
                        average: weatherRecords.coldest_day.temperature.average.toString(),
                        lowest: weatherRecords.coldest_day.temperature.min.toString(),
                        unit: '°F'
                      }}
                    />
                    <WeatherRecordCard
                      title="Windiest Day"
                      recordValue={`${weatherRecords.windiest_day.wind.average}${weatherRecords.windiest_day.wind.unit}`}
                      icon={Wind}
                      iconColor="text-green-500"
                      record={weatherRecords.windiest_day}
                      metrics={{
                        highest: weatherRecords.windiest_day.wind.max.toString(),
                        average: weatherRecords.windiest_day.wind.average.toString(),
                        lowest: weatherRecords.windiest_day.wind.min.toString(),
                        unit: weatherRecords.windiest_day.wind.unit
                      }}
                    />
                  </div>
                ) : (
                  <div>Loading records...</div>
                )}
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <nav className="w-full max-w-screen-xl mx-auto">
          <div className="flex justify-around items-center py-4 px-2">
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
              className="flex flex-col items-center gap-1 text-xs font-medium text-primary"
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