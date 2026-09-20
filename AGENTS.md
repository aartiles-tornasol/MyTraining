<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MyTraining

App personal de un solo usuario: programa de entrenamiento para tendinopatía de
Aquiles y prevención de lesiones de ingle, pensada para el móvil. Next 16 con
`output: standalone`, Postgres, sin ORM (`pg` a pelo) y sin dependencias de UI.

## Ramas y despliegue

`develop` es donde se trabaja, contra el Postgres local de `docker compose`.
`main` es lo que corre en producción; los cambios llegan por merge desde
`develop` **cuando el usuario lo pida**, nunca por iniciativa propia.

El webhook de GitHub **no llega al servidor** (Dokploy no es accesible desde
Internet), así que el toggle de Autodeploy no sirve de nada: un push no despliega.
Después de mergear a `main` hay que lanzar el despliegue a mano:

```bash
curl -X POST -H "x-api-key: $DOKPLOY_API_KEY" -H 'Content-Type: application/json' \
  -d '{"composeId":"<composeId>"}' "$DOKPLOY_URL/api/compose.deploy"
```

Las credenciales y los identificadores están en `.env.dokploy` (fuera de git).
El despliegue tarda un par de minutos; se sigue con `compose.one` hasta que
`composeStatus` sea `done`, y se comprueba con `/api/health`, que responde
`{"ok":true,"database":"up"}` cuando la base de datos está accesible.

Un dominio añadido en Dokploy **después** de desplegar no existe para Traefik
hasta que se vuelve a desplegar.

## Datos de producción en local

```bash
node tools/sync-prod-db.mjs
```

Copia la base de producción sobre la local. No necesita SSH: usa la terminal de
contenedor que Dokploy expone por WebSocket. Solo lee de producción.

## Migraciones

`db/migrations/NNN_*.sql`, aplicadas solas en el primer acceso a la base
(`ready()` en `src/lib/db.ts`), dentro de una transacción y anotadas en
`_migrations`. Columnas nuevas **siempre nulables**: hay histórico guardado sin
ellas. Si una migración falla, `/api/health` responde `database: down`, que es la
forma más rápida de detectarlo tras desplegar.

## Las zonas del chequeo diario

Las cinco zonas que se puntúan cada mañana viven en `src/lib/program/zones.ts`, y
de ahí leen la tarjeta del chequeo, el planificador y Progreso. Añadir una zona
son dos cosas: una entrada ahí y una columna en `daily_check`.

Lo que se puntúa es **dolor o molestia**, 0-10, y la interfaz lo dice
explícitamente. Cada zona retira ejercicios de la sesión del día a partir de su
umbral; las reglas están juntas en `ZONE_RULES`, en `src/lib/program/plan.ts`.
Los umbrales y qué ejercicio sale con cada zona son criterio conservador, no
prescripción de un fisio: si el usuario dice otra cosa, manda él.

## Idioma

Todo lo que ve el usuario va en castellano, incluidos los textos de ejercicios y
avisos. El código, los comentarios y los mensajes de commit, en inglés.
