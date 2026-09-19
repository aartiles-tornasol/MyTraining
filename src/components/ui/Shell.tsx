import { Nav } from './Nav';

/** Standard page frame: safe-area padding, max width, room for the tab bar. */
export function Shell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div
        className="mx-auto w-full max-w-lg px-4"
        style={{
          paddingTop: 'calc(var(--safe-t) + 1.25rem)',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-b) + 1.5rem)',
        }}
      >
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-[1.0rem] text-ink-300">{subtitle}</p> : null}
          </div>
          {action}
        </header>
        {children}
      </div>
      <Nav />
    </>
  );
}

export function Card({
  children,
  className = '',
  tone = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'accent' | 'warn' | 'alert';
}) {
  const tones = {
    default: 'bg-ink-850 border-ink-700/70',
    accent: 'bg-ink-850 border-lime-core/40',
    warn: 'bg-[#2a2313] border-signal-warn/35',
    alert: 'bg-[#2b1618] border-signal-alert/40',
  } as const;
  return (
    <section className={`rounded-xl2 border ${tones[tone]} p-4 ${className}`}>{children}</section>
  );
}

export function Chip({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'lime' | 'warn' | 'alert' | 'info' }) {
  const tones = {
    muted: 'bg-ink-800 text-ink-300 border-ink-700',
    lime: 'bg-lime-core/15 text-lime-glow border-lime-core/35',
    warn: 'bg-signal-warn/15 text-signal-warn border-signal-warn/35',
    alert: 'bg-signal-alert/15 text-signal-alert border-signal-alert/35',
    info: 'bg-signal-info/15 text-signal-info border-signal-info/35',
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.78rem] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
