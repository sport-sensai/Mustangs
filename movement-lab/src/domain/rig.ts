// Visual/mechanical mapping between anatomical structures and the generic rig.
// Each visual is a polyline of anchors on body segments. The visual body is NOT a
// musculoskeletal model; muscle "length" here is the straight-segment path length
// through simplified attachment and via points (PRD §12: keep visuals and
// mathematics separate, with explicit mappings).

import { anchorPoint, dist, poseAt, type Anchor, type SegmentId, type Skeleton, type V3 } from './kinematics';
import { MOVEMENT_BY_ID, cycleDuration } from './movements';
import { STRUCTURE_BY_ID } from './anatomy';

type Side = 'L' | 'R';
export interface RigVisual {
  meshId: string;
  kind: 'muscle' | 'tendon' | 'bone' | 'ligament' | 'fascia' | 'line';
  path: Anchor[];
  radius: number;
  /** Deep structures sit inside the skin and show when the skin is faded. */
  depth: 'superficial' | 'deep';
}

const TRUNKLIKE: SegmentId[] = ['pelvis', 'trunk', 'head'];
/** Anchor helper. `x` is a world-lateral offset (+ = body's left) converted to the segment's side axis. */
function A(seg: SegmentId, t: number, f = 0, x = 0): Anchor {
  return { seg, t, f, s: TRUNKLIKE.includes(seg) ? x : -x };
}
const seg = (base: 'thigh' | 'shank' | 'foot' | 'upperArm' | 'forearm', side: Side) => `${base}${side}` as SegmentId;

