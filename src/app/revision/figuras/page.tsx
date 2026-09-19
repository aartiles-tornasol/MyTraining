import Link from 'next/link';
import { Figure3D } from '@/components/figure/Figure3D';
import { FIGURE3D } from '@/lib/program/figure3d';
import { EXERCISES, EXERCISE_ORDER } from '@/lib/program/exercises';

export const dynamic = 'force-dynamic';

/** All 46, in the new format, in the order the catalogue lists them. */
export default function Figuras() {
  const keys = EXERCISE_ORDER.filter((k) => FIGURE3D[k]);
  const orients = new Map<string, number>();
  for (const k of keys) {
    orients.set(FIGURE3D[k].orient, (orients.get(FIGURE3D[k].orient) ?? 0) + 1);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">Los {keys.length} en 3D</h1>
        <Link href="/ajustes" className="shrink-0 text-sm font-semibold text-ink-400">
          Ajustes
        </Link>
      </div>
      <p className="mb-3 text-[0.92rem] leading-relaxed text-ink-300">
        Renderizados una sola vez en Blender y servidos como imágenes planas. La etiqueta
        de arriba a la izquierda dice dónde está el cuerpo, que es lo que no se entendía.
      </p>
      <p className="mb-5 flex flex-wrap gap-1.5 text-[0.8rem]">
        {[...orients.entries()].map(([o, n]) => (
          <span key={o} className="rounded-full border border-ink-700 bg-ink-800 px-2 py-0.5 font-semibold text-ink-300">
            {o.replace(/-/g, ' ')} · {n}
          </span>
        ))}
      </p>

      <ul className="grid grid-cols-2 gap-3">
        {keys.map((k) => (
          <li key={k} className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-2">
            <Figure3D exercise={k} showLabel={false} className="aspect-square w-full" />
            <p className="mt-1 line-clamp-2 text-[0.9rem] font-semibold leading-tight">
              {EXERCISES[k]?.name ?? k}
            </p>
            <Link
              href={`/ejercicios/${k}`}
              className="mt-1 block text-[0.82rem] font-semibold text-lime-glow"
            >
              Ver ficha →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
