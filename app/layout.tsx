import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reveal Gallery Weather',
  description: 'Weather monitoring and historical data visualization',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: 'https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: 'https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: 'https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/apple-touch-icon.png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: 'https://revealgallery.nyc3.digitaloceanspaces.com/images/favicon/safari-pinned-tab.svg',
        color: '#000000'
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Reveal Gallery Weather'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
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