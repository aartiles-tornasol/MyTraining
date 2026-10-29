import { EXERCISES } from './exercises';
import { SESSIONS, WEEKLY_ROTATION } from './sessions';
import { ZONES } from './zones';
import type { ZoneKey } from './zones';
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
  hamstring: number | null;
  piriformis: number | null;
  pubic: number | null;
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
  /**
   * Lo que el dolor de hoy le ha hecho a la sesión. Se separa de los avisos
   * porque un día que no se entrena «hoy se quita el puente a una pierna» no
   * dice nada, mientras que lo de ir al fisio sigue valiendo igual.
   */
  changes: string[];
  warnings: string[];
}

/** Loaded tendon work that a sore Achilles should not be doing today. */
const HEAVY_TENDON = new Set([
  'calf-raise-single', 'heel-drop-step', 'calf-raise-floor',
  'pogo-hops', 'lateral-bound', 'skater-hold', 'split-step', 'toe-walk',
]);

/** Sentinel for "never done": sorts last and always clears the 48 h gate. */
const NEVER = Number.MAX_SAFE_INTEGER;

function lastDoneIndex(history: DayInput['history'], key: string): number {
  const i = history.findIndex((h) => h.sessionKey === key);
  return i === -1 ? NEVER : i;
}

function daysSinceSession(history: DayInput['history'], today: string, pred: (k: string) => boolean) {
  const hit = history.find((h) => pred(h.sessionKey));
  return hit ? daysBetween(hit.date, today) : NEVER;
}

/**
 * What each zone takes out of the day's session once it hurts enough, and how
 * that is explained. The thresholds are deliberately different: an irritated
 * adductor tolerates less than a piriformis that only dislikes being stretched.
 *
 * Each zone has three thresholds, the same three the Achilles has had all
 * along. Until now the others only had the first one, so a 9/10 adductor still
 * got served a heavy session with four exercises quietly removed — the plan
 * never changed, only its contents. They now steer the day as well:
 *
 * - `from`       quita los ejercicios que cargan la zona.
 * - `lightFrom`  no se hace sesión pesada hoy; se va a una ligera.
 * - `unloadFrom` el día entero pasa a descarga, como el Aquiles a 6/10.
 */
interface ZoneRule {
  field: 'adductor' | 'hamstring' | 'piriformis' | 'pubic';
  name: string;
  from: number;
  lightFrom: number;
  unloadFrom: number;
  drop: string[];
  /**
   * Lo que se mantiene a propósito pese al dolor, y por qué. Solo se cuenta si
   * de verdad está en la sesión de hoy: explicar que algo «se queda» cuando no
   * estaba es tan confuso como no explicar nada.
   */
  keeps?: { exercise: string; note: string };
}

/** Above this, no amount of swapping exercises is the right answer. */
const SEE_A_PHYSIO = 7;

/**
 * Por debajo de esto lo que queda ya no es una sesión. Quitar lo que carga una
 * zona irritada puede dejar «Fuerza B» en un solo ejercicio, y servir ese resto
 * como si fuera el entrenamiento del día es peor que decir que hoy se descarga.
 */
const MIN_ITEMS = 3;

const ZONE_RULES: ZoneRule[] = [
  {
    field: 'adductor',
    name: 'Aductores',
    from: 4,
    lightFrom: 5,
    unloadFrom: 7,
    // Todo lo que tira del aductor con carga, incluidos los aterrizajes
    // laterales. El isométrico con cojín no está: es el que calma la zona.
    drop: [
      'copenhagen-long', 'copenhagen-short', 'side-lying-adduction',
      'cossack-squat', 'lateral-lunge', 'lateral-bound', 'skater-hold',
    ],
    keeps: { exercise: 'adductor-squeeze', note: 'El isométrico con cojín se queda, que es el que alivia' },
  },
  {
    field: 'hamstring',
    name: 'Isquiotibiales',
    from: 4,
    lightFrom: 5,
    unloadFrom: 7,
    // Peso muerto y balanceos cargan el isquio a máxima longitud, que es lo que
    // odia cuando está irritado. El puente a dos piernas se queda porque
    // trabaja en corto y suele aliviar; el de una pierna ya no, que ahí el
    // isquio aguanta el cuerpo entero y es la forma clásica de pasarse.
    drop: ['single-leg-rdl', 'leg-swings', 'single-leg-bridge'],
    keeps: { exercise: 'glute-bridge', note: 'El puente a dos piernas se queda, que trabaja en corto y suele aliviar' },
  },
  {
    field: 'piriformis',
    name: 'Piramidal',
    from: 5,
    lightFrom: 6,
    unloadFrom: 8,
    // Estirarlo fuerte lo empeora, y la almeja y el hip airplane lo cargan en
    // rotación, que es justo lo que no tolera. Las rotaciones 90/90 se quedan:
    // son movilidad suave y son la base de la sesión de descarga.
    drop: ['figure-4-stretch', 'clamshell-band', 'hip-airplane'],
    keeps: { exercise: 'hip-90-90', note: 'Las rotaciones 90/90 se quedan, que son movilidad suave' },
  },
  {
    field: 'pubic',
    name: 'Pubis',
    from: 4,
    lightFrom: 5,
    unloadFrom: 7,
    // Resisted adduction and hard changes of direction are what wind up the
    // pubic symphysis; the cushion isometric is the one thing that settles it.
    drop: [
      'copenhagen-long', 'copenhagen-short', 'side-lying-adduction',
      'cossack-squat', 'lateral-lunge', 'lateral-bound', 'skater-hold',
    ],
    keeps: { exercise: 'adductor-squeeze', note: 'El isométrico con cojín se mantiene, que es el que calma la zona' },
  },
];

