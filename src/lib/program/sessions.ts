import type { SessionDef, SessionItem } from './types';

const it = (
  exercise: string,
  sets: number,
  work: SessionItem['work'],
  restSec: number,
  extra: Partial<SessionItem> = {},
): SessionItem => ({ exercise, sets, work, restSec, ...extra });

const list: SessionDef[] = [
  {
    key: 'fuerza-a',
    name: 'Fuerza A',
    tagline: 'Tobillo y cadena posterior',
    kind: 'fuerza',
    minutes: 25,
    focus: ['Aquiles', 'Sóleo', 'Isquios y glúteo'],
    heavy: true,
    items: {
      1: [
        it('calf-raise-floor', 3, { reps: 12, tempo: '2-1-3' }, 75, {
          cue: 'En el suelo, sin bajar del escalón. Rango cómodo.',
        }),
        it('soleus-seated', 3, { reps: 15, tempo: '2-1-3' }, 60, { load: '2 x 5 kg en los muslos' }),
        it('single-leg-rdl', 2, { reps: 8, perSide: true }, 60, { load: 'Sin peso o 5 kg' }),
        it('glute-bridge', 3, { reps: 15 }, 45),
      ],
      2: [
        it('calf-raise-single', 4, { reps: 8, perSide: true, tempo: '2-0-3' }, 90, {
          load: 'Mochila 8-12 kg',
        }),
        it('soleus-seated', 3, { reps: 15, tempo: '2-1-3' }, 60, { load: '2 x 5 kg' }),
        it('single-leg-rdl', 3, { reps: 8, perSide: true }, 60, { load: '2 x 5 kg' }),
        it('side-plank', 2, { holdSec: 30, perSide: true }, 40),
      ],
      3: [
        it('calf-raise-single', 4, { reps: 6, perSide: true, tempo: '3-0-3' }, 90, {
          load: 'Mochila 15-20 kg',
        }),
        it('heel-drop-step', 3, { reps: 8, perSide: true, tempo: '3-0-2' }, 75),
        it('pogo-hops', 3, { reps: 15 }, 60, { cue: 'Contactos cortos, como un muelle.' }),
        it('single-leg-rdl', 2, { reps: 8, perSide: true }, 60, { load: '2 x 5 kg' }),
      ],
    },
  },
  {
    key: 'fuerza-b',
    name: 'Fuerza B',
    tagline: 'Piernas y aductores',
    kind: 'fuerza',
    minutes: 25,
    focus: ['Aductores', 'Cuádriceps', 'Glúteo'],
    heavy: true,
    items: {
      1: [
        it('goblet-squat', 3, { reps: 10, tempo: '3-0-2' }, 75, { load: '5 kg al pecho' }),
        it('side-lying-adduction', 2, { reps: 12, perSide: true }, 45),
        it('split-squat', 2, { reps: 8, perSide: true }, 60, { load: 'Sin peso' }),
        it('adductor-squeeze', 3, { holdSec: 30 }, 30, { cue: 'Al 80 % de tu fuerza, no al máximo.' }),
        it('glute-bridge', 3, { reps: 15 }, 45),
      ],
      2: [
        it('goblet-squat', 3, { reps: 10, tempo: '3-0-2' }, 75, { load: '2 x 5 kg o mochila' }),
        it('copenhagen-short', 3, { reps: 8, perSide: true }, 60, {
          cue: 'Rodilla en la silla. Cadera arriba hasta la línea recta.',
        }),
        it('split-squat', 3, { reps: 8, perSide: true }, 75, { load: '2 x 5 kg' }),
        it('lateral-lunge', 2, { reps: 8, perSide: true }, 45),
        it('adductor-squeeze', 3, { holdSec: 35 }, 30),
      ],
      3: [
        it('step-up', 3, { reps: 8, perSide: true, tempo: '2-0-3' }, 75, { load: 'Mochila cargada' }),
        it('copenhagen-long', 3, { reps: 6, perSide: true }, 60),
        it('lateral-lunge', 3, { reps: 8, perSide: true }, 60, { load: '2 x 5 kg' }),
        it('lateral-bound', 3, { reps: 5, perSide: true }, 60, { cue: 'Congela 1 s cada aterrizaje.' }),
        it('cossack-squat', 2, { reps: 8, perSide: true }, 50),
      ],
    },
  },
  {
    key: 'tendon',
    name: 'Tendón',
    tagline: 'Aquiles y movilidad de tobillo',
    kind: 'tendon',
    minutes: 18,
    focus: ['Isométricos', 'Sóleo', 'Movilidad'],
    heavy: false,
    items: {
      1: [
        it('iso-calf-double', 4, { holdSec: 45 }, 60),
        it('soleus-wall-iso', 3, { holdSec: 30 }, 45),
        it('knee-to-wall', 2, { reps: 10, perSide: true }, 30),
        it('toe-walk', 2, { timeSec: 30 }, 45),
      ],
      2: [
        it('iso-calf-single', 4, { holdSec: 45, perSide: true }, 60),
        it('heel-drop-step', 3, { reps: 10, tempo: '3-0-2' }, 60, {
          cue: 'Empieza a dos piernas. Solo pasa a una si no aumenta la rigidez.',
        }),
        it('knee-to-wall', 2, { reps: 12, perSide: true }, 30),
      ],
      3: [
        it('iso-calf-single', 3, { holdSec: 45, perSide: true }, 60),
        it('pogo-hops', 4, { reps: 20 }, 60),
        it('split-step', 3, { reps: 10 }, 45),
        it('knee-to-wall', 2, { reps: 12, perSide: true }, 30),
      ],
    },
  },
  {
    key: 'cadera',
    name: 'Cadera y core',
    tagline: 'Glúteo medio, piramidal y anti-rotación',
    kind: 'cadera',
    minutes: 18,
    focus: ['Glúteo medio', 'Piramidal', 'Core'],
    heavy: false,
    items: {
      1: [
        it('glute-bridge', 3, { reps: 15 }, 45),
        it('clamshell-band', 2, { reps: 15, perSide: true }, 40),
        it('dead-bug', 2, { reps: 8, perSide: true }, 40),
        it('side-plank', 3, { holdSec: 20, perSide: true }, 40),
      ],
      2: [
        it('single-leg-bridge', 3, { reps: 10, perSide: true }, 45),
        it('clamshell-band', 3, { reps: 15, perSide: true }, 40),
        it('side-plank-abduction', 3, { reps: 10, perSide: true }, 45),
        it('pallof-press', 2, { reps: 10, perSide: true }, 40),
      ],
      3: [
        it('single-leg-bridge', 3, { reps: 12, perSide: true }, 45),
        it('side-plank-abduction', 3, { reps: 12, perSide: true }, 45),
        it('pallof-press', 3, { reps: 8, perSide: true }, 45),
        it('hip-airplane', 2, { reps: 6, perSide: true }, 45),
      ],
    },
  },
  {
    key: 'descarga',
    name: 'Descarga',
    tagline: 'Movilidad, control y hombro',
    kind: 'descarga',
    minutes: 18,
    focus: ['Movilidad de cadera', 'Control', 'Hombro'],
    heavy: false,
    items: {
      1: [
        it('hip-90-90', 2, { reps: 8 }, 30),
        it('bird-dog', 2, { reps: 8, perSide: true }, 40),
        it('band-external-rotation', 2, { reps: 15, perSide: true }, 35),
        it('figure-4-stretch', 2, { holdSec: 30, perSide: true }, 20),
        it('breathing-360', 1, { timeSec: 90 }, 0),
      ],
      2: [
        it('hip-90-90', 3, { reps: 10 }, 30),
        it('bird-dog', 3, { reps: 10, perSide: true }, 40),
        it('band-pull-apart', 3, { reps: 15 }, 35),
        it('hip-flexor-lunge', 2, { holdSec: 35, perSide: true }, 20),
        it('breathing-360', 1, { timeSec: 90 }, 0),
      ],
      3: [
        it('hip-airplane', 3, { reps: 6, perSide: true }, 45),
        it('hip-90-90', 3, { reps: 10 }, 30),
        it('wall-slide', 3, { reps: 10 }, 35),
        it('hip-flexor-lunge', 2, { holdSec: 40, perSide: true }, 20),
        it('breathing-360', 1, { timeSec: 90 }, 0),
      ],
    },
  },
  {
    key: 'calentamiento',
    name: 'Calentamiento',
    tagline: 'Los 7 minutos antes de jugar',
    kind: 'calentamiento',
    minutes: 7,
    focus: ['Activar', 'Preparar el tendón'],
    heavy: false,
    items: {
      1: [
        it('march-jog', 1, { timeSec: 75 }, 10),
        it('ankle-circles', 1, { reps: 6, perSide: true }, 5),
        it('leg-swings', 1, { reps: 8, perSide: true }, 5),
        it('banded-lateral-walk', 1, { reps: 10, perSide: true }, 10),
        it('iso-calf-double', 2, { holdSec: 30 }, 20),
        it('split-step', 1, { reps: 8 }, 10),
        it('shadow-strokes', 1, { reps: 10 }, 0),
      ],
      2: [],
      3: [],
    },
  },
  {
    key: 'vuelta-calma',
    name: 'Vuelta a la calma',
    tagline: 'Cinco minutos al acabar el partido',
    kind: 'calma',
    minutes: 6,
    focus: ['Bajar pulsaciones', 'Descargar'],
    heavy: false,
    items: {
      1: [
        it('march-jog', 1, { timeSec: 60 }, 10, { cue: 'Muy suave, casi andando.' }),
        it('calf-stretch-wall', 1, { holdSec: 30, perSide: true }, 10, {
          cue: 'Ahora sí: en caliente y suave.',
        }),
        it('figure-4-stretch', 1, { holdSec: 30, perSide: true }, 10),
        it('hip-flexor-lunge', 1, { holdSec: 30, perSide: true }, 10),
        it('breathing-360', 1, { timeSec: 75 }, 0),
      ],
      2: [],
      3: [],
    },
  },
  {
    key: 'pista',
    name: 'Pala y pies',
    tagline: 'Sesión técnica en la azotea',
    kind: 'pista',
    minutes: 18,
    focus: ['Split-step', 'Desplazamiento', 'Golpeo'],
    heavy: false,
    items: {
      1: [
        it('march-jog', 1, { timeSec: 90 }, 20),
        it('split-step', 3, { reps: 10 }, 40),
        it('shadow-strokes', 3, { reps: 10 }, 40),
        it('skater-hold', 3, { reps: 4, perSide: true }, 50),
        it('banded-lateral-walk', 2, { reps: 12, perSide: true }, 30),
      ],
      2: [],
      3: [],
    },
  },
];

/** Sessions whose prescription does not change with the phase. */
const FIXED = new Set(['calentamiento', 'vuelta-calma', 'pista']);

for (const s of list) {
  if (FIXED.has(s.key)) {
    s.items[2] = s.items[1];
    s.items[3] = s.items[1];
  }
}

export const SESSIONS: Record<string, SessionDef> = Object.fromEntries(
  list.map((s) => [s.key, s]),
);

export const SESSION_LIST = list;

/** The five sessions that make up a training week, in rotation order. */
export const WEEKLY_ROTATION = ['fuerza-a', 'tendon', 'fuerza-b', 'cadera', 'descarga'] as const;

export const EXTRA_SESSIONS = ['calentamiento', 'vuelta-calma', 'pista'] as const;
