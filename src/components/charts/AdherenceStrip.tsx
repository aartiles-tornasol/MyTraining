'use client';

import { useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, shortDate, weekdayShort } from '@/lib/dates';
import { SESSIONS } from '@/lib/program/sessions';
import { saveCheck } from '@/lib/actions';

const TRAINED = '#b9dd1f';
const RESTED = '#1a2430';
const BALL_DARK = '#0d1218';

export interface DayCell { day: string; sessionKey: string | null; played: boolean }

/**
 * La bola del icono de la app, que es la que ya reconoce el ojo: lima con
 * agujeros oscuros. El aro oscuro del borde no es decoración — sin él la bola
 * desaparece sobre la celda verde de un día entrenado, que es justo el día en
 * que además se suele jugar.
 */
function Pickleball({ className = 'h-[90%] w-[90%]' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#e4ff6b" />
          <stop offset="100%" stopColor="#a8cc12" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={BALL_DARK} />
      <circle cx="12" cy="12" r="11" fill={`url(#${id})`} />
      {/* Los siete agujeros del icono, en su misma posición. */}
      {[[12, 6.24], [6.24, 9.12], [17.76, 9.12], [12, 12], [6.24, 14.88], [17.76, 14.88], [12, 17.76]]
        .map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.1" fill={BALL_DARK} />
        ))}
    </svg>
  );
}

/** Four weeks of days, newest last, so the run of green reads as a habit. */
export function AdherenceStrip({
  today,
  byDay,
  weeks = 4,
}: {
  today: string;
  byDay: Record<string, { sessionKey: string | null; played: boolean }>;
  weeks?: number;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [pending, startSave] = useTransition();
  const router = useRouter();
  const total = weeks * 7;
  // Start on the Monday of the oldest week so columns line up with weekdays.
  const todayDow = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const start = addDays(today, -(total - 1 - (6 - todayDow)));
  const days = Array.from({ length: total }, (_, i) => addDays(start, i));

  const info = sel ? byDay[sel] : null;

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.6rem] text-ink-400">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => <span key={`${d}${i}`}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const cell = byDay[d];
          const future = d > today;
          const trained = Boolean(cell?.sessionKey);
          const played = Boolean(cell?.played) && !future;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSel(d)}
              aria-label={`${shortDate(d)}${trained ? ', entrenado' : ''}${played ? ', partido' : ''}`}
              className="relative flex aspect-square items-center justify-center rounded-md transition"
              style={{
                background: trained ? TRAINED : future ? 'transparent' : RESTED,
                /* El borde ya no dice si hubo partido — eso lo dice la bola —,
                   así que queda libre para marcar el día de hoy. */
                border: isToday
                  ? '2px solid #a3b4c6'
                  : future
                    ? '1px dashed #2a3542'
                    : '1px solid transparent',
                outline: sel === d ? '2px solid #e6edf5' : 'none',
                outlineOffset: '1px',
                opacity: future ? 0.5 : 1,
              }}
            >
              {played ? <Pickleball /> : null}
              <span className="sr-only">{weekdayShort(d)}</span>
            </button>
          );
        })}
      </div>

      {sel && sel <= today ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startSave(async () => {
              await saveCheck({ day: sel, played: !byDay[sel]?.played });
              router.refresh();
            })
          }
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5 text-[0.9rem] disabled:opacity-50"
        >
          <span className="font-semibold">
            {shortDate(sel)} · {byDay[sel]?.played ? 'jugaste' : 'no jugaste'}
          </span>
          <span className="shrink-0 font-semibold text-lime-glow">
            {pending ? 'Guardando…' : byDay[sel]?.played ? 'Quitar partido' : 'Marcar partido'}
          </span>
        </button>
      ) : null}

      <p className="mt-2 min-h-[1.1rem] text-xs text-ink-300">
        {sel ? (
          info?.sessionKey ? (
            <>
              <span className="font-bold">{shortDate(sel)}</span>{' · '}
              {SESSIONS[info.sessionKey]?.name ?? info.sessionKey}
              {info.played ? ' · partido' : ''}
            </>
          ) : (
            <>
              <span className="font-bold">{shortDate(sel)}</span>
              {info?.played ? ' · partido, sin entrenar' : ' · sin entrenar'}
            </>
          )
        ) : (
          'Toca un día para ver qué hiciste'
        )}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.68rem] text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ background: TRAINED }} />
          entrenaste
        </span>
        <span className="flex items-center gap-1.5">
          <Pickleball className="h-4 w-4" />
          jugaste
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ background: RESTED }} />
          descanso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2" style={{ borderColor: '#a3b4c6' }} />
          hoy
        </span>
      </div>
    </div>
  );
}
