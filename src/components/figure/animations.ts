import { flat } from './skeleton';
import type { PosePatch } from './skeleton';
import type { ExerciseAnim } from './anim';

/* Reusable arm shapes, so poses only spell out what actually changes. */
const ARMS_DOWN: PosePatch = { shoN: 6, elbN: 10, shoF: -5, elbF: 8 };
const HANDS_HIPS: PosePatch = { shoN: -20, elbN: 60, shoF: -24, elbF: 62 };
const WALL_TOUCH: PosePatch = { shoN: 82, elbN: 4, shoF: 76, elbF: 8 };
const ARMS_FRONT: PosePatch = { shoN: 74, elbN: 12, shoF: 70, elbF: 16 };
const GOBLET: PosePatch = { shoN: 22, elbN: 150, shoF: 18, elbF: 152 };
/* Face-on views need their own arm shapes: the far elbow flexes the other way
   because the model is 2D and the far arm is seen from its other side. */
const ARMS_DOWN_F: PosePatch = { shoN: -8, elbN: 6, shoF: 8, elbF: -6 };
const HANDS_HIPS_F: PosePatch = { shoN: -16, elbN: 42, shoF: 16, elbF: -42 };
const ARMS_OUT_F: PosePatch = { shoN: -48, elbN: 16, shoF: 48, elbF: -16 };
const ARMS_CHEST_F: PosePatch = { shoN: -24, elbN: 122, shoF: 24, elbF: -122 };

const WALL_R = { k: 'wall', x: 80, face: 1 } as const;

/** Foot lifted behind, so the far leg clears the floor on single-leg work. */
const FAR_LEG_UP: PosePatch = { hipF: -12, kneeF: 92, footF: -20 };

