-- El dolor durante la sesión se anotaba en una sola casilla, que en la práctica
-- era el Aquiles: el resto de zonas no tenían dónde ir. Ahora se puntúan las
-- mismas cinco que en el chequeo de la mañana. `pain_during` se mantiene, con
-- el peor valor de las cinco, para que el histórico anterior siga leyéndose.
ALTER TABLE session_log
  ADD COLUMN IF NOT EXISTS pain_achilles   smallint CHECK (pain_achilles   BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS pain_adductor   smallint CHECK (pain_adductor   BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS pain_hamstring  smallint CHECK (pain_hamstring  BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS pain_piriformis smallint CHECK (pain_piriformis BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS pain_pubic      smallint CHECK (pain_pubic      BETWEEN 0 AND 10);

-- La escala de esfuerzo de la pantalla va de 0 a 10, pero la tabla solo admitía
-- de 1 a 10: puntuar 0 en una vuelta a la calma hacía fallar el guardado entero
-- de la sesión. 0 es una respuesta legítima — no ha costado nada.
ALTER TABLE session_log DROP CONSTRAINT IF EXISTS session_log_rpe_check;
ALTER TABLE session_log ADD CONSTRAINT session_log_rpe_check CHECK (rpe BETWEEN 0 AND 10);
