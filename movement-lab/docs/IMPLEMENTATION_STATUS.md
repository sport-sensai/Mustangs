# Implementation status: Stage 1/2 prototype

This prototype targets PRD **Stage 1 (feasibility)** and the **Stage 2 vertical slice**. It covers the front squat and sprint acceleration, from request through save and restore. It also covers three baseball skills from the PRD §7 list: **baseball swing**, **baseball pitch** and **catcher throw to second**. It is a feasibility build, not Release A. **No content or motion has passed expert review**, and the app says so everywhere.

Legend: ✅ implemented · ◐ partial / placeholder · ⛔ not started (by design or blocked on a decision)

## What the prototype is and isn't

| Area | Prototype reality | What Release A still needs |
|---|---|---|
| Body | Stylised procedural rig (tubes and spheres), generic adult proportions | Licensed anatomical body with separable meshes (PRD §16) |
| Motion | Five procedurally keyed clips. The squat uses fixed-foot two-bone IK; the sprint uses keyed FK on a treadmill; the swing, pitch and catcher throw use Hermite-interpolated keys (pelvis/trunk heading, lean, tilt, foot placements, hand targets) with leg and arm IK. Left-handed variants are exact mirrors | Captured or reviewed reference clips, plus retargeting |
| Anatomy | 31 structures across all five layers (including rotator cuff, pec major, flexor–pronator group, UCL and elbow joint); muscles drawn as polylines through simplified attachment and via points | Reviewed mesh mapping at the asset's resolution |
| Mechanics | Kinematics only: joint angles, angular velocity, bar travel and speed, contact time; for the skills, pelvis/trunk rotation velocity, pelvis-before-trunk sequencing, hip–shoulder separation, stride, lead-knee angles, keyed bat and hand speed, exchange time. Skill speeds come straight from hand-authored keys, so they illustrate patterns only. Ball speed, pop time, exit velocity and elbow varus torque (UCL load) are **Unavailable**. Forces, moments, activation and strain are **Unavailable** with a reason | A qualified solver (e.g. an OpenSim-style ID pipeline) per output, with tolerances |
| Coach | Deterministic, retrieval-only coach over the scene's cards and results, with structured commands | LLM provider behind the same `CoachProvider` contract, server-side |
| Content | Draft, unsourced educational text. Only the PRD §21 sources are cited | Source mapping plus anatomy, coaching and biomechanics review |
| Persistence | Local-first (`localStorage`), with try/catch on every access | Decision on account vs. local-first (PRD §20.4) |

## Requirements traceability (P0)

