// Keyframed skill clips (swing, pitch, catcher throw) on the generic rig.
// Keys define pelvis position/heading, trunk heading/lean/tilt, foot placements
// and hand targets. Knees and elbows are solved with two-bone IK, so planted feet
// stay planted and segment lengths stay constant. Keys are hand-authored from
// general descriptions of each skill's phases. They are NOT motion capture.
//
// Coordinates: +Y up, +Z toward the target (pitcher for the batter, home plate
// for the pitcher, second base for the catcher). Clips are authored right-handed;
// left-handed variants are mirrored in kinematics.poseAt.

import { BODY, solveKnee, type Skeleton, type V3 } from './kinematics';
import { segmentTiming } from './movements';
import type { MovementDefinition } from './types';

// Local vector helpers (kinematics imports this module, so avoid using its
// exports at module-evaluation time).
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => mul(a, 1 / (len(a) || 1));
const dist = (a: V3, b: V3) => len(sub(a, b));
const rad = (d: number) => (d * Math.PI) / 180;
const UP: V3 = [0, 1, 0];
const SOLE = 0.024; // sole height of toe/heel points above the ground

interface FootKey { toe: [number, number]; yaw: number; lift?: number; y?: number }
interface SkillKey {
  at: [string, number]; // phase id, fraction through the phase
  hip: V3;
  pelvisYaw: number;
  trunkYaw: number;
  lean: number;
  tilt?: number; // + toward body-right
  footL: FootKey;
  footR: FootKey;
  handL: V3;
  handR: V3;
  batDir?: V3;
  elbowPoleL?: V3;
  elbowPoleR?: V3;
}

/** Heading (deg) → horizontal facing vector; 0° faces +Z, −90° faces −X. */
const heading = (deg: number): V3 => [Math.sin(rad(deg)), 0, Math.cos(rad(deg))];
/** Body-left for a facing direction. */
const leftOf = (h: V3): V3 => [h[2], 0, -h[0]];

// ------------------------------------------------------------------- clips
function swingKeys(p: Record<string, number>): SkillKey[] {
  const plantZ = 0.36 + (p.strideLength ?? 22) / 100;
  const stanceL: FootKey = { toe: [-0.14, 0.36], yaw: -90 };
  const backFoot: FootKey = { toe: [-0.14, -0.4], yaw: -90 };
  const planted: FootKey = { toe: [-0.18, plantZ], yaw: -70 };
  const stance: SkillKey = {
    at: ['stance', 0], hip: [0.06, 0.86, -0.02], pelvisYaw: -90, trunkYaw: -90, lean: 22,
    footL: stanceL, footR: backFoot, handL: [-0.25, 1.28, -0.3], handR: [0, 0, 0], batDir: [0.15, 0.8, -0.5],
  };
  return [
    stance,
    { ...stance, at: ['stance', 1] },
    { ...stance, at: ['load', 1], hip: [0.09, 0.85, -0.07], pelvisYaw: -100, trunkYaw: -112, footL: { ...stanceL, y: 0.04, lift: 20 }, handL: [-0.18, 1.3, -0.38] },
    { ...stance, at: ['stride', 1], hip: [0.07, 0.83, 0.02], pelvisYaw: -95, trunkYaw: -112, footL: planted, handL: [-0.17, 1.28, -0.36] },
    { ...stance, at: ['launch', 0.5], hip: [0.06, 0.82, 0.07], pelvisYaw: -62, trunkYaw: -88, tilt: 10, footL: planted, footR: { ...backFoot, yaw: -85, lift: 8 }, handL: [-0.28, 1.12, -0.18], batDir: [0.35, 0.35, -0.87] },
    { ...stance, at: ['contact', 0.5], hip: [0.06, 0.82, 0.1], pelvisYaw: -35, trunkYaw: -55, lean: 20, tilt: 15, footL: planted, footR: { ...backFoot, yaw: -75, lift: 18 }, handL: [-0.25, 1.0, 0.15], batDir: [-0.95, -0.12, 0.25] },
    { ...stance, at: ['followThrough', 0.5], hip: [0.04, 0.84, 0.09], pelvisYaw: 0, trunkYaw: 25, lean: 15, tilt: 5, footL: planted, footR: { toe: [-0.1, -0.34], yaw: -20, lift: 40 }, handL: [0.28, 1.42, 0.28], batDir: [0.2, -0.45, -0.87] },
    { ...stance, at: ['followThrough', 1], hip: [0.04, 0.84, 0.09], pelvisYaw: 0, trunkYaw: 25, lean: 15, tilt: 5, footL: planted, footR: { toe: [-0.1, -0.34], yaw: -20, lift: 40 }, handL: [0.26, 1.38, 0.25], batDir: [0.2, -0.45, -0.87] },
  ];
}

