'use client';

import { useState } from 'react';
import { Card } from './ui/Shell';
import { HowTo } from './SessionPlayer';
import { EXERCISES, EQUIPMENT_LABEL } from '@/lib/program/exercises';
import type { DayPlan } from '@/lib/program/plan';

/**
 * El detalle escrito de la sesión de mañana: qué series toca, cómo se hace cada
 * ejercicio y qué material dejar preparado. Las figuras las pone la tarjeta de
 * sesión, arriba; aquí van los números y el acceso al vídeo.
 *
 * El "?" abre la misma hoja que durante la sesión, con el vídeo arriba: quien
 * prepara la sesión la noche antes quiere repasar el movimiento entonces, no
 * descubrirlo a las siete de la mañana con la primera serie empezada.
 */
export function TomorrowDetail({ plan }: { plan: DayPlan }) {
  const [open, setOpen] = useState<string | null>(null);

  /* El material de todos los ejercicios, sin repetir. "Sin material" solo se
     menciona cuando de verdad no hace falta nada. */
  const gear = [...new Set(plan.items.flatMap((i) => EXERCISES[i.exercise]?.equipment ?? []))]
    .filter((e) => e !== 'ninguno');

  return (
    <>
      <Card className="mb-4">
        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Lo que toca
        </p>
        <ol className="space-y-2.5">
          {plan.items.map((i, n) => {
            const ex = EXERCISES[i.exercise];
            return (
              <li key={`${i.exercise}-${n}`} className="flex items-start gap-2.5">
                <span className="w-4 shrink-0 pt-0.5 text-right text-[0.95rem] tabular-nums text-ink-400">
                  {n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0rem] font-semibold leading-snug">
                    {ex?.name ?? i.exercise}
                  </span>
                  <span className="text-[0.88rem] text-ink-300">{setsLabel(i)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(i.exercise)}
                  aria-label={`Cómo se hace: ${ex?.name ?? i.exercise}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-600 text-[0.9rem] font-bold text-ink-300"
                >
                  ?
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[0.82rem] text-ink-400">
          Toca el <span className="font-bold">?</span> de cada ejercicio para ver el vídeo y
          repasar la técnica.
        </p>
      </Card>

      <Card className="mb-4">
        <p className="mb-1.5 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Material que dejar preparado
        </p>
        {gear.length === 0 ? (
          <p className="text-[1.05rem] leading-relaxed text-ink-100">
            Nada: mañana es todo con tu peso.
          </p>
        ) : (
          <ul className="space-y-1">
            {gear.map((e) => (
              <li key={e} className="flex items-center gap-2 text-[1.05rem] text-ink-100">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-core" />
                {EQUIPMENT_LABEL[e] ?? e}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="px-1 text-[0.85rem] leading-relaxed text-ink-400">
        Es una previsión con la rotación de la semana. Mañana todavía no has puntuado nada, así
        que está calculada como si amanecieras sin dolor: si te levantas con el Aquiles alto, la
        sesión se ajustará sola al hacer el chequeo.
      </p>

      {open ? <HowTo exerciseKey={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

/** "3 × 12" o "4 × 45 s", que es como se leen en la sesión. */
function setsLabel(item: DayPlan['items'][number]): string {
  const w = item.work;
  const each = w.timeSec
    ? `${w.timeSec} s`
    : w.holdSec
      ? `${w.holdSec} s`
      : `${w.reps ?? 10}${w.perSide ? ' por lado' : ''}`;
  return `${item.sets} × ${each}${w.tempo ? ` · tempo ${w.tempo}` : ''}`;
}
