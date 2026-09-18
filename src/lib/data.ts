import { q, q1, hasDatabase } from './db';
import { todayISO, addDays } from './dates';
import { planDay } from './program/plan';
import type { DayPlan } from './program/plan';

export interface Profile {
  start_date: string;
  height_cm: number | null;
  weight_kg: string | null;
  birth_year: number | null;
}

export interface DailyCheck {
  day: string;
  achilles_am: number | null;
  adductor: number | null;
  piriformis: number | null;
  shoulder: number | null;
  playing_today: boolean;
  played: boolean;
  note: string | null;
}

export interface SessionRow {
  id: string;
  day: string;
  session_key: string;
  phase: number;
  week: number;
  mode: string;
  duration_s: number | null;
  completed: boolean;
  rpe: number | null;
  pain_during: number | null;
}

const asDay = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : String(v);

export async function getProfile(): Promise<Profile> {
  const row = await q1<Profile>(
    'SELECT start_date, height_cm, weight_kg, birth_year FROM profile WHERE id = 1',
  );
  if (!row) return { start_date: todayISO(), height_cm: 172, weight_kg: '75', birth_year: 1974 };
  return { ...row, start_date: asDay(row.start_date) };
}

export async function getCheck(day: string): Promise<DailyCheck | null> {
  const row = await q1<DailyCheck>('SELECT * FROM daily_check WHERE day = $1', [day]);
  return row ? { ...row, day: asDay(row.day) } : null;
}

export async function getRecentChecks(days = 42): Promise<DailyCheck[]> {
  const rows = await q<DailyCheck>(
    'SELECT * FROM daily_check WHERE day >= $1 ORDER BY day DESC',
    [addDays(todayISO(), -days)],
  );
  return rows.map((r) => ({ ...r, day: asDay(r.day) }));
}

export async function getHistory(limit = 60): Promise<SessionRow[]> {
  const rows = await q<SessionRow>(
    `SELECT id, day, session_key, phase, week, mode, duration_s, completed, rpe, pain_during
       FROM session_log
      WHERE completed = true
      ORDER BY day DESC, id DESC
      LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, day: asDay(r.day), id: String(r.id) }));
}

export interface ProgressEntry { levelOffset: number; loadKg: number | null }

export async function getExerciseProgress(): Promise<Record<string, ProgressEntry>> {
  const rows = await q<{ exercise_key: string; level_offset: number; load_kg: string | null }>(
    'SELECT exercise_key, level_offset, load_kg FROM exercise_progress',
  );
  return Object.fromEntries(
    rows.map((r) => [
      r.exercise_key,
      { levelOffset: r.level_offset, loadKg: r.load_kg === null ? null : Number(r.load_kg) },
    ]),
  );
}

export interface TodayData {
  day: string;
  plan: DayPlan;
  check: DailyCheck | null;
  profile: Profile;
  history: SessionRow[];
  checks: DailyCheck[];
  progress: Record<string, ProgressEntry>;
  dbConfigured: boolean;
}

/** Everything the home screen and the player need, in one round trip. */
export async function getToday(): Promise<TodayData> {
  const day = todayISO();
  const [profile, check, history, checks, progress] = await Promise.all([
    getProfile(),
    getCheck(day),
    getHistory(30),
    getRecentChecks(42),
    getExerciseProgress(),
  ]);

  const plan = planDay({
    today: day,
    startDate: profile.start_date,
    playingToday: check?.playing_today ?? false,
    achillesAM: check?.achilles_am ?? null,
    adductor: check?.adductor ?? null,
    piriformis: check?.piriformis ?? null,
    history: history.map((h) => ({ date: h.day, sessionKey: h.session_key })),
  });

  return { day, plan, check, profile, history, checks, progress, dbConfigured: hasDatabase() };
}

/** Consecutive days, counting back from today, with a completed session. */
export function streakFrom(history: SessionRow[], today: string): number {
  const days = new Set(history.map((h) => h.day));
  let streak = 0;
  // Today not being done yet must not break a streak that is still alive.
  for (let i = days.has(today) ? 0 : 1; i < 400; i++) {
    if (!days.has(addDays(today, -i))) break;
    streak++;
  }
  return streak;
}

export interface WeekLoad { label: string; kg: number }

/** Heaviest load recorded per calendar week for one exercise. */
export async function getLoadByWeek(exerciseKey: string, weeks = 8): Promise<WeekLoad[]> {
  const rows = await q<{ wk: Date; kg: string }>(
    `SELECT date_trunc('week', s.day)::date AS wk, MAX(l.load_kg) AS kg
       FROM set_log l
       JOIN session_log s ON s.id = l.session_log_id
      WHERE l.exercise_key = $1
        AND l.load_kg IS NOT NULL
        AND l.skipped = false
        AND s.day >= $2
      GROUP BY 1
      ORDER BY 1`,
    [exerciseKey, addDays(todayISO(), -weeks * 7)],
  );
  return rows.map((r) => {
    const day = asDay(r.wk);
    const d = new Date(`${day}T12:00:00Z`);
    return { label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, kg: Number(r.kg) };
  });
}
