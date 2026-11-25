import './globals.css'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/terminal/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Tijo Thomas | Senior Frontend Engineer | Manchester, UK',
  description: 'Senior Frontend Engineer with 8+ years experience in Angular, React, TypeScript, and Go. Currently at Bet365, previously worked with Home Depot, eBay, and major enterprises.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: '32x32' }
    ],
    apple: '/favicon.svg'
  },
  keywords: [
    'Tijo Thomas',
    'Senior Frontend Engineer', 
    'Angular Developer',
    'React Developer',
    'TypeScript',
    'Manchester UK',
    'Bet365',
    'Frontend Consultant',
    'JavaScript Developer',
    'Go Developer',
    'AWS',
    'Software Engineer'
  ],
  authors: [{ name: 'Tijo Thomas' }],
  creator: 'Tijo Thomas',
  publisher: 'Tijo Thomas',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tijothomas.dev/terminal',
    title: 'Tijo Thomas | Senior Frontend Engineer',
    description: 'Senior Frontend Engineer with 8+ years experience in Angular, React, TypeScript, and Go.',
    siteName: 'Tijo Thomas Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tijo Thomas | Senior Frontend Engineer',
    description: 'Senior Frontend Engineer with 8+ years experience in Angular, React, TypeScript, and Go.',
    creator: '@tijothomas',
  },

}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">

      <body className={`${jetbrainsMono.variable} font-mono`}>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
