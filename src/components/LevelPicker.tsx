'use client';

import { useState, useTransition } from 'react';
import { setLevelOffset } from '@/lib/actions';

const OPTIONS = [
  { value: -1, label: 'Más fácil' },
  { value: 0, label: 'El de la fase' },
  { value: 1, label: 'Más difícil' },
] as const;

export function LevelPicker({ exerciseKey, offset }: { exerciseKey: string; offset: number }) {
  const [value, setValue] = useState(offset);
  const [pending, start] = useTransition();

  const pick = (next: number) => {
    setValue(next);
    start(async () => {
      await setLevelOffset(exerciseKey, next);
    });
  };

  return (
    <div className={pending ? 'opacity-60' : ''}>
      <div className="flex gap-1.5 rounded-xl bg-ink-800 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => pick(o.value)}
            aria-pressed={value === o.value}
            className={`flex-1 rounded-lg py-3 text-[0.92rem] font-bold transition ${
              value === o.value ? 'bg-lime-core text-ink-950' : 'text-ink-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
