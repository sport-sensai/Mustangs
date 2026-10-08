// Domain model for the Movement Lab (PRD §13). Units are stored explicitly and
// normalized internally (SI: kg, m, s, degrees for joint angles).

export type StructureType = 'muscle' | 'bone' | 'joint' | 'ligament' | 'fascia' | 'tendon';
export type LayerId = 'muscles' | 'bones' | 'joints' | 'ligaments' | 'fascia';
export type Lens = 'anatomy' | 'coaching' | 'fascial';
export type Side = 'left' | 'right' | 'midline' | 'bilateral';

/** Content review state. Nothing in this prototype has passed expert review. */
export type ReviewState = 'draft' | 'in-review' | 'approved' | 'retired';

// ---- Support status is multidimensional (PRD §10) -------------------------
export type MotionStatus =
  | 'reviewed-reference'
  | 'constrained-variation'
  | 'experimental-approximation'
  | 'draft-reference'; // prototype clip, keyed by hand, awaiting expert review
export type AnatomyStatus = 'reviewed-mapping' | 'limited-detail';
export type ExplanationStatus = 'reviewed-source-based' | 'draft-unsourced' | 'qualified-inference' | 'unavailable';
export type MechanicsStatus = 'not-calculated' | 'calculated-under-assumptions' | 'validated-for-context';
export type FasciaStatus = 'anatomical-tissue-view' | 'myers-inspired-overlay';

export interface SupportStatus {
  motion: MotionStatus;
  anatomy: AnatomyStatus;
  explanation: ExplanationStatus;
  mechanics: MechanicsStatus;
  fascia: FasciaStatus;
}

// ---- Evidence --------------------------------------------------------------
export interface EvidenceRecord {
  id: string;
  claim: string;
  source: string;
  publisher?: string;
  url?: string;
  section?: string;
  evidenceType: 'technical-documentation' | 'framework-description' | 'textbook' | 'peer-reviewed' | 'pending';
  reviewDate?: string;
  reviewer?: string;
  applicability: string;
  limitations: string;
  contentVersion: string;
}

// ---- Anatomy ---------------------------------------------------------------
export interface PhaseRole {
  /** Educational role text for a specific movement phase. */
  role: string;
  basis: 'educational-draft' | 'inferred-from-kinematics' | 'calculated';
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  aliases: string[];
  type: StructureType;
  layer: LayerId;
  side: Side;
  /** Rig anchor ids that visualise this structure. */
  meshIds: string[];
  /** Plain-language "what it is". */
  whatItIs: string;
  attachments?: string;
  crosses?: string[];
  commonActions?: string[];
  /** movementId -> phaseId -> role */
  roles: Record<string, Record<string, PhaseRole>>;
  coaching?: Record<string, string>;
  limitations: string;
  evidenceIds: string[];
  review: ReviewState;
}

export interface JointDefinition {
  id: string;
  name: string;
  /** Degrees of freedom represented in the prototype rig. */
  modeledDof: string[];
  angleConvention: string;
  modelVersion: string;
}

// ---- Movement --------------------------------------------------------------
export type ParamKind = 'technique' | 'tempo' | 'load' | 'external-force';

export interface ParameterDefinition {
  id: string;
  label: string;
  kind: ParamKind;
  unit: 'cm' | 'deg' | 's' | 'kg' | 'steps/s' | 'option';
  /** Discrete choices (e.g. handedness); value is the option's index. */
  options?: string[];
  default: number;
  /** Reviewed validity envelope. */
  min: number;
  max: number;
  step: number;
  /** Wider range permitted only as a separately labelled experimental scene. */
  experimentalMin?: number;
  experimentalMax?: number;
  /** What the control actually changes in this prototype. */
  effect: 'changes-motion' | 'changes-timing' | 'educational-only';
  effectNote: string;
}

