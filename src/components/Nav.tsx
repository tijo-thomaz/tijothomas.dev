import type { Profile } from '@/content/types';

// HOME-AC-11: brand -> #top, then the section anchors in content order. No CV button (Q8b).
export function Nav({ nav }: { nav: Profile['nav'] }) {
  return (
    <header className="site-header band band--mint">
      <nav aria-label="Main" className="nav wrap">
        <a href="#top" className="nav-brand">
          {nav.brand}
        </a>
        <ul className="nav-list">
          {nav.items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="nav-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
