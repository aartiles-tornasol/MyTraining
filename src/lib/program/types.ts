export type Phase = 1 | 2 | 3;

export type Equipment =
  | 'ninguno' | 'mancuernas' | 'banda' | 'escalon' | 'silla'
  | 'mochila' | 'pared' | 'esterilla' | 'cojin' | 'pala';

export type PainSite = 'aquiles' | 'aductores' | 'piramidal' | 'hombro';

export interface ExerciseLevel {
  /** 1 is the easiest rung of the ladder. */
  n: number;
  name: string;
  /** Animation key, when this rung looks different from the base movement. */
  anim?: string;
  note?: string;
}

export interface Exercise {
  key: string;
  name: string;
  tagline: string;
  anim: string;
  equipment: Equipment[];
  targets: string[];
  /** Why this exercise earns its place in *this* programme. */
  why: string;
  setup: string[];
  execution: string[];
  mistakes: string[];
  /** Pain rule shown in the player for the irritable tissues. */
  painRule?: string;
  levels: ExerciseLevel[];
  unilateral: boolean;
}

export interface Work {
  reps?: number;
  holdSec?: number;
  timeSec?: number;
  /** Eccentric-pause-concentric, e.g. "3-1-2". */
  tempo?: string;
  perSide?: boolean;
}

export interface SessionItem {
  exercise: string;
  sets: number;
  work: Work;
  restSec: number;
  load?: string;
  cue?: string;
}

export type SessionKind =
  | 'fuerza' | 'tendon' | 'cadera' | 'descarga'
  | 'calentamiento' | 'calma' | 'pista';

export interface SessionDef {
  key: string;
  name: string;
  tagline: string;
  kind: SessionKind;
  minutes: number;
  focus: string[];
  /** Heavy sessions need 48 h between them and are never stacked on match day. */
  heavy: boolean;
  items: Record<Phase, SessionItem[]>;
}
