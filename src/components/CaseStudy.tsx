import type { ReactNode } from 'react';

import type { CaseStudy as Study, Profile, WorkItem } from '@/content/types';
import { workBadge } from '@/lib/format';

import { FlowDiagram } from './FlowDiagram';
import { Footer } from './Footer';
import { MetricRow } from './MetricRow';
import { StatusBadge } from './StatusBadge';

type Props = { item: WorkItem; study: Study; profile: Profile; playHref?: string };

function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="case-section stack-sm">
      <h2 id={id} className="section-title case-title">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function Architecture({ arch, planned }: { arch: Study['architecture']; planned: string }) {
  const { today, target } = arch;
  return (
    <Section id="cs-architecture" heading={arch.heading}>
      <div className="case-part stack-sm">
        <h3 className="case-subtitle">{today.heading}</h3>
        <FlowDiagram diagram={today.diagram} id="cs-today" />
        <dl className="case-list">
          {today.parts.map((p) => (
            <div key={p.name} className="case-row">
              <dt>{p.name}</dt>
              <dd>{`${today.labels.does}: ${p.does}`}</dd>
              <dd>{`${today.labels.problem}: ${p.problem}`}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="case-part stack-sm">
        <h3 className="case-subtitle">{target.heading}</h3>
        <p>
          <StatusBadge text={planned} tone="planned" />
        </p>
        <FlowDiagram diagram={target.diagram} id="cs-target" />
        <ol className="case-steps">
          {target.parts.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              {`: ${s.text}`}
            </li>
          ))}
        </ol>
        <h4 className="case-minor">{target.toolGateway.heading}</h4>
        <ul className="case-bullets">
          {target.toolGateway.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function TradeOffs({ t }: { t: Study['tradeOffs'] }) {
  return (
    <Section id="cs-trade-offs" heading={t.heading}>
      <dl className="case-list">
        {t.decisions.map((d) => (
          <div key={d.decision} className="case-row">
            <dt>{d.decision}</dt>
            <dd>{`${t.labels.why}: ${d.why}`}</dd>
            <dd>{`${t.labels.tradeOff}: ${d.tradeOff}`}</dd>
          </div>
        ))}
      </dl>
      <h3 className="case-subtitle">{t.limitsHeading}</h3>
      <ul className="case-bullets">
        {t.limits.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </Section>
  );
}

function Header({ item, study, profile, playHref }: Props) {
  const { labels } = profile;
  return (
    <header className="stack-sm">
      <a href="/" className="nav-brand">
        {profile.nav.brand}
      </a>
      <h1 className="hero-title placeholder-title">{item.name}</h1>
      {item.formerName ? <p className="card-former">{`${labels.formerly} ${item.formerName}`}</p> : null}
      <p className="section-intro">{study.description}</p>
      <p className="placeholder-links">
        <StatusBadge text={workBadge(item, labels.workStatus)} tone={item.status} />
        {playHref ? (
          <a href={playHref} className="work-link">
            {labels.play}
          </a>
        ) : null}
        {item.repoUrl ? (
          <a href={item.repoUrl} className="work-link" target="_blank" rel="noopener noreferrer">
            {labels.github}
          </a>
        ) : null}
      </p>
      <MetricRow metric={item.metric} notMeasured={labels.notMeasured} />
    </header>
  );
}

// PROJ-AC-09: each source link carries rel="noopener noreferrer" (SEC-11).
function WhyItMatters({ why }: { why: Study['whyItMatters'] }) {
  return (
    <Section id="cs-why" heading={why.heading}>
      <ul className="case-bullets">
        {why.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <h3 className="case-subtitle">{why.sourcesHeading}</h3>
      <ul className="case-bullets">
        {why.sources.map((s) => (
          <li key={s.href}>
            <a href={s.href} rel="noopener noreferrer">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// PROJ-AC-08, PROJ-AC-09, PROJ-AC-13: the case study at /work/<slug>. Server-rendered, no client code.
// Evaluation shows only its status line until an eval report exists (P-11). Every string comes from
// src/content.
export function CaseStudy(props: Props) {
  const { study, profile } = props;
  const { labels } = profile;
  const { problem, evaluation } = study;
  return (
    <>
      <main id="main" className="band band--surface case-study">
        <article className="wrap wrap--narrow stack-lg">
          <Header {...props} />
          <Section id="cs-problem" heading={problem.heading}>
            {problem.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Section>
          <WhyItMatters why={study.whyItMatters} />
          <Architecture arch={study.architecture} planned={labels.workStatus.planned} />
          <Section id="cs-evaluation" heading={evaluation.heading}>
            <p>{evaluation.status}</p>
          </Section>
          <TradeOffs t={study.tradeOffs} />
        </article>
      </main>
      <Footer
        name={profile.name}
        year={new Date().getFullYear()}
        terminalLabel={labels.terminalMode}
        privacyLabel={labels.privacy}
      />
    </>
  );
}
