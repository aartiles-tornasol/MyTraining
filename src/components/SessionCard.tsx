import Link from 'next/link';
import { Card, Chip } from './ui/Shell';
import { ExerciseAnimation } from './figure/ExerciseAnimation';
import { EXERCISES } from '@/lib/program/exercises';
import { animFor, sessionMinutes } from '@/lib/program/plan';
import type { Phase, SessionDef, SessionItem } from '@/lib/program/types';

export function SessionCard({
  session,
  items,
  phase,
  href,
  reason,
  mode = 'normal',
  cta = 'Empezar sesión',
}: {
  session: SessionDef;
  items: SessionItem[];
  phase: Phase;
  href: string;
  reason?: string;
  mode?: string;
  cta?: string;
}) {
  const minutes = sessionMinutes(items);
  return (
    <Card tone="accent" className="mb-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[1.4rem] font-bold leading-tight">{session.name}</p>
          <p className="text-sm text-ink-300">{session.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold leading-none text-lime-glow tabular-nums">{minutes}</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">min</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mode === 'suave' ? <Chip tone="warn">Versión suave</Chip> : null}
        {mode === 'descarga' ? <Chip tone="alert">Día de descarga</Chip> : null}
        {session.focus.map((f) => (
          <Chip key={f}>{f}</Chip>
        ))}
      </div>

      {reason ? (
        <p className="mt-3 rounded-lg bg-ink-800/70 px-3 py-2.5 text-[0.82rem] leading-snug text-ink-300">
          {reason}
        </p>
      ) : null}

      <ul className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {items.map((item, i) => {
          const ex = EXERCISES[item.exercise];
          if (!ex) return null;
          return (
            <li
              key={`${item.exercise}-${i}`}
              className="w-[5.5rem] shrink-0 rounded-lg bg-ink-800 p-1.5"
            >
              <ExerciseAnimation
                anim={animFor(item.exercise, phase)}
                showLabel={false}
                className="aspect-square w-full"
              />
              <p className="mt-0.5 line-clamp-2 text-center text-[0.62rem] leading-tight text-ink-300">
                {ex.name}
              </p>
            </li>
          );
        })}
      </ul>

      <Link
        href={href}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-lime-core py-4 text-base font-bold text-ink-950 transition active:scale-[0.98]"
      >
        {cta}
      </Link>
    </Card>
  );
}
