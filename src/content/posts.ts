// Writing list (U-05). Every value cites its row in edd-docs/questions/1.1-facts.md as resolved in
// 1.1-facts-resolved.md. The numbers in the subtitles describe planned experiments, not results.
// "Coming soon" posts are shown (RQ-01 a); no post has a URL yet (RQ-04), so `url` is left out.
import type { Post } from './types';

/** The one /writing/[slug] placeholder page (noindex, not linked from `/` until it is published). */
export const placeholderPostSlug = 'queues-double-charge'; // RQ-04 (a)

export const posts: readonly Post[] = [
  {
    slug: 'queues-double-charge', // F-58
    title: 'Why queues double-charge customers, and the fix', // F-58
    subtitle: 'Idempotency, from a 1,000-message experiment', // F-58
    status: 'coming-soon', // F-58, RQ-01 (a)
  },
  {
    slug: 'graceful-shutdown-llm-calls', // F-59
    title: "Graceful shutdown that doesn't drop LLM calls", // F-59
    subtitle: 'Two-phase shutdown with context cancellation in Go', // F-59
    status: 'coming-soon', // F-59, RQ-01 (a)
  },
  {
    slug: 'prompt-injection-filter', // F-60
    title: 'How good is a prompt-injection filter, really?', // F-60
    subtitle: 'Measuring PromptShield against 100 test prompts', // F-60
    status: 'coming-soon', // F-60, RQ-01 (a)
  },
];
