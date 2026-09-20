"""
A 3D articulated figure, posed from joint angles and rendered offline.

Why this exists: the app's 2D rig solves every joint inside the sagittal plane.
It cannot express rotation about the vertical axis, which is the whole content
of a hip airplane, and it cannot say whether a body is upright or lying down —
a torso leaning 66 degrees and a torso lying flat are the same picture. This
model carries a real orientation in the world and three degrees of freedom per
joint, so both questions have answers.

Conventions, body frame: +X to the figure's right, +Y the way it faces, +Z up.
  flex     rotates a limb towards +Y (hip flexion swings the thigh forward)
  abduct   swings it away from the midline
  rot      twists it about its own long axis
  knee     flexion, heel towards the glutes
  ankle    dorsiflexion, positive lifts the toes
  elbow    flexion, hand towards the shoulder
Angles are degrees. Lengths are metres; the figure stands 1.72 m, like its user.
"""

import math

# ── Proportions ──────────────────────────────────────────────────────────
SEG = {
    'head_r': 0.105, 'neck': 0.085, 'torso': 0.50,
    'sho_half': 0.185, 'hip_half': 0.095,
    'upper_arm': 0.30, 'forearm': 0.26, 'hand': 0.085,
    'thigh': 0.44, 'shank': 0.42, 'foot': 0.24, 'heel': 0.06,
}

# Limb thickness at each end, for the tapered capsules.
# Diameters, roughly anatomical. A 52-year-old at 75 kg and 1.72 m: a thigh is
# about 16 cm across, not the pipe the 2D figure drew.
GIRTH = {
    'torso': (0.235, 0.265), 'neck': (0.105, 0.105),
    'upper_arm': (0.098, 0.078), 'forearm': (0.080, 0.058), 'hand': (0.062, 0.048),
    'thigh': (0.165, 0.115), 'shank': (0.115, 0.072), 'foot': (0.085, 0.060),
}


def rad(d):
    return d * math.pi / 180.0


def matmul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)] for i in range(3)]


def apply(m, v):
    return tuple(sum(m[i][k] * v[k] for k in range(3)) for i in range(3))


def rx(d):
    c, s = math.cos(rad(d)), math.sin(rad(d))
    return [[1, 0, 0], [0, c, -s], [0, s, c]]


def ry(d):
    c, s = math.cos(rad(d)), math.sin(rad(d))
    return [[c, 0, s], [0, 1, 0], [-s, 0, c]]


def rz(d):
    c, s = math.cos(rad(d)), math.sin(rad(d))
    return [[c, -s, 0], [s, c, 0], [0, 0, 1]]


def add(p, v, k=1.0):
    return (p[0] + v[0] * k, p[1] + v[1] * k, p[2] + v[2] * k)


DOWN = (0.0, 0.0, -1.0)
UP = (0.0, 0.0, 1.0)
FWD = (0.0, 1.0, 0.0)

# Root orientations. The name is what the athlete needs to be told anyway, so
# the same word drives the geometry and the caption.
ORIENT = {
    'de-pie':         (0, 0, 0),
    'boca-arriba':    (90, 0, 0),
    'boca-abajo':     (-90, 0, 0),
    'de-lado':        (0, 90, 0),
    'cuadrupedia':    (0, 0, 0),
    'sentado':        (0, 0, 0),
    'de-lado-izq':    (0, -90, 0),
}

DEFAULT_POSE = {
    'yaw': 0.0, 'pitch': 0.0, 'roll': 0.0,
    'spine': 0.0, 'spine_side': 0.0, 'spine_twist': 0.0, 'head': 0.0,
    # right / left leg
    'r_hip': 0.0, 'r_abd': 0.0, 'r_rot': 0.0, 'r_knee': 0.0, 'r_ankle': 0.0,
    'l_hip': 0.0, 'l_abd': 0.0, 'l_rot': 0.0, 'l_knee': 0.0, 'l_ankle': 0.0,
    # right / left arm
    'r_sho': 0.0, 'r_sabd': 0.0, 'r_srot': 0.0, 'r_elb': 0.0,
    'l_sho': 0.0, 'l_sabd': 0.0, 'l_srot': 0.0, 'l_elb': 0.0,
    'lift': 0.0,
    # ('joint', z) pins that joint instead of dropping the body. See solve().
    'anchor': None,
}


