import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taylor Ranch',
  description: 'Wildlife camera gallery and weather station',
  appleWebApp: {
    capable: true,
    title: 'Taylor Ranch',
    statusBarStyle: 'default',
    startupImage: [
      // Add startup images if needed
    ],
  },
  applicationName: 'Taylor Ranch',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="icon" 
          type="image/x-icon" 
          href="https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/favicon.ico" 
        />
        <link 
          rel="apple-touch-icon" 
          href="https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/apple-touch-icon.png" 
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={cn(
        inter.className,
        'overflow-x-hidden relative'
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}