import { SKILL_MOVEMENTS } from './skillMovements';
import type { MovementDefinition, ParameterDefinition, PhaseDefinition, PlannedMovement, SupportStatus } from './types';

// Stage 1 feasibility pair (PRD §7): front squat + sprint acceleration.
// Both clips are procedurally keyed by the prototype and have NOT been expert
// reviewed, so their motion status is `draft-reference`, never "reviewed".

export const ASSET_VERSION = 'rig-0.1.0';

const DRAFT_SUPPORT: SupportStatus = {
  motion: 'draft-reference',
  anatomy: 'limited-detail',
  explanation: 'draft-unsourced',
  mechanics: 'not-calculated',
  fascia: 'myers-inspired-overlay',
};

const squatParams: ParameterDefinition[] = [
  {
    id: 'stanceWidth', label: 'Stance width (heel to heel)', kind: 'technique', unit: 'cm',
    default: 35, min: 25, max: 55, step: 1, experimentalMin: 15, experimentalMax: 70,
    effect: 'changes-motion',
    effectNote: 'Moves the feet; toe-out and knee path follow the feet; the trunk is assumed slightly more upright when wider.',
  },
  {
    id: 'depth', label: 'Bottom knee flexion', kind: 'technique', unit: 'deg',
    default: 120, min: 90, max: 135, step: 1, experimentalMin: 60, experimentalMax: 145,
    effect: 'changes-motion',
    effectNote: 'Sets squat depth. Hip, ankle and trunk angles are solved from it with the feet held fixed.',
  },
  {
    id: 'descentTime', label: 'Descent time', kind: 'tempo', unit: 's',
    default: 2, min: 0.8, max: 5, step: 0.1, experimentalMin: 0.4, experimentalMax: 8,
    effect: 'changes-timing', effectNote: 'Modeled execution speed of the lowering phase (not playback rate).',
  },
  {
    id: 'pauseTime', label: 'Bottom pause', kind: 'tempo', unit: 's',
    default: 0.3, min: 0, max: 3, step: 0.1,
    effect: 'changes-timing', effectNote: 'Time held at the bottom.',
  },
  {
    id: 'ascentTime', label: 'Ascent time', kind: 'tempo', unit: 's',
    default: 1.2, min: 0.6, max: 3, step: 0.1, experimentalMin: 0.4, experimentalMax: 5,
    effect: 'changes-timing', effectNote: 'Modeled execution speed of the rising phase.',
  },
  {
    id: 'barLoad', label: 'Barbell load', kind: 'load', unit: 'kg',
    default: 60, min: 20, max: 180, step: 2.5,
    effect: 'educational-only',
    effectNote:
      'Recorded with units only. No qualified model links bar mass to this motion, so it does not change the motion and does not create activation or tissue-load outputs.',
  },
];

const sprintParams: ParameterDefinition[] = [
  {
    id: 'trunkLean', label: 'Trunk lean from vertical', kind: 'technique', unit: 'deg',
    default: 45, min: 30, max: 55, step: 1, experimentalMin: 15, experimentalMax: 65,
    effect: 'changes-motion', effectNote: 'Rotates the trunk line. Leg keyframes stay the same.',
  },
  {
    id: 'stepFrequency', label: 'Step frequency', kind: 'tempo', unit: 'steps/s',
    default: 4.0, min: 3.4, max: 4.6, step: 0.1, experimentalMin: 3.0, experimentalMax: 5.2,
    effect: 'changes-timing', effectNote: 'Modeled cadence. One cycle covers two steps.',
  },
  {
    id: 'sledLoad', label: 'Sled load', kind: 'external-force', unit: 'kg',
    default: 0, min: 0, max: 60, step: 2.5,
    effect: 'educational-only',
    effectNote:
      'Recorded as a horizontal resisted-sprint scenario. The keyed clip is not re-solved for resistance, and no force output is produced.',
  },
];