function pitchKeys(p: Record<string, number>): SkillKey[] {
  const S = (p.strideLength ?? 135) / 100;
  const d = S - 1.35;
  const h = d * 0.5; // body shift after foot contact
  const front: FootKey = { toe: [-0.08, S], yaw: -15 };
  const set: SkillKey = {
    at: ['set', 0], hip: [0.06, 0.92, 0.17], pelvisYaw: -90, trunkYaw: -90, lean: 5,
    footL: { toe: [-0.12, 0.4], yaw: -90 }, footR: { toe: [-0.12, 0], yaw: -90 },
    handL: [-0.2, 1.22, 0.21], handR: [-0.2, 1.22, 0.15],
  };
  return [
    set,
    { ...set, at: ['set', 1] },
    { ...set, at: ['legLift', 1], hip: [0.07, 0.93, 0.12], pelvisYaw: -100, trunkYaw: -100, lean: 3, footL: { toe: [-0.05, 0.12], y: 0.35, yaw: -100, lift: 30 }, handL: [-0.15, 1.3, 0.15], handR: [-0.15, 1.3, 0.09] },
    { ...set, at: ['stride', 0.5], hip: [0.05, 0.86, 0.4 + d * 0.25], pelvisYaw: -95, trunkYaw: -100, lean: 0, footL: { toe: [-0.06, 0.85 + d * 0.5], y: 0.1, yaw: -40, lift: 5 }, footR: { toe: [-0.12, 0], yaw: -90, lift: 10 }, handL: [-0.15, 1.25, 0.75 + d * 0.25], handR: [0.15, 1.05, -0.15 + d * 0.25] },
    { ...set, at: ['stride', 1], hip: [0, 0.76, 0.7 + h], pelvisYaw: -60, trunkYaw: -100, lean: 0, footL: front, footR: { toe: [0, 0.1], yaw: -60, lift: 60 }, handL: [-0.1, 1.3, 1.15 + h], handR: [0.08, 1.5, 0.23 + h], elbowPoleR: [0.17, -0.2, -0.98] },
    { ...set, at: ['cocking', 1], hip: [0, 0.76, 0.85 + h], pelvisYaw: -10, trunkYaw: -45, lean: 10, tilt: -15, footL: front, footR: { toe: [0.01, 0.2], yaw: -50, lift: 65 }, handL: [0.2, 1.15, 1.05 + h], handR: [-0.16, 1.4, 0.54 + h], elbowPoleR: [-0.71, -0.2, -0.71] },
    { ...set, at: ['acceleration', 1], hip: [0, 0.82, 0.95 + h], pelvisYaw: 5, trunkYaw: 0, lean: 35, tilt: -25, footL: front, footR: { toe: [0.02, 0.4], yaw: -30, lift: 70 }, handL: [0.3, 1.0, 1.0 + h], handR: [-0.15, 1.58, 1.58 + h], elbowPoleR: [-0.8, -0.5, -0.2] },
    { ...set, at: ['deceleration', 1], hip: [0, 0.78, 1.0 + h], pelvisYaw: 20, trunkYaw: 35, lean: 50, tilt: -10, footL: front, footR: { toe: [0.25, 0.75 + h], y: 0.3, yaw: 0, lift: 40 }, handL: [0.35, 0.95, 0.95 + h], handR: [0.35, 0.75, 1.25 + h] },
    { ...set, at: ['followThrough', 1], hip: [-0.18, 0.85, S - 0.25], pelvisYaw: -5, trunkYaw: 0, lean: 20, footL: front, footR: { toe: [-0.35, S - 0.05], yaw: 0 }, handL: [-0.1, 1.0, S + 0.05], handR: [-0.25, 1.0, S] },
  ];
}

