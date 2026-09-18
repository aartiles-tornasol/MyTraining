import { STANDING, STANDING_FRONT } from './skeleton';
import type { Pose, PosePatch } from './skeleton';
import type { MuscleKey, Prop } from './Figure';

export interface Keyframe {
  /** Target pose for this frame. */
  p: PosePatch;
  /** Milliseconds spent travelling into this frame. */
  ms: number;
  /** Milliseconds held once the frame is reached. */
  hold?: number;
  /** Caption shown while this frame is the active target. */
  label?: string;
  /** Extra props shown only while this frame is active (arrows, etc.). */
  props?: Prop[];
}

export interface ExerciseAnim {
  view: 'side' | 'front';
  frames: Keyframe[];
  /** Props present for the whole loop. */
  props?: Prop[];
  highlight?: MuscleKey[];
  /** Pose overrides applied to the base for every frame. */
  base?: PosePatch;
}

export const baseFor = (a: ExerciseAnim): Pose => ({
  ...(a.view === 'front' ? STANDING_FRONT : STANDING),
  ...(a.base ?? {}),
});

/** Total loop duration in ms. */
export const animDuration = (a: ExerciseAnim) =>
  a.frames.reduce((t, f) => t + f.ms + (f.hold ?? 0), 0);

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export interface AnimState {
  from: PosePatch;
  to: PosePatch;
  t: number;
  label?: string;
  props: Prop[];
}

/** Resolve the loop at a given time offset. */
export function sampleAnim(a: ExerciseAnim, elapsedMs: number): AnimState {
  const total = animDuration(a);
  const n = a.frames.length;
  const constant = a.props ?? [];
  if (total <= 0 || n === 0) {
    const only = a.frames[0]?.p ?? {};
    return { from: only, to: only, t: 1, props: constant };
  }

  let time = ((elapsedMs % total) + total) % total;
  for (let i = 0; i < n; i++) {
    const frame = a.frames[i];
    const prev = a.frames[(i - 1 + n) % n];
    if (time < frame.ms) {
      return {
        from: prev.p,
        to: frame.p,
        t: frame.ms === 0 ? 1 : easeInOut(time / frame.ms),
        label: frame.label,
        props: [...constant, ...(frame.props ?? [])],
      };
    }
    time -= frame.ms;
    const hold = frame.hold ?? 0;
    if (time < hold) {
      return {
        from: frame.p,
        to: frame.p,
        t: 1,
        label: frame.label,
        props: [...constant, ...(frame.props ?? [])],
      };
    }
    time -= hold;
  }
  const last = a.frames[n - 1];
  return { from: last.p, to: last.p, t: 1, label: last.label, props: constant };
}

/* ── Framing ─────────────────────────────────────────────────────────────
   A lying figure occupies the bottom fifth of the default box, which wastes
   most of the card. Each animation gets a viewBox fitted to the union of all
   its keyframes, so the crop is tight but never moves while the loop plays. */

import { GROUND_Y, SEG, solve } from './skeleton';
import type { Skeleton, Vec } from './skeleton';

export interface Box { x: number; y: number; w: number; h: number }

const POINTS: (keyof Skeleton)[] = [
  'pelvis', 'hipN', 'kneeN', 'ankleN', 'heelN', 'toeN',
  'hipF', 'kneeF', 'ankleF', 'heelF', 'toeF',
  'neck', 'shoN', 'elbowN', 'handN', 'shoF', 'elbowF', 'handF', 'headCentre',
];

const cache = new Map<ExerciseAnim, Box>();

export function viewBoxFor(a: ExerciseAnim): Box {
  const hit = cache.get(a);
  if (hit) return hit;

  const base = baseFor(a);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const see = (x: number, y: number) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  };

  for (const frame of a.frames) {
    const s = solve(frame.p, base);
    for (const key of POINTS) {
      const v = s[key] as Vec;
      see(v.x, v.y);
    }
    // The head is a disc, and limbs are thick strokes.
    see(s.headCentre.x - SEG.headR, s.headCentre.y - SEG.headR);
    see(s.headCentre.x + SEG.headR, s.headCentre.y + SEG.headR);
  }

  // Scenery the crop must not cut off.
  for (const prop of a.props ?? []) {
    if (prop.k === 'step') {
      see(prop.x, GROUND_Y - prop.h);
      see(prop.x + prop.w, GROUND_Y);
    } else if (prop.k === 'chair') {
      const w = prop.w ?? 22;
      const h = prop.h ?? 26;
      see(prop.x, GROUND_Y - h - 22);
      see(prop.x + w, GROUND_Y);
    } else if (prop.k === 'wall') {
      // Only its x, or every wall exercise would keep the full-height frame.
      see(prop.x, GROUND_Y);
      see(prop.x + 5, GROUND_Y);
    } else if (prop.k === 'band' && Array.isArray(prop.from)) {
      see(prop.from[0], prop.from[1]);
    }
  }

  see(minX, GROUND_Y);  // the floor line always belongs in frame
  const pad = 7;
  const box: Box = {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
  cache.set(a, box);
  return box;
}

export const viewBoxString = (b: Box) =>
  `${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`;