def solve(pose, orient='de-pie'):
    """Joint positions in world space, dropped onto the floor at z = 0."""
    p = dict(DEFAULT_POSE)
    p.update(pose)

    ox, oy, oz = ORIENT.get(orient, (0, 0, 0))
    root = matmul(matmul(rz(oz + p['yaw']), ry(oy + p['roll'])), rx(ox + p['pitch']))

    pelvis = (0.0, 0.0, 0.0)
    # Trunk flexion: the limb solvers point a bone down and rotate it, so
    # positive is forward there. The trunk points up, which reverses the sense,
    # so it is negated here and `spine` means forward flexion everywhere.
    # Order matters and it is flex, then side-bend, then twist. A twist is a
    # rotation about the segment's own long axis, so it only means anything
    # once that axis has been placed. Applied first, as it was, `spine_twist`
    # turned the body about the world vertical instead — which is why a hip
    # airplane could not rotate its pelvis over a trunk already leaning 68.
    trunk = matmul(root, matmul(rx(-p['spine']),
                                matmul(ry(p['spine_side']), rz(p['spine_twist']))))

    neck = add(pelvis, apply(trunk, UP), SEG['torso'])
    head_frame = matmul(trunk, rx(p['head']))
    head = add(neck, apply(head_frame, UP), SEG['neck'] + SEG['head_r'] * 0.55)

    out = {'pelvis': pelvis, 'neck': neck, 'head': head}

    for side, sgn in (('r', 1.0), ('l', -1.0)):
        sho = add(neck, apply(trunk, (sgn, 0.0, 0.0)), SEG['sho_half'])
        f = matmul(trunk, matmul(rx(p[side + '_sho']),
                                 matmul(ry(-sgn * p[side + '_sabd']),
                                        rz(-sgn * p[side + '_srot']))))
        elbow = add(sho, apply(f, DOWN), SEG['upper_arm'])
        fe = matmul(f, rx(p[side + '_elb']))
        hand = add(elbow, apply(fe, DOWN), SEG['forearm'])
        tip = add(hand, apply(fe, DOWN), SEG['hand'])
        out[side + '_sho'], out[side + '_elbow'] = sho, elbow
        out[side + '_hand'], out[side + '_tip'] = hand, tip

        hip = add(pelvis, apply(root, (sgn, 0.0, 0.0)), SEG['hip_half'])
        g = matmul(root, matmul(rx(p[side + '_hip']),
                                matmul(ry(-sgn * p[side + '_abd']),
                                       rz(-sgn * p[side + '_rot']))))
        knee = add(hip, apply(g, DOWN), SEG['thigh'])
        gk = matmul(g, rx(-p[side + '_knee']))
        ankle = add(knee, apply(gk, DOWN), SEG['shank'])
        ga = matmul(gk, rx(p[side + '_ankle']))
        toe = add(ankle, apply(ga, FWD), SEG['foot'])
        heel = add(ankle, apply(ga, FWD), -SEG['heel'])
        out[side + '_hip'], out[side + '_knee'] = hip, knee
        out[side + '_ankle'], out[side + '_toe'], out[side + '_heel'] = ankle, toe, heel

    # Placement. By default the lowest piece of body rests at z = 0, which is
    # right for anything standing on the floor. It is wrong the moment one part
    # is meant to stay put while another lifts: raise the heels while seated and
    # the toes become the lowest point, so the whole body rises and the backside
    # leaves the chair. `anchor` pins a named joint at a height instead, and the
    # rest of the body moves around it.
    anchor = p.get('anchor')
    if anchor:
        joint, height = anchor
        dz = height - out[joint][2]
    else:
        pad = {'head': SEG['head_r']}
        low = min(v[2] - pad.get(k, 0.05) for k, v in out.items())
        dz = -low
    dz += p['lift']
    return {k: (v[0], v[1], v[2] + dz) for k, v in out.items()}


BONES = [
    ('pelvis', 'neck', 'torso'), ('neck', 'head', 'neck'),
    ('r_sho', 'r_elbow', 'upper_arm'), ('r_elbow', 'r_hand', 'forearm'),
    ('r_hand', 'r_tip', 'hand'),
    ('l_sho', 'l_elbow', 'upper_arm'), ('l_elbow', 'l_hand', 'forearm'),
    ('l_hand', 'l_tip', 'hand'),
    ('r_hip', 'r_knee', 'thigh'), ('r_knee', 'r_ankle', 'shank'),
    ('r_heel', 'r_toe', 'foot'),
    ('l_hip', 'l_knee', 'thigh'), ('l_knee', 'l_ankle', 'shank'),
    ('l_heel', 'l_toe', 'foot'),
    ('l_sho', 'r_sho', 'neck'), ('l_hip', 'r_hip', 'neck'),
]
