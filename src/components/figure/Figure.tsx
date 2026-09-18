import { GROUND_Y, mid, offsetPerp, solve } from './skeleton';
import type { JointName, Pose, PosePatch, Skeleton, Vec } from './skeleton';

/* ── Muscle markers ─────────────────────────────────────────────────────── */

export type MuscleKey =
  | 'calf' | 'calfF' | 'soleus' | 'achilles' | 'achillesF'
  | 'adductor' | 'adductorF' | 'hamstring' | 'quad' | 'glute'
  | 'gluteMed' | 'piriformis' | 'core' | 'obliques' | 'shoulder'
  | 'scapula' | 'tibialis' | 'hipFlexor';

const MUSCLES: Record<MuscleKey, { at: (s: Skeleton) => Vec; r: number; label: string }> = {
  calf:      { at: (s) => offsetPerp(s.kneeN, s.ankleN, 0.38, -3.4), r: 8,   label: 'Gemelo' },
  calfF:     { at: (s) => offsetPerp(s.kneeF, s.ankleF, 0.38, -3.4), r: 8,   label: 'Gemelo' },
  soleus:    { at: (s) => offsetPerp(s.kneeN, s.ankleN, 0.62, -3.0), r: 7,   label: 'Sóleo' },
  achilles:  { at: (s) => offsetPerp(s.kneeN, s.ankleN, 0.94, -2.4), r: 5.5, label: 'Aquiles' },
  achillesF: { at: (s) => offsetPerp(s.kneeF, s.ankleF, 0.94, -2.4), r: 5.5, label: 'Aquiles' },
  adductor:  { at: (s) => offsetPerp(s.hipN, s.kneeN, 0.42, 3.2),    r: 8.5, label: 'Aductores' },
  adductorF: { at: (s) => offsetPerp(s.hipF, s.kneeF, 0.42, -3.2),   r: 8.5, label: 'Aductores' },
  hamstring: { at: (s) => offsetPerp(s.hipN, s.kneeN, 0.5, -4),      r: 9,   label: 'Isquios' },
  quad:      { at: (s) => offsetPerp(s.hipN, s.kneeN, 0.5, 4),       r: 9,   label: 'Cuádriceps' },
  glute:     { at: (s) => offsetPerp(s.pelvis, s.kneeN, 0.16, -5),   r: 9,   label: 'Glúteo' },
  gluteMed:  { at: (s) => offsetPerp(s.pelvis, s.kneeN, 0.1, 5.5),   r: 8,   label: 'Glúteo medio' },
  piriformis:{ at: (s) => offsetPerp(s.pelvis, s.kneeN, 0.22, -4),   r: 6.5, label: 'Piramidal' },
  core:      { at: (s) => mid(s.pelvis, s.neck, 0.45),               r: 10,  label: 'Core' },
  obliques:  { at: (s) => offsetPerp(s.pelvis, s.neck, 0.45, 4.5),   r: 8,   label: 'Oblicuos' },
  shoulder:  { at: (s) => s.shoN,                                    r: 7.5, label: 'Hombro' },
  scapula:   { at: (s) => offsetPerp(s.shoN, s.pelvis, 0.15, -4.5),  r: 8,   label: 'Escápulas' },
  tibialis:  { at: (s) => offsetPerp(s.kneeN, s.ankleN, 0.45, 3),    r: 6.5, label: 'Tibial ant.' },
  hipFlexor: { at: (s) => offsetPerp(s.pelvis, s.kneeN, 0.12, 4.5),  r: 7,   label: 'Psoas' },
};

/* ── Props (equipment and scenery) ──────────────────────────────────────── */

export type Anchor = JointName | [number, number];

export type Prop =
  | { k: 'step'; x: number; w: number; h: number }
  | { k: 'wall'; x: number; face: 1 | -1 }
  | { k: 'chair'; x: number; w?: number; h?: number; face?: 1 | -1 }
  | { k: 'mat' }
  | { k: 'dumbbell'; at: Anchor; size?: number }
  | { k: 'backpack' }
  | { k: 'ball'; at: Anchor; r?: number }
  | { k: 'band'; from: Anchor; to: Anchor; sag?: number }
  | { k: 'paddle'; at: Anchor; tilt?: number }
  | { k: 'arrow'; at: Anchor; dx: number; dy: number; bend?: number }
  | { k: 'towel'; at: Anchor };

function resolve(a: Anchor, s: Skeleton): Vec {
  return Array.isArray(a) ? { x: a[0], y: a[1] } : (s[a] as Vec);
}

/* ── Renderer ───────────────────────────────────────────────────────────── */

const NEAR = '#d3dfec';
const FAR = '#46596d';
/** Face-on poses need both sides legible, not a silhouette behind a silhouette. */
const FAR_FRONT = '#93a7bc';
const LIME = '#d6f645';

