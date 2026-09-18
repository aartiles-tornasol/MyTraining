'use client';

import { useState, useTransition } from 'react';
import { PainScale } from './ui/PainScale';
import { Card } from './ui/Shell';
import { saveCheck } from '@/lib/actions';
import type { DailyCheck } from '@/lib/data';

export function DailyCheckCard({ check, day }: { check: DailyCheck | null; day: string }) {
  const done = check?.achilles_am != null;
  const [open, setOpen] = useState(!done);
  const [achilles, setAchilles] = useState<number | null>(check?.achilles_am ?? null);
  const [adductor, setAdductor] = useState<number | null>(check?.adductor ?? null);
  const [piriformis, setPiriformis] = useState<number | null>(check?.piriformis ?? null);
  const [playing, setPlaying] = useState(check?.playing_today ?? false);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      await saveCheck({
        day,
        achillesAM: achilles,
        adductor,
        piriformis,
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
            <p className="text-sm font-semibold">Chequeo de hoy hecho</p>
            <p className="mt-0.5 truncate text-xs text-ink-400">
              Aquiles {achilles}/10 · aductores {adductor ?? '—'}/10 · piramidal {piriformis ?? '—'}/10
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full border border-ink-600 px-3 py-1.5 text-xs font-semibold text-ink-300"
          >
            Editar
          </button>
        </div>
        <label className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-2.5">
          <span className="text-sm font-semibold">¿Juegas hoy al pickleball?</span>
          <Switch checked={playing} onChange={togglePlaying} />
        </label>
      </Card>
    );
  }

  return (
    <Card tone="accent" className="mb-4">
      <p className="text-base font-bold">Chequeo de la mañana</p>
      <p className="mt-0.5 mb-4 text-xs leading-snug text-ink-400">
        Puntúa nada más levantarte. La rigidez matutina del Aquiles es la señal que decide
        la carga de hoy: es el dato más importante de toda la app.
      </p>

      <div className="space-y-5">
        <PainScale
          label="Aquiles al levantarte"
          hint="Los primeros pasos al salir de la cama"
          value={achilles}
          onChange={setAchilles}
        />
        <PainScale label="Aductores / ingle" value={adductor} onChange={setAdductor} />
        <PainScale label="Piramidal / glúteo" value={piriformis} onChange={setPiriformis} />
      </div>

      <label className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-3">
        <span className="text-sm font-semibold">¿Juegas hoy al pickleball?</span>
        <Switch checked={playing} onChange={setPlaying} />
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={achilles === null || pending}
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
