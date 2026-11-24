// U-07 HOME-AC-16: writing rows, links only with a URL, empty state.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { posts } from '@/content/posts';
import { profile } from '@/content/profile';
import type { Post } from '@/content/types';

import { Writing } from './Writing';

const { labels, sections } = profile;
const renderIt = (items: readonly Post[]) => render(<Writing posts={items} section={sections.writing} labels={labels} />);

describe('Writing', () => {
  it('HOME-AC-16 is section#writing with the h2, the intro and one row per post (title, subtitle, badge)', () => {
    const { container } = renderIt(posts);
    expect(container.querySelector('section#writing h2')?.textContent).toBe(sections.writing.title);
    expect(container.textContent).toContain(sections.writing.intro);
    const rows = [...container.querySelectorAll('.post')];
    expect(rows).toHaveLength(posts.length);
    rows.forEach((row, i) => {
      expect(row.querySelector('h3')?.textContent).toBe(posts[i].title);
      expect(row.textContent).toContain(posts[i].subtitle);
      expect(row.textContent).toContain(labels.postStatus['coming-soon']);
    });
  });

  it('HOME-AC-16 a post without a URL is not a link (no #writing self-links)', () => {
    const { container } = renderIt(posts);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('HOME-AC-16 a published post with a URL links to it and shows no badge', () => {
    renderIt([{ slug: 'p', title: 'A published post', subtitle: 'Sub', status: 'published', url: 'https://example.com/p' }]);
    const link = screen.getByRole('link', { name: /A published post/ });
    expect(link.getAttribute('href')).toBe('https://example.com/p');
    expect(link.textContent).not.toContain(labels.postStatus['coming-soon']);
  });

  it('HOME-AC-16 with 0 visible posts, section#writing keeps its h2 and shows the empty-state line', () => {
    const { container } = renderIt([]);
    expect(container.querySelector('section#writing h2')?.textContent).toBe(sections.writing.title);
    expect(container.textContent).toContain(sections.writing.empty);
  });
});
