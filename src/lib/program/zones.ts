/**
 * The zones scored every morning, in the order they are asked. One definition
 * for the whole app: the check card renders from this, the plan reads it to
 * decide what to drop, and Progreso charts it. Adding a zone here and a column
 * in the database is all it should take.
 *
 * `column` is the daily_check column, `input` the field saveCheck() expects.
 */
export type ZoneKey = 'achilles_am' | 'adductor' | 'hamstring' | 'piriformis' | 'pubic';

export interface Zone {
  column: ZoneKey;
  /** Columna equivalente en session_log: el dolor sentido al entrenar. */
  sessionColumn: 'pain_achilles' | 'pain_adductor' | 'pain_hamstring' | 'pain_piriformis' | 'pain_pubic';
  input: 'achillesAM' | 'adductor' | 'hamstring' | 'piriformis' | 'pubic';
  /** Full name, as asked in the morning check. */
  label: string;
  /** Short name for summaries, warnings and charts. */
  short: string;
}

export const ZONES: Zone[] = [
  { column: 'achilles_am', sessionColumn: 'pain_achilles',   input: 'achillesAM', label: 'Tendones de Aquiles', short: 'Aquiles' },
  { column: 'adductor',    sessionColumn: 'pain_adductor',   input: 'adductor',   label: 'Aductores / ingle',   short: 'Aductores' },
  { column: 'hamstring',   sessionColumn: 'pain_hamstring',  input: 'hamstring',  label: 'Isquiotibiales',      short: 'Isquios' },
  { column: 'piriformis',  sessionColumn: 'pain_piriformis', input: 'piriformis', label: 'Piramidal / glúteo',  short: 'Piramidal' },
  { column: 'pubic',       sessionColumn: 'pain_pubic',      input: 'pubic',      label: 'Pubis / pubalgia',    short: 'Pubis' },
];

export const zoneByColumn = (c: ZoneKey) => ZONES.find((z) => z.column === c)!;
