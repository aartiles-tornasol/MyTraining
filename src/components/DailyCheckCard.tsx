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
  const [hamstring, setHamstring] = useState<number | null>(check?.hamstring ?? null);
  const [piriformis, setPiriformis] = useState<number | null>(check?.piriformis ?? null);
  const [pubic, setPubic] = useState<number | null>(check?.pubic ?? null);
  const [playing, setPlaying] = useState(check?.playing_today ?? false);
  const [help, setHelp] = useState(false);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      await saveCheck({
        day,
        achillesAM: achilles,
        adductor,
        hamstring,
        piriformis,
        pubic,
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
              Aquiles {achilles}/10 · aductores {adductor ?? '—'} · isquios {hamstring ?? '—'} ·
              piramidal {piriformis ?? '—'} · pubis {pubic ?? '—'}
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold">Chequeo de la mañana</p>
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
        <PainScale
          label="Tendones de Aquiles"
          hint="Los primeros pasos al salir de la cama"
          value={achilles}
          onChange={setAchilles}
        />
        <PainScale label="Aductores / ingle" value={adductor} onChange={setAdductor} />
        <PainScale label="Isquiotibiales" value={hamstring} onChange={setHamstring} />
        <PainScale label="Piramidal / glúteo" value={piriformis} onChange={setPiriformis} />
        <PainScale
          label="Pubis / pubalgia"
          hint="Encima de los genitales, debajo del estómago"
          value={pubic}
          onChange={setPubic}
        />
      </div>

      <label className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-ink-800 px-3 py-3">
        <span className="text-[1.0rem] font-semibold">¿Juegas hoy al pickleball?</span>
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
