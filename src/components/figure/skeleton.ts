/**
 * Forward-kinematics model for the exercise figure.
 *
 * Everything lives in a 100x110 "figure unit" box. The ground is a horizontal
 * line at GROUND_Y and the figure is dropped onto it automatically, so pose
 * authors never have to compute how high the pelvis should sit: raise the
 * heels and the whole body rises by exactly the right amount.
 *
 * Angle conventions (degrees, the figure faces +x in side view):
 *   torso   absolute, 0 = upright, + = lean forward
 *   head    relative to the torso, + = chin toward chest
 *   hip     absolute, 0 = thigh straight down, + = thigh swings forward
 *   knee    FLEXION, 0 = straight, + = heel toward glutes
 *   foot    DORSIFLEXION relative to the shank, 0 = sole flat,
 *           - = heels up (plantarflexion), + = toes up
 *   sho     absolute, 0 = arm hanging down, + = arm swings forward
 *   elbow   FLEXION, 0 = straight, + = hand toward shoulder
 */

export const GROUND_Y = 100;

export const SEG = {
  torso: 26,
  neck: 8.5,
  headR: 7.2,
  upperArm: 15,
  foreArm: 14,
  thigh: 22,
  shank: 21,
  footFwd: 12,
  footBack: 5,
  soleDrop: 4,
} as const;

export type JointName =
  | 'pelvis' | 'hipN' | 'kneeN' | 'ankleN' | 'heelN' | 'toeN'
  | 'hipF' | 'kneeF' | 'ankleF' | 'heelF' | 'toeF'
  | 'neck' | 'shoN' | 'elbowN' | 'handN' | 'shoF' | 'elbowF' | 'handF'
  | 'headCentre';

export interface Pose {
  /** Pelvis centre before the figure is dropped onto the ground. */
  x: number;
  y: number;
  torso: number;
  head: number;
  hipN: number;
  kneeN: number;
  footN: number;
  hipF: number;
  kneeF: number;
  footF: number;
  shoN: number;
  elbN: number;
  shoF: number;
  elbF: number;
  /** Half the gap between the two hips along x (small in side view). */
  hipSpread: number;
  shoSpread: number;
  /** Drop the lowest point of the body onto the ground line. */
  ground: boolean;
  /** Extra vertical offset applied after grounding (negative = airborne). */
  lift: number;
  /** Mirror the whole figure so it faces -x. */
  mirror: boolean;
  /** Height the contact points rest on (a step top, a bench, the floor). */
  floorY: number;
  /** Which points may touch down. Defaults to every plausible contact. */
  groundOn: JointName[] | null;
  /** Pin a joint horizontally so rotations pivot around it (e.g. the toes). */
  anchorX: JointName | null;
  anchorXTo: number;
  /** Viewer sees the body face-on: draw a face, even limb shading, wide torso. */
  front: boolean;
}

export type PosePatch = Partial<Pose>;

export const STANDING: Pose = {
  x: 50,
  y: 52,
  torso: 2,
  head: 0,
  hipN: 0,
  kneeN: 2,
  footN: 0,
  hipF: 0,
  kneeF: 2,
  footF: 0,
  shoN: 6,
  elbN: 10,
  shoF: -5,
  elbF: 8,
  hipSpread: 1.8,
  shoSpread: 1.8,
  ground: true,
  lift: 0,
  mirror: false,
  floorY: GROUND_Y,
  groundOn: null,
  anchorX: null,
  anchorXTo: 50,
  front: false,
};

/** Front-facing default: hips and shoulders spread apart across the screen. */
export const STANDING_FRONT: Pose = {
  ...STANDING,
  front: true,
  torso: 0,
  hipSpread: 7,
  shoSpread: 11.5,
  shoN: -8,
  shoF: 8,
  elbN: 6,
  elbF: -6,
};

