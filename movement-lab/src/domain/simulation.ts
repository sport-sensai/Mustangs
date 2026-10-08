import { jointAngles, poseAt } from './kinematics';
import { cycleDuration, defaultParams, MOVEMENT_BY_ID, phasesFor } from './movements';
import type { MovementDefinition, OutputValue, ParameterDefinition, ProducedBy, SimulationRun, SupportStatus } from './types';

// ------------------------------------------------------------- validation
export type ParamCheck =
  | { level: 'ok' }
  | { level: 'experimental'; message: string }
  | { level: 'rejected'; message: string };

/** SIM-06: never clamp silently. Out-of-envelope values are rejected or flagged experimental. */
export function checkParam(def: ParameterDefinition, value: number): ParamCheck {
  if (!Number.isFinite(value)) return { level: 'rejected', message: `${def.label} needs a number in ${def.unit}.` };
  if (value >= def.min && value <= def.max) return { level: 'ok' };
  const eMin = def.experimentalMin ?? def.min;
  const eMax = def.experimentalMax ?? def.max;
  const range = `${def.min}–${def.max} ${def.unit}`;
  if (value >= eMin && value <= eMax && (def.experimentalMin !== undefined || def.experimentalMax !== undefined)) {
    return {
      level: 'experimental',
      message: `${value} ${def.unit} is outside the reference envelope (${range}). It can run only as a separately labelled experimental scene.`,
    };
  }
  return {
    level: 'rejected',
    message: `${value} ${def.unit} is outside what this rig can represent. The supported range is ${range}${
      def.experimentalMin !== undefined || def.experimentalMax !== undefined ? ` (experimental ${eMin}–${eMax} ${def.unit})` : ''
    }.`,
  };
}

export function checkAll(movement: MovementDefinition, params: Record<string, number>) {
  const results = movement.parameters.map((d) => ({ def: d, check: checkParam(d, params[d.id] ?? d.default) }));
  return {
    rejected: results.filter((r) => r.check.level === 'rejected'),
    experimental: results.filter((r) => r.check.level === 'experimental'),
  };
}

/** Human-readable parameter value with unit (option labels for choices). */
export function formatParam(def: ParameterDefinition, value: number): string {
  if (def.options) return def.options[value] ?? String(value);
  return `${value} ${def.unit}`;
}

