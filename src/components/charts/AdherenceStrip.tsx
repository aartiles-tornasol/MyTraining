'use client';

import { useState } from 'react';
import { addDays, shortDate, weekdayShort } from '@/lib/dates';
import { SESSIONS } from '@/lib/program/sessions';

const TRAINED = '#b9dd1f';
const MATCH = '#5eb0ff';
const RESTED = '#1a2430';
const ON_LIME = '#16202b';

export interface DayCell { day: string; sessionKey: string | null; played: boolean }

/**
 * Una bola de pickleball: redonda y agujereada, que es lo único que la
 * distingue de cualquier otra pelota a este tamaño. Los agujeros se pintan del
 * color del fondo en lugar de recortarse, para que la misma bola sirva sobre la
 * celda verde de un día entrenado y sobre la oscura de un día en que solo se
 * jugó.
 */
function Pickleball({
  color,
  hole,
  className = 'h-[70%] w-[70%]',
}: {
  color: string;
  hole: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill={color} />
      {/* Cinco agujeros grandes y no siete pequeños: a 25 px en pantalla, siete
          se emborronan en una textura y la bola pasa a parecer una rueda. */}
      {[[12, 6.6], [7.3, 11], [16.7, 11], [9.3, 16.6], [14.7, 16.6]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" fill={hole} />
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
              {played ? (
                <Pickleball
                  color={trained ? ON_LIME : MATCH}
                  hole={trained ? TRAINED : RESTED}
                />
              ) : null}
              <span className="sr-only">{weekdayShort(d)}</span>
            </button>
          );
        })}
      </div>

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
          <Pickleball color={MATCH} hole={RESTED} className="h-4 w-4" />
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
