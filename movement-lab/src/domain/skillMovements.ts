import type { MovementDefinition, ParameterDefinition, PhaseDefinition, SupportStatus } from './types';

// Baseball skill clips: swing, pitch and catcher throw-down. All are hand-keyed
// from general coaching descriptions of each skill's phases. None are motion
// capture, and none have been expert reviewed.

const DRAFT_SUPPORT: SupportStatus = {
  motion: 'draft-reference',
  anatomy: 'limited-detail',
  explanation: 'draft-unsourced',
  mechanics: 'not-calculated',
  fascia: 'myers-inspired-overlay',
};

const handedness = (what: string): ParameterDefinition => ({
  id: 'handedness', label: 'Handedness', kind: 'technique', unit: 'option', options: ['Right-handed', 'Left-handed'],
  default: 0, min: 0, max: 1, step: 1,
  effect: 'changes-motion', effectNote: `Mirrors the ${what} clip left to right.`,
});

const phase = (p: Omit<PhaseDefinition, 'start' | 'end' | 'boundarySource'>): PhaseDefinition => ({
  ...p, start: 0, end: 0, boundarySource: 'manually-keyed',
});

// ------------------------------------------------------------------- swing
const swing: MovementDefinition = {
  id: 'baseball-swing',
  version: '0.1.0',
  name: 'Baseball swing',
  aliases: ['baseball swing', 'swing', 'batting', 'bat swing', 'hitting', 'baseball hitting'],
  family: 'Sport skill',
  equipment: ['Bat', 'Ball'],
  summary: 'Load, stride, and rotate to deliver the barrel to the ball.',
  segments: [
    { phaseId: 'stance', duration: 0.3 },
    { phaseId: 'load', duration: 0.35 },
    { phaseId: 'stride', duration: 0.25 },
    { phaseId: 'launch', duration: 0.15, durationParam: 'swingTime' },
    { phaseId: 'contact', duration: 0.03 },
    { phaseId: 'followThrough', duration: 0.5 },
  ],
  phases: [
    phase({
      id: 'stance', name: 'Stance',
      bodyPosition: 'Athletic stance with the front shoulder toward the pitcher and hands near the back shoulder.',
      jointActions: ['Hips and knees slightly flexed', 'Trunk inclined over the plate'],
      contacts: 'Both feet.',
      keyStructures: ['gluteus-maximus', 'erector-spinae', 'deltoid'],
      coachingQuestions: ['Is weight balanced over the middle of the feet?', 'Are the hands relaxed and ready to load?'],
    }),
    phase({
      id: 'load', name: 'Load',
      bodyPosition: 'Weight shifts into the back hip as the hands move slightly back and the front side coils in.',
      jointActions: ['Back hip flexion and internal rotation', 'Pelvis and trunk rotate away from the pitcher'],
      contacts: 'Back foot; front foot light or lifting.',
      keyStructures: ['gluteus-maximus', 'adductor-magnus', 'rectus-abdominis'],
      coachingQuestions: ['Does the athlete load into the back hip without swaying past the back foot?'],
    }),
    phase({
      id: 'stride', name: 'Stride & foot plant',
      bodyPosition: 'Front foot strides toward the pitcher and lands while the hands stay back.',
      jointActions: ['Pelvis begins rotating toward the pitcher', 'Trunk stays closed, creating hip–shoulder separation'],
      contacts: 'Back foot, then front foot at plant.',
      keyStructures: ['rectus-abdominis', 'latissimus-dorsi', 'adductor-magnus'],
      coachingQuestions: ['Do the hips start to open while the shoulders stay closed?', 'Does the front foot land softly and on time?'],
    }),
    phase({
      id: 'launch', name: 'Launch',
      bodyPosition: 'Pelvis, then trunk, then arms and bat rotate in sequence; the barrel drops into the path of the pitch.',
      jointActions: ['Rapid pelvis and trunk rotation', 'Front knee extending to brace', 'Back elbow moving in toward the side'],
      contacts: 'Both feet; back heel rising.',
      keyStructures: ['gluteus-maximus', 'rectus-abdominis', 'latissimus-dorsi', 'quadriceps'],
      coachingQuestions: ['Does rotation start from the hips rather than the hands?', 'Does the front leg firm up to brace the rotation?'],
    }),
    phase({
      id: 'contact', name: 'Contact',
      bodyPosition: 'Bat meets ball in front of the plate with the front leg braced and hips open.',
      jointActions: ['Front knee near extension', 'Hips open more than the shoulders', 'Arms extending through the ball'],
      contacts: 'Front foot firm; back foot on its toe.',
      keyStructures: ['quadriceps', 'rectus-abdominis', 'forearm-flexors'],
      coachingQuestions: ['Is contact out in front?', 'Is the head stable and behind the ball?'],
    }),
    phase({
      id: 'followThrough', name: 'Follow-through',
      bodyPosition: 'Rotation continues to a balanced finish with the bat wrapping over the front shoulder.',
      jointActions: ['Trunk rotation past square', 'Back foot pivots on the toe'],
      contacts: 'Front foot; back toe.',
      keyStructures: ['erector-spinae', 'rectus-abdominis', 'rotator-cuff'],
      coachingQuestions: ['Can the athlete hold the finish in balance?'],
    }),
  ],
  parameters: [
    handedness('swing'),
    {
      id: 'strideLength', label: 'Stride length (front-foot travel)', kind: 'technique', unit: 'cm',
      default: 22, min: 10, max: 35, step: 1, experimentalMin: 0, experimentalMax: 50,
      effect: 'changes-motion', effectNote: 'Moves the front-foot landing spot; leg IK keeps both feet planted after landing.',
    },
    {
      id: 'swingTime', label: 'Launch-to-contact time', kind: 'tempo', unit: 's',
      default: 0.15, min: 0.13, max: 0.2, step: 0.01, experimentalMin: 0.11, experimentalMax: 0.25,
      effect: 'changes-timing', effectNote: 'Modeled duration from the start of rotation to contact. Shorter means faster rotation and bat speed in the model.',
    },
    {
      id: 'batMass', label: 'Bat mass', kind: 'load', unit: 'kg',
      default: 0.88, min: 0.7, max: 1.0, step: 0.01,
      effect: 'educational-only', effectNote: 'Recorded only (0.88 kg ≈ 31 oz). The keyed clip is not re-solved for bat inertia.',
    },
  ],
  contacts: ['Both feet', 'Hands on bat', 'Bat–ball contact (shown, not simulated)'],
  baseDuration: 1.58,
  loop: false,
  camera: { azimuth: 215, elevation: 12, distance: 4.0 },
  cameraTarget: [0, 0.85, 0.1],
  facingYaw: -90,
  review: 'draft',
  support: DRAFT_SUPPORT,
  unavailableControls: [
    { label: 'Pitch location / height', reason: 'Contact point is keyed for a middle pitch only.' },
    { label: 'Exit velocity / launch angle', reason: 'Bat–ball collision is not simulated.' },
    { label: 'Ground reaction forces', reason: 'Requires force plates under each foot.' },
  ],
};