/** «a», «a y b», «a, b y c»: como se lee una lista en castellano. */
function listOf(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1];
}

const exerciseName = (key: string) => EXERCISES[key]?.name ?? key;

/** Una zona que hoy pesa, con su puntuación. */
interface SoreZone { rule: ZoneRule; score: number }

export function planDay(input: DayInput): DayPlan {
  const week = weekNumber(input.startDate, input.today);
  const phase = phaseForWeek(week);
  const am = input.achillesAM;
  const changes: string[] = [];
  const warnings: string[] = [];

  const doneToday = input.history.some((h) => h.date === input.today);
  const heavyGapDays = daysSinceSession(input.history, input.today, (k) => SESSIONS[k]?.heavy);
  const canGoHeavy = heavyGapDays >= 2;

  /* Las zonas que hoy duelen lo suficiente, de la que más a la que menos: la
     peor es la que explica la sesión. */
  const sore: SoreZone[] = ZONE_RULES
    .map((rule) => ({ rule, score: input[rule.field] }))
    .filter((z): z is SoreZone => z.score !== null && z.score >= z.rule.from)
    .sort((a, b) => b.score - a.score);

  /* Lo que hoy se quita de cualquier sesión. */
  const drop = new Set(sore.flatMap((z) => z.rule.drop));
  const keep = (items: SessionItem[]) => items.filter((i) => !drop.has(i.exercise));

  /** La sesión tal y como la deja el modo del día, antes de quitar por zonas. */
  const rawItems = (key: string, m: SessionMode) => {
    const items = SESSIONS[key].items[phase];
    if (m === 'suave') return softenForTendon(items);
    if (m === 'descarga') return items.filter((i) => !HEAVY_TENDON.has(i.exercise));
    return items;
  };

  /** El modo que le toca a una sesión: solo las pesadas se suavizan. */
  const modeFor = (key: string): SessionMode =>
    am !== null && am >= 4 && SESSIONS[key].heavy ? 'suave' : 'normal';

  const unload = sore.find((z) => z.score >= z.rule.unloadFrom);
  const blockHeavy = sore.find((z) => z.score >= z.rule.lightFrom);

  // Least-recently-done first, so the rotation self-corrects after missed days.
  const byStaleness = [...WEEKLY_ROTATION].sort(
    (a, b) => lastDoneIndex(input.history, b) - lastDoneIndex(input.history, a),
  );
  /* «Ligera» no es «día libre»: la descarga está en la rotación y no es pesada,
     así que sin este filtro acababa saliendo ella por ser la más rancia. */
  const lightest = () =>
    byStaleness.find((k) => !SESSIONS[k].heavy && k !== 'descarga') ?? 'descarga';

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
  } else if (unload) {
    sessionKey = 'descarga';
    mode = 'descarga';
    reason =
      unload.rule.name + ' en ' + unload.score + '/10. Con una zona así no se carga nada: hoy toca ' +
      'descarga — movilidad y respiración — y mañana se vuelve a mirar.';
  } else if (input.playingToday) {
    sessionKey = lightest();
    reason =
      'Hoy juegas, así que el trabajo pesado se aparta para no llegar cansado a la pista. ' +
      'Esta sesión es corta y prepara sin fatigar. No te olvides del calentamiento antes de jugar.';
  } else if (blockHeavy && SESSIONS[byStaleness[0]]?.heavy) {
    sessionKey = lightest();
    reason =
      'Por rotación tocaba fuerza pesada, pero con ' + blockHeavy.rule.name.toLowerCase() + ' en ' +
      blockHeavy.score + '/10 hoy se va a una sesión ligera.';
  } else if (!canGoHeavy) {
    sessionKey = lightest();
    reason =
      'Ayer hiciste fuerza pesada. El tendón necesita 48 h entre sesiones duras para adaptarse, ' +
      'así que hoy toca una sesión de las ligeras.';
  } else {
    sessionKey = byStaleness[0];
    const s = SESSIONS[sessionKey];
    reason = s.heavy
      ? heavyGapDays === NEVER
        ? 'No juegas hoy y aún no has hecho ninguna sesión pesada: buen momento para empezar a cargar.'
        : 'No juegas hoy y han pasado ' + heavyGapDays + ' días desde la última sesión pesada: ' +
          'buen momento para cargar de verdad.'
      : 'Toca ' + s.name.toLowerCase() + ' según la rotación de la semana.';
  }

  if (sessionKey === 'descarga') mode = 'descarga';

  if (mode === 'normal' && modeFor(sessionKey) === 'suave') {
    mode = 'suave';
    reason +=
      ' Como el Aquiles está en ' + am + '/10, hoy se cambia el trabajo pesado de gemelo por isométricos.';
  }

  let items = keep(rawItems(sessionKey, mode));

  /* Si lo que hay que quitar deja la sesión en nada, servir el resto como si
     fuera el entrenamiento del día es mentir. Antes de rendirse y descargar se
     busca otra sesión de la rotación que esa zona no cargue: un aductor
     irritado en un día de fuerza pesada no necesita el día libre, necesita la
     sesión de tobillo. */
  if (mode !== 'descarga' && items.length < MIN_ITEMS) {
    const left = items.length;
    const leftover =
      left === 0 ? 'no quedaba ningún ejercicio'
        : left === 1 ? 'solo quedaba 1 ejercicio'
          : 'solo quedaban ' + left + ' ejercicios';
    const canHeavy = canGoHeavy && !blockHeavy;
    const alt = byStaleness.find(
      (k) =>
        k !== sessionKey &&
        k !== 'descarga' &&
        (canHeavy || !SESSIONS[k].heavy) &&
        keep(rawItems(k, modeFor(k))).length >= MIN_ITEMS,
    );
    if (alt) {
      sessionKey = alt;
      mode = modeFor(alt);
      items = keep(rawItems(alt, mode));
      reason += ' Con lo que hay que quitar hoy, de esa sesión ' + leftover +
        ', así que hoy toca ' + SESSIONS[alt].name + ', que se queda en ' +
        items.length + ' ejercicios.';
    } else {
      sessionKey = 'descarga';
      mode = 'descarga';
      items = keep(rawItems(sessionKey, mode));
      reason += ' Con lo que hay que quitar hoy, de esa sesión ' + leftover +
        ', y ninguna otra de la rotación se salva, así que se cambia por la de descarga.';
    }
  }

  /* Lo que de verdad se ha quitado de la sesión que se va a hacer: un aviso que
     diga «hoy fuera los Copenhagen» cuando la sesión no los llevaba no es un
     aviso, es ruido. */
  const removed = new Set(
    rawItems(sessionKey, mode).filter((i) => drop.has(i.exercise)).map((i) => i.exercise),
  );

  const stays = new Set(items.map((i) => i.exercise));
  for (const { rule, score } of sore) {
    const took = rule.drop.filter((k) => removed.has(k));
    if (took.length > 0) {
      /* Con dos puntos y el nombre tal cual: «hoy se queda fuera puente a una
         pierna» pide un artículo que depende del género de cada ejercicio. */
      const kept = rule.keeps && stays.has(rule.keeps.exercise) ? ' ' + rule.keeps.note + '.' : '';
      changes.push(
        rule.name + ' en ' + score + '/10. Hoy se ' + (took.length === 1 ? 'quita' : 'quitan') +
        ': ' + listOf(took.map(exerciseName)) + '.' + kept,
      );
    } else if (mode !== 'descarga') {
      changes.push(rule.name + ' en ' + score + '/10: nada de lo de hoy carga esa zona.');
    }
    if (score >= SEE_A_PHYSIO) {
      warnings.push(
        rule.name + ' en ' + score + '/10 es mucho. Si sigue así varios días, que lo vea un fisio ' +
        'antes de seguir cargando.',
      );
    }
  }

  const suggestExtras: string[] = [];
  if (input.playingToday) suggestExtras.push('calentamiento', 'vuelta-calma');

  if (doneToday) {
    changes.push('Ya has entrenado hoy. Puedes repetir, pero no hace falta.');
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
    changes,
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

/* ── Trend per zone ─────────────────────────────────────────────────────── */

export interface ZoneAlert {
  zone: string;
  tone: 'watch' | 'back-off';
  text: string;
}

/**
 * The Achilles has readTrend() to itself because it steers the whole programme.
 * The other zones only need answering one question: is this one getting worse?
 * Three bad days in a row, or a clear jump on last week, and it says so.
 */
export function readZoneAlerts(
  checks: { day: string; scores: Partial<Record<ZoneKey, number | null>> }[],
): ZoneAlert[] {
  const out: ZoneAlert[] = [];
  for (const zone of ZONES) {
    if (zone.column === 'achilles_am') continue;
    const scores = checks
      .map((c) => c.scores[zone.column])
      .filter((n): n is number => n !== null && n !== undefined);
    if (scores.length < 4) continue;

    const last3 = scores.slice(0, 3);
    const last7 = scores.slice(0, 7);
    const prev7 = scores.slice(7, 14);
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

    if (last3.length === 3 && last3.every((n) => n >= 5)) {
      out.push({
        zone: zone.short,
        tone: 'back-off',
        text: zone.label + ': tres días seguidos en 5/10 o más. Baja la carga de esa zona esta semana ' +
          'y, si no cede, que lo vea un fisio.',
      });
    } else if (prev7.length >= 4 && mean(last7) > mean(prev7) + 0.8) {
      out.push({
        zone: zone.short,
        tone: 'watch',
        text: zone.label + ': va a más que la semana pasada. Mira si coincide con más partidos o con ' +
          'haber subido carga.',
      });
    }
  }
  return out;
}
