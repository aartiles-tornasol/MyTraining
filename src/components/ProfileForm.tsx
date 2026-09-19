'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/lib/actions';

export function ProfileForm({
  startDate,
  heightCm,
  weightKg,
  disabled,
}: {
  startDate: string;
  heightCm: number | null;
  weightKg: number | null;
  disabled?: boolean;
}) {
  const [start, setStart] = useState(startDate);
  const [height, setHeight] = useState(heightCm ?? 172);
  const [weight, setWeight] = useState(weightKg ?? 75);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setSaved(false);
    startTransition(async () => {
      await updateProfile({ startDate: start, heightCm: height, weightKg: weight });
      setSaved(true);
    });
  };

  return (
    <div className="space-y-3">
      <Field label="Fecha de inicio del programa">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full rounded-lg bg-ink-800 px-3 py-2.5 text-[1.0rem] text-ink-100"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Altura (cm)">
          <input
            type="number"
            inputMode="numeric"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full rounded-lg bg-ink-800 px-3 py-2.5 text-[1.0rem] tabular-nums text-ink-100"
          />
        </Field>
        <Field label="Peso (kg)">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full rounded-lg bg-ink-800 px-3 py-2.5 text-[1.0rem] tabular-nums text-ink-100"
          />
        </Field>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending || disabled}
        className="w-full rounded-xl bg-ink-700 py-3 text-[1.0rem] font-bold disabled:opacity-40"
      >
        {pending ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar'}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.8rem] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      {children}
    </label>
  );
}
