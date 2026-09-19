import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Figure } from '@/components/figure/Figure';
import { ANIMATIONS } from '@/components/figure/animations';
import { baseFor, viewBoxFor, viewBoxString } from '@/components/figure/anim';

export const dynamic = 'force-dynamic';

/**
 * Every keyframe of one animation, still and side by side. Poses are authored
 * as numbers and can only really be judged rendered, so this is the bench for
 * that: a frozen contact sheet, no loop to chase.
 */
export default async function Poses({ params }: { params: Promise<{ anim: string }> }) {
  const { anim } = await params;
  const a = ANIMATIONS[anim];
  if (!a) notFound();

  const base = baseFor(a);
  const viewBox = viewBoxString(viewBoxFor(a));

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold">{anim}</h1>
        <Link href="/revision" className="text-sm font-semibold text-ink-400">
          Revisión
        </Link>
      </div>

      <ol className="space-y-3">
        {a.frames.map((f, i) => (
          <li key={i} className="rounded-xl2 border border-ink-700/70 bg-ink-850 p-3">
            <div className="flex items-center gap-3">
              <div className="aspect-square w-32 shrink-0">
                <Figure
                  pose={{ ...base, ...f.p }}
                  base={base}
                  props={f.props ?? a.props}
                  highlight={a.highlight}
                  uid={`pose${i}`}
                  viewBox={viewBox}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-ink-400">
                  Fotograma {i + 1} · {f.ms ?? 0} ms
                  {f.hold ? ` + ${f.hold} ms quieto` : ''}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-lime-glow">{f.label ?? '—'}</p>
                <p className="mt-1 break-words font-mono text-[0.65rem] leading-snug text-ink-400">
                  {Object.entries(f.p)
                    .map(([k, v]) => `${k}:${typeof v === 'number' ? Math.round(v * 10) / 10 : v}`)
                    .join('  ')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
