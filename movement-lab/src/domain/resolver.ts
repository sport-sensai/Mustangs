import { defaultParams, MOVEMENT_BY_ID, MOVEMENTS, PLANNED } from './movements';
import type { MovementSpecification, ResolveResult } from './types';

// Movement resolver (MOV-01..05). Routes, in order: exact reviewed/draft
// reference → constrained variation → experimental approximation → unsupported.
// Ambiguity that materially changes the movement asks a short choice instead.

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const has = (text: string, phrase: string) => new RegExp(`(^|\\s)${phrase.replace(/[-\s]/g, '[-\\s]?')}(\\s|$)`).test(text);

const AMBIGUOUS: { trigger: RegExp; choices: { label: string; request: string }[]; why: string }[] = [
  {
    trigger: /^(show me )?(a |an |the )?(hit|hitting|swing)( a ball)?$/,
    why: '"Hit" or "swing" could mean several different movements.',
    choices: [
      { label: 'Baseball swing', request: 'baseball swing' },
      { label: 'Softball swing (approximation)', request: 'softball swing' },
      { label: 'Tennis forehand', request: 'tennis forehand' },
      { label: 'Golf swing', request: 'golf swing' },
    ],
  },
  {
    trigger: /^(show me )?(a |an |the )?(throw|throws|throwing|overhand throw)$/,
    why: 'Throwing looks different for a pitcher, a catcher and a position player.',
    choices: [
      { label: 'Baseball pitch', request: 'baseball pitch' },
      { label: 'Catcher throw to second', request: 'catcher throw to second' },
      { label: 'Position-player throw (not yet supported)', request: 'infield throw' },
    ],
  },
  {
    trigger: /^(show me )?(a |an |the )?(barbell )?squats?$/,
    why: '"Squat" covers several loading positions that change the movement.',
    choices: [
      { label: 'Front squat', request: 'front squat' },
      { label: 'Back squat (approximation)', request: 'back squat' },
      { label: 'Goblet squat (approximation)', request: 'goblet squat' },
    ],
  },
  {
    trigger: /^(show me )?(a |an |the )?(run|running)$/,
    why: 'Acceleration and upright sprinting are distinct motion contexts.',
    choices: [
      { label: 'Sprint acceleration', request: 'sprint acceleration' },
      { label: 'Upright sprinting', request: 'upright sprint' },
    ],
  },
];

/** Approximations: honest, labelled reuse of a related clip. Never inherits review status. */
const APPROXIMATIONS: { aliases: string[]; movementId: string; variation: string; note: string; params?: Record<string, number> }[] = [
  { aliases: ['back squat', 'high bar squat', 'low bar squat', 'barbell back squat'], movementId: 'front-squat', variation: 'Back squat', note: 'Uses the front-squat clip. Bar position, trunk angle and hip demand differ in a real back squat.' },
  { aliases: ['goblet squat', 'kettlebell squat', 'dumbbell squat'], movementId: 'front-squat', variation: 'Goblet squat', note: 'Uses the front-squat clip with the load treated as anteriorly held. The implement is not modeled.' },
  { aliases: ['softball swing', 'fastpitch swing', 'slowpitch swing'], movementId: 'baseball-swing', variation: 'Softball swing', note: 'Uses the baseball-swing clip. Softball pitch trajectory, bat and timing differ, so contact point and timing are not representative.' },
  { aliases: ['box squat'], movementId: 'front-squat', variation: 'Box squat', note: 'Uses the front-squat clip. Box contact is not modeled.', params: { depth: 95, pauseTime: 1 } },
];

function parseHandedness(t: string): 'left' | 'right' | undefined {
  if (/\b(right[- ]?handed|righty|rhh|rhp)\b/.test(t)) return 'right';
  if (/\b(left[- ]?handed|lefty|lefthander|lhh|lhp|left[- ]handed)\b/.test(t)) return 'left';
  return undefined;
}