| ID | Status | Where / how |
|---|---|---|
| MOV-01 | ✅ | `domain/resolver.ts`: aliases, families, sport terms; Explore search |
| MOV-02 | ✅ | `MovementSpecification`: parsed vs. defaulted params, handedness, equipment, units (kg/lb). Assumption summary shown before opening |
| MOV-03 | ✅ | Routes: exact → variation → approximation → unsupported. Approximations open as `experimental-approximation` and never inherit status |
| MOV-04 | ✅ | "hit", "swing", "squat" and "run" trigger a short choice |
| MOV-05 | ✅ | Planned movements state the missing capability, offer an alternative, and let you save the request as feedback (session-only) |
| VIEW-01 | ✅ | Drag orbit, wheel/pinch zoom, shift/right-drag pan, view presets, reset; keys A/D/W/S/± |
| VIEW-02 | ✅ | Play/pause/loop/scrub/step/phase jump; playback rate independent of modeled tempo |
| VIEW-03 | ✅ | Barbell, foot-contact rings, selection label that follows the structure during animation |
| VIEW-04 | ✅ | Layer toggles, surface opacity, isolate, structure search list |
| VIEW-05 | ✅ | Phase card, joint angles, structure card and coach all read the same scene revision and clock time |
| ANAT-01 | ✅ | Muscles, tendon, bones, joints, ligaments, fascia (tissue and lines) |
| ANAT-02 | ✅ | Cards show attachments, crossed joints, actions and phase roles; **path-length trend** is shown separately as geometry, not activation |
| ANAT-03 | ✅ | Bones say they do not activate; `JOINTS` declares modeled DOF and angle conventions |
| ANAT-04 | ✅ | Ligament cards show a passive role; strain is "Unavailable" |
| ANAT-05 | ✅ | Fascial lens adds Myers-inspired lines labelled as interpretation |
| ANAT-06 | ✅ | Card sections: General anatomy / Contribution here / Coaching interpretation / Evidence limitations; technical detail on expansion |
| ANAT-07 | ✅ | Separate legends for identity and length trend, with arrow and text labels alongside colour |
| PHASE-01–03 | ✅ | Movement-specific phases; boundaries labelled "manually keyed"; compare shows the per-scene modeled durations |
| SIM-01 | ✅ | Per-movement parameter definitions with unit, envelope and effect; unavailable controls stay visible with reasons |
| SIM-02 | ✅ | Stance width (moves feet, IK keeps contacts), depth, tempo; sprint trunk lean and cadence |
| SIM-03 | ✅ | Bar load (kg; lb display), sled load as an external-force scenario |
| SIM-04 | ✅ | Load controls are tagged "Educational only" and change no output except the revision |
| SIM-05 | ✅ | `value: null` + `unavailableReason`; never 0 |
| SIM-06 | ✅ | `checkParam`: ok / experimental (separately labelled scene) / rejected with range. No clamping |
| SIM-07 | ✅ | `producedBy`: keyed reference animation → edited pose → kinematic calculation |
| CMP-01–04 | ✅ | Synchronised clock and camera, diff bar, result diff table, A/B switch on phone, reset baseline/variation |
| AI-01 | ✅ | Coach receives scene (movement, params, time, selection, lens, versions) and run |
| AI-02 | ✅ | Quick prompts plus free text |
| AI-03 | ◐ | Grounded in card content; cites only real sources. Anatomy content is honestly marked "source mapping pending" |
| AI-04 | ✅ | Parts typed anatomy / model estimate / coaching / fascial / boundary; force and activation questions get a boundary |
| AI-05 | ✅ | `CoachCommand` union + `validateCommand` before offering/executing |
| AI-06 | ✅ | Answers carry their revision; stale answers are visibly flagged |
| AI-07 | ✅ | Pain/injury questions get a boundary with no diagnosis |
| SAVE-01–03 | ✅ | Named scenes with notes and questions; favorites and recents |
| SAVE-02 | ✅ | Version mismatch shows a migration prompt instead of silent reinterpretation |

## Acceptance scenarios

Automated in `src/domain/__tests__/acceptance.test.ts` (41 tests, including skill routing, phase tiling, constant segment lengths, planted-foot stability, L/R mirroring, ball release and UCL-load refusal): AC-01, 04, 05, 06, 08, 09, 10, 12, 14, 15, plus routing, kinematic-constraint, and content-integrity checks. These were checked by hand in Chromium at 1440×900 and 390×844: AC-02, 03, 07, 11 (`?coach=offline`), 13 (no horizontal overflow at 390 px), and 16.

## Known gaps / next steps

1. **Assets (Stage 1 gate):** choose a licensed anatomical body and rig; replace tube visuals using the existing `RIG_VISUALS` mapping.
2. **Expert review:** the publication workflow (draft → source mapping → review → approved) has data-model support (`ReviewState`, `EvidenceRecord`) but no admin UI.
3. **Mechanics:** pick one output (e.g. sagittal knee moment in the squat) and validate an inverse-dynamics path against published data before showing any number.
4. **Coach:** add a server-side LLM provider constrained to retrieved evidence and the `CoachCommand` schema; keep the offline coach as the fallback.
5. **Feedback capture** for unsupported requests is session-only.
6. **Performance:** measure on named reference devices (PRD §15). The bundle is currently one ~600 kB chunk (three.js).
