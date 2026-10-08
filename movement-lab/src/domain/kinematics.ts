// Generic-body kinematic rig. Produces world-space joint positions for a movement
// at a normalised time. The body faces +Z, +Y is up, the body's left is +X.
// This is a procedurally keyed educational rig, not a musculoskeletal solver.

import { MOVEMENT_BY_ID, squatTiming } from './movements';
import { poseSkill } from './skills';

export type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => mul(a, 1 / (len(a) || 1));
export const dist = (a: V3, b: V3) => len(sub(a, b));
export const vec = { add, sub, mul, dot, cross };
export const rad = (d: number) => (d * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

/** Generic adult body segment lengths (m). Not athlete-specific. */
export const BODY = {
  thigh: 0.44,
  shank: 0.43,
  ankleHeight: 0.08,
  footFront: 0.18,
  footBack: 0.06,
  hipHalfWidth: 0.09,
  trunk: 0.52, // hip centre to neck base
  pelvisDepth: 0.12,
  shoulderHalfWidth: 0.19,
  shoulderDrop: 0.04,
  neck: 0.1,
  head: 0.22,
  upperArm: 0.3,
  forearm: 0.27,
};

export type PointId =
  | 'hipC' | 'lumbar' | 'neck' | 'head'
  | 'hipL' | 'kneeL' | 'ankleL' | 'heelL' | 'toeL'
  | 'hipR' | 'kneeR' | 'ankleR' | 'heelR' | 'toeR'
  | 'shoulderL' | 'elbowL' | 'wristL'
  | 'shoulderR' | 'elbowR' | 'wristR';

export interface Skeleton {
  points: Record<PointId, V3>;
  /** Forward reference vectors used to build segment frames. */
  forward: { trunk: V3; pelvis: V3; legL: V3; legR: V3 };
  contacts: { footL: boolean; footR: boolean };
  equipment: {
    bar?: { center: V3; halfLength: number };
    bat?: { knob: V3; tip: V3 };
    ball?: V3;
  };
}

export interface JointAngles {
  hipFlexL: number; hipFlexR: number;
  kneeFlexL: number; kneeFlexR: number;
  ankleDorsiL: number; ankleDorsiR: number;
  trunkLean: number;
  elbowFlexL: number; elbowFlexR: number;
  /** Angle between upper arm and the trunk's downward axis (0° = arm at side). */
  shoulderElevL: number; shoulderElevR: number;
  /** Horizontal-plane rotation of the shoulder line relative to the hip line (+ = shoulders closed/behind). */
  separation: number;
  /** Headings of the pelvis and shoulder lines in the horizontal plane (deg). */
  pelvisHeading: number; trunkHeading: number;
}

// ---------------------------------------------------------------- helpers
/** Two-bone IK: knee position given hip, ankle and a pole direction. */
export function solveKnee(hip: V3, ankle: V3, l1: number, l2: number, pole: V3): V3 {
  const d = sub(ankle, hip);
  const D = Math.min(len(d), l1 + l2 - 1e-6);
  const axis = norm(d);
  const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const poleOrtho = norm(sub(pole, mul(axis, dot(pole, axis))));
  return add(add(hip, mul(axis, a)), mul(poleOrtho, h));
}

export function rotY(v: V3, angleDeg: number): V3 {
  const c = Math.cos(rad(angleDeg));
  const s = Math.sin(rad(angleDeg));
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function buildUpper(hipC: V3, trunkDir: V3, fwd: V3) {
  const neck = add(hipC, mul(trunkDir, BODY.trunk));
  const lumbar = add(hipC, mul(trunkDir, BODY.pelvisDepth));
  // Head held closer to vertical than the trunk.
  const headDir = norm(add(trunkDir, [0, 0.6, 0]));
  const head = add(neck, mul(headDir, BODY.neck + BODY.head * 0.5));
  const sh = (side: 1 | -1) => add(add(neck, [side * BODY.shoulderHalfWidth, 0, 0]), mul(trunkDir, -BODY.shoulderDrop));
  return { neck, lumbar, head, shoulderL: sh(1), shoulderR: sh(-1), fwd };
}

// ------------------------------------------------------------ front squat
export function squatProgress(t: number, params: Record<string, number>): number {
  const tm = squatTiming(params);
  if (t < tm.setupEnd) return 0;
  if (t < tm.descentEnd) return ease((t - tm.setupEnd) / (tm.descentEnd - tm.setupEnd));
  if (t < tm.pauseEnd) return 1;
  return 1 - ease((t - tm.pauseEnd) / (1 - tm.pauseEnd));
}

function frontSquat(t: number, params: Record<string, number>): Skeleton {
  const s = squatProgress(t, params);
  const width = (params.stanceWidth ?? 35) / 100;
  const depth = params.depth ?? 120;
  const toeOut = 10 + ((params.stanceWidth ?? 35) - 35) * 0.5;
  // Educational assumptions for the generic body (documented in the evidence panel).
  const knee = lerp(4, depth, s);
  const shin = knee * 0.3;
  const thigh = knee - shin;
  const lean = lerp(4, depth * 0.16 - ((params.stanceWidth ?? 35) - 35) * 0.12, s);

  const ankleL: V3 = [width / 2, BODY.ankleHeight, 0];
  const ankleR: V3 = [-width / 2, BODY.ankleHeight, 0];
  const dirL = rotY([0, 0, 1], toeOut);
  const dirR = rotY([0, 0, 1], -toeOut);

  // Hip-ankle distance that yields the requested knee flexion (law of cosines).
  const D = Math.sqrt(BODY.thigh ** 2 + BODY.shank ** 2 + 2 * BODY.thigh * BODY.shank * Math.cos(rad(knee)));
  const dz = BODY.shank * Math.sin(rad(shin)) - BODY.thigh * Math.sin(rad(thigh));
  const dx = width / 2 - BODY.hipHalfWidth;
  const dy = Math.sqrt(Math.max(0.01, D * D - dx * dx - dz * dz));
  const hipC: V3 = [0, BODY.ankleHeight + dy, dz];
  const hipL = add(hipC, [BODY.hipHalfWidth, 0, 0]);
  const hipR = add(hipC, [-BODY.hipHalfWidth, 0, 0]);
  const kneeL = solveKnee(hipL, ankleL, BODY.thigh, BODY.shank, dirL);
  const kneeR = solveKnee(hipR, ankleR, BODY.thigh, BODY.shank, dirR);

  const trunkDir: V3 = [0, Math.cos(rad(lean)), Math.sin(rad(lean))];
  const fwd: V3 = [0, -Math.sin(rad(lean)), Math.cos(rad(lean))];
  const up = buildUpper(hipC, trunkDir, fwd);

  // Front rack: upper arms roughly horizontal, hands back at the shoulders.
  const arm = (shoulder: V3, side: 1 | -1) => {
    const elbow = add(shoulder, mul(norm([side * -0.15, 0.12, 1]), BODY.upperArm));
    const wrist = add(add(shoulder, mul(fwd, 0.09)), [side * -0.02, 0.06, 0]);
    // Keep forearm length by projecting from the elbow toward the target.
    const wristFixed = add(elbow, mul(norm(sub(wrist, elbow)), BODY.forearm));
    return { elbow, wrist: wristFixed };
  };
  const aL = arm(up.shoulderL, 1);
  const aR = arm(up.shoulderR, -1);
  const barCenter = add(add(up.neck, mul(fwd, 0.1)), mul(trunkDir, -0.03));

  return {
    points: {
      hipC, lumbar: up.lumbar, neck: up.neck, head: up.head,
      hipL, kneeL, ankleL, heelL: add(sub(ankleL, mul(dirL, BODY.footBack)), [0, -BODY.ankleHeight * 0.7, 0]), toeL: add(add(ankleL, mul(dirL, BODY.footFront)), [0, -BODY.ankleHeight * 0.7, 0]),
      hipR, kneeR, ankleR, heelR: add(sub(ankleR, mul(dirR, BODY.footBack)), [0, -BODY.ankleHeight * 0.7, 0]), toeR: add(add(ankleR, mul(dirR, BODY.footFront)), [0, -BODY.ankleHeight * 0.7, 0]),
      shoulderL: up.shoulderL, elbowL: aL.elbow, wristL: aL.wrist,
      shoulderR: up.shoulderR, elbowR: aR.elbow, wristR: aR.wrist,
    },
    forward: { trunk: fwd, pelvis: fwd, legL: dirL, legR: dirR },
    contacts: { footL: true, footR: true },
    equipment: { bar: { center: barCenter, halfLength: 1.1 } },
  };
}

// ------------------------------------------------------- sprint acceleration
// Right-leg keyframes over one cycle (two steps): global thigh angle (forward of
// vertical), knee flexion and foot angle below horizontal (deg). Left leg is offset by 0.5.
const SPRINT_KEYS: { p: number; thigh: number; knee: number; foot: number }[] = [
  { p: 0.0, thigh: 12, knee: 38, foot: 16 },
  { p: 0.18, thigh: -8, knee: 40, foot: 24 },
  { p: 0.45, thigh: -42, knee: 12, foot: 70 },
  { p: 0.6, thigh: -12, knee: 100, foot: 97 },
  { p: 0.78, thigh: 48, knee: 105, foot: 42 },
  { p: 0.93, thigh: 34, knee: 55, foot: 11 },
  { p: 1.0, thigh: 12, knee: 38, foot: 16 },
];

function sampleKeys(p: number) {
  const x = ((p % 1) + 1) % 1;
  for (let i = 0; i < SPRINT_KEYS.length - 1; i++) {
    const a = SPRINT_KEYS[i];
    const b = SPRINT_KEYS[i + 1];
    if (x >= a.p && x <= b.p) {
      const k = ease((x - a.p) / (b.p - a.p));
      return { thigh: lerp(a.thigh, b.thigh, k), knee: lerp(a.knee, b.knee, k), foot: lerp(a.foot, b.foot, k) };
    }
  }
  return SPRINT_KEYS[0];
}

/** Right foot is in contact for [0, 0.45), left for [0.5, 0.95). */
export function sprintContacts(t: number) {
  const x = ((t % 1) + 1) % 1;
  return { footR: x < 0.45, footL: x >= 0.5 && x < 0.95 };
}

function sprintAcceleration(t: number, params: Record<string, number>): Skeleton {
  const lean = params.trunkLean ?? 45;
  const legPoints = (p: number, hip: V3) => {
    const k = sampleKeys(p);
    const shin = k.knee - k.thigh; // shank angle behind vertical
    const knee = add(hip, [0, -Math.cos(rad(k.thigh)) * BODY.thigh, Math.sin(rad(k.thigh)) * BODY.thigh]);
    const ankle = add(knee, [0, -Math.cos(rad(shin)) * BODY.shank, -Math.sin(rad(shin)) * BODY.shank]);
    const footDir: V3 = [0, -Math.sin(rad(k.foot)), Math.cos(rad(k.foot))];
    const ankleDown: V3 = [0, -Math.cos(rad(k.foot)), -Math.sin(rad(k.foot))];
    const toe = add(add(ankle, mul(footDir, BODY.footFront)), mul(ankleDown, BODY.ankleHeight * 0.7));
    const heel = add(sub(ankle, mul(footDir, BODY.footBack)), mul(ankleDown, BODY.ankleHeight * 0.7));
    return { knee, ankle, toe, heel };
  };

  const hipC0: V3 = [0, 0, 0];
  const hipL0 = add(hipC0, [BODY.hipHalfWidth, 0, 0]);
  const hipR0 = add(hipC0, [-BODY.hipHalfWidth, 0, 0]);
  const R = legPoints(t, hipR0);
  const L = legPoints(t + 0.5, hipL0);
  const contacts = sprintContacts(t);

  // Ground the stance foot; during flight add a small lift above the lower foot.
  const lowest = Math.min(R.toe[1], R.heel[1], L.toe[1], L.heel[1]);
  const x = ((t % 1) + 1) % 1;
  const inFlight = !contacts.footL && !contacts.footR;
  const flightP = x < 0.5 ? (x - 0.45) / 0.05 : (x - 0.95) / 0.05;
  const lift = inFlight ? 0.03 * Math.sin(Math.PI * Math.min(1, Math.max(0, flightP))) : 0;
  const shift: V3 = [0, -lowest + lift, 0];
  const mv = (v: V3) => add(v, shift);

  const hipC = mv(hipC0);
  const trunkDir: V3 = [0, Math.cos(rad(lean)), Math.sin(rad(lean))];
  const fwd: V3 = [0, -Math.sin(rad(lean)), Math.cos(rad(lean))];
  const up = buildUpper(hipC, trunkDir, fwd);

  // Arms swing opposite to the same-side leg.
  const arm = (shoulder: V3, phase: number) => {
    const swing = 55 * Math.cos(2 * Math.PI * phase) - 10; // + = forward (shoulder flexion)
    const a = rad(swing + lean * 0.6);
    const upperDir: V3 = [0, -Math.cos(a), Math.sin(a)];
    const elbow = add(shoulder, mul(upperDir, BODY.upperArm));
    const fa = a + rad(85);
    const wrist = add(elbow, mul([0, -Math.cos(fa), Math.sin(fa)], BODY.forearm));
    return { elbow, wrist };
  };
  const aL = arm(up.shoulderL, t);
  const aR = arm(up.shoulderR, t + 0.5);

  return {
    points: {
      hipC, lumbar: up.lumbar, neck: up.neck, head: up.head,
      hipL: mv(hipL0), kneeL: mv(L.knee), ankleL: mv(L.ankle), heelL: mv(L.heel), toeL: mv(L.toe),
      hipR: mv(hipR0), kneeR: mv(R.knee), ankleR: mv(R.ankle), heelR: mv(R.heel), toeR: mv(R.toe),
      shoulderL: up.shoulderL, elbowL: aL.elbow, wristL: aL.wrist,
      shoulderR: up.shoulderR, elbowR: aR.elbow, wristR: aR.wrist,
    },
    forward: { trunk: fwd, pelvis: fwd, legL: [0, 0, 1], legR: [0, 0, 1] },
    contacts,
    equipment: {},
  };
}

// ---------------------------------------------------------------- public
export function poseAt(movementId: string, t: number, params: Record<string, number>): Skeleton {
  const m = MOVEMENT_BY_ID[movementId];
  if (!m) throw new Error(`Unknown movement ${movementId}`);
  let sk: Skeleton;
  if (movementId === 'front-squat') sk = frontSquat(((t % 1) + 1) % 1, params);
  else if (movementId === 'sprint-acceleration') sk = sprintAcceleration(t, params);
  else sk = poseSkill(m, Math.min(1, Math.max(0, t)), params);
  return params.handedness === 1 ? mirror(sk) : sk;
}

/** Left-right mirror (for left-handed variants). Labels stay anatomical: the left leg is still the left leg. */
export function mirror(sk: Skeleton): Skeleton {
  const M = (v: V3): V3 => [-v[0], v[1], v[2]];
  const P = sk.points;
  const swap: Record<string, PointId> = {};
  (Object.keys(P) as PointId[]).forEach((k) => {
    swap[k] = (k.endsWith('L') ? k.slice(0, -1) + 'R' : k.endsWith('R') ? k.slice(0, -1) + 'L' : k) as PointId;
  });
  const points = Object.fromEntries((Object.keys(P) as PointId[]).map((k) => [k, M(P[swap[k]])])) as Record<PointId, V3>;
  const e = sk.equipment;
  return {
    points,
    forward: { trunk: M(sk.forward.trunk), pelvis: M(sk.forward.pelvis), legL: M(sk.forward.legR), legR: M(sk.forward.legL) },
    contacts: { footL: sk.contacts.footR, footR: sk.contacts.footL },
    equipment: {
      bar: e.bar && { ...e.bar, center: M(e.bar.center) },
      bat: e.bat && { knob: M(e.bat.knob), tip: M(e.bat.tip) },
      ball: e.ball && M(e.ball),
    },
  };
}

function angleBetween(a: V3, b: V3) {
  return deg(Math.acos(Math.max(-1, Math.min(1, dot(norm(a), norm(b))))));
}

/** Convention-defined joint angles measured from the skeleton geometry. */
export function jointAngles(sk: Skeleton): JointAngles {
  const P = sk.points;
  const trunk = sub(P.neck, P.hipC);
  const lateral = norm(sub(P.hipL, P.hipR)); // body-left
  const hip = (h: V3, k: V3) => {
    const thigh = sub(k, h);
    const a = 180 - angleBetween(trunk, thigh);
    // Sign: negative when the thigh is behind the trunk line (hyperextension).
    const s = dot(cross(norm(trunk), norm(thigh)), lateral);
    return s > 0 ? a : -a;
  };
  const knee = (h: V3, k: V3, a: V3) => 180 - angleBetween(sub(h, k), sub(a, k));
  const ankle = (k: V3, a: V3, toe: V3, heel: V3) => 90 - angleBetween(sub(k, a), sub(toe, heel));
  const heading = (l: V3) => deg(Math.atan2(l[0], l[2])) - 90; // heading of the facing direction
  const flat = (v: V3): V3 => [v[0], 0, v[2]];
  const hipLine = flat(sub(P.hipL, P.hipR));
  const shLine = flat(sub(P.shoulderL, P.shoulderR));
  const signedYaw = (a: V3, b: V3) => {
    const c = cross(norm(a), norm(b))[1];
    return deg(Math.atan2(c, dot(norm(a), norm(b))));
  };
  return {
    hipFlexL: hip(P.hipL, P.kneeL),
    hipFlexR: hip(P.hipR, P.kneeR),
    kneeFlexL: knee(P.hipL, P.kneeL, P.ankleL),
    kneeFlexR: knee(P.hipR, P.kneeR, P.ankleR),
    ankleDorsiL: ankle(P.kneeL, P.ankleL, P.toeL, P.heelL),
    ankleDorsiR: ankle(P.kneeR, P.ankleR, P.toeR, P.heelR),
    trunkLean: angleBetween(trunk, [0, 1, 0]),
    elbowFlexL: 180 - angleBetween(sub(P.shoulderL, P.elbowL), sub(P.wristL, P.elbowL)),
    elbowFlexR: 180 - angleBetween(sub(P.shoulderR, P.elbowR), sub(P.wristR, P.elbowR)),
    shoulderElevL: angleBetween(sub(P.elbowL, P.shoulderL), mul(trunk, -1)),
    shoulderElevR: angleBetween(sub(P.elbowR, P.shoulderR), mul(trunk, -1)),
    // Positive when the shoulder line lags the hip line in the direction the hips are turning.
    separation: Math.abs(signedYaw(hipLine, shLine)),
    pelvisHeading: heading(hipLine),
    trunkHeading: heading(shLine),
  };
}

// --------------------------------------------------------- segment frames
export type SegmentId =
  | 'pelvis' | 'trunk' | 'head'
  | 'thighL' | 'shankL' | 'footL' | 'thighR' | 'shankR' | 'footR'
  | 'upperArmL' | 'forearmL' | 'upperArmR' | 'forearmR';

export const SEGMENTS: Record<SegmentId, { from: PointId; to: PointId; fwd: 'trunk' | 'pelvis' | 'legL' | 'legR' }> = {
  pelvis: { from: 'hipC', to: 'lumbar', fwd: 'pelvis' },
  trunk: { from: 'hipC', to: 'neck', fwd: 'trunk' },
  head: { from: 'neck', to: 'head', fwd: 'trunk' },
  thighL: { from: 'hipL', to: 'kneeL', fwd: 'legL' },
  shankL: { from: 'kneeL', to: 'ankleL', fwd: 'legL' },
  footL: { from: 'heelL', to: 'toeL', fwd: 'legL' },
  thighR: { from: 'hipR', to: 'kneeR', fwd: 'legR' },
  shankR: { from: 'kneeR', to: 'ankleR', fwd: 'legR' },
  footR: { from: 'heelR', to: 'toeR', fwd: 'legR' },
  upperArmL: { from: 'shoulderL', to: 'elbowL', fwd: 'trunk' },
  forearmL: { from: 'elbowL', to: 'wristL', fwd: 'trunk' },
  upperArmR: { from: 'shoulderR', to: 'elbowR', fwd: 'trunk' },
  forearmR: { from: 'elbowR', to: 'wristR', fwd: 'trunk' },
};

export interface Frame { origin: V3; axis: V3; fwd: V3; side: V3; length: number }

export function segmentFrame(sk: Skeleton, id: SegmentId): Frame {
  const seg = SEGMENTS[id];
  const a = sk.points[seg.from];
  const b = sk.points[seg.to];
  const axis = norm(sub(b, a));
  let ref = sk.forward[seg.fwd];
  if (Math.abs(dot(ref, axis)) > 0.92) ref = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1];
  // For a downward-pointing limb, "front" is the forward reference; for the
  // foot (pointing forward), "front" means up.
  if (id.startsWith('foot')) ref = [0, 1, 0];
  const fwd = norm(sub(ref, mul(axis, dot(ref, axis))));
  const side = norm(cross(axis, fwd));
  return { origin: a, axis, fwd, side, length: dist(a, b) };
}

/** Anchor: point at fraction `t` along a segment, offset forward/side (m). */
export interface Anchor { seg: SegmentId; t: number; f?: number; s?: number }

export function anchorPoint(sk: Skeleton, a: Anchor): V3 {
  const fr = segmentFrame(sk, a.seg);
  return add(add(add(fr.origin, mul(fr.axis, fr.length * a.t)), mul(fr.fwd, a.f ?? 0)), mul(fr.side, a.s ?? 0));
}
