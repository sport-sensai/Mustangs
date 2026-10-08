import { describe, expect, it } from 'vitest';
import { roleFor, STRUCTURES, STRUCTURE_BY_ID } from '../anatomy';
import { answerQuestion, validateCommand } from '../coach';
import { EVIDENCE } from '../evidence';
import { BODY, dist, jointAngles, poseAt } from '../kinematics';
import { cycleDuration, defaultParams, MOVEMENT_BY_ID, MOVEMENTS, phasesFor } from '../movements';
import { resolveMovement } from '../resolver';
import { lengthTrend, RIG_VISUALS } from '../rig';
import { createScene, fromDisplayMass, toDisplayMass, withParams } from '../scene';
import { checkParam, runSimulation, sceneSupport, supportBadge } from '../simulation';
import { checkRestore, listSaved, saveScene, type KV } from '../storage';
import type { SavedScene } from '../types';

const squat = MOVEMENT_BY_ID['front-squat'];
const sprint = MOVEMENT_BY_ID['sprint-acceleration'];

function memoryKV(): KV {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

describe('movement resolution (MOV-01..05, AC-01, AC-09)', () => {
  it('AC-01: resolves a front squat with equipment, defaults and draft status', () => {
    const r = resolveMovement('Front squat');
    expect(r.route).toBe('exact');
    expect(r.spec.movementId).toBe('front-squat');
    expect(r.spec.equipment).toEqual(['Barbell']);
    expect(r.spec.params).toEqual(defaultParams(squat));
    expect(squat.support.motion).toBe('draft-reference');
  });

  it('parses constrained variations with explicit units', () => {
    const r = resolveMovement('wide stance paused front squat with 100 lb');
    expect(r.route).toBe('variation');
    expect(r.spec.params.stanceWidth).toBe(50);
    expect(r.spec.params.pauseTime).toBe(2);
    expect(r.spec.params.barLoad).toBeCloseTo(45.4, 1);
  });

  it('MOV-04: asks a short choice for materially ambiguous requests', () => {
    expect(resolveMovement('hit').route).toBe('ambiguous');
    expect(resolveMovement('squat').choices?.map((c) => c.label)).toContain('Front squat');
    expect(resolveMovement('run').route).toBe('ambiguous');
  });

  it('AC-09: planned movements are declined with a supported alternative, never simulated', () => {
    const r = resolveMovement('Show me a right-handed softball windmill pitch');
    expect(r.route).toBe('unsupported');
    expect(r.spec.handedness).toBe('right');
    expect(r.spec.movementId).toBeUndefined();
    expect(r.alternative && MOVEMENT_BY_ID[r.alternative.movementId]).toBeTruthy();
    expect(r.message).toMatch(/Nothing has been simulated/);
  });

  it('distinct contexts are not silently merged (upright sprint ≠ acceleration)', () => {
    expect(resolveMovement('upright sprint').route).toBe('unsupported');
    expect(resolveMovement('sprint acceleration').spec.movementId).toBe('sprint-acceleration');
  });

  it('MOV-03: approximations are labelled and do not inherit review status', () => {
    const r = resolveMovement('goblet squat');
    expect(r.route).toBe('approximation');
    expect(r.assumptions.join(' ')).toMatch(/approximation/i);
    expect(sceneSupport(squat, r.spec.params, true).motion).toBe('experimental-approximation');
  });

  it('unknown requests are declined honestly', () => {
    const r = resolveMovement('underwater basket weaving');
    expect(r.route).toBe('unsupported');
    expect(r.message).toMatch(/nothing was simulated/);
  });
});

describe('kinematic rig', () => {
  const p = defaultParams(squat);

  it('front squat keeps both feet fixed and segment lengths constant', () => {
    const a0 = poseAt('front-squat', 0, p).points;
    for (const t of [0.2, 0.4, 0.55, 0.8]) {
      const sk = poseAt('front-squat', t, p).points;
      expect(dist(sk.ankleL, a0.ankleL)).toBeLessThan(1e-9);
      expect(dist(sk.ankleR, a0.ankleR)).toBeLessThan(1e-9);
      expect(dist(sk.hipL, sk.kneeL)).toBeCloseTo(BODY.thigh, 3);
      expect(dist(sk.kneeL, sk.ankleL)).toBeCloseTo(BODY.shank, 3);
    }
  });

  it('bottom knee flexion matches the depth parameter', () => {
    const phases = phasesFor(squat, p);
    const bottom = phases.find((x) => x.id === 'bottom')!;
    for (const depth of [95, 120, 132]) {
      const ja = jointAngles(poseAt('front-squat', (bottom.start + bottom.end) / 2, { ...p, depth }));
      expect(ja.kneeFlexR).toBeCloseTo(depth, 0);
    }
  });

  it('sprint stance foot touches the ground and the other is airborne', () => {
    const sk = poseAt('sprint-acceleration', 0.25, defaultParams(sprint));
    expect(sk.contacts.footR).toBe(true);
    expect(Math.min(sk.points.toeR[1], sk.points.heelR[1])).toBeCloseTo(0, 6);
    expect(sk.contacts.footL).toBe(false);
  });

  it('two-joint geometry: quads and glutes lengthen in descent and shorten in ascent', () => {
    const ph = phasesFor(squat, p);
    const mid = (id: string) => { const x = ph.find((q) => q.id === id)!; return (x.start + x.end) / 2; };
    for (const mesh of ['m-quad-r', 'm-glute-r']) {
      expect(lengthTrend('front-squat', mesh, mid('descent'), p).trend).toBe('lengthening');
      expect(lengthTrend('front-squat', mesh, mid('ascent'), p).trend).toBe('shortening');
    }
  });
});

describe('simulation contract (SIM-01..07)', () => {
  it('AC-04: viewing changes (playback, camera, layers) never change the revision', () => {
    const s = createScene('front-squat');
    const viewed = { ...s, playbackRate: 0.25, camera: { azimuth: 90, elevation: 0, distance: 2 }, layers: { ...s.layers, bones: true } };
    expect(viewed.revision).toBe(s.revision);
    expect(createScene('front-squat').revision).toBe(s.revision);
  });

  it('AC-05: modeled speed creates a new revision and updates timing outputs', () => {
    const s = createScene('front-squat');
    const fast = withParams(s, { ascentTime: 0.8 }, false);
    expect(fast.revision).not.toBe(s.revision);
    expect(cycleDuration(squat, fast.params)).toBeLessThan(cycleDuration(squat, s.params));
    const v = (r: ReturnType<typeof runSimulation>) => r.outputs.find((o) => o.id === 'bar-vel-ascent')!.value!;
    expect(v(runSimulation('front-squat', fast.params))).toBeGreaterThan(v(runSimulation('front-squat', s.params)));
  });

  it('AC-06: load is recorded in units and does not invent activation or change kinematics', () => {
    const base = runSimulation('front-squat', defaultParams(squat));
    const heavy = runSimulation('front-squat', { ...defaultParams(squat), barLoad: 140 });
    expect(heavy.revision).not.toBe(base.revision);
    for (const o of heavy.outputs) {
      const b = base.outputs.find((x) => x.id === o.id)!;
      expect(o.value).toEqual(b.value);
    }
    expect(heavy.outputs.find((o) => o.id === 'activation')!.value).toBeNull();
    expect(toDisplayMass(fromDisplayMass(220, 'lb'), 'lb')).toBeCloseTo(220, 0);
  });

  it('SIM-05: unavailable results are null with a reason, never zero', () => {
    for (const m of MOVEMENTS) {
      const run = runSimulation(m.id, defaultParams(m));
      const unavailable = run.outputs.filter((o) => o.status === 'not-calculated');
      expect(unavailable.length).toBeGreaterThan(0);
      for (const o of unavailable) {
        expect(o.value).toBeNull();
        expect(o.unavailableReason).toBeTruthy();
      }
      for (const o of run.outputs.filter((x) => x.value !== null)) expect(o.unit).toBeTruthy();
    }
  });

  it('AC-10 / SIM-06: out-of-envelope inputs are rejected or flagged, never clamped', () => {
    const width = squat.parameters.find((p) => p.id === 'stanceWidth')!;
    expect(checkParam(width, 40).level).toBe('ok');
    expect(checkParam(width, 65).level).toBe('experimental');
    const bad = checkParam(width, 120);
    expect(bad.level).toBe('rejected');
    expect(bad.level === 'rejected' && bad.message).toMatch(/25–55 cm/);
    expect(checkParam(width, NaN).level).toBe('rejected');
  });

  it('SIM-07: records what produced the scene', () => {
    expect(runSimulation('front-squat', defaultParams(squat)).producedBy).toEqual(['keyed-reference-animation', 'kinematic-calculation']);
    expect(runSimulation('front-squat', { ...defaultParams(squat), stanceWidth: 50 }).producedBy).toContain('edited-pose');
  });

  it('badge never claims "validated" for draft content', () => {
    expect(supportBadge(squat.support)).toBe('Draft motion (awaiting review); forces not calculated');
  });
});

describe('coach (AI-01..07)', () => {
  const scene = { ...createScene('front-squat'), time: 0.3 };
  const run = runSimulation(scene.movementId, scene.params);

  it('AC-08: fascia answers separate interpretation from calculated mechanics', () => {
    const a = answerQuestion('How does fascia fit in?', { scene, run });
    const fascial = a.parts.find((p) => p.kind === 'fascial-interpretation')!;
    expect(fascial.evidenceIds).toContain('ev-anatomy-trains');
    expect(fascial.text).toMatch(/not a calculated result/);
    expect(a.parts.some((p) => p.kind === 'model-estimate')).toBe(false);
  });

  it('AI-04: refuses to invent forces or activation', () => {
    const a = answerQuestion('How much force is on the knee?', { scene, run });
    expect(a.parts[0].kind).toBe('boundary');
    expect(a.parts.map((p) => p.text).join(' ')).not.toMatch(/\d+\s?N\b/);
  });

  it('AI-07: does not diagnose pain', () => {
    const a = answerQuestion('My athlete has knee pain here, what is injured?', { scene, run });
    expect(a.parts).toHaveLength(1);
    expect(a.parts[0].kind).toBe('boundary');
    expect(a.parts[0].text).toMatch(/can't assess pain/);
  });

  it('answers are tagged with the scene revision they were computed for (AC-15)', () => {
    const a = answerQuestion('What contributes here?', { scene, run });
    expect(a.revision).toBe(scene.revision);
    const changed = withParams(scene, { stanceWidth: 50 }, false);
    expect(changed.revision).not.toBe(a.revision);
  });

  it('AI-05: commands are validated before execution', () => {
    expect(validateCommand({ type: 'select-structure', structureId: 'hamstrings', label: '' }, scene)).toBe(true);
    expect(validateCommand({ type: 'select-structure', structureId: 'nope', label: '' }, scene)).toBe(false);
    expect(validateCommand({ type: 'propose-param', paramId: 'stanceWidth', value: 90, label: '' }, scene)).toBe(false);
    expect(validateCommand({ type: 'go-to-phase', phaseId: 'bottom', label: '' }, scene)).toBe(true);
  });

  it('structure answers use the selected structure and label the draft source', () => {
    const a = answerQuestion('tell me about this', { scene: { ...scene, selectedStructureId: 'quadriceps' }, run });
    expect(a.parts[0].kind).toBe('anatomy');
    expect(a.parts.some((p) => p.evidenceIds.includes('ev-draft-anatomy'))).toBe(true);
  });
});

describe('anatomy content integrity', () => {
  it('every structure maps to rendered geometry and existing evidence', () => {
    const meshes = new Set([...RIG_VISUALS.map((v) => v.meshId), ...['hip', 'knee', 'ankle', 'shoulder', 'elbow'].flatMap((j) => [`j-${j}-l`, `j-${j}-r`])]);
    for (const s of STRUCTURES) {
      for (const m of s.meshIds) expect(meshes.has(m), `${s.id} → ${m}`).toBe(true);
      for (const e of s.evidenceIds) expect(EVIDENCE[e], `${s.id} → ${e}`).toBeTruthy();
      expect(s.review).toBe('draft');
    }
  });

  it('every requested layer category is present (ANAT-01)', () => {
    for (const layer of ['muscles', 'bones', 'joints', 'ligaments', 'fascia']) {
      expect(STRUCTURES.some((s) => s.layer === layer)).toBe(true);
    }
  });

  it('phase key structures exist and have roles for their movement', () => {
    for (const m of MOVEMENTS) {
      for (const ph of m.phases) {
        for (const id of ph.keyStructures) {
          expect(STRUCTURE_BY_ID[id]).toBeTruthy();
          expect(roleFor(id, m.id, ph.roleKey ?? ph.id), `${m.id}/${ph.id}/${id}`).toBeTruthy();
        }
      }
    }
  });

  it('AC-14: ligaments are passive and carry no quantitative output', () => {
    const acl = STRUCTURE_BY_ID.acl;
    expect(roleFor('acl', 'front-squat', 'bottom')!.role).toMatch(/Passive/);
    expect(acl.limitations).toMatch(/not calculated/);
  });
});

describe('saved workspace (SAVE-01..02, AC-12)', () => {
  const scene = { ...withParams(createScene('front-squat'), { stanceWidth: 48 }, false), time: 0.5, selectedStructureId: 'hamstrings', camera: { azimuth: 90, elevation: 5, distance: 2.5 } };
  const saved: SavedScene = {
    id: 's1', name: 'Wide squat', notes: 'check knees', questions: ['What contributes here?'],
    createdAt: '2026-10-08T00:00:00Z', updatedAt: '2026-10-08T00:00:00Z',
    scene, support: sceneSupport(squat, scene.params, false), schemaVersion: 1,
  };

  it('round-trips the full scene state', () => {
    const kv = memoryKV();
    expect(saveScene(saved, kv)).toBe(true);
    const [back] = listSaved(kv);
    const r = checkRestore(back);
    expect(r.ok).toBe(true);
    expect(r.scene).toEqual(scene);
    expect(back.notes).toBe('check knees');
  });

  it('retrying a save does not duplicate', () => {
    const kv = memoryKV();
    saveScene(saved, kv);
    saveScene(saved, kv);
    expect(listSaved(kv)).toHaveLength(1);
  });

  it('a changed model version is surfaced, not silently reinterpreted', () => {
    const r = checkRestore({ ...saved, scene: { ...scene, movementVersion: '0.0.1' } });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toBe('version-changed');
  });

  it('unavailable storage fails safely', () => {
    const broken: KV = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
    expect(listSaved(broken)).toEqual([]);
    expect(saveScene(saved, broken)).toBe(false);
  });
});

describe('baseball skills: swing, pitch, catcher throw', () => {
  const SKILLS = ['baseball-swing', 'baseball-pitch', 'catcher-throw'];

  it('resolves skill requests, including handedness as a real parameter', () => {
    const swing = resolveMovement('Show me a right-handed baseball swing');
    expect(swing.spec.movementId).toBe('baseball-swing');
    expect(swing.spec.params.handedness).toBe(0);
    const lefty = resolveMovement('left-handed pitch with a long stride');
    expect(lefty.spec.movementId).toBe('baseball-pitch');
    expect(lefty.spec.params.handedness).toBe(1);
    expect(lefty.spec.params.strideLength).toBe(146);
    expect(resolveMovement('catcher throw to second').spec.movementId).toBe('catcher-throw');
    expect(resolveMovement('throw').route).toBe('ambiguous');
    expect(resolveMovement('softball swing').route).toBe('approximation');
  });

  it('phases tile the clip and the segment timing matches the declared duration', () => {
    for (const id of SKILLS) {
      const m = MOVEMENT_BY_ID[id];
      const ph = phasesFor(m, defaultParams(m));
      expect(ph[0].start).toBe(0);
      expect(ph[ph.length - 1].end).toBeCloseTo(1, 9);
      for (let i = 1; i < ph.length; i++) expect(ph[i].start).toBeCloseTo(ph[i - 1].end, 9);
      expect(cycleDuration(m, defaultParams(m))).toBeCloseTo(m.baseDuration, 2);
    }
  });

  it('segment lengths stay constant and planted feet do not slide', () => {
    for (const id of SKILLS) {
      const m = MOVEMENT_BY_ID[id];
      const p = defaultParams(m);
      for (let i = 0; i <= 40; i++) {
        const P = poseAt(id, i / 40, p).points;
        expect(dist(P.hipL, P.kneeL)).toBeCloseTo(BODY.thigh, 3);
        expect(dist(P.kneeR, P.ankleR)).toBeCloseTo(BODY.shank, 3);
        expect(dist(P.shoulderR, P.elbowR)).toBeCloseTo(BODY.upperArm, 3);
        expect(dist(P.elbowL, P.wristL)).toBeCloseTo(BODY.forearm, 3);
      }
    }
    // The pitcher's front foot stays planted from foot contact through release.
    const pitch = MOVEMENT_BY_ID['baseball-pitch'];
    const ph = phasesFor(pitch, defaultParams(pitch));
    const fc = ph.find((x) => x.id === 'stride')!.end;
    const rel = ph.find((x) => x.id === 'acceleration')!.end;
    const toeAtFc = poseAt('baseball-pitch', fc, defaultParams(pitch)).points.toeL;
    for (const t of [fc + 0.01, (fc + rel) / 2, rel]) {
      expect(dist(poseAt('baseball-pitch', t, defaultParams(pitch)).points.toeL, toeAtFc)).toBeLessThan(0.01);
    }
  });

  it('pitch shows hip–shoulder separation at foot contact and pelvis-before-trunk sequencing', () => {
    const run = runSimulation('baseball-pitch', defaultParams(MOVEMENT_BY_ID['baseball-pitch']));
    const v = (id: string) => run.outputs.find((o) => o.id === id)!.value!;
    expect(v('sep-fc')).toBeGreaterThan(25);
    expect(v('sequence')).toBeGreaterThan(0);
    expect(v('stride')).toBeCloseTo(1.35, 1);
    expect(run.outputs.find((o) => o.id === 'elbow-varus')!.value).toBeNull();
    expect(run.outputs.find((o) => o.id === 'ball-velo')!.value).toBeNull();
  });

  it('changing stride length moves the landing foot by the same amount', () => {
    const base = runSimulation('baseball-pitch', { ...defaultParams(MOVEMENT_BY_ID['baseball-pitch']), strideLength: 125 });
    const long = runSimulation('baseball-pitch', { ...defaultParams(MOVEMENT_BY_ID['baseball-pitch']), strideLength: 145 });
    const s = (r: typeof base) => r.outputs.find((o) => o.id === 'stride')!.value!;
    expect(s(long) - s(base)).toBeCloseTo(0.2, 1);
  });

  it('left-handed variants are exact mirrors', () => {
    const p = defaultParams(MOVEMENT_BY_ID['baseball-swing']);
    const r = poseAt('baseball-swing', 0.6, p);
    const l = poseAt('baseball-swing', 0.6, { ...p, handedness: 1 });
    expect(l.points.wristL[0]).toBeCloseTo(-r.points.wristR[0], 9);
    expect(l.points.toeR[2]).toBeCloseTo(r.points.toeL[2], 9);
    const jr = jointAngles(r);
    const jl = jointAngles(l);
    expect(jl.kneeFlexR).toBeCloseTo(jr.kneeFlexL, 6);
  });

  it('carries equipment: a bat in the swing and a ball that leaves the hand at release', () => {
    expect(poseAt('baseball-swing', 0.5, defaultParams(MOVEMENT_BY_ID['baseball-swing'])).equipment.bat).toBeTruthy();
    const m = MOVEMENT_BY_ID['catcher-throw'];
    const ph = phasesFor(m, defaultParams(m));
    const rel = ph.find((x) => x.id === 'acceleration')!.end;
    const before = poseAt('catcher-throw', rel - 0.02, defaultParams(m));
    const after = poseAt('catcher-throw', rel + 0.03, defaultParams(m));
    expect(dist(before.equipment.ball!, before.points.wristR)).toBeLessThan(0.1);
    expect(after.equipment.ball![2]).toBeGreaterThan(after.points.wristR[2] + 0.3);
  });

  it('exchange time parameter changes the catcher timing output', () => {
    const m = MOVEMENT_BY_ID['catcher-throw'];
    const r = runSimulation('catcher-throw', { ...defaultParams(m), exchangeTime: 0.62 });
    expect(r.outputs.find((o) => o.id === 'exchange')!.value).toBeCloseTo(0.62, 2);
    expect(r.outputs.find((o) => o.id === 'pop-time')!.value).toBeNull();
  });

  it('the coach refuses to estimate UCL load', () => {
    const scene = { ...createScene('baseball-pitch'), time: 0.7 };
    const a = answerQuestion('How much torque is on the UCL?', { scene, run: runSimulation(scene.movementId, scene.params) });
    expect(a.parts[0].kind).toBe('boundary');
  });
});
