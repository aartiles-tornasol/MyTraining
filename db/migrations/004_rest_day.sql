-- Cerrar el día sin entrenar. El chequeo de dolor vale por sí solo: hay días
-- que no se entrena y el dato sigue siendo el que manda la carga de mañana,
-- así que la app tiene que poder aceptar «hoy no» sin perder la puntuación.
-- Nulable: el histórico anterior no distingue descanso elegido de día vacío.
ALTER TABLE daily_check ADD COLUMN IF NOT EXISTS rest_day boolean;
