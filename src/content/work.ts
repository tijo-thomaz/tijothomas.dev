// Selected work (U-05). Every value cites its row in edd-docs/questions/1.1-facts.md as resolved in
// 1.1-facts-resolved.md. `planned` items stay hidden unless SHOW_PLANNED is exactly "true".
// No item has a public external link yet (F-71, RQ-04), so caseStudyUrl is left out. Projects
// platform rows (P-xx) are in edd-docs/questions/2.0-projects-facts.md: this list is the registry.
// An item with `caseStudy: true` has its case study in ./case-studies/<slug>.ts (U-15).
import type { WorkItem } from './types';

export const work: readonly WorkItem[] = [
  {
    slug: 'sluice', // P-01
    name: 'Sluice', // P-01
    formerName: 'PromptShield', // P-02, F-15
    formerSlug: 'promptshield', // P-02 (redirects to /work/sluice)
    subtitle: 'Guardrail gateway for AI agents', // P-03
    status: 'in-progress', // P-04 (no target month)
    summary:
      'Problem: LLM apps can be tricked by prompt injection and leak data. Built a Go policy engine with a React dashboard that flags and blocks risky prompts.', // F-17 (P-05: owner to supply new text)
    metric: null, // F-16, P-11 (no eval report yet)
    stack: ['Go', 'React', 'TypeScript', 'Zustand'], // F-19 (P-06: owner to supply new text)
    playOriginEnv: 'SLUICE_ORIGIN', // P-08
    wasm: true, // P-08
    caseStudy: true, // P-09
  },
  {
    slug: 'fde-cloud-spine', // F-20
    name: 'fde-cloud-spine', // F-20
    subtitle: 'Reliable event processing', // F-20
    status: 'planned', // F-20 (resolved: not yet started)
    target: '2026-12', // F-21
    summary:
      'Problem: queues deliver messages more than once, so customers get charged twice. Idempotent Go worker with retries and a dead-letter queue, run locally on LocalStack.', // F-22
    metric: { label: 'Duplicate charges under 30% redelivery', value: null }, // F-23
    stack: ['Go', 'PostgreSQL', 'SQS', 'Terraform'], // F-24
  },
  {
    slug: 'fde-mcp-gateway', // F-25
    name: 'fde-mcp-gateway', // F-25
    subtitle: 'Safe AI access to company systems', // F-25
    status: 'planned', // F-26
    target: '2026-12', // F-26
    summary:
      'Problem: AI assistants need data from internal systems without seeing too much. An MCP server in Go with role-scoped permissions, rate limits and output truncation.', // F-27
    metric: { label: 'Unauthorised access in eval scenarios', value: null }, // F-28
    stack: ['Go', 'MCP', 'PostgreSQL'], // F-29
  },
];
