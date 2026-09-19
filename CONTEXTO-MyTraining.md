# Contexto para Claude Code — proyecto MyTraining

Este documento resume una sesión anterior de Claude (en la nube) en la que se
diseñó y construyó la app entera. Ahora el trabajo sigue en local, en un Mac con
OrbStack. **Léelo entero antes de tocar nada.**

---

## 1. Qué hay que hacer ahora

1. Clonar el repo (privado): `https://github.com/aartiles-tornasol/MyTraining`,
   rama **`claude/mytraining-app-9lcd2u`** (commit `03d2212`, 53 ficheros).
   La rama `main` no existe todavía: todo está en esa rama.
2. Levantarlo en local con el Docker del usuario (OrbStack), frontend + base de
   datos, con el `docker-compose.yml` que ya está en la raíz.
3. Probarlo a fondo en local, **incluido desde el iPhone por la red local**, que
   es donde de verdad se juzga esta app.
4. Cuando esté validado, desplegarlo en el Dokploy que el usuario tiene en su
   homelab.

El flujo habitual del usuario es exactamente ese: repo en local → docker-compose
en local → cuando funciona, a Dokploy.

---

## 2. Para quién es la app (esto manda sobre todo lo demás)

- Hombre, 52 años, 1,72 m, **75 kg** (hace un año pesaba más de 82).
- Jugaba al **pádel**; ahora juega al **pickleball unas 3 veces por semana**, en
  **días variables**, no fijos.
- **Molestias en los tendones de Aquiles**, y el dato clave: **tiene rigidez al
  levantarse por la mañana**. Eso no es simple sobrecarga, es el patrón típico de
  una **tendinopatía**, y es lo que cambió por completo el diseño del programa.
- Tirones ocasionales en **aductores** (él escribió "abductores", pero por el
  gesto lateral del pickleball son aductores) y a veces en el **piramidal**.
- **Hombro derecho** con historial; ahora está bien. Ya hace por su cuenta tres
  ejercicios de hombro con 3 kg por las mañanas, unos 7 minutos.
- Calentaba y estiraba antes de los partidos y algo menos al acabar.

### Restricciones que él puso

- **No quiere ir al gimnasio** y no quiere que se le proponga.
- **No tiene más tiempo libre** para hacer más deporte.
- **Máximo 20 minutos al día**, salvo que se le convenciera de lo contrario.
  Se acordó: **5 días por semana, con algún día de 25-30 min** (los de fuerza).
- Material disponible: **mancuernas de hasta 5 kg**, **bandas elásticas**, una
  **mochila** que puede cargar con peso, silla, escalón, pared, esterilla.
  Tiene **patio y azotea**, donde a veces hace ejercicios con la pala y una pelota.
- De momento **no quiere comprar nada**. Más adelante, si hace falta, lo hará.
  (Recomendación pendiente: hacia la semana 8, un chaleco lastrado de 50-80 € si
  la mochila se queda corta.)

### Decisiones que él tomó explícitamente

| Pregunta | Su respuesta |
|---|---|
| Cómo ver los ejercicios | **Animaciones SVG propias** (no vídeos ni fotos) |
| Dónde guardar los datos | **Postgres + API, sin login** |
| Estado del Aquiles | **Rigidez al levantarse por la mañana** |
| Días que juega | **Variables, no fijos** → la app debe dejar marcar "hoy juego" |
| Alcance extra | Calentamiento pre-partido, registro de molestias, vuelta a la calma |
| Frecuencia | **5 días/semana, con algún día de 25-30 min** |

### Requisitos de producto que él pidió

- Los ejercicios se hacen **en casa**.
- **Tiene que verse muy bien en el iPhone.**
- **Tiene que ser muy gráfica**, indicando perfectamente qué ejercicio toca.
- Nombre de app y repo: **MyTraining**, privado.

---

## 3. Criterio clínico sobre el que está construida

No lo cambies sin motivo; es el eje de la app.

- **La rigidez matutina del Aquiles es el instrumento de medida.** Es la señal que
  mejor distingue un tendón que mejora de uno que empeora. Él la puntúa de 0 a 10
  nada más levantarse y ese número decide la sesión y la carga del día.
- **Estirar el Aquiles en frío antes de jugar probablemente le estaba
  perjudicando**: un tendón necesita rigidez para devolver energía. El
  calentamiento lo sustituye por movilidad activa + isométricos, que además tienen
  efecto analgésico durante el partido. El estiramiento de gemelo/sóleo se movió a
  la vuelta a la calma, en caliente y suave.
- Regla de dolor: **hasta 5/10 durante el ejercicio es aceptable**; lo que importa
  es que la rigidez de la mañana siguiente no sea peor.
- El **rango completo desde el escalón** (heel drops) solo se introduce en fase 2
  y **solo si la rigidez matutina ya es ≤ 2/10**, porque en un tendón irritable
  ese rango lo empeora. Si el dolor es justo en la inserción del talón, se evita.
