// Experience timeline, newest first (U-05). Every value cites its row in
// edd-docs/questions/1.1-facts.md as resolved in 1.1-facts-resolved.md.
// bet365 rows (F-37..F-44) are NDA-flagged: only the confirmed wording below may be published.
import type { ExperienceEntry } from './types';

export const experience: readonly ExperienceEntry[] = [
  {
    kind: 'job', // F-30
    id: 'opteamix', // F-30
    company: 'Opteamix', // F-30
    monogram: 'OP', // F-30
    title: 'Lead Software Engineer', // F-31
    start: '2026-04', // F-32
    end: null, // F-32 (present)
    location: 'Bengaluru, India', // F-33
    bullets: [
      'Joined as a contractor; converted to full-time in October 2026.', // F-34
      'Worked on an offline field-inspection app for Dell rugged tablets: photo capture and offline sync as a PWA, hosted in .NET WebView2.', // F-35 (owner-supplied 2026-11-25)
      'Used Capacitor for native Android and iOS features, with a SQLite database for time and attendance: site check-in and check-out, clock-in and clock-out.', // F-35 (owner-supplied 2026-11-25)
    ],
  },
  {
    kind: 'gap', // F-36
    id: 'relocation', // F-36
    label: 'Relocation: UK to India with family', // F-36
    tile: 'Move', // F-36
    start: '2025-12', // F-36
    end: '2026-03', // F-36
  },
  {
    kind: 'job', // F-37
    id: 'bet365', // F-37
    company: 'bet365 Group Ltd', // F-37
    monogram: 'B365', // F-37
    title: 'Software Developer', // F-38 (resolved: official title)
    start: '2023-02', // F-39
    end: '2025-11', // F-39
    location: 'Manchester, UK', // F-40
    workMode: 'Hybrid', // F-40
    bullets: [
      'Owned KYC, payment-method and payment verification journeys across Germany, France, Ohio and New Jersey, from React and TypeScript UI to Go services on GCP.', // F-41
      'Built Go orchestration for payment and identity verification: bank checks, card verification and third-party selfie verification providers.', // F-42
      'Built a VS Code tool that generated translations across 10 languages plus UK, US and Australian English.', // F-43 (resolved: no LLM wording)
      'Built a Go translation metrics service and onboarded new engineers to the codebase.', // F-44
    ],
  },
  {
    kind: 'job', // F-45
    id: 'infosys', // F-45
    company: 'Infosys', // F-45
    monogram: 'IN', // F-45
    title: 'Consultant / UI Lead', // F-45
    start: '2021-05', // F-46
    end: '2023-01', // F-46
    location: 'Trivandrum, India', // F-46
    bullets: [
      'Led UI delivery for enterprise e-commerce clients using React, Angular and MarkoJS.', // F-47
      'Introduced an Nx monorepo, Storybook and CI quality gates across teams; mentored engineers on testing and accessibility.', // F-48
    ],
  },
  {
    kind: 'job', // F-49
    id: 'netobjex', // F-49
    company: 'NetObjex', // F-49
    monogram: 'NO', // F-49
    title: 'Software Engineer', // F-49
    start: '2020-05', // F-50
    end: '2021-05', // F-50
    location: 'Trivandrum, India', // F-50
    bullets: [
      'Built HIPAA-compliant onboarding and health-screening workflows in React for hospitality operations.', // F-51
    ],
  },
  {
    kind: 'job', // F-52
    id: 'qburst', // F-52
    company: 'QBurst Technologies', // F-52
    monogram: 'QB', // F-52
    title: 'Engineer', // F-52
    start: '2018-11', // F-53
    end: '2020-03', // F-53
    location: 'Trivandrum, India', // F-53
    bullets: [
      'Built GIS risk dashboards on AWS and a serverless parking app with Lambda, DynamoDB and GraphQL.', // F-54
    ],
  },
  {
    kind: 'job', // F-55
    id: 'speridian', // F-55
    company: 'Speridian Technologies', // F-55
    monogram: 'SP', // F-55
    title: 'Associate', // F-55
    start: '2016-11', // F-55
    end: '2018-07', // F-55
    location: 'Mumbai, India', // F-55 (owner edit 2026-11-24)
    bullets: [
      'Built a Chrome extension for in-flight Wi-Fi diagnostics and insurance claims UI.', // F-56
    ],
  },
];