function catcherKeys(): SkillKey[] {
  const squatL: FootKey = { toe: [0.28, 0.12], yaw: 25, lift: 25 };
  const squatR: FootKey = { toe: [-0.28, 0.12], yaw: -25, lift: 25 };
  const front: FootKey = { toe: [0, 0.55], yaw: -40 };
  const receive: SkillKey = {
    at: ['receive', 0], hip: [0, 0.42, -0.05], pelvisYaw: 0, trunkYaw: 0, lean: 25,
    footL: squatL, footR: squatR, handL: [0.1, 0.75, 0.45], handR: [-0.22, 0.55, 0],
  };
  return [
    receive,
    { ...receive, at: ['receive', 1], handL: [0.08, 0.78, 0.4] },
    { ...receive, at: ['transfer', 1], hip: [0, 0.66, -0.06], pelvisYaw: -50, trunkYaw: -65, lean: 20, footL: { toe: [0.2, 0.25], y: 0.05, yaw: 0, lift: 10 }, footR: { toe: [-0.05, 0], yaw: -80 }, handL: [-0.35, 1.02, 0.14], handR: [-0.35, 1.04, 0.08] },
    { ...receive, at: ['stride', 1], hip: [0.03, 0.78, 0.1], pelvisYaw: -80, trunkYaw: -95, lean: 5, footL: front, footR: { toe: [-0.05, -0.05], yaw: -90 }, handL: [-0.15, 1.25, 0.45], handR: [0.15, 1.5, -0.22], elbowPoleR: [0.09, -0.3, -1] },
    { ...receive, at: ['acceleration', 0.6], hip: [0.03, 0.76, 0.2], pelvisYaw: -35, trunkYaw: -55, lean: 15, tilt: -10, footL: front, footR: { toe: [-0.05, -0.05], yaw: -80, lift: 30 }, handL: [0.15, 1.1, 0.4], handR: [-0.05, 1.45, -0.02], elbowPoleR: [-0.6, -0.2, -0.75] },
    { ...receive, at: ['acceleration', 1], hip: [0.03, 0.78, 0.28], pelvisYaw: 0, trunkYaw: 5, lean: 30, tilt: -15, footL: front, footR: { toe: [-0.02, 0.08], yaw: -30, lift: 50 }, handL: [0.3, 1.0, 0.45], handR: [-0.11, 1.6, 0.88], elbowPoleR: [-0.8, -0.5, 0] },
    { ...receive, at: ['followThrough', 0.4], hip: [0.04, 0.76, 0.35], pelvisYaw: 15, trunkYaw: 30, lean: 40, tilt: -5, footL: front, footR: { toe: [0.05, 0.4], y: 0.2, yaw: 0, lift: 30 }, handL: [0.35, 1.0, 0.5], handR: [0.3, 0.85, 0.75] },
    { ...receive, at: ['followThrough', 1], hip: [0, 0.84, 0.5], pelvisYaw: 0, trunkYaw: 5, lean: 15, footL: front, footR: { toe: [-0.2, 0.75], yaw: 0 }, handL: [0.15, 1.0, 0.9], handR: [-0.1, 1.0, 0.85] },
  ];
}

