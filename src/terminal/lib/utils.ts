import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

export function downloadFile(content: string, filename: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generatePDFResume(): string {
  return `
TIJO THOMAS
Senior Frontend Engineer
Manchester, UK

CONTACT
Email: tijo1293@gmail.com
Phone: +44 7818 989060
LinkedIn: linkedin.com/in/tijo-j-thomaz93

SUMMARY
Senior Frontend Engineer with 8+ years of experience in modern web development.
Expertise in Angular, React, TypeScript, and Go. Proven track record of mentoring
developers and delivering enterprise-grade applications.

TECHNICAL SKILLS
Frontend: Angular, React, TypeScript, JavaScript, HTML5, CSS3, Sass
Backend: Go, Node.js
State Management: RxJS, NgRx, Redux, Rematch
Testing: Jasmine, Karma, Jest, Cypress
Cloud: AWS Amplify, Lambda, DynamoDB, Cognito, API Gateway, S3
Tools: Git, VS Code, Chrome DevTools, Postman, Figma

EXPERIENCE

Software Engineer | Bet365 | Feb 2023 - Present
• Migrated legacy .NET pages to modern TypeScript + Go architecture
• Developed internal tools using VS Code extensions
• Engineered scalable backend services in Go
• Performance tuning and release optimization

Frontend Consultant | Infosys | May 2021 - Jan 2023
• Client: Home Depot & eBay
• Spearheaded Angular-based enterprise reporting dashboards
• Implemented OnPush change detection and smart/dumb architecture
• Mentored frontend developers and conducted code reviews

Frontend Developer | NetObjex | May 2020 - May 2021
• Developed COVID-19 employee onboarding portal with React
• Engineered reusable chart components using Highcharts
• Managed state with Rematch and styled components

Full Stack Engineer | QBurst Technologies | Nov 2018 - Mar 2020
• Built cloud-based parking dashboards with AWS stack
• Integrated AWS Cognito authentication and Google Maps API

Associate Trainee | Speridian Technologies | Nov 2016 - Jul 2018
• Client: Gogo Business Aviation
• Developed Chrome Extension with React and video streaming

EDUCATION
MCA & BCA from M.G. University, Kottayam
  `.trim()
}
