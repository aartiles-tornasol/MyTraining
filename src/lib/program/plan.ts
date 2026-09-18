import { EXERCISES } from './exercises';
import { SESSIONS, WEEKLY_ROTATION } from './sessions';
import type { Phase, SessionDef, SessionItem, Work } from './types';

export const PHASES: Record<Phase, {
  n: Phase;
  name: string;
  weeks: string;
  goal: string;
  detail: string;
}> = {
  1: {
    n: 1,
    name: 'Calmar y construir base',
    weeks: 'Semanas 1-4',
    goal: 'Bajar la irritabilidad del Aquiles y aprender los patrones',
    detail:
      'Isométricos largos y carga moderada en rango neutro, sin bajar del escalón. Nada de saltos. El objetivo de estas cuatro semanas es que la rigidez de por las mañanas empiece a bajar.',
  },
  2: {
    n: 2,
    name: 'Carga pesada y lenta',
    weeks: 'Semanas 5-8',
    goal: 'Construir un tendón y una ingle que aguanten',
    detail:
      'Aquí está el trabajo que de verdad cambia las cosas: elevaciones de talón a una pierna con mochila, Copenhagen y sóleo con peso. Se introduce el rango completo desde el escalón solo si la rigidez matutina ya es de 2/10 o menos.',
  },
  3: {
    n: 3,
    name: 'Elasticidad y pista',
    weeks: 'Semanas 9-12',
    goal: 'Devolverle al tendón su capacidad de muelle',
    detail:
      'Se mantiene la fuerza pesada y se añaden pogos, saltos laterales y split-steps. Es lo que transfiere todo lo anterior a los frenazos y arrancadas del pickleball.',
  },
};

export const MS_DAY = 86_400_000;

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / MS_DAY);
}

export function weekNumber(startDate: string, today: string): number {
  return Math.max(1, Math.floor(daysBetween(startDate, today) / 7) + 1);
}