const squatPhases: PhaseDefinition[] = [
  {
    id: 'setup', name: 'Setup', start: 0, end: 0, boundarySource: 'manually-keyed',
    bodyPosition: 'Standing tall, bar resting on the front of the shoulders, elbows high.',
    jointActions: ['Hips and knees near full extension', 'Shoulders flexed to hold the rack'],
    contacts: 'Both feet flat; bar on the anterior deltoids.',
    keyStructures: ['rectus-abdominis', 'erector-spinae', 'deltoid'],
    coachingQuestions: ['Is the ribcage stacked over the pelvis before the descent starts?'],
  },
  {
    id: 'descent', name: 'Descent', start: 0, end: 0, boundarySource: 'manually-keyed',
    bodyPosition: 'Hips and knees bend together; shin travels forward over the mid-foot.',
    jointActions: ['Hip flexion', 'Knee flexion', 'Ankle dorsiflexion'],
    contacts: 'Both feet flat.',
    keyStructures: ['quadriceps', 'gluteus-maximus', 'adductor-magnus', 'calf-complex'],
    coachingQuestions: ['Do the knees follow the toes?', 'Does the torso stay upright as depth increases?'],
  },
  {
    id: 'bottom', name: 'Bottom', start: 0, end: 0, boundarySource: 'manually-keyed',
    bodyPosition: 'Deepest position in the clip.',
    jointActions: ['Peak hip and knee flexion', 'Peak ankle dorsiflexion'],
    contacts: 'Both feet flat.',
    keyStructures: ['quadriceps', 'gluteus-maximus', 'adductor-magnus'],
    coachingQuestions: ['Can the athlete keep the elbows up here?', 'Where is the bar relative to the mid-foot?'],
  },
  {
    id: 'ascent', name: 'Ascent', start: 0, end: 0, boundarySource: 'manually-keyed',
    bodyPosition: 'Hips and knees extend together to return to standing.',
    jointActions: ['Hip extension', 'Knee extension', 'Ankle plantarflexion toward neutral'],
    contacts: 'Both feet flat.',
    keyStructures: ['quadriceps', 'gluteus-maximus', 'erector-spinae'],
    coachingQuestions: ['Do the hips rise faster than the chest?', 'Does the rep finish tall through the hips?'],
  },
];

const sprintPhases: PhaseDefinition[] = [
  {
    id: 'strike', name: 'Foot strike', start: 0, end: 0.18, boundarySource: 'manually-keyed',
    bodyPosition: 'Right foot contacts the ground under or slightly behind the hips with the body leaning forward.',
    jointActions: ['Stance hip begins extending', 'Stance knee accepts load', 'Swing thigh moves forward'],
    contacts: 'Right forefoot.',
    keyStructures: ['calf-complex', 'quadriceps', 'gluteus-maximus'],
    coachingQuestions: ['Is the shin angled forward at contact?', 'Is contact under the hips rather than reaching in front?'],
  },
  {
    id: 'pushoff', name: 'Push-off', start: 0.18, end: 0.45, boundarySource: 'manually-keyed',
    bodyPosition: 'Stance leg extends to project the body forward; opposite thigh drives forward.',
    jointActions: ['Hip extension', 'Knee extension', 'Ankle plantarflexion', 'Opposite hip flexion'],
    contacts: 'Right forefoot until toe-off.',
    keyStructures: ['gluteus-maximus', 'hamstrings', 'calf-complex', 'iliopsoas'],
    coachingQuestions: ['Does push-off finish with a straight line from ankle to shoulder?'],
  },
  {
    id: 'flight', name: 'Flight', start: 0.45, end: 0.5, boundarySource: 'manually-keyed',
    bodyPosition: 'Brief airborne phase between steps.',
    jointActions: ['Swing knee flexes', 'Front thigh prepares for contact'],
    contacts: 'None.',
    keyStructures: ['hamstrings', 'iliopsoas'],
    coachingQuestions: ['Is flight short, as expected early in acceleration?'],
  },
];
// Second step mirrors the first on the left side. Ids are unique per phase;
// `roleKey` maps both sides onto the same structure-role content.
const sprintPhasesFull: PhaseDefinition[] = (['R', 'L'] as const).flatMap((side, i) =>
  sprintPhases.map((p) => ({
    ...p,
    id: `${p.id}-${side.toLowerCase()}`,
    roleKey: p.id,
    name: p.id === 'flight' ? 'Flight' : `${p.name} (${side})`,
    start: p.start + i * 0.5,
    end: p.end + i * 0.5,
    contacts: side === 'L' ? p.contacts.replace('Right', 'Left') : p.contacts,
    bodyPosition: side === 'L' ? p.bodyPosition.replace('Right', 'Left') : p.bodyPosition,
  })),
);

