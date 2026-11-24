// Selected work (U-05). Every value cites its row in edd-docs/questions/1.1-facts.md as resolved in
// 1.1-facts-resolved.md. `planned` items stay hidden unless SHOW_PLANNED is exactly "true".
// No item has a public link yet (F-71, RQ-04), so caseStudyUrl is left out.
import type { WorkItem } from './types';

export const work: readonly WorkItem[] = [
  {
    slug: 'promptshield', // F-15
    name: 'PromptShield', // F-15
    subtitle: 'AI security proof of concept', // F-15
    status: 'live', // F-16
    badgeLabel: 'Proof of concept', // F-16 (resolved: not "Live PoC")
    summary:
      'Problem: LLM apps can be tricked by prompt injection and leak data. Built a Go policy engine with a React dashboard that flags and blocks risky prompts.', // F-17
    metric: null, // F-16 (resolved: metric row removed)
    stack: ['Go', 'React', 'TypeScript', 'Zustand'], // F-19
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
