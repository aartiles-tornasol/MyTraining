# MyTraining

App de entrenamiento en casa pensada para una cosa concreta: **jugar al pickleball
tres veces por semana a los 52 años sin que lo paguen el Aquiles, los aductores y el
piramidal**. Sin gimnasio, sin material caro y sin pasar de 20-25 minutos al día.

No es una app genérica de rutinas. El programa está construido alrededor de un dato:
la **rigidez del tendón de Aquiles al levantarse por la mañana**, que es la señal que
mejor distingue una tendinopatía que va a mejor de una que va a peor. Ese número
decide cada día qué sesión toca y con cuánta carga.

## Qué hace

- **Sesión del día adaptativa.** Cada mañana puntúas Aquiles, aductores y piramidal
  de 0 a 10 y marcas si juegas. Con eso la app elige la sesión, quita lo que no toca
  y te explica en una frase por qué.
- **Ejercicios animados.** Cada uno de los 46 ejercicios se dibuja como una figura
  articulada en SVG que ejecuta el movimiento en bucle, con el tempo real, el músculo
  objetivo resaltado y una flecha de dirección. Nada de vídeos que se caen ni fotos
  ambiguas.
- **Reproductor a pantalla completa.** Temporizador con anillo, avisos de sonido y
  vibración, pantalla que no se apaga, registro de peso por ejercicio y ficha de
  ejecución a un toque.
- **Progreso.** Tendencia de la rigidez matutina con media de 7 días, constancia de
  las últimas 4 semanas y evolución de la carga en el ejercicio principal.
- **PWA.** Se instala en la pantalla de inicio del iPhone y se ve como una app nativa.

## El programa

Doce semanas en tres fases, cinco sesiones por semana en rotación.

| Fase | Semanas | Objetivo |
|------|---------|----------|
| 1 | 1-4 | Calmar el tendón: isométricos largos y carga en rango neutro. Sin saltos. |
| 2 | 5-8 | Carga pesada y lenta: talón a una pierna con mochila, Copenhagen, sóleo con peso. |
| 3 | 9-12 | Elasticidad: pogos, saltos laterales y split-steps, manteniendo la fuerza. |

Las cinco sesiones son **Fuerza A** (tobillo y cadena posterior), **Fuerza B**
(piernas y aductores), **Tendón**, **Cadera y core** y **Descarga**, más un
**calentamiento** pre-partido de 7 minutos y una **vuelta a la calma** de 6.

### Reglas que aplica sola

- Nunca dos sesiones pesadas con menos de 48 h entre ellas.
- Los días que juegas, el trabajo pesado se aparta.
- Aquiles a 4-5/10 por la mañana → la carga pesada de gemelo se cambia por isométricos.
- Aquiles a 6/10 o más → día de descarga, sin carga en el tendón.
- Aductores a 4/10 o más → fuera Copenhagen y trabajo lateral fuerte.
- Piramidal a 5/10 o más → fuera el estiramiento de figura 4, que lo empeora.
- Tres días seguidos por encima de 5/10 → aviso para bajar un nivel.

## Material

Mancuernas de hasta 5 kg, bandas elásticas, una mochila que puedas cargar, una silla,
un escalón, una pared y una esterilla. Nada más.

## Stack

Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, PostgreSQL 17.
Las animaciones son un motor propio de cinemática directa en SVG, sin dependencias.

## Desarrollo

```bash
npm install
cp .env.example .env.local     # apunta DATABASE_URL a tu Postgres
npm run dev
```

La app arranca sin base de datos: el programa se ve entero, simplemente no guarda
nada y lo dice en pantalla. Las migraciones de `db/migrations/` se aplican solas en
el primer arranque contra una base de datos vacía.

## Despliegue en Dokploy

**Opción A — Docker Compose.** Crea una aplicación de tipo Compose apuntando a este
repositorio y al `docker-compose.yml` de la raíz. Levanta la app y su Postgres con
volumen persistente.

**Opción B — Dockerfile + base de datos de Dokploy.** Crea una base de datos
PostgreSQL en Dokploy, luego una aplicación que construya el `Dockerfile` de la raíz,
y en sus variables de entorno pon:

```
DATABASE_URL=postgres://usuario:contraseña@host-de-la-bd:5432/mytraining
TZ=Atlantic/Canary
```

La imagen usa la salida `standalone` de Next, corre como usuario sin privilegios,
expone el puerto 3000 y trae healthcheck contra `/api/health`, que responde `200`
cuando la base de datos está accesible.

Después, en el iPhone: abre la URL en Safari, Compartir → **Añadir a pantalla de
inicio**.

## Aviso

Esto no sustituye a un fisioterapeuta. El programa sigue lo que mejor funciona en
tendinopatía de Aquiles y prevención de lesiones de ingle, pero nadie te ha explorado.
Si el dolor pasa de 6/10 varios días seguidos, si aparece un bulto en el tendón o si
notas dolor que baja por la pierna, que lo vea un profesional.