export const MOVEMENTS: MovementDefinition[] = [
  {
    id: 'front-squat',
    version: '0.1.0',
    name: 'Front squat',
    aliases: ['front squat', 'barbell front squat', 'fs', 'front-squat'],
    family: 'Knee dominant',
    equipment: ['Barbell'],
    summary: 'Build strength through a stable, upright position.',
    phases: squatPhases,
    parameters: squatParams,
    contacts: ['Both feet', 'Bar on front of shoulders'],
    baseDuration: 3.9,
    loop: true,
    review: 'draft',
    support: DRAFT_SUPPORT,
    unavailableControls: [
      { label: 'Bar position (high-bar / low-bar back squat)', reason: 'Needs a separate keyed reference; back-squat requests run as a labelled approximation.' },
      { label: 'Heel elevation', reason: 'Foot-wedge contact is not modeled.' },
      { label: 'Joint moments / muscle forces', reason: 'Requires inverse dynamics with measured ground reaction forces and a scaled model.' },
    ],
  },
  {
    id: 'sprint-acceleration',
    version: '0.1.0',
    name: 'Sprint acceleration',
    aliases: ['sprint acceleration', 'acceleration', 'sprint start', 'accel', 'acceleration sprint', 'sprint'],
    family: 'Running',
    equipment: [],
    summary: 'Forward-leaning strides that build speed from a start.',
    phases: sprintPhasesFull,
    parameters: sprintParams,
    contacts: ['Alternating forefoot contacts'],
    baseDuration: 0.5,
    loop: true,
    review: 'draft',
    support: DRAFT_SUPPORT,
    unavailableControls: [
      { label: 'Ground reaction force', reason: 'Requires force-plate data or a validated forward-dynamics model.' },
      { label: 'Surface / footwear', reason: 'Contact properties are not modeled.' },
      { label: 'Upright (max-velocity) sprinting', reason: 'A distinct motion context that needs its own reference clip.' },
    ],
  },
  ...SKILL_MOVEMENTS,
];

export const MOVEMENT_BY_ID: Record<string, MovementDefinition> = Object.fromEntries(MOVEMENTS.map((m) => [m.id, m]));

/** Proposed Release A coverage (PRD §7) that is catalogued but not simulated yet. */
export const PLANNED: PlannedMovement[] = [
  { name: 'Upright (max-velocity) sprinting', aliases: ['upright sprint', 'max velocity', 'top speed', 'maximum velocity sprint', 'flying sprint'], family: 'Running', relatedSupportedId: 'sprint-acceleration', missingCapability: 'a separate upright-running reference clip' },
  { name: 'Split squat', aliases: ['split squat', 'bulgarian split squat', 'lunge', 'rear foot elevated split squat'], family: 'Knee dominant', relatedSupportedId: 'front-squat', missingCapability: 'unilateral stance and split-foot contact' },
  { name: 'Trap-bar deadlift', aliases: ['trap bar deadlift', 'hex bar deadlift', 'deadlift', 'trap-bar deadlift'], family: 'Hip dominant', relatedSupportedId: 'front-squat', missingCapability: 'hand–implement interaction and hinge reference clip' },
  { name: 'Single-leg RDL', aliases: ['single leg rdl', 'single-leg rdl', 'sl rdl', 'romanian deadlift', 'rdl'], family: 'Hip dominant', relatedSupportedId: 'front-squat', missingCapability: 'single-leg balance and hinge reference clip' },
  { name: 'Push-up', aliases: ['push up', 'push-up', 'pushup', 'press up'], family: 'Upper-body push', relatedSupportedId: 'front-squat', missingCapability: 'closed-chain hand contact and upper-body rigging' },
  { name: 'Landmine press', aliases: ['landmine press', 'landmine'], family: 'Upper-body push', relatedSupportedId: 'front-squat', missingCapability: 'implement interaction and upper-body rigging' },
  { name: 'Inverted row', aliases: ['inverted row', 'ring row', 'row'], family: 'Upper-body pull', relatedSupportedId: 'front-squat', missingCapability: 'upper-body pulling clip' },
  { name: 'Pull-up', aliases: ['pull up', 'pull-up', 'pullup', 'chin up', 'chin-up'], family: 'Upper-body pull', relatedSupportedId: 'front-squat', missingCapability: 'hanging grip contact and upper-body rigging' },
  { name: 'Medicine-ball rotational throw', aliases: ['med ball throw', 'medicine ball throw', 'rotational throw', 'scoop toss', 'med-ball rotational throw'], family: 'Rotation', relatedSupportedId: 'sprint-acceleration', missingCapability: 'implement release and trunk rotation' },
  { name: 'Position-player overhand throw', aliases: ['overhand throw', 'infield throw', 'outfield throw', 'crow hop', 'football throw'], family: 'Throwing', relatedSupportedId: 'catcher-throw', missingCapability: 'a crow-hop / fielding-footwork clip' },
  { name: 'Softball windmill pitch', aliases: ['windmill', 'softball pitch', 'windmill pitch', 'fastpitch'], family: 'Throwing', relatedSupportedId: 'baseball-pitch', missingCapability: 'an underhand windmill arm path clip' },
  { name: 'Countermovement jump', aliases: ['countermovement jump', 'cmj', 'vertical jump', 'jump', 'box jump'], family: 'Jump/landing', relatedSupportedId: 'front-squat', missingCapability: 'takeoff, flight and landing reference clip' },
  { name: 'Planned lateral cut', aliases: ['lateral cut', 'cut', 'cutting', 'change of direction', 'side step', 'cod'], family: 'Direction change', relatedSupportedId: 'sprint-acceleration', missingCapability: 'direction-change clip with lateral foot contact' },
];

