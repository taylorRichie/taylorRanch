import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Taylor Ranch',
  description: 'Taylor Ranch Game Camera Gallery',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="main-container">
          {children}
        </div>
      </body>
    </html>
  )
} 