interface BallPlan {
  /** Ball arrives into the scene (e.g. a pitch to the batter or catcher). */
  incoming?: { at: [string, number]; speed: number; target: 'bat' | 'handL' };
  /** Holding spans: which hand carries the ball from a key time. */
  holds?: { from: [string, number]; hand: 'L' | 'R' }[];
  /** Release and outgoing flight direction. */
  release?: { at: [string, number]; dir: V3; speed: number };
  /** For the swing: batted-ball direction after contact. */
  batted?: { dir: V3; speed: number };
}

const CLIPS: Record<string, { keys: (p: Record<string, number>) => SkillKey[]; ball: BallPlan }> = {
  'baseball-swing': {
    keys: swingKeys,
    ball: { incoming: { at: ['contact', 0.5], speed: 38, target: 'bat' }, batted: { dir: [-0.1, 0.35, 1], speed: 45 } },
  },
  'baseball-pitch': {
    keys: pitchKeys,
    ball: { holds: [{ from: ['set', 0], hand: 'R' }], release: { at: ['acceleration', 1], dir: [0, -0.03, 1], speed: 38 } },
  },
  'catcher-throw': {
    keys: () => catcherKeys(),
    ball: {
      incoming: { at: ['receive', 1], speed: 35, target: 'handL' },
      holds: [{ from: ['receive', 1], hand: 'L' }, { from: ['transfer', 0.6], hand: 'R' }],
      release: { at: ['acceleration', 1], dir: [0, 0.03, 1], speed: 35 },
    },
  },
};

// ------------------------------------------------------- interpolation
function toVec(k: SkillKey): number[] {
  const f = (x: FootKey) => [x.toe[0], x.toe[1], x.yaw, x.lift ?? 0, x.y ?? 0];
  return [
    ...k.hip, k.pelvisYaw, k.trunkYaw, k.lean, k.tilt ?? 0,
    ...f(k.footL), ...f(k.footR), ...k.handL, ...k.handR,
    ...(k.batDir ? norm(k.batDir) : [0, 0, 0]),
    ...(k.elbowPoleL ?? [0, 0, 0]), ...(k.elbowPoleR ?? [0, 0, 0]),
  ];
}

function fromVec(v: number[], hasBat: boolean): Omit<SkillKey, 'at'> {
  const foot = (i: number): FootKey => ({ toe: [v[i], v[i + 1]], yaw: v[i + 2], lift: v[i + 3], y: v[i + 4] });
  const v3 = (i: number): V3 => [v[i], v[i + 1], v[i + 2]];
  const pole = (i: number) => (len(v3(i)) > 1e-3 ? v3(i) : undefined);
  return {
    hip: v3(0), pelvisYaw: v[3], trunkYaw: v[4], lean: v[5], tilt: v[6],
    footL: foot(7), footR: foot(12), handL: v3(17), handR: v3(20),
    batDir: hasBat ? norm(v3(23)) : undefined, elbowPoleL: pole(26), elbowPoleR: pole(29),
  };
}

/**
 * Cubic Hermite through keys with finite-difference tangents (C1-continuous).
 * A channel that holds its value across neighbouring keys (a planted foot, a
 * paused pose) gets a zero tangent there, so holds stay perfectly still.
 */
function sample(times: number[], vals: number[][], t: number): number[] {
  const n = times.length;
  if (t <= times[0]) return vals[0];
  if (t >= times[n - 1]) return vals[n - 1];
  let i = 0;
  while (i < n - 2 && t > times[i + 1]) i++;
  const t0 = times[i];
  const dt = times[i + 1] - t0 || 1e-9;
  const u = (t - t0) / dt;
  const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  const tangent = (j: number, c: number) => {
    const prev = j > 0 ? vals[j - 1][c] : undefined;
    const next = j < n - 1 ? vals[j + 1][c] : undefined;
    const v = vals[j][c];
    if ((prev !== undefined && same(prev, v)) || (next !== undefined && same(next, v))) return 0;
    if (prev === undefined || next === undefined) return 0;
    return (next - prev) / (times[j + 1] - times[j - 1] || 1e-9);
  };
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  return vals[i].map((p0, c) => h00 * p0 + h10 * tangent(i, c) * dt + h01 * vals[i + 1][c] + h11 * tangent(i + 1, c) * dt);
}