/** Phase boundaries can depend on tempo parameters. */
export function phasesFor(movement: MovementDefinition, params: Record<string, number>): PhaseDefinition[] {
  if (movement.segments) {
    const tm = segmentTiming(movement, params);
    return movement.phases.map((p) => ({ ...p, ...tm.bounds[p.id] }));
  }
  if (movement.id !== 'front-squat') return movement.phases;
  const t = squatTiming(params);
  const [setup, descent, bottom, ascent] = movement.phases;
  return [
    { ...setup, start: 0, end: t.setupEnd },
    { ...descent, start: t.setupEnd, end: t.descentEnd },
    { ...bottom, start: t.descentEnd, end: t.pauseEnd },
    { ...ascent, start: t.pauseEnd, end: 1 },
  ];
}

export const SQUAT_SETUP_S = 0.4;

export function squatTiming(params: Record<string, number>) {
  const d = params.descentTime ?? 2;
  const p = params.pauseTime ?? 0.3;
  const a = params.ascentTime ?? 1.2;
  const total = SQUAT_SETUP_S + d + p + a;
  return {
    total,
    setupEnd: SQUAT_SETUP_S / total,
    descentEnd: (SQUAT_SETUP_S + d) / total,
    pauseEnd: (SQUAT_SETUP_S + d + p) / total,
  };
}

/** Segment durations (s) and normalised phase bounds for skill clips. */
export function segmentTiming(movement: MovementDefinition, params: Record<string, number>) {
  const segs = movement.segments ?? [];
  const durs = segs.map((s) => (s.durationParam && params[s.durationParam] !== undefined ? params[s.durationParam] * (s.paramShare ?? 1) : s.duration));
  const total = durs.reduce((a, b) => a + b, 0);
  const bounds: Record<string, { start: number; end: number }> = {};
  let acc = 0;
  segs.forEach((s, i) => {
    bounds[s.phaseId] = { start: acc / total, end: (acc + durs[i]) / total };
    acc += durs[i];
  });
  return { total, bounds };
}

/** Modeled duration of one cycle, seconds. */
export function cycleDuration(movement: MovementDefinition, params: Record<string, number>): number {
  if (movement.segments) return segmentTiming(movement, params).total;
  if (movement.id === 'front-squat') return squatTiming(params).total;
  if (movement.id === 'sprint-acceleration') return 2 / (params.stepFrequency ?? 4);
  return movement.baseDuration;
}

export function defaultParams(movement: MovementDefinition): Record<string, number> {
  return Object.fromEntries(movement.parameters.map((p) => [p.id, p.default]));
}

export function phaseAt(phases: PhaseDefinition[], t: number): PhaseDefinition {
  const x = t >= 1 ? 1 - 1e-9 : ((t % 1) + 1) % 1;
  return phases.find((p) => x >= p.start && x < p.end) ?? phases[phases.length - 1];
}
