import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExerciseAnimation } from '@/components/figure/ExerciseAnimation';
import { ANIMATIONS } from '@/components/figure/animations';

export const dynamic = 'force-dynamic';

/** A shortlist worth judging: two easy, two that a pure profile hides. */
const SUGGESTED = [
  { key: 'single-leg-rdl', name: 'Peso muerto rumano', note: 'sencillo, de perfil' },
  { key: 'copenhagen-short', name: 'Copenhagen corto', note: 'difícil: dos piernas cruzadas' },
  { key: 'bird-dog', name: 'Bird dog', note: 'difícil: brazo y pierna opuestos' },
  { key: 'hip-airplane', name: 'Hip airplane', note: 'difícil: rotación' },
];

const VARIANTS = [
  { id: 'actual' as const, name: 'Actual', blurb: 'Líneas de grosor fijo y punta redonda.' },
  { id: 'silueta' as const, name: 'A · Silueta', blurb: 'Mismo esqueleto, miembros con volumen que afina hacia la articulación.' },
  { id: 'tres-cuartos' as const, name: 'B · Silueta a tres cuartos', blurb: 'La silueta, girada 32° hacia ti. Cada lado tiene profundidad, así que se ve qué pierna es cuál.' },
];

export default async function Estilos({ params }: { params: Promise<{ anim: string }> }) {
  const { anim } = await params;
  const a = ANIMATIONS[anim];
  if (!a) notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">{anim}</h1>
        <Link href="/ajustes" className="shrink-0 text-sm font-semibold text-ink-400">
          Ajustes
        </Link>
      </div>
      <p className="mb-4 text-xs leading-snug text-ink-400">
        El mismo ejercicio, los mismos fotogramas y el mismo tempo, dibujados de tres
        maneras. Solo cambia el pintado: ninguna animación se ha tocado.
      </p>

      <div className="space-y-3">
        {VARIANTS.map((v) => (
          <section key={v.id} className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-lime-glow">
              {v.name}
            </p>
            <p className="mb-1 text-xs leading-snug text-ink-400">{v.blurb}</p>
            <ExerciseAnimation
              anim={anim}
              variant={v.id}
              padX={v.id === 'tres-cuartos' ? 7 : 0}
              className="mx-auto aspect-square w-full max-w-[15rem]"
            />
          </section>
        ))}
      </div>

      <p className="mb-2 mt-6 text-[0.7rem] font-bold uppercase tracking-wider text-ink-400">
        Otros ejercicios para comparar
      </p>
      <ul className="grid grid-cols-2 gap-2">
        {SUGGESTED.map((s) => (
          <li key={s.key}>
            <Link
              href={`/revision/estilos/${s.key}`}
              className={`block rounded-xl border px-3 py-2.5 ${
                s.key === anim
                  ? 'border-lime-core/50 bg-lime-core/10'
                  : 'border-ink-700 bg-ink-850'
              }`}
            >
              <span className="block text-[0.8rem] font-semibold leading-tight">{s.name}</span>
              <span className="block text-[0.68rem] text-ink-400">{s.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
