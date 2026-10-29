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

const anyScored = (s: Scores) => ZONES.some((z) => s[z.column] !== null);

export function DailyCheckCard({ check, day }: { check: DailyCheck | null; day: string }) {
  const [played, setPlayed] = useState(check?.played ?? false);
  const [scores, setScores] = useState<Scores>(() => scoresFrom(check));
  const [playing, setPlaying] = useState(check?.playing_today ?? false);
  const [resting, setResting] = useState(check?.rest_day ?? false);
  const [help, setHelp] = useState(false);
  const [pending, start] = useTransition();
  /* El chequeo ya no depende del Aquiles: cualquier zona puntuada cuenta como
     hecho, porque puntuar el dolor vale por sí solo aunque hoy no se entrene. */
  const [open, setOpen] = useState(!anyScored(scoresFrom(check)));

  const set = (column: ZoneKey, n: number) => setScores((s) => ({ ...s, [column]: n }));

  const submit = () => {
    start(async () => {
      await saveCheck({
        day,
        ...Object.fromEntries(ZONES.map((z) => [z.input, scores[z.column]])),
        playingToday: playing,
        restDay: resting,
      });
      setOpen(false);
    });
  };

  const toggleRemote = (next: Partial<Parameters<typeof saveCheck>[0]>) => {
    start(async () => {
      await saveCheck({ day, ...next });
    });
  };

  const togglePlaying = (next: boolean) => {
    setPlaying(next);
    toggleRemote({ playingToday: next });
  };

  /* Marcar que se jugó de verdad. Lo de arriba es la intención, que sirve para
     elegir la sesión del día; esto es el hecho, que es lo que va al calendario
     y lo que antes no registraba nadie. */
  const togglePlayed = () => {
    const next = !played;
    setPlayed(next);
    toggleRemote({ played: next });
  };

  const toggleResting = (next: boolean) => {
    setResting(next);
    toggleRemote({ restDay: next });
  };

  const playedRow = playing ? (
    <button
      type="button"
      onClick={togglePlayed}
      className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5 text-left"
    >
      <span className="text-[0.95rem] font-semibold">
        {played ? 'Has jugado hoy ✓' : '¿Ya has jugado?'}
      </span>
      <span className="shrink-0 text-[0.9rem] font-semibold text-lime-glow">
        {played ? 'Quitar' : 'Marcar partido'}
      </span>
    </button>
  ) : null;

  const switches = (onPlaying: (v: boolean) => void) => (
    <>
      <label className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5">
        <span className="text-[1.0rem] font-semibold">¿Juegas hoy al pickleball?</span>
        <Switch checked={playing} onChange={onPlaying} />
      </label>
      {playedRow}
      <label className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5">
        <span className="min-w-0 pr-1">
          <span className="block text-[1.0rem] font-semibold">Hoy no entreno</span>
          <span className="block text-[0.85rem] leading-snug text-ink-300">
            El dolor que has puntuado se guarda igual
          </span>
        </span>
        <Switch checked={resting} onChange={toggleResting} />
      </label>
    </>
  );

  if (!open) {
    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold">Dolor de hoy anotado</p>
            <p className="mt-0.5 text-[0.88rem] leading-relaxed text-ink-300">
              {ZONES.map((z) => `${z.short} ${scores[z.column] ?? '—'}`).join(' · ')}
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
        {switches(togglePlaying)}
      </Card>
    );
  }

  return (
    <Card tone="accent" className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold">Dolor de hoy</p>
          <p className="mt-0.5 text-[0.92rem] leading-relaxed text-ink-300">
            Puntúa el <span className="font-semibold text-ink-100">dolor o molestia</span> de cada
            zona: 0 es nada y 10 es mucho. Puntúa las que te digan algo y deja el resto en blanco.
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
          Puntúa nada más levantarte. La rigidez matutina del Aquiles es la señal que decide la
          carga de hoy, y cada zona retira de la sesión lo que la carga. Vale la pena anotarlo
          aunque hoy no entrenes: es el histórico que decide la carga de mañana.
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

      {switches(setPlaying)}

      <button
        type="button"
        onClick={submit}
        disabled={!anyScored(scores) || pending}
        className="mt-4 w-full rounded-xl bg-lime-core py-3.5 text-base font-bold text-ink-950 transition active:scale-[0.98] disabled:opacity-40"
      >
        {pending ? 'Guardando…' : resting ? 'Guardar el dolor de hoy' : 'Guardar y ver la sesión de hoy'}
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
