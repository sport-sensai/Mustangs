// Contextual coach (AI-01..07). The prototype ships a deterministic, retrieval-only
// coach that answers ONLY from the structure/phase cards and computed outputs in
// the current scene. An LLM provider can sit behind the same `CoachProvider`
// contract later (server-side, with credentials kept off the client).

import { roleFor, searchStructures, STRUCTURE_BY_ID } from './anatomy';
import { EVIDENCE } from './evidence';
import { MOVEMENT_BY_ID, phaseAt, phasesFor } from './movements';
import { lengthTrend, primaryMesh } from './rig';
import type { Lens, SceneState, SimulationRun } from './types';

export type ClaimKind = 'anatomy' | 'model-estimate' | 'coaching-interpretation' | 'fascial-interpretation' | 'boundary';

export interface AnswerPart { kind: ClaimKind; text: string; evidenceIds: string[] }

export type CoachCommand =
  | { type: 'select-structure'; structureId: string; label: string }
  | { type: 'go-to-phase'; phaseId: string; label: string }
  | { type: 'set-lens'; lens: Lens; label: string }
  | { type: 'propose-param'; paramId: string; value: number; label: string };

export interface CoachAnswer {
  question: string;
  revision: string;
  movementId: string;
  phaseId: string;
  parts: AnswerPart[];
  commands: CoachCommand[];
  provider: 'offline-grounded';
}

export interface CoachContext { scene: SceneState; run?: SimulationRun }

export interface CoachProvider { ask(question: string, ctx: CoachContext): Promise<CoachAnswer> }

const PAIN = /\b(pain|hurt|hurts|injur|injury|injured|diagnos|tear|torn|rehab|treat|sore|strain(ed)?\b.*\b(my|his|her|their)|physio)/;
const QUANT = /\b(how much force|force|newtons?|percent|%|activation|emg|how hard|load on|strain|torque|moment)\b/;
const FASCIA = /\b(fascia|fascial|anatomy trains|myers|line|sling|meridian)\b/;
const CUE = /\b(cue|coach(ing)?|tell (my|the) athlete|what should i say|fix)\b/;
const CHANGE = /\b(change|changes|different|differ|compare|variation|wider|narrower|faster|slower|deeper)\b/;
const CONTRIB = /\b(contribut|working|work|doing|what muscles|which muscles|involved|drive|driving|active)\b/;

function draftNote(): AnswerPart {
  return {
    kind: 'boundary',
    text: 'Source note: this explanation comes from draft card content that has not yet been source-mapped or expert reviewed.',
    evidenceIds: ['ev-draft-anatomy'],
  };
}

/** Validate a proposed command before it is offered or executed (AI-05). */
export function validateCommand(cmd: CoachCommand, scene: SceneState): boolean {
  const m = MOVEMENT_BY_ID[scene.movementId];
  if (!m) return false;
  switch (cmd.type) {
    case 'select-structure': return !!STRUCTURE_BY_ID[cmd.structureId];
    case 'go-to-phase': return phasesFor(m, scene.params).some((p) => p.id === cmd.phaseId);
    case 'set-lens': return ['anatomy', 'coaching', 'fascial'].includes(cmd.lens);
    case 'propose-param': {
      const d = m.parameters.find((p) => p.id === cmd.paramId);
      return !!d && cmd.value >= d.min && cmd.value <= d.max;
    }
  }
}

