'use client';

import { useState } from 'react';
import { addDays, shortDate, weekdayShort } from '@/lib/dates';
import { SESSIONS } from '@/lib/program/sessions';

const TRAINED = '#b9dd1f';
const MATCH = '#4a86d8';

export interface DayCell { day: string; sessionKey: string | null; played: boolean }

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
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.6rem] text-ink-500">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => <span key={`${d}${i}`}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const cell = byDay[d];
          const future = d > today;
          const trained = Boolean(cell?.sessionKey);
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSel(d)}
              aria-label={`${shortDate(d)}${trained ? ', entrenado' : ''}${cell?.played ? ', partido' : ''}`}
              className="relative aspect-square rounded-md transition"
              style={{
                background: trained ? TRAINED : future ? 'transparent' : '#1a2430',
                border: cell?.played ? `2px solid ${MATCH}` : future ? '1px dashed #2a3542' : '1px solid transparent',
                outline: sel === d ? '2px solid #e6edf5' : 'none',
                outlineOffset: '1px',
                opacity: future ? 0.5 : 1,
              }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold"
                style={{ color: trained ? '#16202b' : '#4c5f72' }}
              >
                {d === today ? '•' : ''}
              </span>
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
          <span className="inline-block h-3 w-3 rounded border-2" style={{ borderColor: MATCH }} />
          jugaste
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ background: '#1a2430' }} />
          descanso
        </span>
      </div>
    </div>
  );
}
