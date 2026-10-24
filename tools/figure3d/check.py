#!/usr/bin/env python3
"""
Revisa las 46 posturas midiéndolas, en vez de mirando los renders.

    python3 tools/figure3d/check.py            # solo lo que falla
    python3 tools/figure3d/check.py --all      # todas, con sus medidas

Lo que busca son incoherencias que un render de 320 px esconde pero que
convierten el dibujo en otro ejercicio:

- **Flotando**: la figura no toca el suelo por ninguna parte. Una plancha con
  los pies a medio metro del suelo sigue pareciendo una plancha en miniatura.
- **Hundido**: algo atraviesa el suelo.
- **Apoyo suelto**: la parte sobre la que descansa el peso según la orientación
  — los pies de pie, el antebrazo y el pie de una plancha lateral, manos y
  rodillas a cuatro patas — no llega al suelo.
- **Quieto**: dos fotogramas clave que apenas se diferencian, que es un
  ejercicio que en pantalla no se mueve.
- **Arrastre del apoyo**: lo que debería quedarse clavado se desplaza entre
  fotogramas. Es lo que delató la plancha lateral.

Las tolerancias son generosas a propósito: esto señala sospechosos para
mirarlos, no dicta la postura correcta.
"""
import sys
import os

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import rig       # noqa: E402
import poses     # noqa: E402

SUNK = -0.03      # por debajo de esto, algo atraviesa el suelo
STILL = 0.04      # movimiento máximo para considerar que un fotograma no cambia

# El suelo no está a la misma altura para cada parte: un cuerpo tiene grosor.
# Una pelvis tumbada descansa a unos 12 cm, una mano a 5. Medir todo contra 9 cm
# daba por despegado lo que estaba apoyado.
TOUCH = {
    'pelvis': 0.16, 'neck': 0.16, 'head': 0.14, 'r_sho': 0.16, 'l_sho': 0.16,
    'r_hip': 0.15, 'l_hip': 0.15, 'r_knee': 0.11, 'l_knee': 0.11,
    'r_elbow': 0.09, 'l_elbow': 0.09,
}
FLOOR_DEFAULT = 0.09


def floor_for(joint):
    return TOUCH.get(joint, FLOOR_DEFAULT)


# Ejercicios con fase aérea o apoyo elevado: que la figura no toque el suelo es
# el ejercicio, no un fallo.
AIRBORNE = {'pogo-hops', 'lateral-bound', 'split-step', 'skater-hold',
            'step-up', 'heel-drop-step', 'toe-walk', 'march-jog'}

# Lo que sostiene el peso en cada orientación, y por tanto debe tocar el suelo.
SUPPORTS = {
    'de-pie':      [('r_heel', 'r_toe', 'l_heel', 'l_toe')],
    'boca-arriba': [('pelvis',), ('r_heel', 'l_heel', 'neck')],
    'boca-abajo':  [('pelvis', 'r_sho', 'l_sho')],
    'cuadrupedia': [('r_hand', 'l_hand'), ('r_knee', 'l_knee')],
    'de-lado':     [('r_elbow', 'r_hand', 'r_hip', 'r_knee', 'r_heel')],
    'sentado':     [('r_heel', 'l_heel', 'r_toe', 'l_toe')],
}

JOINTS = ('pelvis', 'neck', 'head', 'r_sho', 'l_sho', 'r_elbow', 'l_elbow',
          'r_hand', 'l_hand', 'r_tip', 'l_tip', 'r_hip', 'l_hip',
          'r_knee', 'l_knee', 'r_ankle', 'l_ankle', 'r_heel', 'l_heel',
          'r_toe', 'l_toe')


def solved(spec):
    orient = spec.get('orient', 'de-pie')
    return [rig.solve(f['p'], orient) for f in spec['frames']]


def check(key, spec):
    orient = spec.get('orient', 'de-pie')
    notes = []
    try:
        frames = solved(spec)
    except Exception as e:                                   # noqa: BLE001
        return [f'no se puede resolver: {e}']

    for i, o in enumerate(frames):
        heights = {k: o[k][2] for k in JOINTS if k in o}
        clear = {k: v - floor_for(k) for k, v in heights.items()}
        lowest = min(clear.values())
        if lowest > 0 and key not in AIRBORNE:
            where = min(clear, key=clear.get)
            notes.append(f'f{i}: flotando, lo más bajo es {where} a {heights[where] * 100:.0f} cm')
        sunk = {k: v for k, v in heights.items() if v < SUNK}
        if sunk:
            worst = min(sunk, key=sunk.get)
            notes.append(f'f{i}: {worst} atraviesa el suelo ({sunk[worst] * 100:.0f} cm)')
        if key not in AIRBORNE:
            for group in SUPPORTS.get(orient, []):
                avail = [g for g in group if g in o]
                if avail and min(o[g][2] - floor_for(g) for g in avail) > 0:
                    best = min(avail, key=lambda g: o[g][2] - floor_for(g))
                    notes.append(
                        f'f{i}: apoyo suelto en {orient} — {"/".join(group)} '
                        f'más bajo a {o[best][2] * 100:.0f} cm')

    for i in range(len(frames) - 1):
        a, b = frames[i], frames[i + 1]
        moved = {k: max(abs(b[k][j] - a[k][j]) for j in range(3))
                 for k in JOINTS if k in a and k in b}
        if moved and max(moved.values()) < STILL:
            notes.append(f'f{i}→f{i + 1}: no se mueve nada ({max(moved.values()) * 100:.0f} cm)')
        # Lo que estaba apoyado en ambos fotogramas no debería desplazarse.
        for k, d in moved.items():
            if a[k][2] < floor_for(k) and b[k][2] < floor_for(k) and d > 0.12:
                notes.append(f'f{i}→f{i + 1}: {k} está apoyado y se arrastra {d * 100:.0f} cm')
    return notes


def main():
    show_all = '--all' in sys.argv
    bad = 0
    for key, spec in poses.POSES.items():
        notes = check(key, spec)
        if notes:
            bad += 1
            print(f'\n{key}  [{spec.get("orient", "de-pie")}]')
            for n in notes:
                print(f'    {n}')
        elif show_all:
            print(f'\n{key}  [{spec.get("orient", "de-pie")}]  sin problemas')
    print(f'\n{bad} de {len(poses.POSES)} con algo que mirar')


if __name__ == '__main__':
    main()
