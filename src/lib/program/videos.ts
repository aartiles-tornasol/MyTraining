/**
 * Un vídeo de YouTube por ejercicio, como complemento a la figura 3D: la figura
 * enseña la forma, el vídeo enseña el ritmo y los errores típicos.
 *
 * Cada entrada está comprobada contra el endpoint `oembed` de YouTube, que
 * devuelve el título y el canal reales; un ID inventado, privado o borrado da
 * error ahí y no entra. El título y el canal se guardan tal y como los devolvió
 * YouTube, para poder revisar la lista sin abrir 46 pestañas y para detectar el
 * día que un vídeo desaparezca.
 *
 * Se prefieren canales de fisioterapia y rehabilitación antes que de gimnasio:
 * el usuario viene de una tendinopatía, no busca rendimiento.
 */
export interface ExerciseVideo {
  /** ID de YouTube, el de `watch?v=`. */
  id: string;
  title: string;
  channel: string;
}

export const VIDEOS: Record<string, ExerciseVideo> = {
  'iso-calf-double': {
    id: 'QckEvvWuVUY',
    title: 'Achilles Isometrics — How, When, What to Avoid with Isometric Calf Raises',
    channel: 'Treat My Achilles',
  },
  'iso-calf-single': {
    id: 'x1LhV2nj01Q',
    title: 'Isometric Single Leg Calf Raise Hold',
    channel: 'Movement As Medicine',
  },
  'heel-drop-step': {
    id: 'FoCuDAkIdnM',
    title: "Achilles Tendonitis Exercises — Hakan Alfredson's heel drop protocol",
    channel: 'www.sportsinjuryclinic.net',
  },
  'copenhagen-short': {
    id: 'nhGK-DxiGBE',
    title: 'Short Lever Adductor Copenhagen Plank | Step-by-Step Tutorial',
    channel: 'Physio Plus Fitness',
  },
  'hip-airplane': {
    id: '9svtEV4vkp0',
    title: 'Hip Airplane Exercise For Improved Balance, Mobility, And Glute Med Strength',
    channel: 'Dr. Carl Baird',
  },
  'hip-90-90': {
    id: '2GNXWyu7GqU',
    title: '90/90 hip mobility drill',
    channel: 'HeartBeet Health',
  },
  'knee-to-wall': {
    id: 'u3NbKOXl75k',
    title: 'Knee To Wall Test: Ankle Mobility (Dorsiflexion)',
    channel: 'Aleks Physio',
  },
  'figure-4-stretch': {
    id: 'wWqKzdI2La0',
    title: 'Supine Figure 4 Stretch',
    channel: 'Cousin Physical Therapy',
  },
  'calf-raise-floor': {
    id: 'HmgXnST4Mdw',
    title: 'The Calf Raise — Exercise Progression',
    channel: 'Physio REHAB',
  },
  'calf-raise-single': {
    id: 'u1Yc75YdiJA',
    title: 'Single-Leg Calf Raise',
    channel: 'Elite Performance Institute',
  },
  'soleus-seated': {
    id: 'DoAYETkOLUs',
    title: 'Beginner Soleus Exercise: Seated Calf Raise with Resistance',
    channel: 'Westcoast SCI Physiotherapy',
  },
  'soleus-wall-iso': {
    id: 'U2_T4sknW3w',
    title: 'Soleus Strengthening Wall Holds',
    channel: 'POGO Physio',
  },
  'adductor-squeeze': {
    id: 'PuWDdDqh5xY',
    title: 'Adductor Ball Squeezes',
    channel: 'Physio REHAB',
  },
  'copenhagen-long': {
    id: 'aGuAemGeyvA',
    title: 'Copenhagen Plank Long Lever | Step-by-Step Tutorial',
    channel: 'Physio Plus Fitness',
  },
  'side-lying-adduction': {
    id: 'knGLKc1jbWs',
    title: 'Hip adduction side lying',
    channel: 'Rehab My Patient',
  },
  'single-leg-rdl': {
    id: 'Zfr6wizR8rs',
    title: 'The BEST Single-Leg RDL Tutorial (Romanian Deadlift)',
    channel: 'Squat University',
  },
  'single-leg-bridge': {
    id: '18GVqjfHy-M',
    title: 'Single Leg Bridge | Step-by-Step Tutorial',
    channel: 'Physio Plus Fitness',
  },
  'glute-bridge': {
    id: 'PhTDzR0TpZs',
    title: 'How to Do a Glute Bridge Exercise: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'clamshell-band': {
    id: 'gN9ukMKrdEo',
    title: 'Clamshells | Glute Med Strengthening Exercise',
    channel: 'Dr. Carl Baird',
  },
  'banded-lateral-walk': {
    id: 'MZ1HbVflLUI',
    title: 'Physical Therapy — Lateral Band Walks',
    channel: 'Atrius Health',
  },
  'side-plank-abduction': {
    id: '09082SvRFFg',
    title: 'Side Plank with Static Hip Abduction | Demonstrated by Physiotherapist',
    channel: 'GRSMcentre',
  },
  'cossack-squat': {
    id: 'tpczTeSkHz0',
    title: 'How to Cossack Squat Mobility Exercise: Tutorial & Progressions',
    channel: 'FitnessFAQs',
  },
  'lateral-lunge': {
    id: 'qCA8E-dF8cI',
    title: "Lateral Lunges… You're Doing It WRONG",
    channel: 'Coach PJ Nestler',
  },
  'goblet-squat': {
    id: 'Pr5AMVyI9CU',
    title: 'Goblet Squat',
    channel: 'Momentum Physical Therapy of New Paltz',
  },
  'split-squat': {
    id: 'KynErtGwD2M',
    title: 'How to Split Squat (static lunge)',
    channel: 'Pinnacle Health Club',
  },
  'step-up': {
    id: 'elhu-WC1qk4',
    title: 'Proper Step Ups / Downs',
    channel: '[P]rehab',
  },
  'dead-bug': {
    id: 'GbSC02oU3To',
    title: 'How to Do a Dead Bug: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'pallof-press': {
    id: '0C99UZkbRQg',
    title: 'Pallof Press Anti-Rotation: Core Stability Exercise',
    channel: 'MYo Lab Health & Wellness',
  },
  'bird-dog': {
    id: 'xEDnlOxeJH4',
    title: 'How to Do the Bird Dog Exercise: A Guide from Physical Therapists',
    channel: 'Hinge Health',
  },
  'pogo-hops': {
    id: '7SIfCcfP4g0',
    title: 'Pogo hops | plyometric exercise for runners',
    channel: 'The Irish Physio TV',
  },
  'lateral-bound': {
    id: 'XDBHOQoAa3w',
    title: 'Lateral Bound with Stick',
    channel: 'Champion Physical Therapy and Performance',
  },
  'skater-hold': {
    id: 'dzVTuvRojzA',
    title: 'Skater Hop',
    channel: 'The Doctors of Physical Therapy',
  },
  'band-external-rotation': {
    id: '_UvmPNGtlPM',
    title: 'Shoulder External Rotation with Resistive Band',
    channel: 'AskDoctorJo',
  },
  'wall-sit': {
    id: 'lqGcco-k7oE',
    title: 'Isometric Wall Squat for Knee Pain',
    channel: 'Puckett Sports Rehab and Physical Therapy',
  },
  'side-plank': {
    id: '3VegcolLqgU',
    title: 'Core Exercise — Side Plank',
    channel: 'Zion Physical Therapy',
  },
  'toe-walk': {
    id: 'BTrDSCZZei4',
    title: 'Walking on Toes',
    channel: 'AskDoctorJo',
  },
  'split-step': {
    id: 'yt67-DARVDQ',
    title: 'Pickleball Footwork — The Elusive Split Step (What, Why, When)',
    channel: 'Better Pickleball',
  },
  'band-pull-apart': {
    id: 'LoBBo1dtY6I',
    title: 'Band Pull Aparts Exercise Demonstration For Shoulder Stability',
    channel: 'FITBODY with Julie Lohre',
  },
  'wall-slide': {
    id: 'Eaj_NG5_hIo',
    title: 'Exercises for Shoulder Pain: Wall Slides',
    channel: 'BESS - British Elbow & Shoulder Society',
  },
  'march-jog': {
    id: 'u1gmWFvEluM',
    title: 'Marching in Place Demonstrated by a Physical Therapist',
    channel: 'Margaret Martin, Physical Therapist',
  },
  'leg-swings': {
    id: 'difYoBtZi2s',
    title: 'How To Do Leg Swings',
    channel: 'PureGym',
  },
  'ankle-circles': {
    id: 'uV0I5adTRXw',
    title: 'Ankle Circles',
    channel: 'MyMichiganHealth',
  },
  'shadow-strokes': {
    id: 'xjQNZ-4nKfY',
    title: 'How to practice shadow swings',
    channel: 'Threshold of Power',
  },
  'calf-stretch-wall': {
    id: 'mtVqe4CR_60',
    title: 'Wall Calf Stretch — soleus and gastrocnemius stretch for ankle dorsiflexion',
    channel: 'Rehab Hero',
  },
  'hip-flexor-lunge': {
    id: 'mqx7oDUXvEc',
    title: 'Hip Flexor Lunge Stretch',
    channel: 'Cara Giusti, PT, DPT — B3 Physical Therapy',
  },
  'breathing-360': {
    id: 'FzxzCDxC7kI',
    title: '360 Degree Diaphragmatic Breath',
    channel: "Athletes' Potential",
  },
};

export const videoFor = (key: string): ExerciseVideo | null => VIDEOS[key] ?? null;