export const ANIMATIONS: Record<string, ExerciseAnim> = {
  /* ── Tobillo y Aquiles ────────────────────────────────────────────────── */

  'iso-calf-double': {
    view: 'side',
    highlight: ['calf', 'achilles'],
    base: { anchorX: 'toeN', anchorXTo: 60 },
    frames: [
      { p: { ...HANDS_HIPS, footN: 0, footF: 0 }, ms: 1100, label: 'Baja controlado' },
      {
        p: { ...HANDS_HIPS, footN: -34, footF: -34 },
        ms: 900,
        hold: 2400,
        label: 'Aguanta arriba',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -11 }],
      },
    ],
  },

  'iso-calf-single': {
    view: 'side',
    highlight: ['calf', 'achilles'],
    props: [WALL_R],
    base: { anchorX: 'toeN', anchorXTo: 58 },
    frames: [
      { p: { ...WALL_TOUCH, ...FAR_LEG_UP, footN: 0 }, ms: 1100, label: 'Baja controlado' },
      {
        p: { ...WALL_TOUCH, ...FAR_LEG_UP, footN: -34 },
        ms: 900,
        hold: 2600,
        label: 'Aguanta 45 s',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -11 }],
      },
    ],
  },

  'calf-raise-floor': {
    view: 'side',
    highlight: ['calf', 'achilles'],
    base: { anchorX: 'toeN', anchorXTo: 60 },
    frames: [
      { p: { ...HANDS_HIPS, footN: 0, footF: 0 }, ms: 3000, hold: 300, label: 'Baja en 3 s' },
      {
        p: { ...HANDS_HIPS, footN: -34, footF: -34 },
        ms: 2000,
        hold: 900,
        label: 'Sube en 2 s · aprieta',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -11 }],
      },
    ],
  },

  'calf-raise-single': {
    view: 'side',
    highlight: ['calf', 'achilles'],
    props: [WALL_R, { k: 'backpack' }],
    base: { anchorX: 'toeN', anchorXTo: 58 },
    frames: [
      { p: { ...WALL_TOUCH, ...FAR_LEG_UP, footN: 0 }, ms: 3000, hold: 300, label: 'Baja en 3 s' },
      {
        p: { ...WALL_TOUCH, ...FAR_LEG_UP, footN: -34 },
        ms: 2000,
        hold: 800,
        label: 'Sube en 2 s',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -11 }],
      },
    ],
  },

  'heel-drop-step': {
    view: 'side',
    highlight: ['achilles', 'calf'],
    props: [{ k: 'step', x: 26, w: 46, h: 11 }, { k: 'wall', x: 86, face: 1 }],
    base: {
      floorY: 89,
      groundOn: ['toeN', 'toeF'],
      anchorX: 'toeN',
      anchorXTo: 68,
    },
    frames: [
      {
        p: { ...WALL_TOUCH, footN: 26, footF: 26, kneeN: 4, kneeF: 4 },
        ms: 3000,
        hold: 600,
        label: 'Baja el talón en 3 s',
        props: [{ k: 'arrow', at: 'heelN', dx: 0, dy: 9 }],
      },
      {
        p: { ...WALL_TOUCH, footN: -30, footF: -30, kneeN: 2, kneeF: 2 },
        ms: 1600,
        hold: 500,
        label: 'Sube con las dos piernas',
      },
    ],
  },

  'soleus-seated': {
    view: 'side',
    highlight: ['soleus', 'achilles'],
    props: [
      { k: 'chair', x: 28, w: 24, h: 25, face: -1 },
      { k: 'dumbbell', at: 'kneeN', size: 3.6 },
    ],
    base: {
      groundOn: ['toeN', 'toeF'],
      anchorX: 'toeN',
      anchorXTo: 70,
      hipN: 88,
      hipF: 88,
      kneeN: 88,
      kneeF: 88,
      torso: 4,
      shoN: 34,
      elbN: 78,
      shoF: 30,
      elbF: 80,
    },
    frames: [
      { p: { footN: flat(88, 88), footF: flat(88, 88) }, ms: 2200, hold: 300, label: 'Baja despacio' },
      {
        p: { footN: flat(88, 88) - 32, footF: flat(88, 88) - 32 },
        ms: 1600,
        hold: 900,
        label: 'Talones arriba · rodilla doblada',
        props: [{ k: 'arrow', at: 'heelN', dx: 0, dy: -9 }],
      },
    ],
  },

  'soleus-wall-iso': {
    view: 'side',
    highlight: ['soleus'],
    props: [{ k: 'wall', x: 22, face: 1 }],
    frames: [
      {
        p: {
          ...ARMS_FRONT,
          torso: -4,
          hipN: 34,
          kneeN: 66,
          footN: flat(34, 66),
          hipF: 34,
          kneeF: 66,
          footF: flat(34, 66),
          x: 40,
        },
        ms: 1400,
        label: 'Apoya la espalda, rodillas a 60°',
      },
      {
        p: {
          ...ARMS_FRONT,
          torso: -4,
          hipN: 34,
          kneeN: 66,
          footN: flat(34, 66) - 26,
          hipF: 34,
          kneeF: 66,
          footF: flat(34, 66) - 26,
          x: 40,
        },
        ms: 1000,
        hold: 2600,
        label: 'Talones arriba y aguanta',
      },
    ],
  },

  'knee-to-wall': {
    view: 'side',
    highlight: ['tibialis'],
    props: [WALL_R],
    frames: [
      {
        p: { ...WALL_TOUCH, hipN: 16, kneeN: 22, footN: flat(16, 22), hipF: -20, kneeF: 18, footF: flat(-20, 18) },
        ms: 1500,
        label: 'Rodilla atrás',
      },
      {
        p: {
          ...WALL_TOUCH,
          hipN: 26,
          kneeN: 46,
          footN: flat(26, 46) + 4,
          hipF: -22,
          kneeF: 16,
          footF: flat(-22, 16),
        },
        ms: 1500,
        hold: 1200,
        label: 'Rodilla hacia la pared, talón pegado',
        props: [{ k: 'arrow', at: 'kneeN', dx: 12, dy: 0 }],
      },
    ],
  },

  'toe-walk': {
    view: 'side',
    highlight: ['calf', 'soleus'],
    frames: [
      {
        p: { ...ARMS_DOWN, footN: -32, footF: -32, hipN: 16, kneeN: 24, hipF: -14, kneeF: 10 },
        ms: 520,
        label: 'De puntillas, talones siempre arriba',
      },
      {
        p: { ...ARMS_DOWN, footN: -32, footF: -32, hipN: -14, kneeN: 10, hipF: 16, kneeF: 24 },
        ms: 520,
        label: 'De puntillas, talones siempre arriba',
      },
    ],
  },

  /* ── Aductores e ingle ────────────────────────────────────────────────── */

  'adductor-squeeze': {
    view: 'front',
    highlight: ['adductor', 'adductorF'],
    props: [{ k: 'ball', at: [50, 76], r: 4.6 }],
    base: { hipSpread: 7 },
    frames: [
      {
        p: { ...HANDS_HIPS_F, hipN: -9, kneeN: 6, footN: 0, hipF: 9, kneeF: 6, footF: 0 },
        ms: 900,
        label: 'Rodillas separadas',
      },
      {
        p: { ...HANDS_HIPS_F, hipN: -3, kneeN: 6, footN: 0, hipF: 3, kneeF: 6, footF: 0 },
        ms: 900,
        hold: 2600,
        label: 'Aprieta el cojín 30 s',
        props: [
          { k: 'arrow', at: 'kneeN', dx: 7, dy: 0 },
          { k: 'arrow', at: 'kneeF', dx: -7, dy: 0 },
        ],
      },
    ],
  },

  'copenhagen-short': {
    view: 'side',
    highlight: ['adductor', 'obliques'],
    props: [{ k: 'chair', x: 56, w: 26, h: 22, face: 1 }, { k: 'mat' }],
    base: { mirror: false, ground: true },
    frames: [
      {
        p: {
          torso: -74, head: 16,
          shoN: 8, elbN: 88, shoF: 16, elbF: 84,
          hipN: 96, kneeN: 88, footN: flat(96, 88),
          hipF: 92, kneeF: 4, footF: flat(92, 4),
          x: 40, y: 78,
        },
        ms: 1400,
        hold: 400,
        label: 'Cadera abajo, apoyado en el antebrazo',
      },
      {
        p: {
          torso: -88, head: 12,
          shoN: 8, elbN: 88, shoF: 16, elbF: 84,
          hipN: 96, kneeN: 88, footN: flat(96, 88),
          hipF: 92, kneeF: 4, footF: flat(92, 4),
          x: 40, y: 68,
        },
        ms: 1400,
        hold: 1400,
        label: 'Sube la cadera · línea recta',
        props: [{ k: 'arrow', at: 'pelvis', dx: 0, dy: -10 }],
      },
    ],
  },

  'copenhagen-long': {
    view: 'side',
    highlight: ['adductor', 'obliques'],
    props: [{ k: 'chair', x: 68, w: 26, h: 22, face: 1 }, { k: 'mat' }],
    frames: [
      {
        p: {
          torso: -74, head: 16,
          shoN: 8, elbN: 88, shoF: 16, elbF: 84,
          hipN: 92, kneeN: 6, footN: flat(92, 6),
          hipF: 88, kneeF: 30, footF: flat(88, 30),
          x: 36, y: 80,
        },
        ms: 1400,
        hold: 400,
        label: 'Pierna estirada sobre la silla',
      },
      {
        p: {
          torso: -88, head: 12,
          shoN: 8, elbN: 88, shoF: 16, elbF: 84,
          hipN: 92, kneeN: 6, footN: flat(92, 6),
          hipF: 88, kneeF: 30, footF: flat(88, 30),
          x: 36, y: 70,
        },
        ms: 1400,
        hold: 1400,
        label: 'Sube la cadera hasta la línea',
        props: [{ k: 'arrow', at: 'pelvis', dx: 0, dy: -10 }],
      },
    ],
  },

  'side-lying-adduction': {
    view: 'side',
    highlight: ['adductor'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -90, head: 14,
          shoN: 4, elbN: 90, shoF: 10, elbF: 86,
          hipN: 90, kneeN: 4, footN: flat(90, 4),
          hipF: 62, kneeF: 86, footF: flat(62, 86),
          x: 40, y: 92,
        },
        ms: 1300,
        label: 'Pierna de abajo estirada',
      },
      {
        p: {
          torso: -90, head: 14,
          shoN: 4, elbN: 90, shoF: 10, elbF: 86,
          hipN: 104, kneeN: 4, footN: flat(104, 4),
          hipF: 62, kneeF: 86, footF: flat(62, 86),
          x: 40, y: 92,
        },
        ms: 1300,
        hold: 900,
        label: 'Sube la pierna de abajo',
        props: [{ k: 'arrow', at: 'ankleN', dx: 0, dy: -10 }],
      },
    ],
  },

  'lateral-lunge': {
    view: 'front',
    highlight: ['adductor', 'gluteMed', 'quad'],
    frames: [
      { p: { ...ARMS_CHEST_F, hipN: -4, kneeN: 4, footN: 0, hipF: 4, kneeF: 4, footF: 0 }, ms: 900, label: 'De pie' },
      {
        p: {
          ...ARMS_CHEST_F,
          torso: -6,
          hipN: -34, kneeN: 60, footN: flat(-34, 60),
          hipF: 24, kneeF: 4, footF: flat(24, 4),
        },
        ms: 1200,
        hold: 700,
        label: 'Paso lateral · cadera atrás',
        props: [{ k: 'arrow', at: 'ankleN', dx: -11, dy: 0 }],
      },
    ],
  },

  'cossack-squat': {
    view: 'front',
    highlight: ['adductor', 'adductorF', 'gluteMed'],
    frames: [
      {
        p: {
          ...ARMS_CHEST_F,
          hipN: -22, kneeN: 6, footN: flat(-22, 6),
          hipF: 22, kneeF: 6, footF: flat(22, 6),
        },
        ms: 1100,
        label: 'Pies muy abiertos',
      },
      {
        p: {
          ...ARMS_CHEST_F,
          torso: 0,
          hipN: -46, kneeN: 104, footN: flat(-46, 104),
          hipF: 34, kneeF: 4, footF: flat(34, 4) + 14,
        },
        ms: 1600,
        hold: 900,
        label: 'Baja a un lado · la otra estirada',
        props: [{ k: 'arrow', at: 'pelvis', dx: -8, dy: 8 }],
      },
    ],
  },

  /* ── Cadera, glúteo y piramidal ───────────────────────────────────────── */

  'glute-bridge': {
    view: 'side',
    highlight: ['glute', 'hamstring'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -90, head: -8,
          shoN: 84, elbN: 10, shoF: 88, elbF: 8,
          hipN: 132, kneeN: 92, footN: flat(132, 92),
          hipF: 132, kneeF: 92, footF: flat(132, 92),
        },
        ms: 1300,
        hold: 300,
        label: 'Baja sin apoyar del todo',
      },
      {
        p: {
          torso: -114, head: 16,
          shoN: 78, elbN: 10, shoF: 82, elbF: 8,
          hipN: 96, kneeN: 56, footN: flat(96, 56),
          hipF: 96, kneeF: 56, footF: flat(96, 56),
        },
        ms: 1200,
        hold: 1200,
        label: 'Aprieta el glúteo arriba',
        props: [{ k: 'arrow', at: 'pelvis', dx: 0, dy: -11 }],
      },
    ],
  },

  'single-leg-bridge': {
    view: 'side',
    highlight: ['glute', 'hamstring'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -90, head: -8,
          shoN: 84, elbN: 10, shoF: 88, elbF: 8,
          hipN: 132, kneeN: 92, footN: flat(132, 92),
          hipF: 150, kneeF: 20, footF: flat(150, 20),
        },
        ms: 1300,
        label: 'Una pierna en el aire',
      },
      {
        p: {
          torso: -114, head: 16,
          shoN: 78, elbN: 10, shoF: 82, elbF: 8,
          hipN: 96, kneeN: 56, footN: flat(96, 56),
          hipF: 128, kneeF: 16, footF: flat(128, 16),
        },
        ms: 1200,
        hold: 1300,
        label: 'Sube con una sola pierna',
        props: [{ k: 'arrow', at: 'pelvis', dx: 0, dy: -11 }],
      },
    ],
  },

  'clamshell-band': {
    view: 'side',
    highlight: ['gluteMed', 'piriformis'],
    props: [
      { k: 'mat' },
      { k: 'band', from: 'kneeN', to: 'kneeF', sag: -3 },
    ],
    frames: [
      {
        p: {
          torso: -90, head: 14,
          shoN: 4, elbN: 96, shoF: 30, elbF: 96,
          hipN: 56, kneeN: 92, footN: flat(56, 92),
          hipF: 56, kneeF: 92, footF: flat(56, 92),
        },
        ms: 1100,
        label: 'Rodillas juntas, talones alineados',
      },
      {
        p: {
          torso: -90, head: 14,
          shoN: 4, elbN: 96, shoF: 30, elbF: 96,
          hipN: 56, kneeN: 92, footN: flat(56, 92),
          hipF: 34, kneeF: 108, footF: flat(34, 108),
        },
        ms: 1100,
        hold: 900,
        label: 'Abre la rodilla sin girar la cadera',
        props: [{ k: 'arrow', at: 'kneeF', dx: 2, dy: -10, bend: 3 }],
      },
    ],
  },

  'side-plank-abduction': {
    view: 'side',
    highlight: ['gluteMed', 'obliques'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -84, head: 12,
          shoN: 6, elbN: 86, shoF: 40, elbF: 60,
          hipN: 92, kneeN: 30, footN: flat(92, 30),
          hipF: 92, kneeF: 30, footF: flat(92, 30),
          x: 42, y: 74,
        },
        ms: 1200,
        label: 'Plancha lateral estable',
      },
      {
        p: {
          torso: -84, head: 12,
          shoN: 6, elbN: 86, shoF: 40, elbF: 60,
          hipN: 92, kneeN: 30, footN: flat(92, 30),
          hipF: 72, kneeF: 12, footF: flat(72, 12),
          x: 42, y: 74,
        },
        ms: 1100,
        hold: 800,
        label: 'Sube la pierna de arriba',
        props: [{ k: 'arrow', at: 'ankleF', dx: 0, dy: -10 }],
      },
    ],
  },

  'banded-lateral-walk': {
    view: 'front',
    highlight: ['gluteMed'],
    props: [{ k: 'band', from: 'ankleN', to: 'ankleF', sag: -4 }],
    frames: [
      {
        p: {
          ...HANDS_HIPS_F,
          hipN: -10, kneeN: 24, footN: flat(-10, 24),
          hipF: 10, kneeF: 24, footF: flat(10, 24),
          torso: 8,
        },
        ms: 800,
        label: 'Medio sentado, banda tensa',
      },
      {
        p: {
          ...HANDS_HIPS_F,
          hipN: -22, kneeN: 24, footN: flat(-22, 24),
          hipF: 6, kneeF: 24, footF: flat(6, 24),
          torso: 8,
        },
        ms: 800,
        hold: 400,
        label: 'Paso lateral sin juntar los pies',
        props: [{ k: 'arrow', at: 'ankleN', dx: -10, dy: 0 }],
      },
    ],
  },

  'hip-airplane': {
    view: 'side',
    highlight: ['gluteMed', 'piriformis'],
    frames: [
      {
        p: {
          torso: 66, head: -50,
          shoN: 106, elbN: 6, shoF: 106, elbF: 6,
          hipN: -16, kneeN: 22, footN: flat(-16, 22),
          hipF: -62, kneeF: 16, footF: flat(-62, 16),
          x: 44,
        },
        ms: 1500,
        label: 'Bisagra con una pierna atrás',
      },
      {
        p: {
          torso: 66, head: -50,
          shoN: 106, elbN: 6, shoF: 106, elbF: 6,
          hipN: -16, kneeN: 26, footN: flat(-16, 26),
          hipF: -62, kneeF: 16, footF: flat(-62, 16),
          hipSpread: 9,
          shoSpread: 9,
          x: 44,
        },
        ms: 1800,
        hold: 900,
        label: 'Abre la cadera despacio y vuelve',
        props: [{ k: 'arrow', at: 'ankleF', dx: -4, dy: -9, bend: 4 }],
      },
    ],
  },

  'hip-90-90': {
    view: 'side',
    highlight: ['piriformis', 'gluteMed'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: 14, head: -10,
          shoN: 58, elbN: 22, shoF: 54, elbF: 24,
          hipN: 92, kneeN: 96, footN: flat(92, 96),
          hipF: 56, kneeF: 104, footF: flat(56, 104),
          hipSpread: 5,
          x: 44, y: 84,
          ground: true,
        },
        ms: 1800,
        hold: 700,
        label: 'Sentado en 90/90',
      },
      {
        p: {
          torso: 14, head: -10,
          shoN: 58, elbN: 22, shoF: 54, elbF: 24,
          hipN: 56, kneeN: 104, footN: flat(56, 104),
          hipF: 92, kneeF: 96, footF: flat(92, 96),
          hipSpread: 5,
          x: 44, y: 84,
          ground: true,
        },
        ms: 1800,
        hold: 700,
        label: 'Gira las dos rodillas al otro lado',
        props: [{ k: 'arrow', at: 'kneeN', dx: -9, dy: 4, bend: 4 }],
      },
    ],
  },

  'figure-4-stretch': {
    view: 'side',
    highlight: ['piriformis'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -92, head: -6,
          shoN: 112, elbN: 64, shoF: 116, elbF: 62,
          hipN: 136, kneeN: 78, footN: flat(136, 78),
          hipF: 150, kneeF: 96, footF: flat(150, 96),
          hipSpread: 4,
        },
        ms: 1600,
        hold: 2400,
        label: 'Tobillo sobre la rodilla · tira suave',
        props: [{ k: 'arrow', at: 'kneeN', dx: -6, dy: -8, bend: 3 }],
      },
      {
        p: {
          torso: -92, head: -6,
          shoN: 106, elbN: 50, shoF: 110, elbF: 48,
          hipN: 122, kneeN: 78, footN: flat(122, 78),
          hipF: 140, kneeF: 96, footF: flat(140, 96),
          hipSpread: 4,
        },
        ms: 1400,
        hold: 600,
        label: 'Suelta un poco y respira',
      },
    ],
  },

  /* The readable shape here is one straight line from head to back heel, which
     is also the coaching cue. Keeping hipF = -torso makes the trunk and the
     trailing leg exactly collinear; the previous pose left 24° of kink at the
     hip and the back leg read as a kick rather than a counterweight. The arm
     hangs vertically (shoN 0) because that is where gravity puts the weight. */
  'single-leg-rdl': {
    view: 'side',
    highlight: ['hamstring', 'glute'],
    props: [{ k: 'dumbbell', at: 'handN' }],
    frames: [
      {
        p: {
          ...ARMS_DOWN, torso: 0, head: 0,
          hipN: 0, kneeN: 6, footN: 0,
          hipF: -10, kneeF: 20, footF: -12,
        },
        ms: 1200,
        hold: 400,
        // Captions name the movement *into* the frame, not the pose: this one
        // plays while you come back up, so it has to read as the way up.
        label: 'Sube apretando el glúteo',
      },
      {
        p: {
          torso: 38, head: -8,
          shoN: 0, elbN: 3, shoF: 0, elbF: 5,
          hipN: -10, kneeN: 14, footN: flat(-10, 14),
          hipF: -38, kneeF: 10, footF: flat(-38, 10),
        },
        ms: 1400,
        label: 'La cadera va hacia atrás',
        props: [{ k: 'arrow', at: 'pelvis', dx: -13, dy: -2 }],
      },
      {
        p: {
          torso: 68, head: -12,
          shoN: 0, elbN: 3, shoF: 0, elbF: 5,
          hipN: -14, kneeN: 15, footN: flat(-14, 15),
          hipF: -68, kneeF: 4, footF: flat(-68, 4),
        },
        ms: 1400,
        hold: 900,
        label: 'Espalda y pierna en línea',
      },
    ],
  },

  /* ── Pierna ───────────────────────────────────────────────────────────── */

  'goblet-squat': {
    view: 'side',
    highlight: ['quad', 'glute'],
    props: [{ k: 'dumbbell', at: 'handN', size: 4 }],
    frames: [
      { p: { ...GOBLET, hipN: 0, kneeN: 4, footN: 0, hipF: 0, kneeF: 4, footF: 0 }, ms: 1300, label: 'De pie con el peso al pecho' },
      {
        p: {
          ...GOBLET,
          torso: 24, head: -18,
          hipN: 62, kneeN: 104, footN: flat(62, 104) + 12,
          hipF: 62, kneeF: 104, footF: flat(62, 104) + 12,
        },
        ms: 1800,
        hold: 500,
        label: 'Baja con el pecho alto',
        props: [{ k: 'arrow', at: 'pelvis', dx: -4, dy: 10 }],
      },
    ],
  },

  'split-squat': {
    view: 'side',
    highlight: ['quad', 'glute', 'hipFlexor'],
    props: [{ k: 'dumbbell', at: 'handN' }, { k: 'dumbbell', at: 'handF' }],
    frames: [
      {
        p: {
          ...ARMS_DOWN,
          hipN: 22, kneeN: 24, footN: flat(22, 24),
          hipF: -26, kneeF: 24, footF: flat(-26, 24) - 14,
        },
        ms: 1300,
        label: 'Zancada, peso en el pie de delante',
      },
      {
        p: {
          ...ARMS_DOWN,
          torso: 10,
          hipN: 44, kneeN: 88, footN: flat(44, 88) + 8,
          hipF: -34, kneeF: 88, footF: flat(-34, 88) - 26,
        },
        ms: 1600,
        hold: 500,
        label: 'Rodilla de atrás casi al suelo',
        props: [{ k: 'arrow', at: 'kneeF', dx: 0, dy: 10 }],
      },
    ],
  },

  'step-up': {
    view: 'side',
    highlight: ['quad', 'glute'],
    props: [{ k: 'step', x: 56, w: 34, h: 16 }],
    frames: [
      {
        p: {
          ...ARMS_DOWN,
          hipN: 54, kneeN: 88, footN: flat(54, 88),
          hipF: -6, kneeF: 6, footF: flat(-6, 6),
          x: 40,
          groundOn: ['heelF', 'toeF'],
        },
        ms: 1400,
        label: 'Un pie arriba, peso en el talón',
      },
      {
        p: {
          ...ARMS_DOWN,
          hipN: 8, kneeN: 10, footN: flat(8, 10),
          hipF: -26, kneeF: 62, footF: flat(-26, 62) - 20,
          x: 46,
          groundOn: ['heelN', 'toeN'],
          floorY: 84,
        },
        ms: 1600,
        hold: 600,
        label: 'Sube sin impulso de la pierna de atrás',
        props: [{ k: 'arrow', at: 'headCentre', dx: 3, dy: -11 }],
      },
    ],
  },

  'wall-sit': {
    view: 'side',
    highlight: ['quad'],
    props: [{ k: 'wall', x: 22, face: 1 }],
    frames: [
      {
        p: {
          ...ARMS_FRONT,
          torso: -4,
          hipN: 58, kneeN: 92, footN: flat(58, 92),
          hipF: 58, kneeF: 92, footF: flat(58, 92),
          x: 40,
        },
        ms: 1400,
        hold: 3200,
        label: 'Muslos paralelos · aguanta',
      },
      {
        p: {
          ...ARMS_FRONT,
          torso: -4,
          hipN: 56, kneeN: 90, footN: flat(56, 90),
          hipF: 56, kneeF: 90, footF: flat(56, 90),
          x: 40,
        },
        ms: 900,
        label: 'Muslos paralelos · aguanta',
      },
    ],
  },

  /* ── Core ─────────────────────────────────────────────────────────────── */

  'dead-bug': {
    view: 'side',
    highlight: ['core'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -90, head: -16,
          shoN: 176, elbN: 6, shoF: 172, elbF: 8,
          hipN: 178, kneeN: 88, footN: flat(178, 88),
          hipF: 178, kneeF: 88, footF: flat(178, 88),
          ground: false, y: 92,
        },
        ms: 1300,
        label: 'Rodillas y brazos a 90°',
      },
      {
        p: {
          torso: -90, head: -16,
          shoN: 214, elbN: 6, shoF: 172, elbF: 8,
          hipN: 178, kneeN: 88, footN: flat(178, 88),
          hipF: 128, kneeF: 24, footF: flat(128, 24),
          ground: false, y: 92,
        },
        ms: 1600,
        hold: 700,
        label: 'Brazo y pierna contrarios · lumbar pegada',
        props: [{ k: 'arrow', at: 'handN', dx: -10, dy: 2 }],
      },
    ],
  },

  'pallof-press': {
    view: 'side',
    highlight: ['obliques', 'core'],
    props: [{ k: 'band', from: [8, 38], to: 'handN', sag: 2 }],
    frames: [
      {
        p: {
          shoN: 24, elbN: 128, shoF: 20, elbF: 130,
          hipN: 10, kneeN: 26, footN: flat(10, 26),
          hipF: -10, kneeF: 26, footF: flat(-10, 26),
          hipSpread: 4,
        },
        ms: 1200,
        label: 'Manos al pecho · la banda tira de un lado',
      },
      {
        p: {
          shoN: 84, elbN: 6, shoF: 80, elbF: 8,
          hipN: 10, kneeN: 26, footN: flat(10, 26),
          hipF: -10, kneeF: 26, footF: flat(-10, 26),
          hipSpread: 4,
        },
        ms: 1300,
        hold: 1600,
        label: 'Estira al frente sin dejar que te gire',
        props: [{ k: 'arrow', at: 'handN', dx: 10, dy: 0 }],
      },
    ],
  },

  'side-plank': {
    view: 'side',
    highlight: ['obliques', 'gluteMed'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -84, head: 12,
          shoN: 6, elbN: 86, shoF: 40, elbF: 60,
          hipN: 92, kneeN: 8, footN: flat(92, 8),
          hipF: 92, kneeF: 8, footF: flat(92, 8),
          x: 40, y: 76,
        },
        ms: 1300,
        hold: 3000,
        label: 'Línea recta tobillo-cadera-hombro',
      },
      {
        p: {
          torso: -82, head: 12,
          shoN: 6, elbN: 86, shoF: 40, elbF: 60,
          hipN: 90, kneeN: 8, footN: flat(90, 8),
          hipF: 90, kneeF: 8, footF: flat(90, 8),
          x: 40, y: 78,
        },
        ms: 900,
        label: 'Aguanta sin caer la cadera',
      },
    ],
  },

  'bird-dog': {
    view: 'side',
    highlight: ['core', 'glute'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: 88, head: -70,
          shoN: 8, elbN: 4, shoF: 12, elbF: 4,
          hipN: -88, kneeN: 88, footN: flat(-88, 88),
          hipF: -88, kneeF: 88, footF: flat(-88, 88),
          x: 46, y: 70,
        },
        ms: 1200,
        label: 'Cuadrupedia, espalda neutra',
      },
      {
        p: {
          torso: 88, head: -70,
          shoN: 48, elbN: 4, shoF: 12, elbF: 4,
          hipN: -88, kneeN: 88, footN: flat(-88, 88),
          hipF: -114, kneeF: 12, footF: flat(-114, 12),
          x: 46, y: 70,
        },
        ms: 1500,
        hold: 900,
        label: 'Brazo y pierna contrarios, sin girar',
        props: [{ k: 'arrow', at: 'handN', dx: 9, dy: -3 }],
      },
    ],
  },

  /* ── Pliometría (fase 3) ──────────────────────────────────────────────── */

  'pogo-hops': {
    view: 'side',
    highlight: ['calf', 'achilles'],
    base: { anchorX: 'toeN', anchorXTo: 58 },
    frames: [
      {
        p: { ...HANDS_HIPS, footN: -6, footF: -6, kneeN: 14, kneeF: 14 },
        ms: 160,
        label: 'Contacto corto y rígido',
      },
      {
        p: { ...HANDS_HIPS, footN: -34, footF: -34, kneeN: 6, kneeF: 6, lift: -9 },
        ms: 200,
        label: 'Rebota desde el tobillo',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -10 }],
      },
    ],
  },

  'lateral-bound': {
    view: 'front',
    highlight: ['gluteMed', 'adductor'],
    frames: [
      {
        p: {
          ...ARMS_OUT_F,
          torso: -6,
          hipN: -18, kneeN: 52, footN: flat(-18, 52),
          hipF: 22, kneeF: 16, footF: flat(22, 16),
          x: 38,
        },
        ms: 600,
        hold: 900,
        label: 'Aterriza y congela 1 s',
      },
      {
        p: {
          ...ARMS_OUT_F,
          torso: 6,
          hipN: -22, kneeN: 16, footN: flat(-22, 16),
          hipF: 18, kneeF: 52, footF: flat(18, 52),
          x: 62,
        },
        ms: 600,
        hold: 900,
        label: 'Salta al otro lado y congela',
        props: [{ k: 'arrow', at: 'pelvis', dx: 12, dy: -6, bend: 5 }],
      },
    ],
  },

  'split-step': {
    view: 'front',
    highlight: ['calf', 'quad'],
    frames: [
      {
        p: {
          ...ARMS_OUT_F,
          hipN: -10, kneeN: 18, footN: flat(-10, 18),
          hipF: 10, kneeF: 18, footF: flat(10, 18),
        },
        ms: 420,
        label: 'Listo, peso en las puntas',
      },
      {
        p: {
          ...ARMS_OUT_F,
          hipN: -14, kneeN: 8, footN: flat(-14, 8) - 18,
          hipF: 14, kneeF: 8, footF: flat(14, 8) - 18,
          lift: -6,
        },
        ms: 260,
        label: 'Salto corto',
        props: [{ k: 'arrow', at: 'headCentre', dx: 0, dy: -9 }],
      },
      {
        p: {
          ...ARMS_OUT_F,
          torso: 6,
          hipN: -18, kneeN: 42, footN: flat(-18, 42),
          hipF: 18, kneeF: 42, footF: flat(18, 42),
        },
        ms: 220,
        hold: 500,
        label: 'Aterriza amortiguando · listo para salir',
      },
    ],
  },

  'skater-hold': {
    view: 'front',
    highlight: ['gluteMed'],
    frames: [
      {
        p: {
          ...ARMS_OUT_F,
          torso: -8,
          hipN: -14, kneeN: 48, footN: flat(-14, 48),
          hipF: 34, kneeF: 86, footF: flat(34, 86),
          x: 44,
        },
        ms: 900,
        hold: 2000,
        label: 'Aterriza a una pierna y congela 2 s',
      },
      {
        p: {
          ...ARMS_OUT_F,
          torso: 8,
          hipN: -34, kneeN: 86, footN: flat(-34, 86),
          hipF: 14, kneeF: 48, footF: flat(14, 48),
          x: 56,
        },
        ms: 900,
        hold: 2000,
        label: 'Cambia de lado y congela',
        props: [{ k: 'arrow', at: 'pelvis', dx: 11, dy: -5, bend: 4 }],
      },
    ],
  },

  /* ── Hombro (mantenimiento) ───────────────────────────────────────────── */

  'band-external-rotation': {
    view: 'front',
    highlight: ['shoulder'],
    props: [{ k: 'band', from: [92, 46], to: 'handN', sag: 2 }],
    frames: [
      {
        p: {
          shoN: -6, elbN: 92, shoF: 8, elbF: -30,
          hipN: -6, kneeN: 6, footN: 0, hipF: 6, kneeF: 6, footF: 0,
        },
        ms: 1100,
        label: 'Codo pegado al costado, 90°',
      },
      {
        p: {
          shoN: -6, elbN: 46, shoF: 8, elbF: -30,
          hipN: -6, kneeN: 6, footN: 0, hipF: 6, kneeF: 6, footF: 0,
        },
        ms: 1200,
        hold: 800,
        label: 'Abre hacia fuera sin separar el codo',
        props: [{ k: 'arrow', at: 'handN', dx: -9, dy: 0, bend: 3 }],
      },
    ],
  },

  'band-pull-apart': {
    view: 'front',
    highlight: ['scapula', 'shoulder'],
    props: [{ k: 'band', from: 'handN', to: 'handF', sag: 0 }],
    frames: [
      {
        p: {
          shoN: -4, elbN: 84, shoF: 4, elbF: -84, shoSpread: 11.5,
          hipN: -6, kneeN: 6, footN: 0, hipF: 6, kneeF: 6, footF: 0,
        },
        ms: 1100,
        label: 'Brazos al frente, banda tensa',
      },
      {
        p: {
          shoN: -84, elbN: 8, shoF: 84, elbF: -8, shoSpread: 11.5,
          hipN: -6, kneeN: 6, footN: 0, hipF: 6, kneeF: 6, footF: 0,
        },
        ms: 1200,
        hold: 700,
        label: 'Abre juntando las escápulas',
        props: [
          { k: 'arrow', at: 'handN', dx: -9, dy: 0 },
          { k: 'arrow', at: 'handF', dx: 9, dy: 0 },
        ],
      },
    ],
  },

  'wall-slide': {
    view: 'side',
    highlight: ['scapula'],
    props: [{ k: 'wall', x: 30, face: 1 }],
    frames: [
      {
        p: {
          torso: -3,
          shoN: 118, elbN: 84, shoF: 114, elbF: 86,
          hipN: 8, kneeN: 14, footN: flat(8, 14),
          hipF: -8, kneeF: 14, footF: flat(-8, 14),
          x: 44,
        },
        ms: 1300,
        label: 'Espalda y brazos pegados a la pared',
      },
      {
        p: {
          torso: -3,
          shoN: 150, elbN: 36, shoF: 146, elbF: 38,
          hipN: 8, kneeN: 14, footN: flat(8, 14),
          hipF: -8, kneeF: 14, footF: flat(-8, 14),
          x: 44,
        },
        ms: 1500,
        hold: 600,
        label: 'Sube sin despegar ni arquear la espalda',
        props: [{ k: 'arrow', at: 'handN', dx: 2, dy: -10 }],
      },
    ],
  },

  /* ── Calentamiento, movilidad y vuelta a la calma ─────────────────────── */

  'leg-swings': {
    view: 'side',
    highlight: ['hipFlexor', 'hamstring'],
    props: [WALL_R],
    frames: [
      {
        p: {
          ...WALL_TOUCH,
          hipN: -34, kneeN: 10, footN: flat(-34, 10),
          hipF: 0, kneeF: 4, footF: 0,
        },
        ms: 650,
        label: 'Balanceo atrás',
      },
      {
        p: {
          ...WALL_TOUCH,
          hipN: 52, kneeN: 6, footN: flat(52, 6),
          hipF: 0, kneeF: 4, footF: 0,
        },
        ms: 650,
        label: 'Balanceo adelante · suelto, sin forzar',
        props: [{ k: 'arrow', at: 'ankleN', dx: 11, dy: -4, bend: 5 }],
      },
    ],
  },

  'ankle-circles': {
    view: 'side',
    highlight: ['tibialis'],
    props: [WALL_R],
    frames: [
      {
        p: { ...WALL_TOUCH, hipN: 34, kneeN: 40, footN: 26, hipF: 0, kneeF: 4, footF: 0 },
        ms: 700,
        label: 'Punta arriba',
      },
      {
        p: { ...WALL_TOUCH, hipN: 34, kneeN: 40, footN: -34, hipF: 0, kneeF: 4, footF: 0 },
        ms: 700,
        label: 'Punta abajo · círculos amplios',
        props: [{ k: 'arrow', at: 'toeN', dx: 3, dy: 8, bend: 5 }],
      },
    ],
  },

  'march-jog': {
    view: 'side',
    highlight: ['quad'],
    frames: [
      {
        p: {
          shoN: 40, elbN: 78, shoF: -40, elbF: 78,
          hipN: 48, kneeN: 88, footN: flat(48, 88) - 10,
          hipF: -16, kneeF: 12, footF: flat(-16, 12) - 12,
          lift: -3,
        },
        ms: 420,
        label: 'Trote suave en el sitio',
      },
      {
        p: {
          shoN: -40, elbN: 78, shoF: 40, elbF: 78,
          hipN: -16, kneeN: 12, footN: flat(-16, 12) - 12,
          hipF: 48, kneeF: 88, footF: flat(48, 88) - 10,
          lift: -3,
        },
        ms: 420,
        label: 'Trote suave en el sitio',
      },
    ],
  },

  'shadow-strokes': {
    view: 'side',
    highlight: ['obliques', 'shoulder'],
    props: [{ k: 'paddle', at: 'handN', tilt: -20 }],
    frames: [
      {
        p: {
          torso: -12, head: 16,
          shoN: -48, elbN: 40, shoF: 30, elbF: 50,
          hipN: 16, kneeN: 30, footN: flat(16, 30),
          hipF: -18, kneeF: 24, footF: flat(-18, 24),
        },
        ms: 700,
        label: 'Preparación: pala atrás, rodillas blandas',
      },
      {
        p: {
          torso: 20, head: -18,
          shoN: 52, elbN: 26, shoF: -20, elbF: 60,
          hipN: 22, kneeN: 24, footN: flat(22, 24),
          hipF: -24, kneeF: 20, footF: flat(-24, 20),
        },
        ms: 600,
        hold: 400,
        label: 'Golpe: empuja desde las piernas',
        props: [{ k: 'arrow', at: 'handN', dx: 10, dy: -4, bend: 5 }],
      },
    ],
  },

  'calf-stretch-wall': {
    view: 'side',
    highlight: ['calf', 'soleus'],
    props: [WALL_R],
    frames: [
      {
        p: {
          ...WALL_TOUCH,
          torso: 16, head: -14,
          hipN: 20, kneeN: 26, footN: flat(20, 26),
          hipF: -30, kneeF: 4, footF: flat(-30, 4) + 26,
          x: 46,
        },
        ms: 1600,
        hold: 2600,
        label: 'Pierna atrás estirada · talón en el suelo',
      },
      {
        p: {
          ...WALL_TOUCH,
          torso: 16, head: -14,
          hipN: 20, kneeN: 26, footN: flat(20, 26),
          hipF: -30, kneeF: 26, footF: flat(-30, 26) + 22,
          x: 46,
        },
        ms: 1400,
        hold: 2200,
        label: 'Ahora dobla la rodilla de atrás (sóleo)',
        props: [{ k: 'arrow', at: 'kneeF', dx: 6, dy: 5 }],
      },
    ],
  },

  'hip-flexor-lunge': {
    view: 'side',
    highlight: ['hipFlexor', 'glute'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          ...HANDS_HIPS,
          torso: -4, head: -4,
          hipN: 46, kneeN: 88, footN: flat(46, 88),
          hipF: -40, kneeF: 96, footF: flat(-40, 96) - 30,
          x: 42,
        },
        ms: 1500,
        label: 'Rodilla de atrás en el suelo',
      },
      {
        p: {
          ...HANDS_HIPS,
          torso: -10, head: -4,
          hipN: 38, kneeN: 82, footN: flat(38, 82),
          hipF: -54, kneeF: 96, footF: flat(-54, 96) - 30,
          x: 42,
        },
        ms: 1500,
        hold: 2400,
        label: 'Mete el glúteo y empuja la cadera',
        props: [{ k: 'arrow', at: 'pelvis', dx: 9, dy: 0 }],
      },
    ],
  },

  'breathing-360': {
    view: 'side',
    highlight: ['core'],
    props: [{ k: 'mat' }],
    frames: [
      {
        p: {
          torso: -90, head: -12,
          shoN: 130, elbN: 96, shoF: 134, elbF: 94,
          hipN: 136, kneeN: 84, footN: flat(136, 84),
          hipF: 136, kneeF: 84, footF: flat(136, 84),
        },
        ms: 3400,
        hold: 800,
        label: 'Inspira 4 s · hincha las costillas',
        props: [{ k: 'arrow', at: 'pelvis', dx: 0, dy: -8 }],
      },
      {
        p: {
          torso: -90, head: -12,
          shoN: 128, elbN: 98, shoF: 132, elbF: 96,
          hipN: 138, kneeN: 84, footN: flat(138, 84),
          hipF: 138, kneeF: 84, footF: flat(138, 84),
        },
        ms: 5000,
        hold: 600,
        label: 'Espira 6 s · muy largo',
      },
    ],
  },
};
