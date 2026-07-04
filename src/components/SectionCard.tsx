import type { ReactNode } from 'react';

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  eyebrow,
  title,
  subtitle,
  action,
  children
}: SectionCardProps) {
  return (
    <section className="section-card">
      <header className="section-card-header">
        <div>
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}
