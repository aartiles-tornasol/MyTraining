-- Two more places that flare up and were not being recorded: the hamstrings and
-- the pubic area (what the old pubalgia felt like). Same 0-10 scale as the rest
-- of the morning check, and nullable, because every check before today was
-- saved without them.
ALTER TABLE daily_check
  ADD COLUMN IF NOT EXISTS hamstring smallint CHECK (hamstring BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS pubic     smallint CHECK (pubic     BETWEEN 0 AND 10);