export function phaseForWeek(week: number): Phase {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

/* ── Duration ───────────────────────────────────────────────────────────── */

/** Seconds of actual work in one set, so the player can show a real estimate. */
export function setSeconds(work: Work): number {
  if (work.timeSec) return work.timeSec;
  const one = work.holdSec ?? (work.reps ?? 10) * (work.tempo ? tempoSeconds(work.tempo) : 3);
  // Unilateral sets are done twice with a short changeover in between.
  return work.perSide ? one * 2 + 8 : one;
}

function tempoSeconds(tempo: string): number {
  const parts = tempo.split('-').map((n) => Number(n) || 0);
  return parts.reduce((a, b) => a + b, 0) + 1;
}

export function itemSeconds(item: SessionItem): number {
  return item.sets * setSeconds(item.work) + Math.max(0, item.sets - 1) * item.restSec;
}

export function sessionSeconds(items: SessionItem[]): number {
  // 15 s of transition between exercises: reading the card, moving the mat.
  return items.reduce((t, i) => t + itemSeconds(i), 0) + Math.max(0, items.length - 1) * 15;
}

export const sessionMinutes = (items: SessionItem[]) => Math.round(sessionSeconds(items) / 60);

/* ── Exercise level ─────────────────────────────────────────────────────── */

/**
 * Which rung of the progression ladder to show. The phase sets the default and
 * the stored offset lets the app move a single exercise up or down without
 * touching the rest of the programme.
 */
export function levelFor(exerciseKey: string, phase: Phase, offset = 0) {
  const ex = EXERCISES[exerciseKey];
  if (!ex) return null;
  const n = Math.min(ex.levels.length, Math.max(1, phase + offset));
  return ex.levels.find((l) => l.n === n) ?? ex.levels[ex.levels.length - 1];
}

/** Animation to show, honouring any per-level override. */
export function animFor(exerciseKey: string, phase: Phase, offset = 0): string {
  const ex = EXERCISES[exerciseKey];
  if (!ex) return exerciseKey;
  return levelFor(exerciseKey, phase, offset)?.anim ?? ex.anim;
}

/* ── Adaptive selection ─────────────────────────────────────────────────── */

export type SessionMode = 'normal' | 'suave' | 'descarga';

export interface DayInput {
  today: string;
  startDate: string;
  playingToday: boolean;
  /** This morning's Achilles stiffness, 0-10. Null when not logged yet. */
  achillesAM: number | null;
  adductor: number | null;
  piriformis: number | null;
  /** Completed sessions, most recent first: { date, sessionKey }. */
  history: { date: string; sessionKey: string }[];
}

export interface DayPlan {
  sessionKey: string;
  session: SessionDef;
  phase: Phase;
  week: number;
  mode: SessionMode;
  /** Plain-Spanish explanation of why this session, today. */
  reason: string;
  items: SessionItem[];
  minutes: number;
  /** Extra sessions surfaced on the home screen today. */
  suggestExtras: string[];
  warnings: string[];
}

/** Loaded tendon work that a sore Achilles should not be doing today. */
const HEAVY_TENDON = new Set([
  'calf-raise-single', 'heel-drop-step', 'calf-raise-floor',
  'pogo-hops', 'lateral-bound', 'skater-hold', 'split-step', 'toe-walk',
]);

function lastDoneIndex(history: DayInput['history'], key: string): number {
  const i = history.findIndex((h) => h.sessionKey === key);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

function daysSinceSession(history: DayInput['history'], today: string, pred: (k: string) => boolean) {
  const hit = history.find((h) => pred(h.sessionKey));
  return hit ? daysBetween(hit.date, today) : Number.MAX_SAFE_INTEGER;
}

export function planDay(input: DayInput): DayPlan {
  const week = weekNumber(input.startDate, input.today);
  const phase = phaseForWeek(week);
  const am = input.achillesAM;
  const warnings: string[] = [];

  const doneToday = input.history.some((h) => h.date === input.today);
  const heavyGapDays = daysSinceSession(input.history, input.today, (k) => SESSIONS[k]?.heavy);
  const canGoHeavy = heavyGapDays >= 2;

  // Least-recently-done first, so the rotation self-corrects after missed days.
  const byStaleness = [...WEEKLY_ROTATION].sort(
    (a, b) => lastDoneIndex(input.history, b) - lastDoneIndex(input.history, a),
  );

  let sessionKey: string;
  let mode: SessionMode = 'normal';
  let reason: string;

  if (am !== null && am >= 6) {
    sessionKey = 'descarga';
    mode = 'descarga';
    reason =
      'Has marcado el Aquiles en ' + am + '/10 esta mañana. Hoy toca descargar: movilidad y respiración, ' +
      'sin carga en el tendón. Descansarlo un día hoy te ahorra tres la semana que viene.';
    warnings.push('Si sigues por encima de 6/10 tres días seguidos, merece la pena que lo vea un fisio.');
  } else if (input.playingToday) {
    const light = byStaleness.filter((k) => !SESSIONS[k].heavy);
    sessionKey = light[0] ?? 'descarga';
    reason =
      'Hoy juegas, así que el trabajo pesado se aparta para no llegar cansado a la pista. ' +
      'Esta sesión es corta y prepara sin fatigar. No te olvides del calentamiento antes de jugar.';
  } else if (!canGoHeavy) {
    const light = byStaleness.filter((k) => !SESSIONS[k].heavy);
    sessionKey = light[0] ?? 'cadera';
    reason =
      'Ayer hiciste fuerza pesada. El tendón necesita 48 h entre sesiones duras para adaptarse, ' +
      'así que hoy toca una sesión de las ligeras.';
  } else {
    sessionKey = byStaleness[0];
    const s = SESSIONS[sessionKey];
    reason = s.heavy
      ? 'No juegas hoy y han pasado ' + heavyGapDays + ' días desde la última sesión pesada: ' +
        'buen momento para cargar de verdad.'
      : 'Toca ' + s.name.toLowerCase() + ' según la rotación de la semana.';
  }

  if (mode === 'normal' && am !== null && am >= 4 && SESSIONS[sessionKey].heavy) {
    mode = 'suave';
    reason +=
      ' Como el Aquiles está en ' + am + '/10, hoy se cambia el trabajo pesado de gemelo por isométricos.';
  }

  let items = SESSIONS[sessionKey].items[phase];
  if (mode === 'suave') items = softenForTendon(items);
  if (mode === 'descarga') items = items.filter((i) => !HEAVY_TENDON.has(i.exercise));

  if (input.adductor !== null && input.adductor >= 4) {
    items = items.filter((i) => !['copenhagen-long', 'copenhagen-short', 'cossack-squat', 'lateral-bound']
      .includes(i.exercise));
    warnings.push('Aductores en ' + input.adductor + '/10: hoy se quitan los Copenhagen y el trabajo lateral fuerte.');
  }
  if (input.piriformis !== null && input.piriformis >= 5) {
    items = items.filter((i) => i.exercise !== 'figure-4-stretch');
    warnings.push('Con el piramidal irritado, estirarlo fuerte lo empeora. Hoy se queda fuera.');
  }

  const suggestExtras: string[] = [];
  if (input.playingToday) suggestExtras.push('calentamiento', 'vuelta-calma');

  if (doneToday) {
    warnings.push('Ya has entrenado hoy. Puedes repetir, pero no hace falta.');
  }

  return {
    sessionKey,
    session: SESSIONS[sessionKey],
    phase,
    week,
    mode,
    reason,
    items,
    minutes: sessionMinutes(items),
    suggestExtras,
    warnings,
  };
}

/** Swap loaded tendon work for the isometric version and trim a set. */
function softenForTendon(items: SessionItem[]): SessionItem[] {
  return items.map((i) => {
    if (!HEAVY_TENDON.has(i.exercise)) return i;
    return {
      exercise: 'iso-calf-double',
      sets: 4,
      work: { holdSec: 45 },
      restSec: 60,
      cue: 'Versión suave de hoy: isométricos en vez de carga pesada.',
    };
  }).filter((i, idx, arr) => arr.findIndex((o) => o.exercise === i.exercise) === idx);
}

/* ── Trend advice ───────────────────────────────────────────────────────── */

export interface TrendAdvice {
  tone: 'ok' | 'watch' | 'back-off' | 'level-up';
  title: string;
  body: string;
}

/** Reads the last two weeks of morning scores and says what to do about them. */
export function readTrend(recent: { date: string; achillesAM: number | null }[]): TrendAdvice | null {
  const scores = recent
    .map((r) => r.achillesAM)
    .filter((n): n is number => n !== null);
  if (scores.length < 4) return null;

  const last3 = scores.slice(0, 3);
  const last7 = scores.slice(0, 7);
  const prev7 = scores.slice(7, 14);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

  if (last3.every((n) => n >= 5)) {
    return {
      tone: 'back-off',
      title: 'El tendón te está pidiendo menos',
      body: 'Tres días seguidos con la rigidez matutina en 5/10 o más. Baja un nivel en las elevaciones de talón durante una semana y quita los saltos si los estabas haciendo.',
    };
  }
  if (last7.every((n) => n <= 1) && prev7.length >= 4 && avg(prev7) <= 2) {
    return {
      tone: 'level-up',
      title: 'Toca subir el listón',
      body: 'Llevas una semana entera con el Aquiles a 1/10 o menos. Sube un nivel en el ejercicio principal de tobillo o añade 2-3 kg a la mochila.',
    };
  }
  if (prev7.length >= 4 && avg(last7) < avg(prev7) - 0.5) {
    return {
      tone: 'ok',
      title: 'Vas en la buena dirección',
      body: 'La rigidez de por las mañanas ha bajado respecto a la semana pasada. Sigue igual, sin tener prisa por subir carga.',
    };
  }
  if (prev7.length >= 4 && avg(last7) > avg(prev7) + 0.8) {
    return {
      tone: 'watch',
      title: 'Ojo, está subiendo',
      body: 'La rigidez matutina va a más que la semana pasada. Revisa si has metido más partidos de la cuenta o has subido carga demasiado rápido.',
    };
  }
  return null;
}