function sideVisuals(S: Side): RigVisual[] {
  const k = S === 'L' ? 1 : -1; // world-lateral sign
  const s = S.toLowerCase();
  const thigh = seg('thigh', S);
  const shank = seg('shank', S);
  const foot = seg('foot', S);
  const ua = seg('upperArm', S);
  return [
    { meshId: `m-glute-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.06,
      path: [A('pelvis', 0.7, -0.1, k * 0.05), A('pelvis', -0.2, -0.11, k * 0.1), A(thigh, 0.25, -0.04, k * 0.05)] },
    { meshId: `m-quad-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.058,
      // Origin on the proximal femur (vasti); the two knee via points wrap the patella
      // over the condyles so the path lengthens with knee flexion.
      path: [A(thigh, 0.12, 0.06, k * 0.01), A(thigh, 0.5, 0.07, k * 0.01), A(thigh, 1.0, 0.075), A(shank, 0.0, 0.075), A(shank, 0.1, 0.055)] },
    { meshId: `m-ham-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.052,
      path: [A('pelvis', -0.45, -0.08, k * 0.06), A(thigh, 0.5, -0.065), A(thigh, 0.9, -0.05), A(shank, 0.12, -0.04)] },
    { meshId: `m-add-${s}`, kind: 'muscle', depth: 'deep', radius: 0.045,
      path: [A('pelvis', -0.55, -0.01, k * 0.025), A(thigh, 0.45, -0.01, -k * 0.035), A(thigh, 0.85, -0.02, -k * 0.04)] },
    { meshId: `m-calf-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.05,
      path: [A(thigh, 0.93, -0.05), A(shank, 0.3, -0.07), A(shank, 0.72, -0.045)] },
    { meshId: `t-achilles-${s}`, kind: 'tendon', depth: 'superficial', radius: 0.016,
      path: [A(shank, 0.72, -0.045), A(foot, 0.04, 0.03)] },
    { meshId: `m-psoas-${s}`, kind: 'muscle', depth: 'deep', radius: 0.03,
      path: [A('pelvis', 1.4, 0.0, k * 0.03), A('pelvis', 0.1, 0.05, k * 0.06), A(thigh, 0.12, 0.02, -k * 0.02)] },
    { meshId: `m-delt-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.05,
      path: [A('trunk', 0.97, 0.02, k * 0.17), A(ua, 0.35)] },
    { meshId: `m-lat-${s}`, kind: 'muscle', depth: 'superficial', radius: 0.05,
      path: [A('pelvis', 0.9, -0.1, k * 0.05), A('trunk', 0.6, -0.08, k * 0.13), A(ua, 0.15)] },
    // bones
    { meshId: `b-femur-${s}`, kind: 'bone', depth: 'deep', radius: 0.016, path: [A(thigh, 0.02), A(thigh, 0.98)] },
    { meshId: `b-tibia-${s}`, kind: 'bone', depth: 'deep', radius: 0.015, path: [A(shank, 0.02), A(shank, 0.98)] },
    { meshId: `b-humerus-${s}`, kind: 'bone', depth: 'deep', radius: 0.013, path: [A(ua, 0.02), A(ua, 0.98)] },
    // ligaments (schematic positions)
    { meshId: `l-acl-${s}`, kind: 'ligament', depth: 'deep', radius: 0.007, path: [A(thigh, 0.97, -0.012, k * 0.008), A(shank, 0.03, 0.012, -k * 0.004)] },
    { meshId: `l-mcl-${s}`, kind: 'ligament', depth: 'deep', radius: 0.007, path: [A(thigh, 0.93, 0, -k * 0.045), A(shank, 0.12, 0, -k * 0.04)] },
    { meshId: `l-patellar-${s}`, kind: 'ligament', depth: 'superficial', radius: 0.012, path: [A(thigh, 1.0, 0.065), A(shank, 0.1, 0.05)] },
    // fascia tissue
    { meshId: `f-itb-${s}`, kind: 'fascia', depth: 'superficial', radius: 0.02, path: [A('pelvis', 0.1, 0, k * 0.15), A(thigh, 0.5, 0, k * 0.075), A(thigh, 0.98, 0, k * 0.055)] },
  ];
}

export const RIG_VISUALS: RigVisual[] = [
  ...sideVisuals('L'),
  ...sideVisuals('R'),
  { meshId: 'm-erector', kind: 'muscle', depth: 'superficial', radius: 0.035, path: [A('pelvis', 0, -0.09, 0.035), A('trunk', 0.5, -0.1, 0.035), A('trunk', 0.92, -0.07, 0.035)] },
  { meshId: 'm-erector', kind: 'muscle', depth: 'superficial', radius: 0.035, path: [A('pelvis', 0, -0.09, -0.035), A('trunk', 0.5, -0.1, -0.035), A('trunk', 0.92, -0.07, -0.035)] },
  { meshId: 'm-abs', kind: 'muscle', depth: 'superficial', radius: 0.07, path: [A('pelvis', 0.3, 0.09), A('trunk', 0.45, 0.11), A('trunk', 0.7, 0.11)] },
  { meshId: 'b-pelvis', kind: 'bone', depth: 'deep', radius: 0.05, path: [A('pelvis', -0.1, 0, 0.1), A('pelvis', -0.1, 0, -0.1)] },
  { meshId: 'b-spine', kind: 'bone', depth: 'deep', radius: 0.016, path: [A('pelvis', 0.1, -0.05), A('trunk', 0.5, -0.06), A('trunk', 1.0, -0.02), A('head', 0.3, -0.02)] },
  { meshId: 'f-tlf', kind: 'fascia', depth: 'superficial', radius: 0.06, path: [A('pelvis', 0.3, -0.115), A('trunk', 0.45, -0.115)] },
  // Myers-inspired interpretive lines (educational overlays, not load paths).
  ...(['L', 'R'] as Side[]).map((S): RigVisual => {
    const k = S === 'L' ? 1 : -1;
    return {
      meshId: 'line-sbl', kind: 'line', depth: 'superficial', radius: 0.006,
      path: [
        A(seg('foot', S), 0.75, -0.035), A(seg('foot', S), 0.0, 0.0), A(seg('shank', S), 0.55, -0.075),
        A(seg('thigh', S), 0.95, -0.06), A(seg('thigh', S), 0.45, -0.085), A('pelvis', -0.35, -0.11, k * 0.06),
        A('trunk', 0.3, -0.13, k * 0.04), A('trunk', 0.85, -0.1, k * 0.04), A('head', 0.75, -0.11, k * 0.03),
      ],
    };
  }),
  {
    meshId: 'line-spiral', kind: 'line', depth: 'superficial', radius: 0.006,
    path: [
      A('head', 0.6, -0.08, 0.04), A('trunk', 0.85, -0.12, -0.08), A('trunk', 0.6, 0.0, -0.17),
      A('trunk', 0.45, 0.13, -0.02), A('pelvis', 0.3, 0.1, 0.12), A('thighL', 0.4, 0.04, 0.08),
      A('shankL', 0.35, 0.05, -0.01), A('footL', 0.45, -0.03, -0.02), A('shankL', 0.55, -0.02, 0.05),
      A('thighL', 0.6, -0.06, 0.04), A('pelvis', -0.4, -0.1, 0.06),
    ],
  },
];

export function visualPoints(sk: Skeleton, v: RigVisual): V3[] {
  return v.path.map((a) => anchorPoint(sk, a));
}

/** Path length (m) of a structure's first visual on a side. */
export function pathLength(sk: Skeleton, meshId: string): number {
  const v = RIG_VISUALS.find((r) => r.meshId === meshId);
  if (!v) return NaN;
  const pts = visualPoints(sk, v);
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
  return L;
}

export type LengthTrend = 'lengthening' | 'shortening' | 'near-constant';

/**
 * Geometric musculotendon-path length trend at time t, from finite differences of
 * the simplified path. This is a kinematic property of the generic rig only;
 * it says nothing about activation or fibre behaviour (ANAT-02).
 */
export function lengthTrend(
  movementId: string,
  meshId: string,
  t: number,
  params: Record<string, number>,
): { trend: LengthTrend; ratePerS: number; relLength: number } {
  const m = MOVEMENT_BY_ID[movementId];
  const dur = cycleDuration(m, params);
  const dt = 0.01;
  const a = pathLength(poseAt(movementId, t - dt / 2, params), meshId);
  const b = pathLength(poseAt(movementId, t + dt / 2, params), meshId);
  const ref = pathLength(poseAt(movementId, 0, params), meshId);
  const ratePerS = (b - a) / (dt * dur); // m/s
  const relRate = ratePerS / ref; // lengths per second
  const trend: LengthTrend = Math.abs(relRate) < 0.05 ? 'near-constant' : relRate > 0 ? 'lengthening' : 'shortening';
  const cur = pathLength(poseAt(movementId, t, params), meshId);
  return { trend, ratePerS, relLength: cur / ref };
}

/** Which mesh to use for a structure's length trend (right side by convention). */
export function primaryMesh(structureId: string): string | undefined {
  const s = STRUCTURE_BY_ID[structureId];
  if (!s) return undefined;
  return s.meshIds.find((m) => m.endsWith('-r')) ?? s.meshIds[0];
}