export function answerQuestion(question: string, ctx: CoachContext): CoachAnswer {
  const { scene, run } = ctx;
  const q = question.toLowerCase();
  const m = MOVEMENT_BY_ID[scene.movementId];
  const phases = phasesFor(m, scene.params);
  const phase = phaseAt(phases, scene.time);
  const roleKey = phase.roleKey ?? phase.id;
  const parts: AnswerPart[] = [];
  const commands: CoachCommand[] = [];

  // Structure mentioned in the question, else the selected one.
  const mentioned = searchStructures('').find((s) => [s.name.toLowerCase(), ...s.aliases].some((a) => a.length > 2 && new RegExp(`\\b${a.replace(/[()]/g, '')}\\b`).test(q)));
  const structure = mentioned ?? (scene.selectedStructureId ? STRUCTURE_BY_ID[scene.selectedStructureId] : undefined);

  const base = { question, revision: scene.revision, movementId: m.id, phaseId: phase.id, provider: 'offline-grounded' as const };

  // AI-07: no diagnosis or treatment.
  if (PAIN.test(q)) {
    parts.push({
      kind: 'boundary',
      text: "I can't assess pain, diagnose injuries, or recommend treatment, and the avatar is a generic body, not your athlete. For pain or a suspected injury, refer to a qualified clinician. I can still explain the anatomy and what the model shows for this movement.",
      evidenceIds: [],
    });
    if (structure) commands.push({ type: 'select-structure', structureId: structure.id, label: `Show ${structure.name}` });
    return { ...base, parts, commands };
  }

  // AI-04 / SIM-05: no invented numbers.
  if (QUANT.test(q)) {
    const unavailable = run?.outputs.filter((o) => o.value === null) ?? [];
    parts.push({
      kind: 'boundary',
      text: `This scene does not calculate forces, joint moments, muscle activation or tissue strain. Visible motion alone does not establish them. Unavailable here: ${unavailable.map((o) => o.label.toLowerCase()).join(', ') || 'all mechanics outputs'}.`,
      evidenceIds: ['ev-opensim-workflows', 'ev-opensim-id'],
    });
    const kin = run?.outputs.filter((o) => o.value !== null).slice(0, 3) ?? [];
    if (kin.length) {
      parts.push({
        kind: 'model-estimate',
        text: `What the model does calculate (kinematics of the generic rig): ${kin.map((o) => `${o.label.toLowerCase()} ${o.value}${o.unit}`).join('; ')}.`,
        evidenceIds: [],
      });
    }
    return { ...base, parts, commands };
  }

  if (FASCIA.test(q)) {
    const sbl = STRUCTURE_BY_ID['line-superficial-back'];
    const tlf = STRUCTURE_BY_ID['thoracolumbar-fascia'];
    parts.push({ kind: 'anatomy', text: `${tlf.name}: ${tlf.whatItIs}`, evidenceIds: tlf.evidenceIds });
    parts.push({
      kind: 'fascial-interpretation',
      text: `Myers-inspired lens (interpretation, not a calculated result): ${roleFor(sbl.id, m.id, roleKey)?.role ?? sbl.whatItIs} The overlay shows a proposed continuity. It does not show a measured load pathway.`,
      evidenceIds: ['ev-anatomy-trains'],
    });
    commands.push({ type: 'set-lens', lens: 'fascial', label: 'Turn on fascial lens' });
    commands.push({ type: 'select-structure', structureId: sbl.id, label: 'Highlight Superficial Back Line' });
    parts.push(draftNote());
    return { ...base, parts, commands: commands.filter((c) => validateCommand(c, scene)) };
  }

  if (CHANGE.test(q)) {
    const changed = m.parameters.filter((p) => scene.params[p.id] !== p.default);
    parts.push({
      kind: 'model-estimate',
      text: changed.length
        ? `Compared with the defaults, this scene changes ${changed.map((p) => `${p.label.toLowerCase()} (${p.default} → ${scene.params[p.id]} ${p.unit}; ${p.effect.replace(/-/g, ' ')})`).join(', ')}.`
        : 'This scene uses the default parameters. Try Compare to duplicate it and change one parameter.',
      evidenceIds: [],
    });
    const educational = changed.filter((p) => p.effect === 'educational-only');
    if (educational.length) {
      parts.push({ kind: 'boundary', text: `${educational.map((p) => p.label).join(', ')}: recorded only. ${educational[0].effectNote}`, evidenceIds: [] });
    }
    if (m.id === 'front-squat') {
      parts.push({
        kind: 'coaching-interpretation',
        text: 'Coaching hypothesis, not a model result: a wider stance with more toe-out is often discussed as increasing hip-abductor/adductor and glute involvement. The model shows only the geometric change in joint and path lengths.',
        evidenceIds: ['ev-draft-anatomy'],
      });
      if (!changed.some((p) => p.id === 'stanceWidth')) commands.push({ type: 'propose-param', paramId: 'stanceWidth', value: 50, label: 'Try a 50 cm stance' });
    }
    return { ...base, parts, commands: commands.filter((c) => validateCommand(c, scene)) };
  }

  if (structure) {
    const role = roleFor(structure.id, m.id, roleKey);
    parts.push({ kind: 'anatomy', text: `${structure.name}: ${structure.whatItIs}${structure.attachments ? ` Attachments: ${structure.attachments}` : ''}`, evidenceIds: structure.evidenceIds });
    if (role) parts.push({ kind: structure.layer === 'fascia' && structure.id.startsWith('line') ? 'fascial-interpretation' : 'coaching-interpretation', text: `In ${phase.name.toLowerCase()}: ${role.role}`, evidenceIds: structure.evidenceIds });
    const mesh = primaryMesh(structure.id);
    if (mesh && (structure.type === 'muscle' || structure.type === 'tendon')) {
      const lt = lengthTrend(m.id, mesh, scene.time, scene.params);
      parts.push({ kind: 'model-estimate', text: `Modeled path length here: ${lt.trend.replace('-', ' ')} (${Math.round(lt.relLength * 100)}% of the start length). This is geometry, not activation.`, evidenceIds: [] });
    }
    if (structure.coaching?.[m.id] && CUE.test(q)) parts.push({ kind: 'coaching-interpretation', text: structure.coaching[m.id], evidenceIds: structure.evidenceIds });
    parts.push({ kind: 'boundary', text: `Limits: ${structure.limitations}`, evidenceIds: [] });
    if (scene.selectedStructureId !== structure.id) commands.push({ type: 'select-structure', structureId: structure.id, label: `Select ${structure.name}` });
    parts.push(draftNote());
    return { ...base, parts, commands: commands.filter((c) => validateCommand(c, scene)) };
  }

  if (CONTRIB.test(q) || CUE.test(q) || q.trim().length > 0) {
    parts.push({ kind: 'anatomy', text: `${phase.name}: ${phase.bodyPosition} Joint actions: ${phase.jointActions.join('; ')}.`, evidenceIds: ['ev-draft-anatomy'] });
    const contributors = phase.keyStructures.map((id) => STRUCTURE_BY_ID[id]).filter(Boolean);
    parts.push({
      kind: 'coaching-interpretation',
      text: `Several structures contribute together. No single muscle does the work. Possible contributors in this phase: ${contributors
        .map((s) => `${s.name} (${roleFor(s.id, m.id, roleKey)?.role ?? 'see card'})`)
        .join(' ')}`,
      evidenceIds: ['ev-draft-anatomy'],
    });
    if (CUE.test(q)) parts.push({ kind: 'coaching-interpretation', text: `Questions to coach from: ${phase.coachingQuestions.join(' ')}`, evidenceIds: ['ev-draft-anatomy'] });
    parts.push({ kind: 'boundary', text: 'Structures that are not highlighted are not "inactive". Highlighting shows what the card discusses, not measured activation.', evidenceIds: [] });
    contributors.slice(0, 2).forEach((s) => commands.push({ type: 'select-structure', structureId: s.id, label: `Show ${s.name}` }));
    parts.push(draftNote());
  }
  return { ...base, parts, commands: commands.filter((c) => validateCommand(c, scene)) };
}

export const offlineCoach: CoachProvider = {
  ask: (question, ctx) => new Promise((resolve) => setTimeout(() => resolve(answerQuestion(question, ctx)), 350)),
};

export function evidenceFor(ids: string[]) {
  return ids.map((id) => EVIDENCE[id]).filter(Boolean);
}
