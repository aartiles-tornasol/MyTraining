"""
The programme's exercises as 3D poses.

Each entry carries the one thing the old drawings could never say: `orient`,
where the body is relative to gravity. That word drives the geometry and is
also printed on screen, because "no sé si tengo que estar tumbado" was the
complaint that started all of this.

`spine` is trunk flexion at the hip, so a hinge leans the torso and leaves the
legs under the body. Putting the lean in `pitch` would tip the legs with it.
"""

ARMS_SIDE = {'r_sabd': 12, 'l_sabd': 12, 'r_elb': 6, 'l_elb': 6}
ARMS_HIPS = {'r_sabd': 30, 'l_sabd': 30, 'r_elb': 95, 'l_elb': 95}
ARMS_WALL = {'r_sho': 78, 'l_sho': 78, 'r_elb': 14, 'l_elb': 14}
ARMS_FRONT = {'r_sho': 80, 'l_sho': 80, 'r_elb': 12, 'l_elb': 12}
ARMS_CHEST = {'r_sho': 24, 'l_sho': 24, 'r_elb': 128, 'l_elb': 128}


def f(label, **p):
    return {'label': label, 'p': p}


POSES = {
    # ── Tobillo y Aquiles ────────────────────────────────────────────────
    'iso-calf-double': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.22, 0.0)},
        'highlight': ['gemelo_d', 'gemelo_i', 'aquiles_d'], 'ms': 1400,
        'frames': [
            f('Sube a puntillas', **ARMS_WALL, r_ankle=-38, l_ankle=-38, r_knee=3, l_knee=3),
            f('Aguanta arriba', **ARMS_WALL, r_ankle=-42, l_ankle=-42, r_knee=2, l_knee=2),
            f('Baja despacio', **ARMS_WALL, r_ankle=0, l_ankle=0, r_knee=4, l_knee=4),
        ],
    },
    'iso-calf-single': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.22, 0.0)},
        'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1400,
        'frames': [
            f('Sobre una pierna, sube', **ARMS_WALL, r_ankle=-40, r_knee=4,
              l_hip=-14, l_knee=92, l_ankle=-16),
            f('Aguanta arriba', **ARMS_WALL, r_ankle=-44, r_knee=3,
              l_hip=-14, l_knee=94, l_ankle=-16),
            f('Baja despacio', **ARMS_WALL, r_ankle=0, r_knee=6,
              l_hip=-14, l_knee=92, l_ankle=-16),
        ],
    },
    'calf-raise-floor': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gemelo_d', 'gemelo_i', 'aquiles_d'],
        'ms': 1500,
        'frames': [
            f('Sube en 2 s', **ARMS_SIDE, r_ankle=-38, l_ankle=-38),
            f('Aprieta arriba', **ARMS_SIDE, r_ankle=-42, l_ankle=-42),
            f('Baja en 3 s', **ARMS_SIDE, r_ankle=0, l_ankle=0),
        ],
    },
    'calf-raise-single': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1500,
        'frames': [
            f('Sube sobre una pierna', **ARMS_SIDE, r_ankle=-40, l_hip=-16, l_knee=94, l_ankle=-16),
            f('Aprieta arriba', **ARMS_SIDE, r_ankle=-44, l_hip=-16, l_knee=96, l_ankle=-16),
            f('Baja en 3 s', **ARMS_SIDE, r_ankle=0, l_hip=-16, l_knee=94, l_ankle=-16),
        ],
    },
    'heel-drop-step': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['escalon', 'pared'],
        'prop_place': {'escalon': (0.0, 0.10, 0.0), 'pared': (0.0, -0.22, 0.0)},
        'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1800,
        'frames': [
            f('En el escalón, arriba', **ARMS_WALL, lift=0.17, r_ankle=-30,
              l_hip=-16, l_knee=92, l_ankle=-14),
            f('Baja el talón por debajo', **ARMS_WALL, lift=0.04, r_ankle=26,
              l_hip=-16, l_knee=92, l_ankle=-14),
        ],
    },
    'soleus-seated': {
        'orient': 'sentado', 'camera': 'lateral', 'props': ['silla'],
        'prop_place': {'silla': (0.0, 0.46, 0.0, 180)},
        # The whole point is the knee being bent, which switches the calf off
        # and leaves the soleus working. Highlighting the calf said the opposite.
        'highlight': ['soleo_d', 'aquiles_d'], 'ms': 1400,
        'frames': [
            f('Talones arriba', r_hip=104, r_knee=100, l_hip=104, l_knee=100,
              r_ankle=-32, l_ankle=-32, anchor=('pelvis', 0.47), **ARMS_CHEST),
            f('Baja despacio', r_hip=104, r_knee=100, l_hip=104, l_knee=100,
              r_ankle=4, l_ankle=4, anchor=('pelvis', 0.47), **ARMS_CHEST),
        ],
    },
    'soleus-wall-iso': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['pared'],
        'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1600,
        'frames': [
            f('Rodilla doblada contra la pared', **ARMS_WALL,
              r_hip=14, r_knee=48, r_ankle=-10, l_hip=-24, l_knee=18, l_ankle=6),
            f('Aguanta el sóleo', **ARMS_WALL,
              r_hip=14, r_knee=52, r_ankle=-14, l_hip=-24, l_knee=18, l_ankle=6),
        ],
    },
    'knee-to-wall': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['pared'],
        'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1500,
        'frames': [
            f('Rodilla lejos de la pared', **ARMS_WALL,
              r_hip=8, r_knee=18, r_ankle=14, l_hip=-26, l_knee=22),
            f('Lleva la rodilla a tocar', **ARMS_WALL,
              r_hip=20, r_knee=46, r_ankle=34, l_hip=-26, l_knee=22),
        ],
    },
    'toe-walk': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gemelo_d', 'gemelo_i', 'aquiles_d'],
        'ms': 900,
        'frames': [
            f('De puntillas, paso corto', **ARMS_SIDE,
              r_hip=16, r_knee=14, r_ankle=-34, l_hip=-18, l_knee=10, l_ankle=-34),
            f('Sin bajar los talones', **ARMS_SIDE,
              r_hip=-18, r_knee=10, r_ankle=-34, l_hip=16, l_knee=14, l_ankle=-34),
        ],
    },

    # ── Aductores e ingle ────────────────────────────────────────────────
    'adductor-squeeze': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['cuadriceps_d', 'aductor_d', 'aductor_i'], 'ms': 1600,
        'frames': [
            f('Boca arriba, rodillas dobladas', r_hip=48, r_knee=112, l_hip=48, l_knee=112, r_ankle=-26, l_ankle=-26,
              r_abd=9, l_abd=9, r_sabd=34, l_sabd=34, r_sho=-10, l_sho=-10),
            f('Aprieta el cojín al 80 %', r_hip=48, r_knee=112, l_hip=48, l_knee=112, r_ankle=-26, l_ankle=-26,
              r_abd=1, l_abd=1, r_sabd=34, l_sabd=34, r_sho=-10, l_sho=-10),
        ],
    },
    'copenhagen-short': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['silla', 'esterilla'],
        'prop_place': {'silla': (-0.50, 0.0, 0.0, 90)},
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1800,
        'frames': [
            f('De lado, rodilla en la silla', spine=6,
              r_sho=86, r_elb=84, l_sabd=8, l_elb=10,
              l_hip=8, l_knee=88, l_abd=-26, r_hip=-6, r_knee=16),
            f('Sube la cadera a la línea', spine=-4, roll=-12,
              r_sho=86, r_elb=84, l_sabd=8, l_elb=10,
              l_hip=4, l_knee=86, l_abd=-30, r_hip=-4, r_knee=10),
        ],
    },
    'copenhagen-long': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['silla', 'esterilla'],
        'prop_place': {'silla': (-0.78, 0.0, 0.0, 90)},
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1800,
        'frames': [
            f('De lado, pie en la silla', spine=6,
              r_sho=86, r_elb=84, l_sabd=8, l_elb=10,
              l_hip=2, l_knee=8, l_abd=-30, r_hip=-4, r_knee=8),
            f('Sube la cadera, cuerpo recto', spine=-6, roll=-14,
              r_sho=86, r_elb=84, l_sabd=8, l_elb=10,
              l_hip=0, l_knee=4, l_abd=-32, r_hip=-2, r_knee=4),
        ],
    },
    'side-lying-adduction': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1600,
        'frames': [
            f('Tumbado de lado', r_sho=84, r_elb=76, l_sabd=10, l_elb=12,
              l_hip=54, l_knee=72, l_abd=-36, r_hip=0, r_knee=4),
            f('Sube la pierna de abajo', r_sho=84, r_elb=76, l_sabd=10, l_elb=12,
              l_hip=54, l_knee=72, l_abd=-36, r_hip=0, r_knee=4, r_abd=-26),
        ],
    },
    'lateral-lunge': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1600,
        'frames': [
            f('De pie, pies juntos', **ARMS_CHEST, r_abd=4, l_abd=4),
            f('Paso largo al lado', **ARMS_FRONT, spine=26,
              r_abd=30, r_hip=34, r_knee=72, l_abd=-24, l_knee=4),
        ],
    },
    'cossack-squat': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['gluteo_d', 'gluteo_i'], 'ms': 1800,
        'frames': [
            f('Pies muy abiertos', **ARMS_FRONT, r_abd=26, l_abd=26, r_knee=6, l_knee=6),
            f('Baja sobre una pierna', **ARMS_FRONT, spine=22,
              r_abd=22, r_hip=42, r_knee=104, l_abd=-34, l_knee=2, l_ankle=22),
        ],
    },

    # ── Cadera, glúteo y piramidal ───────────────────────────────────────
    'glute-bridge': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos', 'props': ['esterilla'],
        'highlight': ['gluteo_d', 'gluteo_i'], 'ms': 1500,
        'frames': [
            f('Boca arriba, cadera abajo', r_hip=48, r_knee=112, l_hip=48, l_knee=112, r_ankle=-26, l_ankle=-26, anchor=('r_heel', 0.05),
              r_sabd=26, l_sabd=26, r_sho=-10, l_sho=-10),
            f('Sube la cadera', spine=-16, r_hip=26, r_knee=100, l_hip=26, l_knee=100, r_ankle=-26, l_ankle=-26, anchor=('r_heel', 0.05),
              r_sabd=26, l_sabd=26, r_sho=-10, l_sho=-10),
        ],
    },
    'single-leg-bridge': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos', 'props': ['esterilla'],
        'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1500,
        'frames': [
            f('Una pierna en el suelo', r_hip=48, r_knee=112, r_ankle=-26, anchor=('r_heel', 0.05), l_hip=96, l_knee=14,
              r_sabd=26, l_sabd=26, r_sho=-10, l_sho=-10),
            f('Sube la cadera', spine=-18, r_hip=24, r_knee=98, r_ankle=-26, anchor=('r_heel', 0.05), l_hip=76, l_knee=10,
              r_sabd=26, l_sabd=26, r_sho=-10, l_sho=-10),
        ],
    },
    'clamshell-band': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1400,
        'frames': [
            f('De lado, rodillas dobladas', r_sho=80, r_elb=88, l_sabd=10, l_elb=14,
              r_hip=44, r_knee=86, l_hip=44, l_knee=86, anchor=('pelvis', 0.23)),
            f('Abre la rodilla de arriba', r_sho=80, r_elb=88, l_sabd=10, l_elb=14,
              r_hip=44, r_knee=86, l_hip=44, l_knee=86, l_rot=40,
              anchor=('pelvis', 0.23)),
        ],
    },
    'side-plank-abduction': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1600,
        'frames': [
            f('Plancha lateral sobre el codo', roll=-16, r_sho=0, r_sabd=88, r_elb=86,
              l_sabd=14, l_elb=10, r_hip=0, r_knee=6, l_hip=0, l_knee=4,
              anchor=('r_elbow', 0.06)),
            f('Sube la pierna de arriba', roll=-16, r_sho=0, r_sabd=88, r_elb=86,
              l_sabd=14, l_elb=10, r_hip=0, r_knee=6, l_hip=0, l_knee=2, l_abd=34,
              anchor=('r_elbow', 0.06)),
        ],
    },
    'banded-lateral-walk': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['gluteo_d', 'gluteo_i'], 'ms': 1200,
        'frames': [
            f('Semiflexión, banda tensa', **ARMS_CHEST,
              spine=16, r_knee=44, l_knee=44, r_abd=10, l_abd=10),
            f('Paso lateral sin juntar', **ARMS_CHEST,
              spine=16, r_knee=44, l_knee=44, r_abd=26, l_abd=6),
        ],
    },
    'hip-airplane': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'props': ['esterilla'],
        'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1900,
        'frames': [
            f('De pie sobre una pierna, bisagra', spine=68, head=-52,
              r_hip=-6, r_knee=16, r_ankle=6, l_hip=-70, l_knee=2,
              r_sabd=70, l_sabd=70, r_elb=8, l_elb=8),
            f('Abre la cadera despacio', spine=68, head=-52, spine_side=-30,
              r_hip=-6, r_knee=16, r_ankle=6, l_hip=-68, l_knee=2, l_abd=36,
              r_sabd=70, l_sabd=70, r_elb=8, l_elb=8),
            f('Cierra con control', spine=68, head=-52,
              r_hip=-6, r_knee=16, r_ankle=6, l_hip=-70, l_knee=2,
              r_sabd=70, l_sabd=70, r_elb=8, l_elb=8),
        ],
    },
    'hip-90-90': {
        'orient': 'sentado', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['gluteo_d', 'gluteo_i'], 'ms': 1800,
        'frames': [
            f('Sentado, 90 y 90', spine=12, lift=0.02,
              r_hip=86, r_knee=88, r_abd=52, l_hip=64, l_knee=92, l_abd=-46,
              r_sho=54, l_sho=54, r_elb=16, l_elb=16),
            f('Gira las dos rodillas al otro lado', spine=12, lift=0.02,
              r_hip=64, r_knee=92, r_abd=-46, l_hip=86, l_knee=88, l_abd=52,
              r_sho=54, l_sho=54, r_elb=16, l_elb=16),
        ],
    },
    'figure-4-stretch': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1800,
        'frames': [
            f('Boca arriba, tobillo sobre la rodilla', r_hip=64, r_knee=84,
              l_hip=54, l_knee=88, l_abd=-46, r_sho=48, l_sho=48, r_elb=60, l_elb=60),
            f('Acerca la rodilla al pecho', r_hip=96, r_knee=82,
              l_hip=86, l_knee=88, l_abd=-48, r_sho=58, l_sho=58, r_elb=92, l_elb=92),
        ],
    },
    'single-leg-rdl': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1700,
        'frames': [
            f('De pie sobre una pierna', **ARMS_SIDE, r_knee=8, r_ankle=8,
              l_hip=-18, l_knee=48, anchor=('r_heel', 0.05)),
            f('La cadera va hacia atrás', spine=45, r_knee=14, r_ankle=14, l_hip=-45, l_knee=8,
              r_sho=45, l_sho=45, r_elb=6, l_elb=6),
            # Trunk to horizontal, roughly square to the support leg, and the
            # trailing leg in line with it. sho tracks spine so the weight
            # hangs plumb instead of drifting behind the body.
            f('Espalda y pierna en línea', spine=85, r_knee=16, r_ankle=16, l_hip=-85, l_knee=2,
              r_sho=85, l_sho=85, r_elb=6, l_elb=6),
        ],
    },

    # ── Pierna ───────────────────────────────────────────────────────────
    'goblet-squat': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['cuadriceps_d', 'aductor_d', 'aductor_i'],
        'ms': 1700,
        'frames': [
            f('De pie con el peso al pecho', **ARMS_CHEST, r_abd=8, l_abd=8),
            f('Baja en 3 s', **ARMS_CHEST, spine=24,
              r_hip=76, r_knee=96, r_ankle=22, r_abd=10,
              l_hip=76, l_knee=96, l_ankle=22, l_abd=10),
        ],
    },
    'split-squat': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['cuadriceps_d'], 'ms': 1700,
        'frames': [
            f('Zancada, un pie delante', **ARMS_HIPS,
              r_hip=20, r_knee=22, l_hip=-30, l_knee=26, l_ankle=-12),
            f('Baja la rodilla de atrás', **ARMS_HIPS, spine=8,
              r_hip=54, r_knee=84, l_hip=-42, l_knee=92, l_ankle=-26),
        ],
    },
    'step-up': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['escalon'],
        'prop_place': {'escalon': (0.0, 0.30, 0.0)},
        'highlight': ['cuadriceps_d'], 'ms': 1700,
        'frames': [
            f('Un pie en el escalón', **ARMS_HIPS,
              r_hip=56, r_knee=70, l_hip=-8, l_knee=6),
            f('Sube sin impulso', **ARMS_HIPS, lift=0.17,
              r_hip=6, r_knee=10, l_hip=-30, l_knee=48, l_ankle=-18),
        ],
    },
    'wall-sit': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.95, 0.0)},
        'highlight': ['cuadriceps_d', 'aductor_d', 'aductor_i'], 'ms': 1600,
        'frames': [
            f('Espalda en la pared', **ARMS_SIDE,
              r_hip=76, r_knee=84, l_hip=76, l_knee=84, r_ankle=12, l_ankle=12),
            f('Aguanta 90 grados', **ARMS_SIDE,
              r_hip=84, r_knee=90, l_hip=84, l_knee=90, r_ankle=14, l_ankle=14),
        ],
    },

    # ── Core ─────────────────────────────────────────────────────────────
    'dead-bug': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['core'], 'ms': 1600,
        'frames': [
            f('Boca arriba, brazos al techo', r_hip=88, r_knee=86, l_hip=88, l_knee=86,
              r_sho=92, l_sho=92, r_elb=6, l_elb=6),
            f('Estira brazo y pierna contrarios', r_hip=16, r_knee=10, l_hip=88, l_knee=86,
              r_sho=92, l_sho=175, r_elb=6, l_elb=6, r_ankle=-40),
        ],
    },
    'pallof-press': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['core'], 'ms': 1500,
        'frames': [
            f('Banda al pecho, no te gires', **ARMS_CHEST, r_abd=8, l_abd=8, r_knee=12, l_knee=12),
            f('Estira los brazos al frente', r_sho=84, l_sho=84, r_elb=8, l_elb=8,
              r_abd=8, l_abd=8, r_knee=12, l_knee=12),
        ],
    },
    'side-plank': {
        'orient': 'de-lado', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['core'], 'ms': 1600,
        'frames': [
            f('Apóyate en el codo', r_sho=0, r_sabd=88, r_elb=86,
              l_sabd=16, l_elb=10, r_hip=0, r_knee=6, l_hip=0, l_knee=4,
              roll=-4, anchor=('r_elbow', 0.06)),
            f('Sube la cadera hasta la línea', roll=-16, r_sho=0, r_sabd=88, r_elb=86,
              l_sabd=16, l_elb=10, r_hip=0, r_knee=4, l_hip=0, l_knee=2,
              anchor=('r_elbow', 0.06)),
        ],
    },
    'bird-dog': {
        'orient': 'cuadrupedia', 'camera': 'tres-cuartos', 'props': ['esterilla'],
        'highlight': ['core'], 'ms': 1700,
        'frames': [
            f('A cuatro patas', spine=90, head=0,
              r_sho=90, l_sho=90, r_elb=70, l_elb=70,
              r_hip=0, r_knee=90, l_hip=0, l_knee=90,
              r_ankle=-90, l_ankle=-90),
            f('Estira brazo y pierna contrarios', spine=90, head=0,
              r_sho=90, l_sho=176, r_elb=70, l_elb=10,
              r_hip=-88, r_knee=4, r_ankle=-40, l_hip=0, l_knee=90, l_ankle=-90,
              anchor=('l_knee', 0.05)),
        ],
    },

    # ── Elasticidad y pista ──────────────────────────────────────────────
    'pogo-hops': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gemelo_d', 'gemelo_i', 'aquiles_d'],
        'ms': 420,
        'frames': [
            f('Contacto corto y rígido', **ARMS_HIPS,
              r_knee=16, l_knee=16, r_ankle=-8, l_ankle=-8),
            f('Rebota desde el tobillo', **ARMS_HIPS, lift=0.11,
              r_knee=6, l_knee=6, r_ankle=-38, l_ankle=-38),
        ],
    },
    'lateral-bound': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1100,
        'frames': [
            f('Salta al lado', **ARMS_SIDE, lift=0.09,
              r_abd=22, r_knee=30, l_abd=-14, l_knee=52),
            f('Congela 1 s el aterrizaje', **ARMS_SIDE, spine=16,
              r_abd=12, r_hip=34, r_knee=62, l_abd=-18, l_knee=26),
        ],
    },
    'split-step': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gemelo_d', 'gemelo_i', 'aquiles_d'],
        'ms': 620,
        'frames': [
            f('Pequeño salto', **ARMS_FRONT, lift=0.07,
              r_abd=10, l_abd=10, r_knee=22, l_knee=22, r_ankle=-22, l_ankle=-22),
            f('Cae listo para salir', **ARMS_FRONT, spine=14,
              r_abd=16, l_abd=16, r_knee=46, l_knee=46, r_ankle=10, l_ankle=10),
        ],
    },
    'skater-hold': {
        'orient': 'de-pie', 'camera': 'frontal', 'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1500,
        'frames': [
            f('Cae sobre una pierna', **ARMS_SIDE, spine=18,
              r_hip=28, r_knee=56, r_abd=8, l_hip=-24, l_knee=44, l_abd=-26),
            f('Aguanta sin que la rodilla caiga', **ARMS_SIDE, spine=22,
              r_hip=34, r_knee=66, r_abd=10, l_hip=-28, l_knee=50, l_abd=-30),
        ],
    },

    # ── Hombro ───────────────────────────────────────────────────────────
    'band-external-rotation': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['hombro_d'],
        'zoom': 1.15, 'look': 1.24, 'ms': 1500,
        'frames': [
            f('Codo pegado al cuerpo', r_sabd=8, r_elb=92, r_srot=-40,
              l_sabd=10, l_elb=14, r_knee=6, l_knee=6),
            f('Abre el antebrazo', r_sabd=8, r_elb=92, r_srot=46,
              l_sabd=10, l_elb=14, r_knee=6, l_knee=6),
        ],
    },
    'band-pull-apart': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['hombro_d', 'hombro_i'],
        'zoom': 1.5, 'look': 1.26, 'ms': 1500,
        'frames': [
            f('Brazos al frente', r_sho=86, l_sho=86, r_elb=8, l_elb=8, r_knee=6, l_knee=6),
            f('Abre hasta el pecho', r_sho=84, l_sho=84, r_srot=60, l_srot=60,
              r_elb=10, l_elb=10, r_knee=6, l_knee=6),
        ],
    },
    'wall-slide': {
        'orient': 'de-pie', 'camera': 'frontal', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.22, 0.0)},
        'highlight': ['hombro_d', 'hombro_i'], 'ms': 1600,
        'frames': [
            f('Brazos en la pared, codos abajo', r_sabd=60, l_sabd=60,
              r_elb=96, l_elb=96, r_sho=14, l_sho=14),
            f('Desliza hacia arriba', r_sabd=84, l_sabd=84,
              r_elb=38, l_elb=38, r_sho=16, l_sho=16),
        ],
    },

    # ── Calentamiento y vuelta a la calma ────────────────────────────────
    'march-jog': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['gluteo_d', 'isquios_d'], 'ms': 700,
        'frames': [
            f('Trote muy suave', r_hip=54, r_knee=78, l_hip=-16, l_knee=14,
              r_sho=-26, l_sho=30, r_elb=72, l_elb=72),
            f('Casi andando', r_hip=-16, r_knee=14, l_hip=54, l_knee=78,
              r_sho=30, l_sho=-26, r_elb=72, l_elb=72),
        ],
    },
    'leg-swings': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.22, 0.0)},
        'highlight': ['gluteo_d', 'isquios_d'], 'ms': 1000,
        'frames': [
            f('Pierna adelante', r_sho=76, l_sho=76, r_elb=12, l_elb=12,
              r_hip=54, r_knee=8, l_knee=6),
            f('Pierna atrás, relajada', r_sho=76, l_sho=76, r_elb=12, l_elb=12,
              r_hip=-34, r_knee=14, l_knee=6),
        ],
    },
    'ankle-circles': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'props': ['pared'],
        'prop_place': {'pared': (0.0, -0.22, 0.0)},
        'highlight': ['gemelo_d', 'aquiles_d'], 'ms': 1000,
        'frames': [
            f('Dibuja círculos con el tobillo', **ARMS_WALL,
              r_hip=26, r_knee=42, r_ankle=-28, l_knee=8),
            f('En los dos sentidos', **ARMS_WALL,
              r_hip=26, r_knee=42, r_ankle=30, r_rot=18, l_knee=8),
        ],
    },
    'shadow-strokes': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'highlight': ['hombro_d'], 'ms': 1000,
        'frames': [
            f('Prepara el golpe', spine_twist=-28, r_sho=-16, r_sabd=26, r_elb=58,
              l_sabd=16, l_elb=24, r_abd=12, l_abd=12, r_knee=18, l_knee=18),
            f('Acompaña con el cuerpo', spine_twist=32, r_sho=46, r_sabd=34, r_elb=22,
              l_sabd=14, l_elb=20, r_abd=12, l_abd=12, r_knee=14, l_knee=14),
        ],
    },
    'calf-stretch-wall': {
        'orient': 'de-pie', 'camera': 'lateral', 'props': ['pared'],
        'highlight': ['gemelo_i', 'aquiles_i'], 'ms': 1800,
        'frames': [
            f('Pierna atrás estirada', **ARMS_WALL,
              r_hip=24, r_knee=46, l_hip=-24, l_knee=4, l_ankle=22),
            f('Ahora dobla la de atrás, sóleo', **ARMS_WALL,
              r_hip=24, r_knee=46, l_hip=-18, l_knee=26, l_ankle=26),
        ],
    },
    'hip-flexor-lunge': {
        'orient': 'de-pie', 'camera': 'tres-cuartos', 'props': ['esterilla'],
        'highlight': ['gluteo_i', 'aductor_i'], 'ms': 1800,
        'frames': [
            f('Rodilla en el suelo', **ARMS_HIPS,
              r_hip=56, r_knee=76, l_hip=-14, l_knee=96, l_ankle=-30),
            f('Mete la cadera hacia delante', **ARMS_HIPS, spine=-8,
              r_hip=44, r_knee=70, l_hip=-34, l_knee=100, l_ankle=-34),
        ],
    },
    'breathing-360': {
        'orient': 'boca-arriba', 'camera': 'tres-cuartos-alto', 'props': ['esterilla'],
        'highlight': ['core'], 'ms': 2600,
        'frames': [
            f('Boca arriba, manos en las costillas', r_hip=48, r_knee=112, l_hip=48, l_knee=112, r_ankle=-26, l_ankle=-26,
              r_sho=18, l_sho=18, r_elb=104, l_elb=104, r_sabd=26, l_sabd=26),
            f('Inspira abriendo las costillas', r_hip=48, r_knee=112, l_hip=48, l_knee=112, r_ankle=-26, l_ankle=-26,
              r_sho=26, l_sho=26, r_elb=98, l_elb=98, r_sabd=32, l_sabd=32),
        ],
    },
}
