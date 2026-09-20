'use server';

import { revalidatePath } from 'next/cache';
import { ready, exec } from './db';
import { todayISO } from './dates';

export interface CheckInput {
  day?: string;
  achillesAM?: number | null;
  adductor?: number | null;
  hamstring?: number | null;
  piriformis?: number | null;
  pubic?: number | null;
  shoulder?: number | null;
  playingToday?: boolean;
  played?: boolean;
  note?: string | null;
}

/** Upsert the day's pain check. Only the fields passed in are touched. */
export async function saveCheck(input: CheckInput): Promise<{ ok: boolean }> {
  const day = input.day ?? todayISO();
  const ok = await exec(
    `INSERT INTO daily_check
        (day, achilles_am, adductor, hamstring, piriformis, pubic, shoulder, playing_today, played, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, false), COALESCE($9, false), $10)
     ON CONFLICT (day) DO UPDATE SET
        achilles_am   = COALESCE(EXCLUDED.achilles_am,   daily_check.achilles_am),
        adductor      = COALESCE(EXCLUDED.adductor,      daily_check.adductor),
        hamstring     = COALESCE(EXCLUDED.hamstring,     daily_check.hamstring),
        piriformis    = COALESCE(EXCLUDED.piriformis,    daily_check.piriformis),
        pubic         = COALESCE(EXCLUDED.pubic,         daily_check.pubic),
        shoulder      = COALESCE(EXCLUDED.shoulder,      daily_check.shoulder),
        playing_today = COALESCE($8, daily_check.playing_today),
        played        = COALESCE($9, daily_check.played),
        note          = COALESCE(EXCLUDED.note,          daily_check.note),
        updated_at    = now()`,
    [
      day,
      input.achillesAM ?? null,
      input.adductor ?? null,
      input.hamstring ?? null,
      input.piriformis ?? null,
      input.pubic ?? null,
      input.shoulder ?? null,
      input.playingToday ?? null,
      input.played ?? null,
      input.note ?? null,
    ],
  );
  revalidatePath('/');
  revalidatePath('/progreso');
  return { ok };
}

export interface SetInput {
  exerciseKey: string;
  setIndex: number;
  reps?: number | null;
  holdS?: number | null;
  loadKg?: number | null;
  skipped?: boolean;
}

export interface SessionInput {
  day?: string;
  sessionKey: string;
  phase: number;
  week: number;
  mode: string;
  durationS: number;
  rpe?: number | null;
  painDuring?: number | null;
  note?: string | null;
  sets: SetInput[];
}

/**
 * The player buffers the whole session on the phone and posts it once, so a
 * flaky connection on the roof terrace cannot lose half a workout.
 */
export async function saveSession(input: SessionInput): Promise<{ ok: boolean; id?: string }> {
  const pool = await ready();
  if (!pool) return { ok: false };
  const day = input.day ?? todayISO();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO session_log
          (day, session_key, phase, week, mode, duration_s, completed, rpe, pain_during, note, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9, now())
       RETURNING id`,
      [
        day, input.sessionKey, input.phase, input.week, input.mode,
        input.durationS, input.rpe ?? null, input.painDuring ?? null, input.note ?? null,
      ],
    );
    const id = rows[0].id;
    for (const s of input.sets) {
      await client.query(
        `INSERT INTO set_log
            (session_log_id, exercise_key, set_index, reps, hold_s, load_kg, skipped)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, s.exerciseKey, s.setIndex, s.reps ?? null, s.holdS ?? null, s.loadKg ?? null, s.skipped ?? false],
      );
      if (s.loadKg != null && !s.skipped) {
        await client.query(
          `INSERT INTO exercise_progress (exercise_key, load_kg)
           VALUES ($1, $2)
           ON CONFLICT (exercise_key) DO UPDATE
             SET load_kg = EXCLUDED.load_kg, updated_at = now()`,
          [s.exerciseKey, s.loadKg],
        );
      }
    }
    await client.query('COMMIT');
    revalidatePath('/');
    revalidatePath('/progreso');
    return { ok: true, id: String(id) };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[saveSession]', err);
    return { ok: false };
  } finally {
    client.release();
  }
}

export async function setLevelOffset(exerciseKey: string, offset: number) {
  const clamped = Math.max(-2, Math.min(2, Math.round(offset)));
  const ok = await exec(
    `INSERT INTO exercise_progress (exercise_key, level_offset)
     VALUES ($1, $2)
     ON CONFLICT (exercise_key) DO UPDATE
       SET level_offset = EXCLUDED.level_offset, updated_at = now()`,
    [exerciseKey, clamped],
  );
  revalidatePath('/');
  revalidatePath('/ejercicios');
  return { ok };
}

export async function updateProfile(input: {
  startDate?: string;
  heightCm?: number | null;
  weightKg?: number | null;
}) {
  const ok = await exec(
    `INSERT INTO profile (id, start_date, height_cm, weight_kg)
     VALUES (1, COALESCE($1, CURRENT_DATE), $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       start_date = COALESCE($1, profile.start_date),
       height_cm  = COALESCE($2, profile.height_cm),
       weight_kg  = COALESCE($3, profile.weight_kg),
       updated_at = now()`,
    [input.startDate ?? null, input.heightCm ?? null, input.weightKg ?? null],
  );
  revalidatePath('/');
  revalidatePath('/ajustes');
  return { ok };
}
