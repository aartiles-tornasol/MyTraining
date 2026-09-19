"""
Turns posed joints into a lit Blender scene and renders it.

The camera is deliberately the same for every exercise except for its azimuth,
and it is orthographic. That is the point: with a shared scale and a floor in
shot, a body lying down occupies the bottom of the frame and a standing one
fills it. The old renderer fitted the crop to each exercise, so both filled the
same square and the athlete could not tell them apart.
"""

import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rig  # noqa: E402

SKIN = (0.80, 0.85, 0.93, 1.0)
FLOOR = (0.030, 0.040, 0.056, 1.0)
BG = (0.020, 0.028, 0.040)
LIME = (0.72, 0.93, 0.13, 1.0)

CAMERAS = {
    'tres-cuartos': 38,
    'lateral': 90,
    'frontal': 0,
    'tres-cuartos-alto': 38,
    # For anything with its back to a wall. The other angles sit on the same
    # side as that wall, so the wall ends up between the camera and the body
    # and hides it completely.
    'tres-cuartos-frente': 142,
}
ELEVATION = {'tres-cuartos': 14, 'lateral': 10, 'frontal': 10,
             'tres-cuartos-alto': 32, 'tres-cuartos-frente': 14}


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, rgba, rough=0.55, emit=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = rgba
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = rgba
        b.inputs['Emission Strength'].default_value = emit
    if alpha < 1.0:
        b.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND'
        m.show_transparent_back = False
    return m


