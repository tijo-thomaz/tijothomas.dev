// Owner profile and site copy. Single source of truth for `/` (U-05).
// Every value cites its row in edd-docs/questions/1.1-facts.md (F-xx facts, C-xx copy), as resolved in
// 1.1-facts-resolved.md, or an approved requirement decision (RQ-xx). Do not add a value without a row.
import type { Profile } from './types';

export const profile: Profile = {
  name: 'Tijo Thomas', // F-01
  headline: 'Lead Software Engineer building reliable AI systems', // F-02
  jobTitle: 'Lead Software Engineer', // F-03
  location: 'Bengaluru, India', // F-04
  relocation: {
    summary: 'Relocating to the UK or EU', // F-05 (resolved: UK/EU wording)
    visaSponsorshipRequired: true, // F-06
    visaLabel: 'Visa sponsorship needed', // F-06
  },
  availability: null, // RQ-02 (a): omitted until the owner supplies it
  noticePeriod: null, // RQ-02 (a): omitted until the owner supplies it
  coreStack: ['React', 'TypeScript', 'Go'], // F-07
  siteUrl: 'https://tijothomas.dev', // F-69
  links: {
    linkedin: 'https://www.linkedin.com/in/tijo-j-thomaz93/', // F-67
    github: 'https://github.com/tijo-thomaz', // F-68
  },
  knowsAbout: [
    'React', // F-70
    'TypeScript', // F-70
    'Go', // F-70
    'Zustand', // F-70
    'PostgreSQL', // F-70
    'AWS', // F-70
    'Google Cloud Platform', // F-70
    'Terraform', // F-70
    'Amazon SQS', // F-70
    'Model Context Protocol', // F-70
    'LLM applications', // F-70
    'Prompt-injection defence', // F-70
    'Idempotent event processing', // F-70
    'KYC and payment verification', // F-70
  ],
  nav: {
    brand: 'Tijo Thomas', // C-01
    items: [
      { label: 'Work', href: '#work' }, // C-01
      { label: 'Experience', href: '#experience' }, // C-01
      { label: 'Writing', href: '#writing' }, // C-01
      { label: 'Contact', href: '#contact' }, // C-01
    ],
  },
  hero: {
    intro:
      'React, TypeScript and Go. Nine years shipping production software, including nearly three at bet365 in Manchester. Looking for Forward Deployed, Senior Full-Stack and Applied AI roles.', // F-07, F-08 (resolved), F-09, F-10
    primaryCta: { label: 'View work', href: '#work' }, // C-02
    secondaryCta: { label: 'Get in touch', href: '#contact' }, // RQ-03 (a)
    tip: 'Tip: the city is a map. Select a building to jump to that section.', // C-03
  },
  city: {
    label: 'Isometric toy city map: select a building to jump to that section', // C-04
    signposts: ['Bengaluru', 'Manchester', 'Trivandrum', 'Mumbai'], // C-04 (owner edit 2026-11-24: timeline locations)
  },
  highlights: [
    { value: '9+ years', label: 'shipping production software since 2016' }, // F-11
    { value: '4 regulated markets', label: 'Germany, France, Ohio and New Jersey at bet365' }, // F-12
    { value: '10 languages', label: 'shipped with a VS Code translation tool' }, // F-13 (resolved: no LLM wording), F-43
    { value: 'React · TypeScript · Go', label: 'full-stack, on GCP and AWS' }, // F-14
  ],
  howIWork: [
    { title: 'Discover', text: 'Ask the questions that find the real problem and its constraints.' }, // C-08
    { title: 'Specify', text: 'Write it down as testable acceptance criteria before any code.' }, // C-09
    { title: 'Build', text: 'Ship the smallest working version, with AI assistance and human review.' }, // C-10
    { title: 'Break and measure', text: 'Inject failures on purpose and put a number on what works.' }, // C-11
    { title: 'Hand over', text: 'Runbook, monitoring and known limits, so the team owns it.' }, // C-12
  ],
  sections: {
    work: {
      title: 'Selected work', // C-05
      intro:
        'Each project is written up as a customer case: the problem, what I built, what I broke on purpose, and the numbers. Unmeasured results are marked as such.', // C-05
      empty: 'More projects are on the way.', // C-15
    },
    experience: {
      title: 'Experience', // C-06
      intro: 'Nine years, newest first. Monogram tiles stand in for company logos until official logo files are added.', // F-57
    },
    howIWork: {
      title: 'How I work with customers', // C-07
    },
    writing: {
      title: 'Lessons from breaking things', // C-13
      intro: 'Short write-ups of experiments: predict, break, fix, measure.', // C-13
      empty: 'First write-up coming soon.', // C-15
    },
    contact: {
      title: "Let's talk", // C-14
      intro:
        'Open to Forward Deployed, Senior Full-Stack and Applied AI roles in Manchester, Berlin, Munich and Hamburg. I will need visa sponsorship (UK Skilled Worker or EU Blue Card).', // F-10, F-61, F-62
    },
  },
  labels: {
    skipLink: 'Skip to content', // HOME-AC-11
    highlights: 'Highlights', // HOME-AC-12 (mockup region label)
    availability: 'Availability', // RQ-02 (label of the line shown only when set)
    linkedin: 'LinkedIn', // F-67
    github: 'GitHub', // F-68
    terminalMode: 'Terminal mode', // HOME-AC-18
    privacy: 'Privacy', // HOME-AC-27
    caseStudy: 'Read the case study', // HOME-AC-13 (shown only when caseStudyUrl is set)
    now: 'Now', // F-32
    present: 'present', // F-32
    notMeasured: 'Not yet measured', // F-23 (PH rendering), RQ-05
    workStatus: {
      live: 'Live', // F-16
      'in-progress': 'In progress', // F-21
      planned: 'Planned', // F-26
    },
    postStatus: {
      'coming-soon': 'Coming soon', // F-58
      planned: 'Planned', // F-26
    },
  },
  seo: {
    title: 'Tijo Thomas · Lead Software Engineer', // C-16
    description:
      'React, TypeScript and Go engineer. Nine years shipping production software, nearly three at bet365. Open to Forward Deployed and Applied AI roles.', // C-17 (resolved: follows F-08)
  },
};