// ------------------------------------------------------------------- pitch
const pitch: MovementDefinition = {
  id: 'baseball-pitch',
  version: '0.1.0',
  name: 'Baseball pitch',
  aliases: ['baseball pitch', 'pitch', 'pitching', 'fastball', 'pitching delivery', 'throw a pitch', 'pitcher'],
  family: 'Throwing',
  equipment: ['Baseball', 'Mound (shown flat)'],
  summary: 'Leg lift, stride, and sequenced rotation to deliver the ball (from the stretch).',
  segments: [
    { phaseId: 'set', duration: 0.4 },
    { phaseId: 'legLift', duration: 0.5 },
    { phaseId: 'stride', duration: 0.45, durationParam: 'strideTime' },
    { phaseId: 'cocking', duration: 0.1 },
    { phaseId: 'acceleration', duration: 0.04 },
    { phaseId: 'deceleration', duration: 0.1 },
    { phaseId: 'followThrough', duration: 0.45 },
  ],
  phases: [
    phase({
      id: 'set', name: 'Set',
      bodyPosition: 'Standing on the rubber, glove side toward the plate, hands together at the chest.',
      jointActions: ['Near-neutral hips and knees'],
      contacts: 'Back foot on the rubber, front foot.',
      keyStructures: ['gluteus-maximus', 'erector-spinae'],
      coachingQuestions: ['Is the posture tall and balanced over the back leg?'],
    }),
    phase({
      id: 'legLift', name: 'Leg lift',
      bodyPosition: 'Front knee rises while the athlete balances on the back leg.',
      jointActions: ['Front hip flexion', 'Back hip and knee stabilise the stance leg'],
      contacts: 'Back foot only.',
      keyStructures: ['iliopsoas', 'gluteus-maximus', 'calf-complex'],
      coachingQuestions: ['Is the athlete stable on the back leg at the top of the lift?'],
    }),
    phase({
      id: 'stride', name: 'Stride',
      bodyPosition: 'Body moves toward the plate, hips leading, while the hands separate.',
      jointActions: ['Back hip extension and abduction', 'Pelvis begins rotating while the trunk stays closed'],
      contacts: 'Back foot, until the front foot lands.',
      keyStructures: ['gluteus-maximus', 'adductor-magnus', 'hamstrings'],
      coachingQuestions: ['Do the hips lead toward the plate?', 'Does the throwing arm get up on time?'],
    }),
    phase({
      id: 'cocking', name: 'Foot contact → arm cocking',
      bodyPosition: 'Front foot plants, pelvis rotates toward the plate, and the throwing arm lays back behind the head.',
      jointActions: ['Pelvis rotation ahead of the trunk (separation)', 'Shoulder abduction and external rotation', 'Front knee accepting load'],
      contacts: 'Both feet.',
      keyStructures: ['rectus-abdominis', 'pectoralis-major', 'rotator-cuff', 'ucl', 'quadriceps'],
      coachingQuestions: ['Is the arm up when the front foot lands?', 'Do the hips open before the shoulders?'],
    }),
    phase({
      id: 'acceleration', name: 'Acceleration & release',
      bodyPosition: 'Trunk rotates and flexes forward over a firming front leg as the arm whips through to release.',
      jointActions: ['Rapid trunk rotation and flexion', 'Shoulder internal rotation', 'Elbow extension', 'Front knee extending'],
      contacts: 'Front foot; back toe dragging.',
      keyStructures: ['latissimus-dorsi', 'pectoralis-major', 'forearm-flexors', 'quadriceps', 'ucl'],
      coachingQuestions: ['Does the front leg firm up to stop the pelvis?', 'Is release out in front of the head?'],
    }),
    phase({
      id: 'deceleration', name: 'Deceleration',
      bodyPosition: 'Arm continues across the body and down while the trunk keeps flexing over the front leg.',
      jointActions: ['Shoulder horizontal adduction and internal rotation', 'Trunk flexion'],
      contacts: 'Front foot.',
      keyStructures: ['rotator-cuff', 'latissimus-dorsi', 'hamstrings'],
      coachingQuestions: ['Does the arm decelerate over a long path rather than stopping abruptly?'],
    }),
    phase({
      id: 'followThrough', name: 'Follow-through',
      bodyPosition: 'Back leg swings through and lands; the athlete squares up in a fielding position.',
      jointActions: ['Back hip flexion as the leg comes through'],
      contacts: 'Front foot, then both feet.',
      keyStructures: ['gluteus-maximus', 'erector-spinae'],
      coachingQuestions: ['Does the athlete finish balanced and ready to field?'],
    }),
  ],
  parameters: [
    handedness('pitching'),
    {
      id: 'strideLength', label: 'Stride length (rubber to front toe)', kind: 'technique', unit: 'cm',
      default: 135, min: 115, max: 150, step: 1, experimentalMin: 95, experimentalMax: 165,
      effect: 'changes-motion', effectNote: 'Moves the front-foot landing spot and shifts the body after foot contact. Commonly discussed as a share of body height (generic body ≈ 178 cm).',
    },
    {
      id: 'strideTime', label: 'Leg lift to foot contact', kind: 'tempo', unit: 's',
      default: 0.45, min: 0.35, max: 0.6, step: 0.01, experimentalMin: 0.28, experimentalMax: 0.8,
      effect: 'changes-timing', effectNote: 'Modeled duration of the stride phase only.',
    },
  ],
  contacts: ['Back foot on rubber', 'Front foot at landing', 'Ball in hand until release'],
  baseDuration: 2.04,
  loop: false,
  camera: { azimuth: 255, elevation: 10, distance: 4.4 },
  cameraTarget: [0, 0.88, 0.75],
  facingYaw: -90,
  review: 'draft',
  support: DRAFT_SUPPORT,
  unavailableControls: [
    { label: 'Elbow varus torque (UCL load)', reason: 'Needs inverse dynamics with measured arm kinematics; it cannot come from a keyed clip.' },
    { label: 'Pitch type / grip', reason: 'Forearm and wrist pronation/supination are not modeled.' },
    { label: 'Mound slope', reason: 'The ground is flat in this rig.' },
  ],
};

