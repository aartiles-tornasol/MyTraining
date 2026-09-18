-- MyTraining schema. One athlete, one row in profile, everything else keyed by day.

CREATE TABLE IF NOT EXISTS profile (
  id           integer PRIMARY KEY DEFAULT 1,
  start_date   date NOT NULL DEFAULT CURRENT_DATE,
  height_cm    integer,
  weight_kg    numeric(5,2),
  birth_year   integer,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_single_row CHECK (id = 1)
);

-- One row per day: the morning pain check and whether a match is planned.
CREATE TABLE IF NOT EXISTS daily_check (
  day           date PRIMARY KEY,
  achilles_am   smallint CHECK (achilles_am BETWEEN 0 AND 10),
  adductor      smallint CHECK (adductor BETWEEN 0 AND 10),
  piriformis    smallint CHECK (piriformis BETWEEN 0 AND 10),
  shoulder      smallint CHECK (shoulder BETWEEN 0 AND 10),
  playing_today boolean NOT NULL DEFAULT false,
  played        boolean NOT NULL DEFAULT false,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_log (
  id           bigserial PRIMARY KEY,
  day          date NOT NULL,
  session_key  text NOT NULL,
  phase        smallint NOT NULL,
  week         smallint NOT NULL,
  mode         text NOT NULL DEFAULT 'normal',
  duration_s   integer,
  completed    boolean NOT NULL DEFAULT false,
  rpe          smallint CHECK (rpe BETWEEN 1 AND 10),
  pain_during  smallint CHECK (pain_during BETWEEN 0 AND 10),
  note         text,
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz
);

CREATE INDEX IF NOT EXISTS session_log_day_idx ON session_log (day DESC);
CREATE INDEX IF NOT EXISTS session_log_completed_idx ON session_log (completed, day DESC);

CREATE TABLE IF NOT EXISTS set_log (
  id              bigserial PRIMARY KEY,
  session_log_id  bigint NOT NULL REFERENCES session_log (id) ON DELETE CASCADE,
  exercise_key    text NOT NULL,
  set_index       smallint NOT NULL,
  reps            smallint,
  hold_s          smallint,
  load_kg         numeric(5,1),
  skipped         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS set_log_exercise_idx ON set_log (exercise_key, created_at DESC);

-- How far up each exercise's progression ladder the athlete has moved, and the
-- load last used, so the player can pre-fill the weight.
CREATE TABLE IF NOT EXISTS exercise_progress (
  exercise_key  text PRIMARY KEY,
  level_offset  smallint NOT NULL DEFAULT 0,
  load_kg       numeric(5,1),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO profile (id, start_date, height_cm, weight_kg, birth_year)
VALUES (1, CURRENT_DATE, 172, 75, 1974)
ON CONFLICT (id) DO NOTHING;
