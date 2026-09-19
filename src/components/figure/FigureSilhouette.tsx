import { GROUND_Y, solve } from './skeleton';
import type { JointName, Skeleton, Vec } from './skeleton';
import { FAR, FAR_FRONT, LIME, MUSCLES, NEAR, PropShape } from './Figure';
import type { FigureProps } from './Figure';

/**
 * A second renderer, for judging against the first. Same skeleton, same
 * keyframes, same props: only the painting changes, because nothing upstream
 * of here knows how the body is drawn.
 *
 * Two things are different from Figure:
 *  - limbs are tapered shapes rather than round-capped lines, so the body has
 *    the mass of a person instead of the even thickness of a pipe cleaner;
 *  - an optional yaw turns the figure towards the viewer. The model is a
 *    sagittal-plane rig, so every joint gets a depth — near side towards the
 *    viewer, far side away, spine at zero — and the whole thing is rotated
 *    about the pelvis' vertical axis. A pure profile hides which leg is which,
 *    which is exactly what makes a Copenhagen or a bird dog unreadable.
 */
export interface SilhouetteProps extends FigureProps {
  /** Degrees of turn towards the viewer. 0 is the profile we have today. */
  yaw?: number;
}

const rad = (d: number) => (d * Math.PI) / 180;

/** Half the width of the hips and shoulders, in figure units. */
const DEPTH = 8;

const NEAR_JOINTS: JointName[] = [
  'hipN', 'kneeN', 'ankleN', 'heelN', 'toeN', 'shoN', 'elbowN', 'handN',
];
const FAR_JOINTS: JointName[] = [
  'hipF', 'kneeF', 'ankleF', 'heelF', 'toeF', 'shoF', 'elbowF', 'handF',
];

/*
 * Depth is added as lateral separation only, without the foreshortening a true
 * rotation would bring. Foreshortening shrinks the body along the sagittal
 * axis but leaves the step or the chair where it was, so the feet come off
 * their contact points, and it squashes the head. Separating the two sides is
 * what carries the information anyway: which leg is which.
 */
function turn(s: Skeleton, yaw: number): Skeleton {
  if (!yaw) return s;
  const sn = Math.sin(rad(yaw));
  const at = (p: Vec, z: number): Vec => ({ x: p.x + z * sn, y: p.y });

  const out = { ...s };
  for (const k of NEAR_JOINTS) out[k] = at(s[k], DEPTH);
  for (const k of FAR_JOINTS) out[k] = at(s[k], -DEPTH);
  for (const k of ['pelvis', 'neck', 'headCentre'] as JointName[]) out[k] = at(s[k], 0);
  return out;
}

/** A limb as a tapered shape: a quad between two circles, all one fill. */
/* fill is left out where a parent <g> already sets it. */
function seg(a: Vec, b: Vec, wa: number, wb: number, fill?: string, key?: string) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const ra = wa / 2;
  const rb = wb / 2;
  return (
    <g key={key} fill={fill}>
      <path
        d={`M ${a.x + nx * ra} ${a.y + ny * ra} L ${b.x + nx * rb} ${b.y + ny * rb} ` +
           `L ${b.x - nx * rb} ${b.y - ny * rb} L ${a.x - nx * ra} ${a.y - ny * ra} Z`}
      />
      <circle cx={a.x} cy={a.y} r={ra} />
      <circle cx={b.x} cy={b.y} r={rb} />
    </g>
  );
}

function Arm({ sho, elbow, hand, fill, w }: {
  sho: Vec; elbow: Vec; hand: Vec; fill: string; w: number;
}) {
  return (
    <g fill={fill}>
      {seg(sho, elbow, w, w * 0.76)}
      {seg(elbow, hand, w * 0.72, w * 0.54)}
      <circle cx={hand.x} cy={hand.y} r={w * 0.44} fill={fill} />
    </g>
  );
}

function Leg({ hip, knee, ankle, heel, toe, fill, w }: {
  hip: Vec; knee: Vec; ankle: Vec; heel: Vec; toe: Vec; fill: string; w: number;
}) {
  return (
    <g fill={fill}>
      {seg(hip, knee, w, w * 0.7)}
      {seg(knee, ankle, w * 0.68, w * 0.44)}
      {seg(ankle, heel, w * 0.42, w * 0.38)}
      {seg(heel, toe, w * 0.4, w * 0.26)}
    </g>
  );
}