// --------------------------------------------------------- catcher throw
const catcher: MovementDefinition = {
  id: 'catcher-throw',
  version: '0.1.0',
  name: 'Catcher throw to second',
  aliases: ['catcher throw', 'catcher throw down', 'throw down', 'catcher', 'catcher pop time', 'pop time', 'throw to second', 'catcher throwing', 'catcher pop up throw'],
  family: 'Throwing',
  equipment: ['Baseball', 'Catcher’s mitt (not modeled)'],
  summary: 'Receive in the squat, pop up with quick footwork, and throw to second base.',
  segments: [
    { phaseId: 'receive', duration: 0.35 },
    { phaseId: 'transfer', duration: 0.28, durationParam: 'exchangeTime', paramShare: 0.4 },
    { phaseId: 'stride', duration: 0.245, durationParam: 'exchangeTime', paramShare: 0.35 },
    { phaseId: 'acceleration', duration: 0.175, durationParam: 'exchangeTime', paramShare: 0.25 },
    { phaseId: 'followThrough', duration: 0.45 },
  ],
  phases: [
    phase({
      id: 'receive', name: 'Receive',
      bodyPosition: 'Low, wide squat on the balls of the feet; glove presented in front, throwing hand protected.',
      jointActions: ['Deep hip, knee and ankle flexion', 'Trunk inclined forward'],
      contacts: 'Both forefeet.',
      keyStructures: ['quadriceps', 'adductor-magnus', 'gluteus-maximus', 'calf-complex'],
      coachingQuestions: ['Is the weight on the balls of the feet, ready to move?'],
    }),
    phase({
      id: 'transfer', name: 'Transfer & pop-up',
      bodyPosition: 'Glove brings the ball to the throwing hand while the catcher rises and replaces the back foot under the body.',
      jointActions: ['Hip and knee extension', 'Pelvis and trunk rotate to close toward second base'],
      contacts: 'Back foot replaces; front foot unweights.',
      keyStructures: ['gluteus-maximus', 'quadriceps', 'adductor-magnus'],
      coachingQuestions: ['Does the back foot replace under the body rather than stepping back?', 'Is the transfer close to the chest?'],
    }),
    phase({
      id: 'stride', name: 'Stride & arm up',
      bodyPosition: 'Short stride toward second base; the throwing hand goes up by the ear on a short arm path.',
      jointActions: ['Shoulder abduction and external rotation', 'Front foot plants', 'Hip–shoulder separation'],
      contacts: 'Back foot, then front foot.',
      keyStructures: ['rotator-cuff', 'deltoid', 'rectus-abdominis'],
      coachingQuestions: ['Is the arm path short and direct?', 'Is the front shoulder closed and aimed at the bag?'],
    }),
    phase({
      id: 'acceleration', name: 'Acceleration & release',
      bodyPosition: 'Trunk rotates over the front leg and the arm drives through to release.',
      jointActions: ['Trunk rotation and flexion', 'Shoulder internal rotation', 'Elbow extension'],
      contacts: 'Front foot; back toe.',
      keyStructures: ['latissimus-dorsi', 'pectoralis-major', 'forearm-flexors', 'ucl'],
      coachingQuestions: ['Does the throw come over the top for carry and accuracy?'],
    }),
    phase({
      id: 'followThrough', name: 'Follow-through',
      bodyPosition: 'Arm decelerates across the body and the back leg comes through.',
      jointActions: ['Shoulder horizontal adduction', 'Trunk flexion'],
      contacts: 'Front foot, then both feet.',
      keyStructures: ['rotator-cuff', 'hamstrings'],
      coachingQuestions: ['Is the finish balanced and directed toward second base?'],
    }),
  ],
  parameters: [
    handedness('catcher throw'),
    {
      id: 'exchangeTime', label: 'Exchange time (catch to release)', kind: 'tempo', unit: 's',
      default: 0.7, min: 0.6, max: 0.9, step: 0.01, experimentalMin: 0.5, experimentalMax: 1.1,
      effect: 'changes-timing', effectNote: 'Scales transfer, stride and arm acceleration together. Pop time also needs ball flight, which is not modeled.',
    },
  ],
  contacts: ['Both forefeet in the squat', 'Ball in glove, then in hand until release'],
  baseDuration: 1.5,
  loop: false,
  camera: { azimuth: 295, elevation: 12, distance: 3.6 },
  cameraTarget: [0, 0.8, 0.3],
  review: 'draft',
  support: DRAFT_SUPPORT,
  unavailableControls: [
    { label: 'Pop time', reason: 'Ball flight to second base is not modeled; only the exchange time is.' },
    { label: 'Throwing from the knees', reason: 'Needs a separate keyed clip.' },
  ],
};

export const SKILL_MOVEMENTS: MovementDefinition[] = [swing, pitch, catcher];
