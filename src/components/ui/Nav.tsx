'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Hoy', icon: 'today' },
  { href: '/progreso', label: 'Progreso', icon: 'chart' },
  { href: '/ejercicios', label: 'Ejercicios', icon: 'grid' },
  { href: '/ajustes', label: 'Ajustes', icon: 'gear' },
] as const;

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? '#d6f645' : '#7488a0';
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      {name === 'today' && (
        <g {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
          <circle cx="12" cy="14.5" r="2.2" fill={stroke} stroke="none" />
        </g>
      )}
      {name === 'chart' && (
        <g {...common}>
          <path d="M4 19.5h16" />
          <path d="M6.5 16V11M11 16V6.5M15.5 16v-6M20 16v-3" />
        </g>
      )}
      {name === 'grid' && (
        <g {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
        </g>
      )}
      {name === 'gear' && (
        <g {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
        </g>
      )}
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-ink-700/70 bg-ink-950/85 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-b)' }}
    >
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((t) => {
          const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className="flex h-[4.25rem] flex-col items-center justify-center gap-1"
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={t.icon} active={active} />
                <span
                  className={`text-[0.68rem] font-semibold tracking-wide ${
                    active ? 'text-lime-glow' : 'text-ink-400'
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