export function keyTime(m: MovementDefinition, params: Record<string, number>, at: [string, number]) {
  const b = segmentTiming(m, params).bounds[at[0]];
  return b.start + (b.end - b.start) * at[1];
}

// --------------------------------------------------------------- body build
function footPoints(f: FootKey) {
  const hf = heading(f.yaw);
  const lift = rad(f.lift ?? 0);
  const fd = norm(sub(mul(hf, Math.cos(lift)), mul(UP, Math.sin(lift)))); // heel → toe
  const n = add(mul(hf, Math.sin(lift)), mul(UP, Math.cos(lift))); // sole normal
  const toe: V3 = [f.toe[0], SOLE + (f.y ?? 0), f.toe[1]];
  const span = BODY.footFront + BODY.footBack;
  const heel = sub(toe, mul(fd, span));
  const ankle = add(add(heel, mul(fd, BODY.footBack)), mul(n, BODY.ankleHeight * 0.7));
  return { toe, heel, ankle, dir: hf };
}

/** Keep a target within reach of a two-bone chain; returns the reachable point. */
function reach(root: V3, target: V3, L: number): V3 {
  const d = dist(root, target);
  return d <= L ? target : add(root, mul(norm(sub(target, root)), L));
}

function build(k: Omit<SkillKey, 'at'>): Skeleton {
  const hp = heading(k.pelvisYaw);
  const lp = leftOf(hp);
  const hipC = k.hip;
  const hipL = add(hipC, mul(lp, BODY.hipHalfWidth));
  const hipR = sub(hipC, mul(lp, BODY.hipHalfWidth));

  const ht = heading(k.trunkYaw);
  const lt = leftOf(ht);
  const lean = rad(k.lean);
  const tilt = rad(k.tilt ?? 0);
  let trunkDir = norm(add(mul(UP, Math.cos(lean)), mul(ht, Math.sin(lean))));
  trunkDir = norm(add(mul(trunkDir, Math.cos(tilt)), mul(lt, -Math.sin(tilt))));
  const fwd = norm(sub(ht, mul(trunkDir, dot(ht, trunkDir))));
  const side = norm(cross(trunkDir, fwd)); // body-left
  const neck = add(hipC, mul(trunkDir, BODY.trunk));
  const lumbar = add(hipC, mul(trunkDir, BODY.pelvisDepth));
  const head = add(neck, mul(norm(add(trunkDir, [0, 0.6, 0])), BODY.neck + BODY.head * 0.5));
  const shoulderL = sub(add(neck, mul(side, BODY.shoulderHalfWidth)), mul(trunkDir, BODY.shoulderDrop));
  const shoulderR = sub(sub(neck, mul(side, BODY.shoulderHalfWidth)), mul(trunkDir, BODY.shoulderDrop));

  const leg = (hip: V3, f: FootKey) => {
    const fp = footPoints(f);
    const ankle = reach(hip, fp.ankle, BODY.thigh + BODY.shank - 1e-4);
    const shift = sub(ankle, fp.ankle);
    const knee = solveKnee(hip, ankle, BODY.thigh, BODY.shank, add(fp.dir, [0, 0.15, 0]));
    return { knee, ankle, toe: add(fp.toe, shift), heel: add(fp.heel, shift), dir: fp.dir, contact: (f.y ?? 0) < 0.015 && len(shift) < 0.01 };
  };
  const L = leg(hipL, k.footL);
  const R = leg(hipR, k.footR);

  let handL = k.handL;
  let handR = k.handR;
  let bat: Skeleton['equipment']['bat'];
  if (k.batDir) {
    // Bottom hand (left for a right-handed batter) holds the knob end; top hand just above it.
    handR = add(handL, mul(k.batDir, 0.09));
    bat = { knob: sub(handL, mul(k.batDir, 0.06)), tip: add(handL, mul(k.batDir, 0.78)) };
  }
  const armLen = BODY.upperArm + BODY.forearm - 1e-4;
  const arm = (shoulder: V3, hand: V3, pole: V3 | undefined, s: 1 | -1) => {
    const wrist = reach(shoulder, hand, armLen);
    const defPole = norm(add(add(mul(trunkDir, -1), mul(side, 0.35 * s)), mul(fwd, -0.3)));
    const elbow = solveKnee(shoulder, wrist, BODY.upperArm, BODY.forearm, pole ? norm(pole) : defPole);
    return { elbow, wrist };
  };
  const aL = arm(shoulderL, handL, k.elbowPoleL, 1);
  const aR = arm(shoulderR, handR, k.elbowPoleR, -1);

  return {
    points: {
      hipC, lumbar, neck, head,
      hipL, kneeL: L.knee, ankleL: L.ankle, heelL: L.heel, toeL: L.toe,
      hipR, kneeR: R.knee, ankleR: R.ankle, heelR: R.heel, toeR: R.toe,
      shoulderL, elbowL: aL.elbow, wristL: aL.wrist,
      shoulderR, elbowR: aR.elbow, wristR: aR.wrist,
    },
    forward: { trunk: fwd, pelvis: hp, legL: L.dir, legR: R.dir },
    contacts: { footL: L.contact, footR: R.contact },
    equipment: { bat },
  };
}

