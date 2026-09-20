import { Card, Chip } from './ui/Shell';
import { EXERCISES, EQUIPMENT_LABEL } from '@/lib/program/exercises';
import { longDate } from '@/lib/dates';
import type { DayPlan } from '@/lib/program/plan';

/**
 * Lo que toca mañana, para poder dejarlo preparado la noche antes: qué sesión,
 * cuánto dura, qué ejercicios y qué material hay que tener a mano.
 *
 * Es una previsión, no la sesión definitiva: mañana no hay chequeo todavía, así
 * que se calcula como si se amaneciera sin dolor. La tarjeta lo dice, porque
 * entrenar de madrugada con el material equivocado a mano es justo lo que esto
 * intenta evitar, pero prometer una sesión exacta sería mentir.
 */
export function TomorrowCard({ day, plan }: { day: string; plan: DayPlan }) {
  /* El material de todos los ejercicios, sin repetir. "Sin material" solo se
     menciona cuando de verdad no hace falta nada. */
  const gear = [...new Set(plan.items.flatMap((i) => EXERCISES[i.exercise]?.equipment ?? []))]
    .filter((e) => e !== 'ninguno');

  return (
    <Card className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-bold">Mañana</p>
        <p className="text-[0.85rem] text-ink-300">{longDate(day)}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Chip tone="lime">{plan.session.name}</Chip>
        <Chip>{plan.minutes} min</Chip>
        {plan.session.heavy ? <Chip tone="info">Sesión pesada</Chip> : null}
      </div>

      <ol className="mt-3 space-y-1">
        {plan.items.map((i, n) => (
          <li key={`${i.exercise}-${n}`} className="flex gap-2 text-[0.95rem] leading-snug">
            <span className="w-4 shrink-0 text-right tabular-nums text-ink-400">{n + 1}</span>
            <span className="text-ink-100">
              {EXERCISES[i.exercise]?.name ?? i.exercise}
              <span className="text-ink-400"> · {setsLabel(i)}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-3 border-t border-ink-700/70 pt-3">
        <p className="text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Material
        </p>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-100">
          {gear.length === 0
            ? 'Nada: todo es con tu peso.'
            : gear.map((e) => EQUIPMENT_LABEL[e] ?? e).join(' · ')}
        </p>
      </div>

      <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-400">
        Previsión con la rotación de la semana. Si mañana amaneces con el Aquiles alto, la
        sesión se ajustará sola al puntuar el chequeo.
      </p>
    </Card>
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
  return `${item.sets} × ${each}`;
}
