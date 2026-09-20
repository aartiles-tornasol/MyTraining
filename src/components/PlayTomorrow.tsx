'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveCheck } from '@/lib/actions';

/**
 * Marcar la noche antes que mañana hay partido. No es un adorno: si se juega,
 * el trabajo pesado se aparta para no llegar cansado a la pista, así que la
 * previsión de abajo cambia entera al tocarlo. Por eso refresca en cuanto se
 * guarda, en vez de esperar a que se entre en la pantalla otra vez.
 */
export function PlayTomorrow({ day, playing }: { day: string; playing: boolean }) {
  const [on, setOn] = useState(playing);
  const [pending, start] = useTransition();
  const router = useRouter();

  const toggle = (next: boolean) => {
    setOn(next);
    start(async () => {
      await saveCheck({ day, playingToday: next });
      router.refresh();
    });
  };

  return (
    <label className="mb-4 flex items-center justify-between gap-3 rounded-xl2 border border-ink-700/70 bg-ink-850 px-4 py-3.5">
      <span>
        <span className="block text-[1.0rem] font-semibold">¿Juegas mañana al pickleball?</span>
        <span className="mt-0.5 block text-[0.85rem] text-ink-300">
          {pending ? 'Guardando…' : 'Si juegas, la sesión será más corta y sin carga pesada'}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => toggle(!on)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          on ? 'bg-lime-core' : 'bg-ink-600'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
            on ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </label>
  );
}
