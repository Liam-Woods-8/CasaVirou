import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { stars } from '../../utils/format';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow text-muted ${className}`}>{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h1 className="display text-3xl sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeading({
  index,
  title,
  action,
  note,
}: {
  index?: string;
  title: string;
  action?: ReactNode;
  note?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div className="flex items-baseline gap-3">
        {index && <span className="eyebrow text-muted">{index}</span>}
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider sm:text-base">{title}</h2>
        {note && <span className="eyebrow hidden text-muted sm:inline">{note}</span>}
      </div>
      {action}
    </div>
  );
}

export function Difficulty({ level, className = '' }: { level: number; className?: string }) {
  return (
    <span className={`font-mono tracking-widest ${className}`} aria-label={`Difficulty ${level} of 5`}>
      {stars(level)}
    </span>
  );
}

export function ProgressBar({ value, total, className = '' }: { value: number; total: number; className?: string }) {
  return (
    <div
      className={`flex gap-1 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={`${value} of ${total} steps complete`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 ${i < value ? 'bg-ink' : 'bg-ink/15'}`} />
      ))}
    </div>
  );
}

export interface TabItem {
  to: string;
  label: string;
  count?: number;
  end?: boolean;
}

export function Tabs({ items, className = '' }: { items: TabItem[]; className?: string }) {
  return (
    <nav className={`flex overflow-x-auto overflow-y-hidden border-b border-line ${className}`}>
      {items.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `eyebrow shrink-0 border-b-2 px-1 py-3 mr-6 transition-colors ${
              isActive ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            }`
          }
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 text-muted">({t.count})</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`eyebrow h-9 shrink-0 border px-3 transition-all ${
        active ? 'border-ink bg-ink text-paper' : 'border-line bg-transparent text-ink hover:border-ink'
      }`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-ink/30 px-6 py-12 sm:items-center sm:px-10 sm:py-16 sm:text-center">
      <p className="font-mono text-base font-semibold uppercase tracking-wide sm:text-lg">{title}</p>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'error' | 'success'; children: ReactNode }) {
  const tones = {
    neutral: 'border-ink/20 bg-paper-deep',
    error: 'border-red-800/40 bg-red-50 text-red-900',
    success: 'border-emerald-800/30 bg-emerald-50 text-emerald-900',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
