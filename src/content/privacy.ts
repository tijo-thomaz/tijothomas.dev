// Privacy notice for /privacy (U-10, ADR-P3, SQ-02 a). Every statement follows the approved
// compliance assessment (edd-docs/inception/compliance.md §1, requirement CMP-03). The disabled chat
// is not listed. A legal review comes later (SQ-08 a). Contact is LinkedIn only: no email (F-64).
import type { PrivacyNotice } from './types';

export const privacy: PrivacyNotice = {
  title: 'Privacy notice', // CMP-03
  description: 'What this site processes about visitors, why, for how long, and your rights.', // CMP-03
  updated: '2026-11-25', // CMP-03 (date this notice was written)
  updatedLabel: 'Last updated', // CMP-03
  controller: {
    name: 'Tijo Thomas', // F-01
    contactUrl: 'https://www.linkedin.com/in/tijo-j-thomaz93/', // F-67
    contactLabel: 'Message me on LinkedIn', // CMP-03 (contact channel, SQ-02 a)
  },
  sections: [
    {
      heading: 'Who is responsible', // CMP-03
      paragraphs: [
        'I run this site myself and I am responsible for the personal data it processes. I am based in Bengaluru, India. The best way to contact me about privacy is a LinkedIn message.', // F-04, CMP-03
      ],
    },
    {
      heading: 'What is processed', // CMP-03
      paragraphs: [
        'This site has no forms and no accounts. The home page sets no cookies and stores nothing on your device.', // CMP-01
      ],
      items: [
        'Request logs: when you load any page, Vercel, which hosts this site, processes your IP address, browser details, the page address, the referring page and the time.', // CMP-03 (P1)
        'Web Analytics: Vercel Web Analytics records page views with the page, referrer, country, browser, operating system and device type. It uses no cookies. Visitors are counted with a hash of the request that Vercel discards after 24 hours, so only aggregate statistics remain.', // CMP-03 (P2)
        'Visit counters on /terminal: the terminal stores a date and a count of visits and commands in a Supabase database. Nothing in it identifies you.', // CMP-03 (P4)
        'Your browser on /terminal: your theme, zoom and sound settings (tijothomas-theme, tijothomas-zoom, tijothomas-sounds) and local usage counters (portfolio-analytics) are kept in your browser storage. They are never sent to me.', // CMP-03 (P5)
      ],
    },
    {
      heading: 'Why, and on what legal basis', // CMP-03
      paragraphs: [
        'Request logs keep the site running and secure, and Web Analytics shows me how many people visit and from where. Both rely on legitimate interests (GDPR and UK GDPR Article 6(1)(f)). The terminal settings exist only so that the features you choose work.', // CMP-03 (§1.3)
      ],
    },
    {
      heading: 'Who processes it, and where', // CMP-03
      paragraphs: [
        'Vercel Inc. hosts the site, keeps the request logs and runs Web Analytics as my processor, under its data processing terms. Supabase Inc. stores the terminal counters, which are not personal data. Both are based in the United States, so data may be processed there.', // CMP-03 (§1.6)
      ],
    },
    {
      heading: 'How long it is kept', // CMP-03
      paragraphs: [],
      items: [
        'Request logs: kept for Vercel’s standard, short log retention period.', // CMP-03 (§1.5)
        'Web Analytics: the visitor hash is discarded after 24 hours; only aggregate statistics remain after that.', // CMP-03 (§1.5)
        'Terminal counters: kept, as they hold no personal data.', // CMP-03 (§1.5)
        'Browser storage on /terminal: kept until you clear it in your browser.', // CMP-03 (§1.5)
      ],
    },
    {
      heading: 'Your rights', // CMP-03
      paragraphs: [
        'You can ask for access to, correction or erasure of your personal data, ask me to restrict its use, and object to processing based on legitimate interests. I store nothing that identifies you, so in most cases I cannot link a request to a person (GDPR Article 11); I will still answer every request within one month.', // CMP-03 (§1.8)
      ],
    },
    {
      heading: 'Complaints', // CMP-03
      paragraphs: [
        'You can complain to a data protection supervisory authority: in the EU, the authority where you live or work; in the UK, the Information Commissioner’s Office (ICO).', // CMP-03 (§1.7)
      ],
    },
  ],
};
