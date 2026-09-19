'use client';

import { useEffect, useState } from 'react';
import { FIGURE3D } from '@/lib/program/figure3d';

/**
 * Plays a pre-rendered 3D exercise: flat WebP frames, no WebGL, no model to
 * download. The phone decodes small images and nothing else, which is what
 * lets this run for 25 minutes with the screen forced on.
 *
 * The orientation word is not decoration. "De pie" or "Tumbado de lado" is the
 * question the old drawings could not answer, so it is stated rather than
 * implied, and it comes from the same field that placed the body in the scene.
 */
export function Figure3D({
  exercise,
  paused = false,
  showLabel = true,
  showOrient = true,
  className,
}: {
  exercise: string;
  paused?: boolean;
  showLabel?: boolean;
  showOrient?: boolean;
  className?: string;
}) {
  const entry = FIGURE3D[exercise];
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [exercise]);

  useEffect(() => {
    if (!entry || paused) return;
    const id = setInterval(
      () => setI((n) => (n + 1) % entry.frames.length),
      Math.max(60, entry.msPerFrame),
    );
    return () => clearInterval(id);
  }, [entry, paused]);

  if (!entry) return <div className={className} />;

  const label = entry.labels[Math.floor(i / entry.steps) % entry.labels.length];

  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      <div className="relative min-h-0 w-full flex-1">
        {/* Every frame stays mounted and stacked, so the loop never waits on a
            decode and never flashes the background between frames. */}
        {entry.frames.map((f, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={f}
            src={`/fig3d/${exercise}/${f}`}
            alt={n === 0 ? `Ilustración de ${exercise}` : ''}
            aria-hidden={n !== 0}
            className="absolute inset-0 h-full w-full rounded-xl object-contain"
            style={{ opacity: n === i ? 1 : 0 }}
            loading={n === 0 ? 'eager' : 'lazy'}
          />
        ))}
        {showOrient ? (
          <span className="absolute left-2 top-2 rounded-full bg-ink-950/75 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-ink-100 backdrop-blur-sm">
            {entry.orient.replace(/-/g, ' ')}
          </span>
        ) : null}
      </div>
      {showLabel ? (
        <p className="min-h-[2.5em] shrink-0 px-3 pt-1 text-center text-[0.95rem] font-semibold leading-tight text-lime-glow">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export const has3D = (exercise: string) => Boolean(FIGURE3D[exercise]);