def unit_meshes():
    """One cone and one sphere, reused by every bone and joint."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=1.0, radius2=1.0, depth=1.0)
    cone = bpy.data.meshes.new('bone')
    bm.to_mesh(cone)
    bm.free()

    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1.0)
    ball = bpy.data.meshes.new('joint')
    bm.to_mesh(ball)
    bm.free()
    for me in (cone, ball):
        for poly in me.polygons:
            poly.use_smooth = True
        # One empty slot on the shared mesh, so each object can override it.
        me.materials.append(None)
    return cone, ball


def paint(obj, mat):
    """Material per object, not per mesh: every bone reuses the same mesh and
    assigning to the data would repaint all of them with the last colour."""
    obj.material_slots[0].link = 'OBJECT'
    obj.material_slots[0].material = mat


def bone_matrix(a, b, r1, r2):
    a, b = Vector(a), Vector(b)
    d = b - a
    length = d.length or 1e-4
    rot = d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    loc = Matrix.Translation((a + b) / 2.0)
    scale = Matrix.Diagonal(Vector((max(r1, r2), max(r1, r2), length, 1.0)))
    return loc @ rot @ scale


# A glow belongs on the muscle belly, not on the joint: put it on the ankle and
# it reads as a bright shoe. Each entry is (from, to, how far along, radius).
MUSCLES = {
    'gemelo_d':   ('r_knee', 'r_ankle', 0.34, 0.115),
    'gemelo_i':   ('l_knee', 'l_ankle', 0.34, 0.115),
    'soleo_d':    ('r_knee', 'r_ankle', 0.62, 0.095),
    'aquiles_d':  ('r_knee', 'r_ankle', 0.93, 0.070),
    'aquiles_i':  ('l_knee', 'l_ankle', 0.93, 0.070),
    'isquios_d':  ('r_hip', 'r_knee', 0.48, 0.125),
    'cuadriceps_d': ('r_hip', 'r_knee', 0.50, 0.130),
    'aductor_d':  ('r_hip', 'r_knee', 0.30, 0.115),
    'aductor_i':  ('l_hip', 'l_knee', 0.30, 0.115),
    'gluteo_d':   ('pelvis', 'r_knee', 0.20, 0.130),
    'gluteo_i':   ('pelvis', 'l_knee', 0.20, 0.130),
    'core':       ('pelvis', 'neck', 0.42, 0.155),
    'hombro_d':   ('r_sho', 'r_elbow', 0.12, 0.105),
    'hombro_i':   ('l_sho', 'l_elbow', 0.12, 0.105),
}


def build_figure(joints, mats, meshes, highlight=None):
    cone, ball = meshes
    objs = []
    for a, b, kind in rig.BONES:
        if a not in joints or b not in joints:
            continue
        r1, r2 = rig.GIRTH.get(kind, (0.05, 0.05))
        o = bpy.data.objects.new(f'{a}_{b}', cone)
        o.matrix_world = bone_matrix(joints[a], joints[b], r1 / 2, r2 / 2)
        bpy.context.collection.objects.link(o)
        paint(o, mats['skin'])
        objs.append(o)

    for name, radius in (('head', rig.SEG['head_r']), ('pelvis', 0.125),
                         ('r_knee', 0.070), ('l_knee', 0.070),
                         ('r_elbow', 0.048), ('l_elbow', 0.048),
                         ('r_sho', 0.078), ('l_sho', 0.078),
                         ('r_ankle', 0.050), ('l_ankle', 0.050),
                         ('r_hip', 0.082), ('l_hip', 0.082),
                         ('neck', 0.062)):
        if name not in joints:
            continue
        o = bpy.data.objects.new(name, ball)
        o.matrix_world = (Matrix.Translation(Vector(joints[name]))
                          @ Matrix.Diagonal(Vector((radius, radius, radius, 1.0))))
        bpy.context.collection.objects.link(o)
        paint(o, mats['skin'])
        objs.append(o)

    for spot in (highlight or []):
        if spot in MUSCLES:
            a, b, t, r = MUSCLES[spot]
            if a not in joints or b not in joints:
                continue
            at = Vector(joints[a]).lerp(Vector(joints[b]), t)
        elif spot in joints:
            at, r = Vector(joints[spot]), 0.115
        else:
            continue
        o = bpy.data.objects.new('hl_' + spot, ball)
        o.matrix_world = Matrix.Translation(at) @ Matrix.Diagonal(Vector((r, r, r, 1.0)))
        bpy.context.collection.objects.link(o)
        paint(o, mats['lime'])
        objs.append(o)
    return objs


def build_prop(kind, mats, spec):
    """Scenery that gives the body somewhere to be: a step, a chair, a wall.

    Where it goes is per exercise, because a chair under a side-lying knee and
    a chair being sat on are not in the same place, and a body resting on
    scenery that is somewhere else reads as floating.
    """
    boxes = {
        'escalon': [(0.0, 0.13, 0.085, 0.86, 0.40, 0.17)],
        'escalon_alto': [(0.0, 0.16, 0.15, 0.86, 0.46, 0.30)],
        'silla':   [(0.0, 0.46, 0.425, 0.42, 0.40, 0.05),
                    (0.0, 0.64, 0.64, 0.42, 0.05, 0.42)],
        'pared':   [(0.0, 0.80, 0.80, 1.1, 0.05, 1.6)],
        'esterilla': [(0.0, 0.0, 0.008, 0.9, 1.9, 0.016)],
        'banco':   [(0.0, 0.42, 0.28, 0.38, 0.95, 0.07)],
    }
    made = []
    for (x, y, z, sx, sy, sz) in boxes.get(kind, []):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        me = bpy.data.meshes.new('prop')
        bm.to_mesh(me)
        bm.free()
        o = bpy.data.objects.new(kind, me)
        place = spec.get('prop_place', {}).get(kind, (0.0, 0.0, 0.0, 0.0))
        dx, dy, dz = place[0], place[1], place[2]
        yaw = place[3] if len(place) > 3 else 0.0
        rot = Matrix.Rotation(math.radians(yaw), 4, 'Z')
        local = rot @ Vector((x, y, z))
        o.matrix_world = (Matrix.Translation(local + Vector((dx, dy, dz)))
                          @ rot
                          @ Matrix.Diagonal(Vector((sx, sy, sz, 1.0))))
        bpy.context.collection.objects.link(o)
        if not o.material_slots:
            me.materials.append(None)
        paint(o, mats['prop'])
        made.append(o)
    return made


def setup(size, view, zoom=None, look=None):
    """`zoom` narrows the orthographic width and `look` raises the aim, for
    exercises where the detail is small and the body's orientation is not in
    doubt anyway — band work for the shoulder reads as a full-body pictogram
    otherwise. Everything else keeps the shared framing on purpose: a common
    scale is what tells a lying body from a standing one."""
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x = sc.render.resolution_y = size
    # Transparent sky, solid floor: the card behind the image becomes the
    # background, so the figure sits in the UI instead of on a pasted-on
    # rectangle. The floor is geometry, so it still renders and still catches
    # the contact shadow, which is the cue that says the body is resting on it.
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'WEBP'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.quality = 82
    sc.view_settings.view_transform = 'Standard'

    world = bpy.data.worlds.new('w')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (*BG, 1.0)
    world.node_tree.nodes['Background'].inputs[1].default_value = 0.16
    sc.world = world

    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=14.0)
    me = bpy.data.meshes.new('floor')
    bm.to_mesh(me)
    bm.free()
    floor = bpy.data.objects.new('floor', me)
    bpy.context.collection.objects.link(floor)
    floor.active_material = material('floor', FLOOR, rough=0.95)

    az = math.radians(CAMERAS.get(view, 38))
    el = math.radians(ELEVATION.get(view, 14))

    def lamp(name, energy, size, swing, height, dist):
        """Lights follow the camera. Fixed ones left the figure in silhouette
        the moment a shot was taken from the other side."""
        a = az + math.radians(swing)
        light = bpy.data.lights.new(name, 'AREA')
        light.energy, light.size = energy, size
        o = bpy.data.objects.new(name, light)
        o.location = (-math.sin(a) * dist, -math.cos(a) * dist, height)
        aim = Vector((0.0, 0.0, 0.9)) - Vector(o.location)
        o.rotation_euler = aim.to_track_quat('-Z', 'Y').to_euler()
        bpy.context.collection.objects.link(o)

    lamp('key', 260.0, 2.6, -38, 3.4, 3.6)
    lamp('rim', 110.0, 2.0, 155, 2.4, 4.0)

    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.ortho_scale = zoom or 2.35   # shared metre-per-pixel unless asked otherwise
    co = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(co)
    sc.camera = co

    dist = 8.0
    target = Vector((0.0, 0.0, look if look is not None else 0.80))
    co.location = target + Vector((-math.sin(az) * math.cos(el),
                                   -math.cos(az) * math.cos(el),
                                   math.sin(el))) * dist
    direction = target - co.location
    co.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    return {
        'skin': material('skin', SKIN, rough=0.42),
        'lime': material('lime', LIME, rough=0.5, emit=2.0, alpha=0.22),
        'prop': material('prop', (0.055, 0.072, 0.098, 1.0), rough=0.9),
    }
