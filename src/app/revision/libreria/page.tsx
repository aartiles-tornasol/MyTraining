import Link from 'next/link';
import { ExerciseAnimation } from '@/components/figure/ExerciseAnimation';

export const dynamic = 'force-dynamic';

/**
 * Side by side: our own drawing against ready-made line art, on our own dark
 * background and at the size a session shows it. Eight exercises sampled from
 * a 302-exercise set, for judging only — nothing here ships.
 */
const PAIRS = [
  { ours: 'hip-airplane', theirs: 'hip-airplane', name: 'Hip airplane', note: 'El que no entendías' },
  { ours: 'copenhagen-short', theirs: 'copenhagen-plank', name: 'Copenhagen', note: 'Tumbado de lado' },
  { ours: 'bird-dog', theirs: 'bird-dog', name: 'Bird dog', note: 'A cuatro patas' },
  { ours: 'calf-raise-single', theirs: 'single-leg-calf-raise', name: 'Talón a una pierna', note: 'De pie' },
  { ours: 'clamshell-band', theirs: 'clamshell', name: 'Almeja', note: 'Tumbado de lado' },
  { ours: 'calf-stretch-wall', theirs: 'wall-calf-stretch', name: 'Estiramiento de gemelo', note: 'Contra la pared' },
  { ours: 'banded-lateral-walk', theirs: 'banded-lateral-walk', name: 'Paso lateral con banda', note: 'De pie' },
  { ours: 'cossack-squat', theirs: 'cossack-squat', name: 'Sentadilla cosaco', note: 'De pie' },
];

/* The art is already white on transparent, so it needs no recolouring here —
   a filter would also repaint the element's own background and fill the box. */

export default function Libreria() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Nuestro dibujo vs. una librería</h1>
        <Link href="/ajustes" className="shrink-0 text-sm font-semibold text-ink-400">
          Ajustes
        </Link>
      </div>
      <p className="mb-5 text-xs leading-snug text-ink-400">
        A la izquierda lo que tiene la app hoy, animado. A la derecha los tres fotogramas
        de una librería ya dibujada, a la misma escala y sobre el mismo fondo. Ocho
        ejercicios de muestra, solo para juzgar.
      </p>

      <div className="space-y-5">
        {PAIRS.map((p) => (
          <section key={p.ours} className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3">
            <p className="text-[0.82rem] font-bold">{p.name}</p>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-400">
              {p.note}
            </p>
            <div className="flex gap-2">
              <div className="w-[7.5rem] shrink-0">
                <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-wider text-ink-400">
                  Ahora
                </p>
                <ExerciseAnimation
                  anim={p.ours}
                  showLabel={false}
                  className="aspect-square w-full rounded-lg bg-ink-900"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-wider text-lime-glow">
                  Librería
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((f) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={f} className="min-w-0 flex-1 rounded-lg bg-ink-900 p-1">
                      <img
                        src={`/wg/${p.theirs}-${f}.svg`}
                        alt={`${p.name}, fotograma ${f}`}
                        className="aspect-square w-full object-contain opacity-90"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-[0.68rem] leading-snug text-ink-400">
        Dibujos de Workout Guide (Bryl Lim) y Everkinetic, CC BY-SA 4.0. Muestra local
        para evaluación.
      </p>
    </div>
  );
}