/** Constrained-variation keywords mapped to parameter changes within the envelope. */
function parseVariations(movementId: string, t: string) {
  const p: Record<string, number> = {};
  const labels: string[] = [];
  if (movementId === 'front-squat') {
    if (/\bwide(r)?( stance)?\b|\bsumo\b/.test(t)) { p.stanceWidth = 50; labels.push('wider stance'); }
    if (/\bnarrow( stance)?\b|\bclose stance\b/.test(t)) { p.stanceWidth = 27; labels.push('narrow stance'); }
    if (/\bpause(d)?\b/.test(t)) { p.pauseTime = 2; labels.push('paused'); }
    if (/\btempo\b|\bslow\b|\beccentric\b/.test(t)) { p.descentTime = 4; labels.push('slow descent'); }
    if (/\bparallel\b|\bhalf\b/.test(t)) { p.depth = 95; labels.push('to parallel'); }
    if (/\bdeep\b|\bass to grass\b|\bfull depth\b/.test(t)) { p.depth = 132; labels.push('deep'); }
    const kg = t.match(/(\d+(?:\.\d+)?)\s*(kg|kilo|kilos|kilograms)\b/);
    const lb = t.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pounds)\b/);
    if (kg) { p.barLoad = Number(kg[1]); labels.push(`${kg[1]} kg bar`); }
    else if (lb) { p.barLoad = Math.round((Number(lb[1]) * 0.45359237) * 10) / 10; labels.push(`${lb[1]} lb bar`); }
  }
  if (movementId === 'baseball-swing') {
    if (/\bno stride\b|\btoe tap\b|\bshort stride\b/.test(t)) { p.strideLength = 12; labels.push('minimal stride'); }
    if (/\bbig stride\b|\blong stride\b|\bleg kick\b/.test(t)) { p.strideLength = 32; labels.push('longer stride'); }
  }
  if (movementId === 'baseball-pitch') {
    if (/\blong stride\b|\bbig stride\b/.test(t)) { p.strideLength = 146; labels.push('longer stride'); }
    if (/\bshort stride\b/.test(t)) { p.strideLength = 120; labels.push('shorter stride'); }
    if (/\bslide step\b|\bquick\b/.test(t)) { p.strideTime = 0.36; labels.push('quicker stride'); }
  }
  if (movementId === 'catcher-throw') {
    if (/\bquick\b|\bfast\b|\bquicker\b/.test(t)) { p.exchangeTime = 0.62; labels.push('quick exchange'); }
  }
  if (movementId === 'sprint-acceleration') {
    if (/\bsled\b|\bresisted\b/.test(t)) { p.sledLoad = 20; labels.push('resisted (sled)'); }
    if (/\bmore lean\b|\baggressive lean\b|\blow(er)? start\b/.test(t)) { p.trunkLean = 52; labels.push('more forward lean'); }
    if (/\bupright(er)?\b|\bless lean\b/.test(t)) { p.trunkLean = 33; labels.push('less forward lean'); }
  }
  return { p, labels };
}

function findExact(t: string) {
  // Longest alias first so "sprint acceleration" beats "sprint".
  const all = MOVEMENTS.flatMap((m) => m.aliases.map((a) => ({ m, a }))).sort((x, y) => y.a.length - x.a.length);
  return all.find(({ a }) => has(t, a))?.m;
}

function findPlanned(t: string) {
  const all = PLANNED.flatMap((p) => p.aliases.map((a) => ({ p, a }))).sort((x, y) => y.a.length - x.a.length);
  return all.find(({ a }) => has(t, a))?.p;
}