// --------------------------------------------------------------- revision
/** Deterministic scene revision id: changes whenever any result-affecting input changes. */
export function sceneRevision(movementId: string, version: string, assetVersion: string, params: Record<string, number>, experimental: boolean): string {
  const keys = Object.keys(params).sort();
  const raw = `${movementId}@${version}|${assetVersion}|${experimental ? 'X' : 'R'}|${keys.map((k) => `${k}=${params[k]}`).join(',')}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `rev-${(h >>> 0).toString(36)}`;
}

export function changedParams(movement: MovementDefinition, params: Record<string, number>) {
  const d = defaultParams(movement);
  return movement.parameters.filter((p) => (params[p.id] ?? p.default) !== d[p.id]);
}

export function sceneSupport(movement: MovementDefinition, params: Record<string, number>, experimental: boolean): SupportStatus {
  const motionChanged = changedParams(movement, params).some((p) => p.effect === 'changes-motion');
  return {
    ...movement.support,
    motion: experimental ? 'experimental-approximation' : motionChanged ? 'constrained-variation' : movement.support.motion,
  };
}

export function supportBadge(s: SupportStatus): string {
  const motion = {
    'reviewed-reference': 'Reviewed motion',
    'draft-reference': 'Draft motion (awaiting review)',
    'constrained-variation': 'Constrained variation of draft motion',
    'experimental-approximation': 'Experimental approximation',
  }[s.motion];
  const mech = {
    'not-calculated': 'forces not calculated',
    'calculated-under-assumptions': 'mechanics calculated under stated assumptions',
    'validated-for-context': 'mechanics validated for stated context',
  }[s.mechanics];
  return `${motion}; ${mech}`;
}

// ------------------------------------------------------------- simulation
const KIN_METHOD = 'Kinematic calculation from the generic keyed rig (finite differences, 200 samples per cycle).';
const KIN_ASSUMPTIONS = 'Generic adult body, rigid segments, procedurally keyed motion. Not athlete-specific.';

function kin(id: string, label: string, value: number, unit: string): OutputValue {
  return { id, label, value: Math.round(value * 100) / 100, unit, status: 'calculated-under-assumptions', method: KIN_METHOD, assumptions: KIN_ASSUMPTIONS };
}

function unavailable(id: string, label: string, reason: string, unit?: string): OutputValue {
  return { id, label, value: null, unit, status: 'not-calculated', method: 'None', assumptions: '—', unavailableReason: reason };
}

const UNAVAILABLE_MECHANICS = (extra: string) => [
  unavailable('joint-moments', 'Joint moments', `Needs inverse dynamics with measured external forces and a scaled model. ${extra}`, 'N·m'),
  unavailable('muscle-forces', 'Muscle forces', 'Needs a validated musculoskeletal model and solver; not produced by animation.', 'N'),
  unavailable('activation', 'Muscle activation', 'Cannot be established from visible motion alone; would need EMG or a validated model.', '%'),
  unavailable('ligament-strain', 'Ligament strain / tension', 'Ligaments are not represented in a mechanical model (ANAT-04).', '%'),
];

type Sample = { t: number; sk: ReturnType<typeof poseAt>; ja: ReturnType<typeof jointAngles> };

/** Unwrapped angular rate (deg/s) of a heading series. */
function headingRates(samples: Sample[], f: (s: Sample) => number, dt: number) {
  return samples.slice(1).map((s, i) => {
    let d = f(s) - f(samples[i]);
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return { t: s.t, rate: Math.abs(d) / dt };
  });
}

function skillOutputs(m: MovementDefinition, params: Record<string, number>, samples: Sample[], dur: number): OutputValue[] {
  const N = samples.length - 1;
  const dt = dur / N;
  const phases = phasesFor(m, params);
  const ph = (id: string) => phases.find((p) => p.id === id)!;
  const at = (t: number) => samples[Math.min(N, Math.max(0, Math.round(t * N)))];
  const lefty = params.handedness === 1;
  const lead = lefty ? 'R' : 'L'; // stride / front leg
  const arm = lefty ? 'L' : 'R'; // throwing arm (or top hand)
  const knee = (s: Sample, side: string) => (side === 'L' ? s.ja.kneeFlexL : s.ja.kneeFlexR);

  const pelvis = headingRates(samples, (s) => s.ja.pelvisHeading, dt);
  const trunk = headingRates(samples, (s) => s.ja.trunkHeading, dt);
  const peak = (xs: { t: number; rate: number }[]) => xs.reduce((a, b) => (b.rate > a.rate ? b : a));
  const pp = peak(pelvis);
  const tp = peak(trunk);
  const sepMax = Math.max(...samples.map((s) => s.ja.separation));
  const speed = (point: (s: Sample) => [number, number, number], t: number) => {
    const a = at(t - 1 / N).sk;
    const b = at(t + 1 / N).sk;
    const pa = point({ sk: a } as Sample);
    const pb = point({ sk: b } as Sample);
    return Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]) / (2 * dt);
  };
  const wrist = (s: Sample) => s.sk.points[`wrist${arm}` as 'wristR'];
  const toe = (s: Sample) => s.sk.points[`toe${lead}` as 'toeL'];
  const strideLen = (t0: number, t1: number) => {
    const a = toe(at(t0));
    const b = toe(at(t1));
    return Math.hypot(b[0] - a[0], b[2] - a[2]);
  };

  const out: OutputValue[] = [
    kin('pelvis-rot-vel', 'Peak pelvis rotation velocity', pp.rate, '°/s'),
    kin('trunk-rot-vel', 'Peak trunk (shoulder-line) rotation velocity', tp.rate, '°/s'),
    kin('sequence', 'Pelvis peak precedes trunk peak by', (tp.t - pp.t) * dur * 1000, 'ms'),
    kin('separation', 'Max hip–shoulder separation', sepMax, '°'),
  ];

  if (m.id === 'baseball-swing') {
    const c = ph('contact');
    const tc = (c.start + c.end) / 2;
    const sweet = (s: Sample): [number, number, number] => {
      const b = s.sk.equipment.bat!;
      return [b.knob[0] + (b.tip[0] - b.knob[0]) * 0.82, b.knob[1] + (b.tip[1] - b.knob[1]) * 0.82, b.knob[2] + (b.tip[2] - b.knob[2]) * 0.82];
    };
    out.push(
      kin('stride', 'Stride length (front-foot travel)', strideLen(0, ph('stride').end), 'm'),
      kin('lead-knee-contact', 'Front knee flexion at contact', knee(at(tc), lead), '°'),
      kin('bat-speed', 'Bat sweet-spot speed at contact (keyed)', speed(sweet, tc), 'm/s'),
      kin('launch-time', 'Launch-to-contact time', (tc - ph('launch').start) * dur, 's'),
      unavailable('exit-velo', 'Exit velocity / launch angle', 'Bat–ball collision is not simulated.', 'm/s'),
      unavailable('grf', 'Ground reaction forces', 'Needs force plates under each foot.', 'N'),
      ...UNAVAILABLE_MECHANICS('Bat mass is recorded but the clip is not re-solved for bat inertia.'),
    );
  } else if (m.id === 'baseball-pitch') {
    const fc = ph('stride').end;
    const rel = ph('acceleration').end;
    // Rubber (back toe at the set) to front toe at foot contact, horizontal.
    const back = at(0).sk.points[`toe${lefty ? 'L' : 'R'}` as 'toeR'];
    const front = toe(at(fc));
    out.push(
      kin('stride', 'Stride length (rubber toe to front toe)', Math.hypot(front[0] - back[0], front[2] - back[2]), 'm'),
      kin('stride-pct', 'Stride as % of generic body height (178 cm)', (((params.strideLength ?? 135) / 100) / 1.78) * 100, '%'),
      kin('sep-fc', 'Hip–shoulder separation at foot contact', at(fc).ja.separation, '°'),
      kin('lead-knee-fc', 'Lead knee flexion at foot contact', knee(at(fc), lead), '°'),
      kin('lead-knee-rel', 'Lead knee flexion at release', knee(at(rel), lead), '°'),
      kin('shoulder-rel', 'Throwing-arm elevation at release', arm === 'R' ? at(rel).ja.shoulderElevR : at(rel).ja.shoulderElevL, '°'),
      kin('hand-speed', 'Throwing-hand speed near release (keyed)', speed(wrist, rel - 1 / N), 'm/s'),
      kin('fc-to-release', 'Foot contact to release time', (rel - fc) * dur, 's'),
      unavailable('ball-velo', 'Ball release speed', 'Ball and fingers are not modeled; hand speed is not ball speed.', 'm/s'),
      unavailable('elbow-varus', 'Elbow varus torque (UCL load)', 'Needs inverse dynamics with measured arm kinematics and segment inertias.', 'N·m'),
      unavailable('shoulder-distraction', 'Shoulder distraction force', 'Needs inverse dynamics; not available from a keyed clip.', 'N'),
      ...UNAVAILABLE_MECHANICS('UCL and rotator-cuff loads in particular cannot be read from animation.'),
    );
  } else {
    const catchT = ph('receive').end;
    const rel = ph('acceleration').end;
    out.push(
      kin('exchange', 'Exchange time (catch to release)', (rel - catchT) * dur, 's'),
      kin('stride', 'Glove-side step length', strideLen(catchT, ph('stride').end), 'm'),
      kin('lead-knee-rel', 'Lead knee flexion at release', knee(at(rel), lead), '°'),
      kin('hand-speed', 'Throwing-hand speed near release (keyed)', speed(wrist, rel - 1 / N), 'm/s'),
      unavailable('pop-time', 'Pop time (catch to tag at second)', 'Ball flight to second base is not modeled.', 's'),
      unavailable('elbow-varus', 'Elbow varus torque (UCL load)', 'Needs inverse dynamics with measured arm kinematics.', 'N·m'),
      ...UNAVAILABLE_MECHANICS('Throwing-arm tissue loads cannot be read from animation.'),
    );
  }
  return out;
}

export function runSimulation(movementId: string, params: Record<string, number>, experimental = false): SimulationRun {
  const m = MOVEMENT_BY_ID[movementId];
  const dur = cycleDuration(m, params);
  const N = 200;
  const samples = Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    const sk = poseAt(movementId, t, params);
    return { t, sk, ja: jointAngles(sk) };
  });
  const max = (f: (s: (typeof samples)[number]) => number) => Math.max(...samples.map(f));
  const min = (f: (s: (typeof samples)[number]) => number) => Math.min(...samples.map(f));
  const peakRate = (f: (s: (typeof samples)[number]) => number, from = 0, to = 1) => {
    let peak = 0;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].t < from || samples[i].t > to) continue;
      const r = Math.abs(f(samples[i]) - f(samples[i - 1])) / (dur / N);
      peak = Math.max(peak, r);
    }
    return peak;
  };

  const outputs: OutputValue[] = [];
  const producedBy: ProducedBy[] = ['keyed-reference-animation'];
  if (changedParams(m, params).some((p) => p.effect === 'changes-motion')) producedBy.push('edited-pose');
  producedBy.push('kinematic-calculation');
  const limitations = [
    'All values describe the generic modeled scenario, not a specific athlete.',
    'Motion is procedurally keyed and has not been expert reviewed.',
  ];
  if (experimental) limitations.unshift('Experimental scene: inputs are outside the reference envelope.');

  if (movementId === 'front-squat') {
    const phases = phasesFor(m, params);
    const descent = phases.find((p) => p.id === 'descent')!;
    const ascent = phases.find((p) => p.id === 'ascent')!;
    const barY = (s: (typeof samples)[number]) => s.sk.equipment.bar!.center[1];
    const disp = max(barY) - min(barY);
    outputs.push(
      kin('peak-knee', 'Peak knee flexion', max((s) => s.ja.kneeFlexR), '°'),
      kin('peak-hip', 'Peak hip flexion', max((s) => s.ja.hipFlexR), '°'),
      kin('peak-ankle', 'Peak ankle dorsiflexion', max((s) => s.ja.ankleDorsiR), '°'),
      kin('peak-trunk', 'Peak trunk lean', max((s) => s.ja.trunkLean), '°'),
      kin('bar-disp', 'Bar vertical travel', disp, 'm'),
      kin('bar-vel-ascent', 'Mean bar speed, ascent', disp / ((ascent.end - ascent.start) * dur), 'm/s'),
      kin('knee-vel-descent', 'Peak knee angular velocity, descent', peakRate((s) => s.ja.kneeFlexR, descent.start, descent.end), '°/s'),
      kin('knee-vel-ascent', 'Peak knee angular velocity, ascent', peakRate((s) => s.ja.kneeFlexR, ascent.start, ascent.end), '°/s'),
      ...UNAVAILABLE_MECHANICS('Bar load is recorded but no qualified model links it to tissue loading.'),
    );
  } else if (m.segments) {
    outputs.push(...skillOutputs(m, params, samples, dur));
    limitations.push('Skill clips are hand-keyed from coaching descriptions. Speeds and timings come from those keys, so they show sequencing patterns, not a real athlete\'s speeds.');
  } else {
    outputs.push(
      kin('peak-hip-flex', 'Peak hip flexion (swing)', max((s) => s.ja.hipFlexR), '°'),
      kin('min-hip-flex', 'Hip flexion at toe-off (lowest)', min((s) => s.ja.hipFlexR), '°'),
      kin('peak-knee-flex', 'Peak knee flexion (swing)', max((s) => s.ja.kneeFlexR), '°'),
      kin('contact-time', 'Ground contact time per step', 0.45 * dur, 's'),
      kin('flight-time', 'Flight time per step', 0.05 * dur, 's'),
      kin('hip-ang-vel', 'Peak hip angular velocity', peakRate((s) => s.ja.hipFlexR), '°/s'),
      unavailable('grf', 'Ground reaction force', 'Needs force-plate data or a validated forward-dynamics model.', 'N'),
      unavailable('step-length', 'Step length', 'The clip is shown in place (treadmill view); horizontal travel is not modeled.', 'm'),
      ...UNAVAILABLE_MECHANICS('Sled load is recorded but the clip is not re-solved for resistance.'),
    );
  }
  return { revision: sceneRevision(movementId, m.version, 'rig-0.1.0', params, experimental), movementId, params: { ...params }, producedBy, status: 'completed', outputs, limitations };
}