export interface FigureProps {
  pose: PosePatch;
  base: Pose;
  props?: Prop[];
  highlight?: MuscleKey[];
  /** Unique id so gradients from several figures on one page never collide. */
  uid: string;
  /** Crop, as an SVG viewBox string. Defaults to the full figure box. */
  viewBox?: string;
  className?: string;
}

export function Figure({
  pose, base, props = [], highlight = [], uid, viewBox, className,
}: FigureProps) {
  const s = solve(pose, base);
  const far = s.front ? FAR_FRONT : FAR;
  const torsoW = s.front ? 16 : 13.5;

  const limb = (a: Vec, b: Vec, w: number, color: string) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );

  const foot = (ankle: Vec, heel: Vec, toe: Vec, w: number, color: string) => (
    <>
      {limb(ankle, heel, w * 0.8, color)}
      <path
        d={`M ${heel.x} ${heel.y} L ${toe.x} ${toe.y}`}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </>
  );

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

      {/* Floor */}
      <ellipse cx={s.pelvis.x} cy={GROUND_Y + 1.5} rx="26" ry="3.6" fill={`url(#${uid}-shadow)`} />
      <line x1="-30" y1={GROUND_Y} x2="130" y2={GROUND_Y} stroke={`url(#${uid}-floor)`} strokeWidth="1.1" />

      {/* Scenery that sits behind the body */}
      {props.filter((p) => p.k === 'step' || p.k === 'wall' || p.k === 'chair' || p.k === 'mat')
        .map((p, i) => <PropShape key={`bg${i}`} prop={p} s={s} uid={uid} />)}

      {/* Muscle glow sits under the limbs so the body stays crisp */}
      {highlight.map((m) => {
        const spec = MUSCLES[m];
        const at = spec.at(s);
        return (
          <g key={m}>
            <circle cx={at.x} cy={at.y} r={spec.r * 1.9} fill={`url(#${uid}-glow)`} />
            <circle
              cx={at.x}
              cy={at.y}
              r={spec.r}
              fill="none"
              stroke={LIME}
              strokeWidth="1"
              strokeOpacity="0.8"
              strokeDasharray="2.6 2.4"
            />
          </g>
        );
      })}

      {/* Far side */}
      <g opacity="0.95">
        {limb(s.hipF, s.kneeF, 8, far)}
        {limb(s.kneeF, s.ankleF, 6.6, far)}
        {foot(s.ankleF, s.heelF, s.toeF, 5, far)}
        {limb(s.shoF, s.elbowF, 6.4, far)}
        {limb(s.elbowF, s.handF, 5.4, far)}
      </g>

      {/* Torso and head */}
      <path
        d={`M ${s.pelvis.x} ${s.pelvis.y} L ${s.neck.x} ${s.neck.y}`}
        stroke={NEAR}
        strokeWidth={torsoW}
        strokeLinecap="round"
      />
      <path
        d={`M ${s.shoF.x} ${s.shoF.y} L ${s.shoN.x} ${s.shoN.y}`}
        stroke={NEAR}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx={s.headCentre.x} cy={s.headCentre.y} r={s.headR} fill={NEAR} />
      {s.front ? (
        /* Face-on: two eyes, so the viewer knows they are looking at the front. */
        <g fill="#16202b">
          <circle cx={s.headCentre.x - 2.5} cy={s.headCentre.y - 0.8} r="1.25" />
          <circle cx={s.headCentre.x + 2.5} cy={s.headCentre.y - 0.8} r="1.25" />
        </g>
      ) : (
        /* Profile: a nose, so the direction the body faces is unambiguous. */
        <circle
          cx={s.headCentre.x + Math.sin(((s.faceDir + 78) * Math.PI) / 180) * (s.headR - 1.6)}
          cy={s.headCentre.y - Math.cos(((s.faceDir + 78) * Math.PI) / 180) * (s.headR - 1.6)}
          r="1.5"
          fill="#16202b"
        />
      )}

      {/* Near side */}
      {limb(s.hipN, s.kneeN, 8.6, NEAR)}
      {limb(s.kneeN, s.ankleN, 7, NEAR)}
      {foot(s.ankleN, s.heelN, s.toeN, 5.2, NEAR)}
      {limb(s.shoN, s.elbowN, 6.8, NEAR)}
      {limb(s.elbowN, s.handN, 5.8, NEAR)}

      {/* Equipment drawn on top of the body */}
      {props.filter((p) => p.k !== 'step' && p.k !== 'wall' && p.k !== 'chair' && p.k !== 'mat')
        .map((p, i) => <PropShape key={`fg${i}`} prop={p} s={s} uid={uid} />)}
    </svg>
  );
}

