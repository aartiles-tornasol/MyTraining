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

/** Below this a caption is gone before it can be read. */
const READABLE_MS = 700;

/**
 * Fast exercises — pogos, split-steps, the warm-up jog — cycle their captions
 * faster than anyone can read them. Rather than slow the figure down, which
 * would misrepresent a movement whose whole point is being quick, hold every
 * caption on screen at once.
 */
function steadyLabel(anim: ExerciseAnim): string | null {
  const labelled = anim.frames.filter((f) => f.label);
  if (labelled.length < 2) return null;
  const shortest = Math.min(...labelled.map((f) => (f.ms ?? 0) + (f.hold ?? 0)));
  if (shortest >= READABLE_MS) return null;
  return [...new Set(labelled.map((f) => f.label as string))].join(' · ');
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
  const label = steadyLabel(resolved) ?? state.label;
  const hasLabels = resolved.frames.some((f) => f.label);
  const box = viewBoxString(viewBoxFor(resolved));

  // The caption is a row of its own. Left as a sibling of a full-height figure
  // it spilled out of the box and sat on top of whatever came next — the rep
  // count in a session, the timer ring on a held exercise.
  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      <Figure
        pose={pose}
        base={base}
        props={state.props}
        highlight={resolved.highlight}
        uid={uid}
        viewBox={box}
        className="min-h-0 w-full flex-1"
      />
      {showLabel && hasLabels ? (
        // Two lines are always reserved. Captions vary in length and letting
        // the row grow resized the figure every time the caption changed.
        <p className="min-h-[2.5em] shrink-0 px-3 pt-1 text-center text-[0.95rem] font-semibold leading-tight text-lime-glow">
          {label}
        </p>
      ) : null}
    </div>
  );
}