export type Vec = { x: number; y: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Unit vector for an absolute angle: 0 points down (+y), 90 points to +x. */
const down = (deg: number): Vec => ({ x: Math.sin(rad(deg)), y: Math.cos(rad(deg)) });
/** Unit vector for the torso: 0 points up (-y), 90 points to +x. */
const up = (deg: number): Vec => ({ x: Math.sin(rad(deg)), y: -Math.cos(rad(deg)) });

const add = (a: Vec, b: Vec, k = 1): Vec => ({ x: a.x + b.x * k, y: a.y + b.y * k });

export interface Skeleton {
  /** True when the pose is authored as a face-on view. */
  front: boolean;
  pelvis: Vec;
  hipN: Vec;
  kneeN: Vec;
  ankleN: Vec;
  heelN: Vec;
  toeN: Vec;
  hipF: Vec;
  kneeF: Vec;
  ankleF: Vec;
  heelF: Vec;
  toeF: Vec;
  neck: Vec;
  shoN: Vec;
  elbowN: Vec;
  handN: Vec;
  shoF: Vec;
  elbowF: Vec;
  handF: Vec;
  headCentre: Vec;
  /** Absolute torso angle after mirroring, used to orient the face. */
  faceDir: number;
  headR: number;
}

interface LegOut {
  hip: Vec;
  knee: Vec;
  ankle: Vec;
  heel: Vec;
  toe: Vec;
}

function solveLeg(hipPoint: Vec, hip: number, kneeFlex: number, dorsi: number): LegOut {
  const shankAbs = hip - kneeFlex;
  const footAbs = shankAbs + 90 + dorsi;
  const knee = add(hipPoint, down(hip), SEG.thigh);
  const ankle = add(knee, down(shankAbs), SEG.shank);
  const fd = down(footAbs);
  // Perpendicular pointing from the ankle down through the sole.
  const sole: Vec = { x: -fd.y, y: fd.x };
  const heel = add(add(ankle, fd, -SEG.footBack), sole, SEG.soleDrop);
  const toe = add(add(ankle, fd, SEG.footFwd), sole, SEG.soleDrop);
  return { hip: hipPoint, knee, ankle, heel, toe };
}

function solveArm(shoPoint: Vec, sho: number, elbowFlex: number) {
  const elbow = add(shoPoint, down(sho), SEG.upperArm);
  const hand = add(elbow, down(sho + elbowFlex), SEG.foreArm);
  return { elbow, hand };
}

/** Every point the body can rest on when the figure is dropped to the floor. */
const CONTACTS: JointName[] = [
  'heelN', 'toeN', 'heelF', 'toeF',
  'kneeN', 'kneeF', 'handN', 'handF',
  'pelvis', 'neck', 'headCentre', 'elbowN', 'elbowF',
];

export function solve(patch: PosePatch, base: Pose = STANDING): Skeleton {
  const p: Pose = { ...base, ...patch };

  const pelvis: Vec = { x: p.x, y: p.y };
  const torsoVec = up(p.torso);
  const neck = add(pelvis, torsoVec, SEG.torso);
  // Shoulders sit just below the neck joint on the torso line.
  const shoulderBase = add(pelvis, torsoVec, SEG.torso * 0.9);
  // Spread runs perpendicular to the torso so leaning keeps the body coherent.
  const perp: Vec = { x: -torsoVec.y, y: torsoVec.x };

  const legN = solveLeg(
    add(pelvis, perp, p.hipSpread),
    p.hipN, p.kneeN, p.footN,
  );
  const legF = solveLeg(
    add(pelvis, perp, -p.hipSpread),
    p.hipF, p.kneeF, p.footF,
  );

  const shoNPt = add(shoulderBase, perp, p.shoSpread);
  const shoFPt = add(shoulderBase, perp, -p.shoSpread);
  const armN = solveArm(shoNPt, p.shoN, p.elbN);
  const armF = solveArm(shoFPt, p.shoF, p.elbF);

  const headCentre = add(neck, up(p.torso + p.head), SEG.neck);

  let s: Skeleton = {
    front: p.front,
    pelvis,
    hipN: legN.hip, kneeN: legN.knee, ankleN: legN.ankle, heelN: legN.heel, toeN: legN.toe,
    hipF: legF.hip, kneeF: legF.knee, ankleF: legF.ankle, heelF: legF.heel, toeF: legF.toe,
    neck,
    shoN: shoNPt, elbowN: armN.elbow, handN: armN.hand,
    shoF: shoFPt, elbowF: armF.elbow, handF: armF.hand,
    headCentre,
    faceDir: p.torso + p.head,
    headR: SEG.headR,
  };

  if (p.ground) {
    const points = p.groundOn ?? CONTACTS;
    let lowest = -Infinity;
    for (const key of points) lowest = Math.max(lowest, s[key].y);
    const dy = p.floorY - lowest;
    if (Number.isFinite(dy)) s = translate(s, 0, dy);
  }
  if (p.anchorX) s = translate(s, p.anchorXTo - s[p.anchorX].x, 0);
  if (p.lift) s = translate(s, 0, p.lift);
  if (p.mirror) s = mirrorX(s);

  return s;
}

function mapPoints(s: Skeleton, fn: (v: Vec) => Vec): Skeleton {
  const out = { ...s };
  for (const key of Object.keys(s) as (keyof Skeleton)[]) {
    if (key === 'faceDir' || key === 'headR' || key === 'front') continue;
    out[key] = fn(s[key] as Vec) as never;
  }
  return out;
}

const translate = (s: Skeleton, dx: number, dy: number) =>
  mapPoints(s, (v) => ({ x: v.x + dx, y: v.y + dy }));

const mirrorX = (s: Skeleton): Skeleton => ({
  ...mapPoints(s, (v) => ({ x: 100 - v.x, y: v.y })),
  faceDir: -s.faceDir,
});

/** Linear interpolation between two partial poses, resolved against a base. */
export function lerpPose(a: PosePatch, b: PosePatch, t: number, base: Pose): Pose {
  const pa: Pose = { ...base, ...a };
  const pb: Pose = { ...base, ...b };
  const out = { ...pa };
  for (const key of Object.keys(pa) as (keyof Pose)[]) {
    const va = pa[key];
    const vb = pb[key];
    if (typeof va === 'number' && typeof vb === 'number') {
      (out[key] as number) = va + (vb - va) * t;
    } else {
      // Flags and contact sets switch at the midpoint rather than blending.
      (out[key] as unknown) = t < 0.5 ? va : vb;
    }
  }
  return out;
}

export const mid = (a: Vec, b: Vec, k = 0.5): Vec => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
});

/** Offset a point perpendicular to the a->b segment (for muscle markers). */
export function offsetPerp(a: Vec, b: Vec, along: number, out: number): Vec {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x: a.x + ux * len * along - uy * out,
    y: a.y + uy * len * along + ux * out,
  };
}

/**
 * Dorsiflexion value that leaves the sole flat on the floor for a given
 * thigh/knee combination. Saves authoring poses from trigonometry.
 */
export const flat = (hip: number, knee: number) => -(hip - knee);
