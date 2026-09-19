import Link from 'next/link';
import { ExerciseAnimation } from '@/components/figure/ExerciseAnimation';

export const dynamic = 'force-dynamic';

/**
 * Side by side: our own drawing against ready-made line art, on our own dark
 * background and at the size a session shows it. Eight exercises sampled from
 * a 302-exercise set, for judging only — nothing here ships.
 */
/*
 * `movimiento` is measured, not guessed: each frame is rasterised and compared
 * by coarse ink coverage, which tolerates a drawing being a pixel off and still
 * reacts to a limb genuinely being somewhere else. 1.00 would be two unrelated
 * drawings. Below about 0.45 the loop reads as a still.
 */
const PAIRS = [
  { ours: 'hip-airplane', theirs: 'hip-airplane', name: 'Hip airplane', note: 'El que no entendías', exact: true, movimiento: 0.58 },
  { ours: 'copenhagen-short', theirs: 'copenhagen-plank', name: 'Copenhagen', note: 'Tumbado de lado', exact: false, why: 'La suya es palanca LARGA, con el pie en el banco. La nuestra es la corta, rodilla en la silla.', movimiento: 0.57 },
  { ours: 'bird-dog', theirs: 'bird-dog', name: 'Bird dog', note: 'A cuatro patas', exact: true, movimiento: 0.79 },
  { ours: 'calf-raise-single', theirs: 'single-leg-calf-raise', name: 'Talón a una pierna', note: 'De pie', exact: true, movimiento: 0.49 },
  { ours: 'clamshell-band', theirs: 'banded-clamshell', name: 'Almeja con banda', note: 'Tumbado de lado', exact: true, movimiento: 0.51 },
  { ours: 'single-leg-rdl', theirs: 'single-leg-romanian-deadlift', name: 'Peso muerto rumano', note: 'De pie', exact: true, movimiento: 0.80 },
  { ours: 'dead-bug', theirs: 'dead-bug', name: 'Dead bug', note: 'Boca arriba', exact: true, movimiento: 0.87 },
  { ours: 'cossack-squat', theirs: 'cossack-squat', name: 'Sentadilla cosaco', note: 'De pie', exact: true, movimiento: 0.85 },
  { ours: 'lateral-bound', theirs: 'skater-hop', name: 'Salto lateral', note: 'De pie', exact: false, why: 'Suyo: skater hop. Parecido pero no es el mismo aterrizaje.', movimiento: 0.74 },
  { ours: 'calf-stretch-wall', theirs: 'wall-calf-stretch', name: 'Estiramiento de gemelo', note: 'Contra la pared', exact: false, why: 'La suya es solo gemelo con la rodilla estirada. La nuestra incluye el sóleo con la rodilla doblada.', movimiento: 0.46 },
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
        de una librería ya dibujada, a la misma escala y sobre el mismo fondo. Donde su
        ejercicio no es exactamente el nuestro, lo digo en amarillo. El número de
        movimiento está medido, no estimado: cuánto cambia el dibujo entre fotogramas.
      </p>

      <div className="space-y-5">
        {PAIRS.map((p) => (
          <section key={p.ours} className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3">
            <p className="text-[0.82rem] font-bold">{p.name}</p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-400">
              {p.note} · movimiento {p.movimiento.toFixed(2)}
              {p.movimiento < 0.45 ? ' · se lee casi quieto' : ''}
            </p>
            {p.exact ? null : (
              <p className="mb-2 mt-1 rounded-lg border border-signal-warn/35 bg-signal-warn/10 px-2 py-1.5 text-[0.68rem] leading-snug text-signal-warn">
                No es el mismo ejercicio. {p.why}
              </p>
            )}
            {p.exact ? <div className="mb-2" /> : null}
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
