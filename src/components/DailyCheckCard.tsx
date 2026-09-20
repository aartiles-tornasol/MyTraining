'use client';

import { useState, useTransition } from 'react';
import { PainScale } from './ui/PainScale';
import { Card } from './ui/Shell';
import { saveCheck } from '@/lib/actions';
import { ZONES } from '@/lib/program/zones';
import type { ZoneKey } from '@/lib/program/zones';
import type { DailyCheck } from '@/lib/data';

type Scores = Record<ZoneKey, number | null>;

const scoresFrom = (check: DailyCheck | null): Scores =>
  Object.fromEntries(ZONES.map((z) => [z.column, check?.[z.column] ?? null])) as Scores;

export function DailyCheckCard({ check, day }: { check: DailyCheck | null; day: string }) {
  const done = check?.achilles_am != null;
  const [open, setOpen] = useState(!done);
  const [scores, setScores] = useState<Scores>(() => scoresFrom(check));
  const [playing, setPlaying] = useState(check?.playing_today ?? false);
  const [help, setHelp] = useState(false);
  const [pending, start] = useTransition();

  const set = (column: ZoneKey, n: number) => setScores((s) => ({ ...s, [column]: n }));

  const submit = () => {
    start(async () => {
      await saveCheck({
        day,
        ...Object.fromEntries(ZONES.map((z) => [z.input, scores[z.column]])),
        playingToday: playing,
      });
      setOpen(false);
    });
  };

  const togglePlaying = (next: boolean) => {
    setPlaying(next);
    start(async () => {
      await saveCheck({ day, playingToday: next });
    });
  };

  if (!open) {
    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold">Chequeo de hoy hecho</p>
            <p className="mt-0.5 text-[0.88rem] leading-relaxed text-ink-300">
              Dolor hoy · {ZONES.map((z) => `${z.short} ${scores[z.column] ?? '—'}`).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full border border-ink-600 px-3 py-1.5 text-[0.85rem] font-semibold text-ink-300"
          >
            Editar
          </button>
        </div>
        <label className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5">
          <span className="text-[1.0rem] font-semibold">¿Juegas hoy al pickleball?</span>
          <Switch checked={playing} onChange={togglePlaying} />
        </label>
      </Card>
    );
  }

  return (
    <Card tone="accent" className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold">Chequeo de la mañana</p>
          <p className="mt-0.5 text-[0.92rem] leading-relaxed text-ink-300">
            Puntúa el <span className="font-semibold text-ink-100">dolor o molestia</span> de cada
            zona: 0 es nada y 10 es mucho.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHelp((v) => !v)}
          aria-expanded={help}
          aria-label="Por qué importa este chequeo"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[0.9rem] font-bold transition-colors ${
            help ? 'border-lime-core text-lime-core' : 'border-ink-600 text-ink-300'
          }`}
        >
          ?
        </button>
      </div>
      {help ? (
        <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-300">
          Puntúa nada más levantarte. La rigidez matutina del Aquiles es la señal que decide
          la carga de hoy: es el dato más importante de toda la app.
        </p>
      ) : null}

      <div className="mt-4 space-y-5">
        {ZONES.map((z) => (
          <PainScale
            key={z.column}
            label={z.label}
            value={scores[z.column]}
            onChange={(n) => set(z.column, n)}
          />
        ))}
      </div>

      <label className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-3">
        <span className="text-[1.0rem] font-semibold">¿Juegas hoy al pickleball?</span>
        <Switch checked={playing} onChange={setPlaying} />
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={scores.achilles_am === null || pending}
        className="mt-4 w-full rounded-xl bg-lime-core py-3.5 text-base font-bold text-ink-950 transition active:scale-[0.98] disabled:opacity-40"
      >
        {pending ? 'Guardando…' : 'Guardar y ver la sesión de hoy'}
      </button>
    </Card>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-lime-core' : 'bg-ink-600'
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}