function poseNoBall(m: MovementDefinition, t: number, params: Record<string, number>): Skeleton {
  const clip = CLIPS[m.id];
  const keys = clip.keys(params);
  const times = keys.map((k) => keyTime(m, params, k.at));
  const hasBat = !!keys[0].batDir;
  const v = sample(times, keys.map(toVec), t);
  return build(fromVec(v, hasBat));
}

/** Sweet spot of the bat (≈ 15 cm from the tip). */
const sweetSpot = (sk: Skeleton): V3 | undefined => {
  const b = sk.equipment.bat;
  return b && add(b.knob, mul(sub(b.tip, b.knob), 0.82));
};

export function poseSkill(m: MovementDefinition, t: number, params: Record<string, number>): Skeleton {
  const sk = poseNoBall(m, t, params);
  const plan = CLIPS[m.id].ball;
  const dur = segmentTiming(m, params).total;
  const kt = (at: [string, number]) => keyTime(m, params, at);
  let ball: V3 | undefined;

  if (plan.incoming) {
    const tc = kt(plan.incoming.at);
    if (t < tc) {
      const tau = (tc - t) * dur; // seconds before arrival
      if (tau < 0.3) {
        const target = plan.incoming.target === 'bat' ? sweetSpot(poseNoBall(m, tc, params))! : poseNoBall(m, tc, params).points.wristL;
        ball = add(target, mul(norm([0, 0.04, 1]), tau * plan.incoming.speed));
      }
    } else if (plan.batted) {
      const target = sweetSpot(poseNoBall(m, tc, params))!;
      const travel = (t - tc) * dur * plan.batted.speed;
      if (travel < 8) ball = add(target, mul(norm(plan.batted.dir), travel));
    }
  }
  if (plan.holds) {
    const release = plan.release ? kt(plan.release.at) : 2;
    const active = [...plan.holds].reverse().find((h) => t >= kt(h.from));
    if (active && t <= release) {
      const w = active.hand === 'L' ? sk.points.wristL : sk.points.wristR;
      ball = add(w, mul(norm(sub(w, active.hand === 'L' ? sk.points.elbowL : sk.points.elbowR)), 0.06));
    }
    if (plan.release && t > release) {
      const rp = poseNoBall(m, release, params).points.wristR;
      const travel = (t - release) * dur * plan.release.speed;
      if (travel < 8) ball = add(rp, mul(norm(plan.release.dir), travel));
    }
  }
  return { ...sk, equipment: { ...sk.equipment, ball } };
}

export const SKILL_IDS = Object.keys(CLIPS);
