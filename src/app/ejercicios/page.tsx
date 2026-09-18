import Link from 'next/link';
import { Shell } from '@/components/ui/Shell';
import { ExerciseAnimation } from '@/components/figure/ExerciseAnimation';
import { EXERCISES, EXERCISE_GROUPS } from '@/lib/program/exercises';
import { getToday } from '@/lib/data';
import { animFor } from '@/lib/program/plan';

export const dynamic = 'force-dynamic';

export default async function Ejercicios() {
  const { plan } = await getToday();
  return (
    <Shell title="Ejercicios" subtitle={`${Object.keys(EXERCISES).length} ejercicios del programa`}>
      <div className="space-y-7">
        {EXERCISE_GROUPS.map((group) => (
          <section key={group.name}>
            <h2 className="text-[1.05rem] font-bold">{group.name}</h2>
            <p className="mb-3 mt-0.5 text-xs leading-snug text-ink-400">{group.blurb}</p>
            <ul className="grid grid-cols-2 gap-2.5">
              {group.keys.map((key) => {
                const ex = EXERCISES[key];
                if (!ex) return null;
                return (
                  <li key={key}>
                    <Link
                      href={`/ejercicios/${key}`}
                      className="block rounded-xl2 border border-ink-700/70 bg-ink-850 p-2 transition active:scale-[0.98]"
                    >
                      <ExerciseAnimation
                        anim={animFor(key, plan.phase)}
                        showLabel={false}
                        className="aspect-square w-full"
                      />
                      <p className="mt-1 line-clamp-2 text-[0.8rem] font-semibold leading-tight">
                        {ex.name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[0.68rem] leading-tight text-ink-400">
                        {ex.tagline}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