function PropShape({ prop, s, uid }: { prop: Prop; s: Skeleton; uid: string }) {
  switch (prop.k) {
    case 'step': {
      const y = GROUND_Y - prop.h;
      return (
        <g>
          <rect x={prop.x} y={y} width={prop.w} height={prop.h} rx="1.5" fill="#22303e" />
          <rect x={prop.x} y={y} width={prop.w} height="1.8" rx="0.9" fill="#3b4d60" />
        </g>
      );
    }
    case 'wall': {
      const w = 5;
      const x = prop.face === 1 ? prop.x : prop.x - w;
      return (
        <g>
          <rect x={x} y="6" width={w} height={GROUND_Y - 6} fill="#1b2631" />
          <line
            x1={prop.x} y1="6" x2={prop.x} y2={GROUND_Y}
            stroke="#3b4d60" strokeWidth="1.2"
          />
        </g>
      );
    }
    case 'chair': {
      const w = prop.w ?? 22;
      const h = prop.h ?? 26;
      const face = prop.face ?? 1;
      const seatY = GROUND_Y - h;
      return (
        <g fill="#22303e">
          <rect x={prop.x} y={seatY} width={w} height="3.2" rx="1.4" fill="#3b4d60" />
          <rect x={prop.x + 1} y={seatY + 3} width="3" height={h - 3} rx="1.2" />
          <rect x={prop.x + w - 4} y={seatY + 3} width="3" height={h - 3} rx="1.2" />
          <rect
            x={face === 1 ? prop.x : prop.x + w - 3.4}
            y={seatY - 22}
            width="3.4"
            height="23"
            rx="1.4"
          />
        </g>
      );
    }
    case 'mat':
      return (
        <rect x="10" y={GROUND_Y - 2.6} width="80" height="3.2" rx="1.6" fill="#22303e" />
      );
    case 'dumbbell': {
      const at = resolve(prop.at, s);
      const r = prop.size ?? 3.4;
      return (
        <g fill="#8fa3b8">
          <rect x={at.x - 3.4} y={at.y - 1.1} width="6.8" height="2.2" rx="1.1" />
          <rect x={at.x - 5.6} y={at.y - r} width="2.8" height={r * 2} rx="1.2" fill="#b6c6d6" />
          <rect x={at.x + 2.8} y={at.y - r} width="2.8" height={r * 2} rx="1.2" fill="#b6c6d6" />
        </g>
      );
    }
    case 'backpack': {
      const back = offsetPerp(s.pelvis, s.neck, 0.55, -7.2);
      return (
        <g>
          <rect
            x={back.x - 6} y={back.y - 7.5} width="12" height="15" rx="3.4"
            fill="#3d5163" stroke="#546c82" strokeWidth="0.8"
          />
          <rect x={back.x - 3.6} y={back.y - 4} width="7.2" height="4.4" rx="1.6" fill="#546c82" />
        </g>
      );
    }
    case 'ball': {
      const at = resolve(prop.at, s);
      return (
        <circle
          cx={at.x} cy={at.y} r={prop.r ?? 5}
          fill="#3d5163" stroke="#6d849a" strokeWidth="0.9"
        />
      );
    }
    case 'band': {
      const a = resolve(prop.from, s);
      const b = resolve(prop.to, s);
      const m = mid(a, b);
      const sag = prop.sag ?? 3;
      return (
        <path
          d={`M ${a.x} ${a.y} Q ${m.x} ${m.y + sag} ${b.x} ${b.y}`}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    }
    case 'paddle': {
      const at = resolve(prop.at, s);
      const tilt = prop.tilt ?? 0;
      return (
        <g transform={`rotate(${tilt} ${at.x} ${at.y})`}>
          <rect x={at.x - 1.3} y={at.y - 1} width="2.6" height="6" rx="1.2" fill="#6d849a" />
          <rect
            x={at.x - 5} y={at.y - 12} width="10" height="12" rx="3.2"
            fill="#2c3b4a" stroke="#7d93a8" strokeWidth="1"
          />
        </g>
      );
    }
    case 'towel': {
      const at = resolve(prop.at, s);
      return <rect x={at.x - 5} y={at.y - 2} width="10" height="4" rx="2" fill="#546c82" />;
    }
    case 'arrow': {
      const at = resolve(prop.at, s);
      const to = { x: at.x + prop.dx, y: at.y + prop.dy };
      const m = mid(at, to);
      const bend = prop.bend ?? 0;
      const nx = -(to.y - at.y);
      const ny = to.x - at.x;
      const len = Math.hypot(nx, ny) || 1;
      const c = { x: m.x + (nx / len) * bend, y: m.y + (ny / len) * bend };
      return (
        <path
          d={`M ${at.x} ${at.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`}
          fill="none"
          stroke={LIME}
          strokeWidth="2.1"
          strokeLinecap="round"
          markerEnd={`url(#${uid}-head)`}
          opacity="0.9"
        />
      );
    }
  }
}

export { MUSCLES };
