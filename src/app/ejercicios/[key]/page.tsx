import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell, Card, Chip } from '@/components/ui/Shell';
import { ExerciseAnimation } from '@/components/figure/ExerciseAnimation';
import { Figure3D } from '@/components/figure/Figure3D';
import { ExerciseVideo } from '@/components/ExerciseVideo';
import { videoFor } from '@/lib/program/videos';
import { FIGURE3D } from '@/lib/program/figure3d';
import { LevelPicker } from '@/components/LevelPicker';
import { ExerciseHeaderNav, ExerciseNav } from '@/components/ExerciseNav';
import { EXERCISES, exerciseNeighbours } from '@/lib/program/exercises';
import { getToday } from '@/lib/data';
import { animFor, levelFor } from '@/lib/program/plan';

export const dynamic = 'force-dynamic';

const EQUIPMENT_LABEL: Record<string, string> = {
  ninguno: 'Sin material', mancuernas: 'Mancuernas', banda: 'Banda elástica',
  escalon: 'Escalón', silla: 'Silla', mochila: 'Mochila cargada',
  pared: 'Pared', esterilla: 'Esterilla', cojin: 'Cojín o pelota', pala: 'Pala',
};

export default async function ExerciseDetail({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const ex = EXERCISES[key];
  if (!ex) notFound();
  const nav = exerciseNeighbours(key);

  const { plan, progress } = await getToday();
  const offset = progress[key]?.levelOffset ?? 0;
  const video = videoFor(key);
  const current = levelFor(key, plan.phase, offset);

  return (
    <Shell
      title={ex.name}
      subtitle={ex.tagline}
      action={
        nav ? (
          <ExerciseHeaderNav nav={nav} />
        ) : (
          <Link href="/ejercicios" className="shrink-0 text-sm font-semibold text-ink-400">
            ← Volver
          </Link>
        )
      }
    >
      <Card className="mb-4">
        {FIGURE3D[key] ? (
          <Figure3D exercise={key} className="mx-auto aspect-square w-full max-w-[17rem]" />
        ) : (
          <ExerciseAnimation
            anim={animFor(key, plan.phase, offset)}
            className="mx-auto aspect-square w-full max-w-[17rem]"
          />
        )}
      </Card>

      {video ? (
        <Card className="mb-4">
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
            Cómo se hace
          </p>
          <ExerciseVideo video={video} />
        </Card>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {ex.targets.map((t) => <Chip key={t} tone="lime">{t}</Chip>)}
        {ex.equipment.map((e) => <Chip key={e}>{EQUIPMENT_LABEL[e] ?? e}</Chip>)}
        {ex.unilateral ? <Chip tone="info">Una pierna cada vez</Chip> : null}
      </div>

      <Card className="mb-4">
        <p className="mb-1.5 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Por qué lo haces
        </p>
        <p className="text-[1.05rem] leading-relaxed text-ink-100">{ex.why}</p>
      </Card>

      <Card className="mb-4">
        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Colocación
        </p>
        <ul className="mb-5 space-y-2.5">
          {ex.setup.map((t) => (
            <li key={t} className="flex gap-2.5 text-[1.05rem] leading-relaxed text-ink-100">
              <span className="text-ink-400">·</span><span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-lime-glow">
          Ejecución
        </p>
        <ol className="space-y-2.5">
          {ex.execution.map((t, i) => (
            <li key={t} className="flex gap-2.5 text-[1.05rem] leading-relaxed text-ink-100">
              <span className="font-bold text-ink-400">{i + 1}.</span><span>{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mb-4">
        <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-wider text-signal-alert">
          Errores típicos
        </p>
        <ul className="space-y-2.5">
          {ex.mistakes.map((t) => (
            <li key={t} className="flex gap-2.5 text-[1.05rem] leading-relaxed text-ink-100">
              <span className="text-signal-alert">×</span><span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      {ex.painRule ? (
        <Card tone="warn" className="mb-4">
          <p className="text-[0.8rem] font-bold uppercase tracking-wider text-signal-warn">
            Regla de dolor
          </p>
          <p className="mt-1.5 text-[1.02rem] leading-relaxed text-ink-100">{ex.painRule}</p>
        </Card>
      ) : null}

      <Card>
        <p className="text-base font-bold">Progresión</p>
        <p className="mb-3 mt-1 text-[0.92rem] leading-relaxed text-ink-300">
          La fase marca el nivel por defecto. Si te queda corto o largo, ajústalo aquí y
          la app lo recordará.
        </p>
        <ol className="mb-4 space-y-2">
          {ex.levels.map((l) => (
            <li
              key={l.n}
              className={`rounded-lg border px-3 py-2.5 ${
                current?.n === l.n
                  ? 'border-lime-core/50 bg-lime-core/10'
                  : 'border-ink-700 bg-ink-800/60'
              }`}
            >
              <p className="text-[0.98rem] font-semibold">
                <span className="text-ink-400">Nivel {l.n} · </span>
                {l.name}
              </p>
              {l.note ? <p className="mt-1 text-[0.88rem] leading-snug text-ink-300">{l.note}</p> : null}
            </li>
          ))}
        </ol>
        <LevelPicker exerciseKey={key} offset={offset} />
      </Card>

      {nav ? <ExerciseNav nav={nav} /> : null}
    </Shell>
  );
}