export interface PhaseDefinition {
  id: string;
  /** Key into structure roles when several phases share content (e.g. left/right steps). */
  roleKey?: string;
  name: string;
  /** Normalised start/end time in [0, 1]. */
  start: number;
  end: number;
  boundarySource: 'manually-keyed' | 'algorithmic-estimate';
  bodyPosition: string;
  jointActions: string[];
  contacts: string;
  keyStructures: string[];
  coachingQuestions: string[];
}

/** A timed segment of a skill clip. Phase boundaries are derived from segment durations. */
export interface TimingSegment {
  phaseId: string;
  /** Base duration, seconds. */
  duration: number;
  /** Parameter whose value (s) replaces the duration, or scales a group of segments. */
  durationParam?: string;
  /** Share of the parameter's value given to this segment when several share it. */
  paramShare?: number;
}

export interface MovementDefinition {
  id: string;
  version: string;
  name: string;
  aliases: string[];
  family: string;
  equipment: string[];
  summary: string;
  phases: PhaseDefinition[];
  parameters: ParameterDefinition[];
  contacts: string[];
  /** Base duration of one cycle at default parameters, seconds. */
  baseDuration: number;
  loop: boolean;
  /** Skill clips derive phase timing from segments. */
  segments?: TimingSegment[];
  /** Default camera for this movement. */
  camera?: { azimuth: number; elevation: number; distance: number };
  /** Direction the athlete faces at the start (deg; 0 = +Z). Camera presets are relative to it. */
  facingYaw?: number;
  /** World point the camera orbits around. */
  cameraTarget?: [number, number, number];
  review: ReviewState;
  support: SupportStatus;
  /** Controls a coach might expect but that this movement does not support yet. */
  unavailableControls: { label: string; reason: string }[];
}

/** Catalogued but not yet simulated movements, for honest routing. */
export interface PlannedMovement {
  name: string;
  aliases: string[];
  family: string;
  relatedSupportedId: string;
  missingCapability: string;
}

// ---- Requests --------------------------------------------------------------
export type Route = 'exact' | 'variation' | 'approximation' | 'unsupported' | 'ambiguous' | 'empty';

export interface MovementSpecification {
  requestText: string;
  movementId?: string;
  family?: string;
  variation?: string;
  handedness?: 'left' | 'right';
  equipment?: string[];
  params: Record<string, number>;
  /** Parameters inferred from language vs defaulted. */
  parsedParams: string[];
  defaults: string[];
}

export interface ResolveResult {
  route: Route;
  spec: MovementSpecification;
  /** Short assumption summary shown before loading. */
  assumptions: string[];
  choices?: { label: string; request: string }[];
  alternative?: { movementId: string; reason: string };
  message: string;
}

// ---- Scene + simulation ----------------------------------------------------
export type ProducedBy =
  | 'keyed-reference-animation'
  | 'edited-pose'
  | 'retargeted-animation'
  | 'kinematic-calculation'
  | 'inverse-dynamics'
  | 'forward-dynamics';

export interface SceneState {
  movementId: string;
  movementVersion: string;
  assetVersion: string;
  params: Record<string, number>;
  experimental: boolean;
  revision: string;
  /** Normalised time 0..1 within the cycle. */
  time: number;
  playbackRate: number;
  camera: { azimuth: number; elevation: number; distance: number };
  layers: Record<LayerId, boolean>;
  skinOpacity: number;
  isolate: boolean;
  selectedStructureId?: string;
  lens: Lens;
}

export interface OutputValue {
  id: string;
  label: string;
  value: number | null; // null = unavailable, never a fake zero
  unit?: string;
  status: MechanicsStatus;
  method: string;
  assumptions: string;
  unavailableReason?: string;
}

export interface SimulationRun {
  revision: string;
  movementId: string;
  params: Record<string, number>;
  producedBy: ProducedBy[];
  status: 'completed' | 'failed';
  outputs: OutputValue[];
  limitations: string[];
}

export interface SavedScene {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  scene: SceneState;
  notes: string;
  questions: string[];
  support: SupportStatus;
  schemaVersion: number;
}

export interface Comparison {
  id: string;
  baseline: SceneState;
  variation: SceneState;
  alignment: 'time-normalised';
}
