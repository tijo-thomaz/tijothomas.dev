import './globals.css'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Tijo Thomas | Senior Frontend Engineer | Manchester, UK',
  description: 'Senior Frontend Engineer with 8+ years experience in Angular, React, TypeScript, and Go. Currently at Bet365, previously worked with Home Depot, eBay, and major enterprises.',
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
    url: 'https://tijothomas.dev',
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
        
        {/* SEO Content - Hidden but crawlable */}
        <div className="seo-content">
          <h1>Tijo Thomas - Senior Frontend Engineer</h1>
          <p>
            Experienced Senior Frontend Engineer based in Manchester, UK with over 8 years 
            of expertise in modern web development. Currently working at Bet365, specializing 
            in Angular, React, TypeScript, and Go.
          </p>
          
          <h2>Technical Skills</h2>
          <ul>
            <li>Frontend: Angular, React, TypeScript, JavaScript, HTML5, CSS3, Sass</li>
            <li>Backend: Go, Node.js</li>
            <li>State Management: RxJS, NgRx, Redux, Rematch</li>
            <li>Testing: Jasmine, Karma, Jest, Cypress</li>
            <li>Cloud: AWS Amplify, Lambda, DynamoDB, Cognito, API Gateway, S3</li>
            <li>Tools: Git, VS Code, Chrome DevTools, Postman, Figma</li>
          </ul>
          
          <h2>Work Experience</h2>
          <ul>
            <li>Software Engineer at Bet365 (2023-Present)</li>
            <li>Frontend Consultant at Infosys (2021-2023) - Home Depot & eBay</li>
            <li>Frontend Developer at NetObjex (2020-2021)</li>
            <li>Full Stack Engineer at QBurst Technologies (2018-2020)</li>
            <li>Associate Trainee at Speridian Technologies (2016-2018)</li>
          </ul>
          
          <h2>Contact Information</h2>
          <p>Email: tijo1293@gmail.com</p>
          <p>Phone: +44 7818 989060</p>
          <p>Location: Manchester, United Kingdom</p>
          <p>LinkedIn: linkedin.com/in/tijo-j-thomaz93</p>
        </div>
      </body>
    </html>
  )
}