- El **piramidal no se estira fuerte**: se fortalece glúteo medio y rotadores. El
  estiramiento de figura 4 se quita si está irritado.
- Aductores: el ejercicio con más evidencia es el **Copenhagen** (reduce las
  lesiones de ingle casi a la mitad en los ensayos).
- La app **no sustituye a un fisio** y lo dice en Ajustes.

---

## 4. Qué se construyó

### Stack

Next.js 16 (App Router, Server Actions) · React 19 · Tailwind CSS 4 ·
PostgreSQL 17 · driver `pg` sin ORM. Sin librería de gráficas: son SVG propios.
Tema oscuro único, acento lima (color de la pelota de pickleball).

### Estructura

```
db/migrations/001_init.sql     esquema; se aplica solo al arrancar
src/app/                       page (Hoy), progreso, ejercicios[/key],
                               ajustes, sesion/[key], api/health,
                               manifest.ts, apple-icon.tsx
src/components/figure/         EL MOTOR DE ANIMACIÓN (ver abajo)
src/components/charts/         StiffnessChart, AdherenceStrip, LoadChart
src/components/                SessionPlayer, SessionCard, DailyCheckCard,
                               LevelPicker, ProfileForm, ui/
src/lib/program/               exercises.ts, sessions.ts, plan.ts, types.ts
src/lib/                       db.ts, data.ts, actions.ts, dates.ts,
                               feedback.ts, useWakeLock.ts
Dockerfile, docker-compose.yml, .env.example
```

### El motor de animación (lo más delicado del repo)

No son vídeos ni imágenes: es **cinemática directa** propia que dibuja una figura
humana articulada en SVG y la anima interpolando entre poses clave.

- `skeleton.ts` — modelo y convenciones de ángulos. **Léelas antes de tocar una
  pose.** Torso absoluto (0 = vertical), cadera absoluta, **rodilla = flexión**,
  **pie = dorsiflexión relativa a la tibia**, hombro absoluto, **codo = flexión**.
  Hay anclaje al suelo (`ground`, `floorY`, `groundOn`) y anclaje horizontal
  (`anchorX`) para que una elevación de talón pivote sobre la punta del pie y el
  cuerpo suba exactamente lo que debe. Helper `flat(hip, knee)` para dejar la
  planta horizontal.
- `animations.ts` — los 46 ejercicios como series de keyframes con tempo real,
  props (pared, escalón, silla, mancuerna, banda, mochila, pelota, pala,
  esterilla, flechas de dirección) y músculo objetivo resaltado.
- `anim.ts` — muestreo del bucle y **cálculo del viewBox** ajustado a la unión de
  todos los keyframes, para que los ejercicios tumbados llenen el encuadre.
- `Figure.tsx` — el render. Distingue vista lateral (dibuja nariz) de vista
  frontal (dibuja dos ojos y aclara las extremidades del lado lejano).

**Aviso**: en vista frontal el codo del brazo lejano flexiona con signo contrario
(el modelo es 2D). Hay presets `ARMS_*_F` para eso. Las poses se validaron
visualmente con capturas; si tocas alguna, vuelve a mirarla renderizada.

### El programa

12 semanas en 3 fases, 5 sesiones rotando:

| Fase | Semanas | Qué |
|---|---|---|
| 1 | 1-4 | Calmar: isométricos largos, carga en rango neutro (sin bajar del escalón). Sin saltos. |
| 2 | 5-8 | Carga pesada y lenta: talón a una pierna con mochila, Copenhagen, sóleo con peso. |
| 3 | 9-12 | Elasticidad: pogos, saltos laterales, split-steps, manteniendo la fuerza. |

Sesiones: **Fuerza A** (tobillo y cadena posterior), **Fuerza B** (piernas y
aductores), **Tendón**, **Cadera y core**, **Descarga**. Más **Calentamiento**
pre-partido (~8 min) y **Vuelta a la calma** (~7 min). Duraciones reales
calculadas: 19-27 min las de fuerza, 13-21 min el resto.

46 ejercicios, cada uno con: por qué está en SU programa, colocación, ejecución
paso a paso, errores típicos, regla de dolor y una escalera de 3 niveles. Los
niveles describen **la variante**, no las series/repes (las series las prescribe
la sesión). El usuario puede subir o bajar un nivel por ejercicio y se guarda.

### Reglas adaptativas (`src/lib/program/plan.ts`)

- Nunca dos sesiones pesadas con menos de **48 h** entre ellas.
- Si marca **"hoy juego"**, el trabajo pesado se aparta y se ofrece calentamiento
  y vuelta a la calma.
- Aquiles **4-5/10** por la mañana → la carga pesada de gemelo se cambia por
  isométricos ("versión suave").