export function FigureSilhouette({
  pose, base, props = [], highlight = [], uid, viewBox, className, yaw = 0,
}: SilhouetteProps) {
  const solved = solve(pose, base);
  const s = turn(solved, solved.front ? 0 : yaw);
  const far = s.front ? FAR_FRONT : FAR;
  const trunkW = s.front ? 17 : 14;

  return (
    <svg
      viewBox={viewBox ?? '0 0 100 110'}
      className={className}
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0%" stopColor={LIME} stopOpacity="0.55" />
          <stop offset="55%" stopColor={LIME} stopOpacity="0.22" />
          <stop offset="100%" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-floor`} x1="0" x2="1">
          <stop offset="0%" stopColor="#31404f" stopOpacity="0" />
          <stop offset="18%" stopColor="#4c5f72" stopOpacity="1" />
          <stop offset="82%" stopColor="#4c5f72" stopOpacity="1" />
          <stop offset="100%" stopColor="#31404f" stopOpacity="0" />
        </linearGradient>
        <marker
          id={`${uid}-head`}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="4.5"
          markerHeight="4.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill={LIME} />
        </marker>
      </defs>

      <ellipse cx={s.pelvis.x} cy={GROUND_Y + 1.5} rx="26" ry="3.6" fill={`url(#${uid}-shadow)`} />
      <line x1="-30" y1={GROUND_Y} x2="130" y2={GROUND_Y} stroke={`url(#${uid}-floor)`} strokeWidth="1.1" />

      {props.filter((p) => p.k === 'step' || p.k === 'wall' || p.k === 'chair' || p.k === 'mat')
        .map((p, i) => <PropShape key={`bg${i}`} prop={p} s={solved} uid={uid} />)}

      {highlight.map((m) => {
        const spec = MUSCLES[m];
        const at = spec.at(s);
        return (
          <g key={m}>
            <circle cx={at.x} cy={at.y} r={spec.r * 1.9} fill={`url(#${uid}-glow)`} />
            <circle
              cx={at.x} cy={at.y} r={spec.r}
              fill="none" stroke={LIME} strokeWidth="1"
              strokeOpacity="0.8" strokeDasharray="2.6 2.4"
            />
          </g>
        );
      })}

      {/* Far side first, so the near side reads as in front of it. */}
      <g opacity="0.95">
        <Leg hip={s.hipF} knee={s.kneeF} ankle={s.ankleF} heel={s.heelF} toe={s.toeF} fill={far} w={9} />
        <Arm sho={s.shoF} elbow={s.elbowF} hand={s.handF} fill={far} w={6.6} />
      </g>

      {/* Trunk: narrower at the hips, broader at the chest. */}
      <g fill={NEAR}>
        {seg(s.pelvis, s.neck, trunkW * 0.85, trunkW)}
        {seg(s.shoF, s.shoN, 8.4, 8.4)}
        {seg(s.neck, s.headCentre, 5.6, 5.6)}
        <circle cx={s.headCentre.x} cy={s.headCentre.y} r={s.headR} />
      </g>

      {s.front ? (
        <g fill="#16202b">
          <circle cx={s.headCentre.x - 2.5} cy={s.headCentre.y - 0.8} r="1.25" />
          <circle cx={s.headCentre.x + 2.5} cy={s.headCentre.y - 0.8} r="1.25" />
        </g>
      ) : (
        <circle
          cx={s.headCentre.x + Math.sin(rad(s.faceDir + 78)) * (s.headR - 1.6)}
          cy={s.headCentre.y - Math.cos(rad(s.faceDir + 78)) * (s.headR - 1.6)}
          r="1.5"
          fill="#16202b"
        />
      )}

      <g>
        <Leg hip={s.hipN} knee={s.kneeN} ankle={s.ankleN} heel={s.heelN} toe={s.toeN} fill={NEAR} w={10} />
        <Arm sho={s.shoN} elbow={s.elbowN} hand={s.handN} fill={NEAR} w={7} />
      </g>

      {props.filter((p) => p.k !== 'step' && p.k !== 'wall' && p.k !== 'chair' && p.k !== 'mat')
        .map((p, i) => <PropShape key={`fg${i}`} prop={p} s={s} uid={uid} />)}
    </svg>
  );
}
