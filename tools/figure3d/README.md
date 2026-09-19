# La figura 3D

Las ilustraciones de los ejercicios se renderizan aquí, una sola vez, y se
sirven como imágenes planas. El móvil no ejecuta 3D: descodifica WebP de 4 KB.

## Por qué

El motor 2D anterior (`src/components/figure/`) resolvía todas las
articulaciones dentro del plano sagital. No podía expresar una rotación sobre
el eje vertical —que es el hip airplane entero— ni distinguir un tronco
inclinado 66° de un cuerpo tumbado, porque en ese modelo son el mismo dibujo.
Cambiar el estilo de pintado no arreglaba nada: hacía falta cambiar los datos.

Sigue ahí como respaldo para cualquier ejercicio que no tenga postura 3D.

## Cómo

```bash
blender -b -noaudio -P tools/figure3d/build.py -- --only hip-airplane   # ~15 s
blender -b -noaudio -P tools/figure3d/build.py -- --all                 # ~8 min
```

Opciones: `--size 320` (lado en píxeles), `--steps 5` (cuántos fotogramas se
interpolan entre cada par de posturas clave).

Salida en `public/fig3d/<ejercicio>/fNN.webp`, más dos manifiestos: uno JSON
junto a las imágenes y otro TypeScript en `src/lib/program/figure3d.ts`, que es
el que lee la app. **Los dos se regeneran solos: no los edites a mano.**

Después de renderizar hay que reconstruir la imagen de Docker, porque las
imágenes viajan dentro.

## Ficheros

- `rig.py` — el esqueleto. Convenciones de ángulos arriba del todo; léelas antes
  de tocar una postura. Lo importante: `orient` coloca el cuerpo respecto a la
  gravedad, y esa misma palabra se imprime en pantalla.
- `poses.py` — los 46 ejercicios. Dos o tres posturas clave cada uno.
- `scene.py` — luz, suelo, atrezo, cámara y materiales.
- `build.py` — el bucle de render y los manifiestos.

## Trampas que ya costaron tiempo

- **Un material por objeto, no por malla.** Todos los huesos reutilizan la misma
  malla; asignar el material a la malla repinta el cuerpo entero.
- **`spine` positivo es flexión hacia delante.** Se niega dentro del solver
  porque el tronco apunta hacia arriba y los miembros hacia abajo. Sin eso,
  todas las bisagras salen al revés y cuesta verlo.
- **La cámara es ortográfica y común a todos** salvo el azimut. Es deliberado:
  con escala compartida, un cuerpo tumbado ocupa la parte baja del encuadre. Si
  la ajustas por ejercicio, vuelves al problema original.
- **EEVEE funciona headless en macOS**, pese a lo que sugiere la documentación.

## Lo que falta

Atrezo colocado a mano y mejorable en el escalón y el step-up. Los brazos son
genéricos en varios ejercicios. No se dibuja el material pequeño: ni banda, ni
mancuerna, ni pala. Un solo 3D por ejercicio, sin variantes por nivel.

El render sale con cielo transparente, pero el suelo mide 14 m y con cámara
ortográfica llena el encuadre entero, así que en la práctica la imagen sigue
siendo un rectángulo opaco dentro de la tarjeta. Para que la tarjeta se vea por
detrás habría que acotar el suelo y desvanecer su borde; si no, aparece un
canto recto que queda peor que el rectángulo.