- Aquiles **≥ 6/10** → día de **descarga**, sin carga en el tendón.
- Aductores **≥ 4/10** → fuera Copenhagen, cosaco y saltos laterales.
- Piramidal **≥ 5/10** → fuera el estiramiento de figura 4.
- Rotación por **la sesión menos reciente**, así se autocorrige si falta días.
- `readTrend()` avisa de bajar nivel (3 días ≥ 5/10) o de subirlo (7 días ≤ 1/10).
- Cada decisión se explica en pantalla en una frase, en lenguaje llano.

### Base de datos

Tablas: `profile` (una fila), `daily_check` (una por día), `session_log`,
`set_log`, `exercise_progress`, más `_migrations`. Las migraciones de
`db/migrations/` se aplican solas en el primer arranque contra una BD vacía.

**La app arranca sin base de datos**: si no hay `DATABASE_URL` el programa se ve
entero, simplemente no guarda y lo avisa en pantalla. No rompas eso.

### Detalles de la UI que importan

- PWA instalable; el icono de iOS se **genera en build** (`src/app/apple-icon.tsx`
  con `ImageResponse`) para que no haya binarios en el repo. El manifest usa el
  SVG. No metas PNGs al repo sin motivo.
- Reproductor a pantalla completa: anillo de temporizador, avisos de sonido
  (Web Audio) y vibración, **wake lock** para que no se apague la pantalla,
  registro de peso por ejercicio, ficha de ejecución a un toque.
- **Borrador en localStorage**: si recarga a mitad de sesión no pierde nada. La
  sesión se envía entera al final en una sola transacción, pensado para wifi malo
  en la azotea.
- Gráficas: tendencia de rigidez con media de 7 días y banda "zona buena" (0-2),
  constancia de 4 semanas, y carga por semana. La paleta se validó para fondo
  oscuro (`#7fa10d` y `#4a86d8` pasan las comprobaciones de contraste y de
  daltonismo; el lima brillante `#b9dd1f` se usa para series únicas).
- Todo en español.

---

## 5. Estado: qué está verificado y qué no

**Verificado** (con Postgres real y navegador de verdad, en producción):

- `npm run build` y `tsc --noEmit` limpios.
- Migraciones aplicadas solas contra una BD vacía.
- Todas las rutas responden 200.
- Flujo completo de sesión: trabajo → descanso con cuenta atrás → resumen →
  guardado → vuelta a Hoy con la racha actualizada. Los datos llegan a Postgres.
- El chequeo diario funciona y **la lógica adaptativa responde de verdad**: con
  Aquiles 2/10 y "hoy juego" dio *Tendón, 18 min*; al poner 7/10 cambió sola a
  *Descarga, 16 min*.
- Degradación sin `DATABASE_URL`.
- Las 46 animaciones revisadas una a una con capturas.

**NO verificado, a comprobar en local:**

- **El build de la imagen Docker** — en el contenedor anterior no había daemon.
  Es lo primero que hay que probar.
- **Safari en iOS real** — solo se probó en Chromium a 393×852. Hay que mirar
  safe areas, el wake lock, el audio (iOS necesita un toque previo para permitir
  sonido; ya está contemplado con `unlockAudio`) y la vibración (Safari iOS no
  soporta `navigator.vibrate`, por eso hay también aviso sonoro).
- Añadir a pantalla de inicio en el iPhone y ver el icono.

---

## 6. Cómo levantarlo en local

Con el Docker del Mac (OrbStack). El compose trae valores por defecto, no hace
falta crear ningún `.env`:

```bash
docker compose up --build
# → http://localhost:3000
```

Para probar desde el iPhone en la misma wifi: `ipconfig getifaddr en0` y abrir
`http://ESA_IP:3000` desde el móvil. El contenedor ya escucha en `0.0.0.0`.

Para iterar en código es más rápido levantar solo la BD y Next en local:

```bash
docker compose up -d db
cp .env.example .env.local   # ajustar host a localhost:5432
npm install && npm run dev
```

Para desplegar después en Dokploy: o bien una aplicación de tipo Compose
apuntando a este repo, o bien el `Dockerfile` con una base de datos de Dokploy y
`DATABASE_URL` + `TZ=Atlantic/Canary` en las variables de entorno. Healthcheck en
`/api/health`.

---

## 7. Cómo hablarle a este usuario

- Es técnico: tiene homelab con Dokploy y ha hecho otras apps. No hace falta
  explicarle Docker.
- Prefiere que le digas las cosas claras y con criterio, no una lista de opciones.
- Le importa mucho **que se vea bien en el iPhone** y **que quede claro qué
  ejercicio toca**. Si una decisión técnica va en contra de eso, no la tomes.
- Respeta el límite de tiempo: **20 minutos al día**. No amplíes el programa sin
  hablarlo.