export function resolveMovement(requestText: string): ResolveResult {
  const t = norm(requestText);
  const baseSpec: MovementSpecification = { requestText, params: {}, parsedParams: [], defaults: [] };
  if (!t) return { route: 'empty', spec: baseSpec, assumptions: [], message: 'Describe a movement or exercise.' };

  for (const a of AMBIGUOUS) {
    if (a.trigger.test(t)) {
      return { route: 'ambiguous', spec: baseSpec, assumptions: [], choices: a.choices, message: `${a.why} Which did you mean?` };
    }
  }

  const handedness = parseHandedness(t);

  // Planned movements are checked before generic matches so "upright sprint" is not
  // silently turned into sprint acceleration.
  const planned = findPlanned(t);
  const approx = APPROXIMATIONS.find((a) => a.aliases.some((x) => has(t, x)));
  const exact = findExact(t);

  if (approx) {
    const m = MOVEMENT_BY_ID[approx.movementId];
    const { p } = parseVariations(m.id, t);
    if (handedness && m.parameters.some((d) => d.id === 'handedness')) p.handedness = handedness === 'left' ? 1 : 0;
    const params = { ...defaultParams(m), ...(approx.params ?? {}), ...p };
    return {
      route: 'approximation',
      spec: { ...baseSpec, movementId: m.id, family: m.family, variation: approx.variation, equipment: m.equipment, handedness, params, parsedParams: Object.keys({ ...(approx.params ?? {}), ...p }), defaults: Object.keys(params).filter((k) => !(k in p) && !(k in (approx.params ?? {}))) },
      assumptions: [approx.note, 'Labelled experimental approximation; it does not inherit the reference clip\'s status.'],
      message: `${approx.variation} is not modeled directly. I can show an experimental approximation built from the ${m.name.toLowerCase()} clip.`,
    };
  }

  if (planned && (!exact || planned.aliases.some((a) => has(t, a) && a.length > 6))) {
    const alt = MOVEMENT_BY_ID[planned.relatedSupportedId];
    return {
      route: 'unsupported',
      spec: { ...baseSpec, family: planned.family, handedness },
      assumptions: [],
      alternative: { movementId: alt.id, reason: `Closest supported ${alt.family.toLowerCase()} movement in the current set.` },
      message: `${planned.name} is on the roadmap but can't be simulated yet. It still needs ${planned.missingCapability}. Nothing has been simulated for this request.`,
    };
  }

  if (exact) {
    const { p, labels } = parseVariations(exact.id, t);
    const sided = exact.parameters.some((d) => d.id === 'handedness');
    if (handedness && sided) {
      p.handedness = handedness === 'left' ? 1 : 0;
      labels.unshift(`${handedness}-handed`);
    }
    const params = { ...defaultParams(exact), ...p };
    const isVariation = Object.keys(p).some((k) => p[k] !== defaultParams(exact)[k]);
    const assumptions = [
      `${exact.name}${labels.length ? ` — ${labels.join(', ')}` : ''}`,
      exact.equipment.length ? `Equipment: ${exact.equipment.join(', ')}` : 'No equipment',
      'Generic adult body; not athlete-specific',
    ];
    if (handedness && !sided) assumptions.push(`Handedness noted (${handedness}); this movement is bilateral, so it does not change the clip.`);
    if (sided && !handedness) assumptions.push('Right-handed by default. Say "left-handed" or change it in Adjust.');
    return {
      route: isVariation ? 'variation' : 'exact',
      spec: { ...baseSpec, movementId: exact.id, family: exact.family, equipment: exact.equipment, handedness, params, parsedParams: Object.keys(p), defaults: Object.keys(params).filter((k) => !(k in p)), variation: labels.join(', ') || undefined },
      assumptions,
      message: isVariation ? `Constrained variation of ${exact.name.toLowerCase()}: ${labels.join(', ')}.` : `${exact.name} is in the reference set.`,
    };
  }

  // Unknown entirely: decline honestly and offer something related.
  const guess = /throw|pitch|swing|bat|rotat|punch|serve|golf|tennis/.test(t) ? 'sprint-acceleration' : /jump|land|run|sprint|cut|hop|bound/.test(t) ? 'sprint-acceleration' : 'front-squat';
  return {
    route: 'unsupported',
    spec: { ...baseSpec, handedness },
    assumptions: [],
    alternative: { movementId: guess, reason: 'Available now while this request is logged for review.' },
    message: `I don't have a model for "${requestText.trim()}" yet, so nothing was simulated. You can save the request as feedback.`,
  };
}
