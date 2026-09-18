'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Figure } from './Figure';
import { animDuration, baseFor, sampleAnim, viewBoxFor, viewBoxString } from './anim';
import type { ExerciseAnim } from './anim';
import { lerpPose } from './skeleton';
import { ANIMATIONS } from './animations';

export interface ExerciseAnimationProps {
  anim: string | ExerciseAnim;
  /** Pause the loop (e.g. while the session timer is stopped). */
  paused?: boolean;
  /** Playback rate; the tempo sessions slow this down for teaching. */
  rate?: number;
  showLabel?: boolean;
  className?: string;
}

const FALLBACK: ExerciseAnim = {
  view: 'side',
  frames: [{ p: {}, ms: 1000, hold: 1000 }],
};

export function resolveAnim(anim: string | ExerciseAnim): ExerciseAnim {
  if (typeof anim !== 'string') return anim;
  return ANIMATIONS[anim] ?? FALLBACK;
}

export function ExerciseAnimation({
  anim,
  paused = false,
  rate = 1,
  showLabel = true,
  className,
}: ExerciseAnimationProps) {
  const resolved = resolveAnim(anim);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [elapsed, setElapsed] = useState(0);
  const clock = useRef(0);

  useEffect(() => {
    clock.current = 0;
    setElapsed(0);
  }, [resolved]);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const total = animDuration(resolved);
    const tick = (now: number) => {
      const dt = Math.min(now - last, 120) * rate;
      last = now;
      clock.current = total > 0 ? (clock.current + dt) % total : 0;
      setElapsed(clock.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [resolved, paused, rate]);

  const base = baseFor(resolved);
  const state = sampleAnim(resolved, elapsed);
  const pose = lerpPose(state.from, state.to, state.t, base);

  return (
    <div className={className}>
      <Figure
        pose={pose}
        base={base}
        props={state.props}
        highlight={resolved.highlight}
        uid={uid}
        viewBox={viewBoxString(viewBoxFor(resolved))}
        className="w-full h-full"
      />
      {showLabel && state.label ? (
        <p className="text-center text-[0.95rem] leading-tight font-semibold text-lime-glow/90 px-3">
          {state.label}
        </p>
      ) : null}
    </div>
  );
}
