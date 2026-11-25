import type { Post, Profile } from '@/content/types';

import { StatusBadge } from './StatusBadge';

function Row({ post, labels }: { post: Post; labels: Profile['labels'] }) {
  const body = (
    <>
      <div className="post-text">
        <h3 className="post-title">{post.title}</h3>
        <span className="post-subtitle">{post.subtitle}</span>
      </div>
      {post.status === 'published' ? null : (
        <StatusBadge text={labels.postStatus[post.status]} tone={post.status} />
      )}
    </>
  );
  // HOME-AC-16: a row is a link only when the post has a URL (no #writing self-links, RQ-04).
  return (
    <li className="post">
      {post.url ? (
        <a href={post.url} className="post-row post-row--link">
          {body}
        </a>
      ) : (
        <div className="post-row">{body}</div>
      )}
    </li>
  );
}

// HOME-AC-16: the section keeps its id and h2 with 0 visible posts, and shows the empty-state line.
export function Writing({
  posts,
  section,
  labels,
}: {
  posts: readonly Post[];
  section: Profile['sections']['writing'];
  labels: Profile['labels'];
}) {
  return (
    <section id="writing" aria-labelledby="writing-title" className="band section">
      <div className="wrap stack-sm">
        <h2 id="writing-title" className="section-title">
          {section.title}
        </h2>
        <p className="section-intro">{section.intro}</p>
        {posts.length > 0 ? (
          // Safari drops list semantics from a styled <ul> outside <nav>; role="list" restores them.
          // oxlint-disable-next-line jsx-a11y/no-redundant-roles
          <ul className="posts" role="list">
            {posts.map((p) => (
              <Row key={p.slug} post={p} labels={labels} />
            ))}
          </ul>
        ) : (
          <p className="empty">{section.empty}</p>
        )}
      </div>
    </section>
  );
}
