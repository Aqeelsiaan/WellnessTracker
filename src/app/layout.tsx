import { SessionProvider } from 'next-auth/react'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LifeTrack - Smart Health Companion',
  description: 'Track your health metrics, get AI-powered insights, and achieve your wellness goals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}