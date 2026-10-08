# Functional Anatomy Movement Lab

**Product requirements document · Version 1.0 · October 8, 2026**

- **Product owner:** Zach, FLXPOD Performance Systems, LLC
- **Status:** Discovery baseline; suitable for design, feasibility work, and implementation planning.
- **Working name:** Functional Anatomy Movement Lab. Final branding is undecided.
- **Primary user:** Zach, a sports-performance coach learning and applying functional anatomy.
- **Platforms:** Responsive web application with complete core workflows on phone, tablet, and desktop.

![Concept mockup](./concept-mockup.png)

---

## 1. Product vision

Build an interactive movement lab that helps a coach understand how the body produces, controls, and transfers movement during any athletic action or exercise.

The user describes a movement, watches an anatomically grounded body perform it, pauses at meaningful phases, reveals anatomical layers, and asks questions. The user can change technique, movement speed, load, and external forces to explore supported scenarios and understand the assumptions behind the results.

The product connects three distinct perspectives:

1. **Anatomy and biomechanics:** What structures exist, how they relate, how joints move, and what a supported mechanical model can estimate.
2. **Functional coaching:** Original, attributed educational explanations informed by Mike Boyle's approach to functional training for sport, translated into practical movement and exercise questions.
3. **Fascial connections:** A separately labeled interpretive lens informed by Thomas Myers's Anatomy Trains model, connected to conventional anatomy without implying that every proposed relationship is a measured mechanical result.

**Product promise:** "See the movement. Understand the anatomy. Explore the mechanics. Apply what you learn."

The long-term ambition is support for any athletic movement or exercise. The first release accepts broad requests but distinguishes supported movements, constrained variations, experimental approximations, and requests it cannot yet simulate.

## 2. Confirmed decisions and planning assumptions

| Topic | Confirmed direction |
|---|---|
| First user | Zach as a coach |
| Device coverage | Phone, tablet, and desktop |
| Movement input | Describe or search; natural-language variations |
| Simulation | Adjust and explore |
| Adjustments | Technique, tempo, load, and external forces |
| Anatomy | Muscles, bones, joints, ligaments, and fascia |
| Learning | Open exploration with an AI coach |
| Conceptual approach | Separate, connected evidence and interpretation lenses |
| Coverage strategy | Broad input with staged accuracy |

**Proposed assumptions requiring product-owner review:** Web-first delivery; personal saved workspaces; a visually detailed 3D body; an initial small reviewed movement set; no uploaded-video analysis in the first release; no medical diagnosis; no quantitative tissue-force claims without a qualified modeling pipeline. These are planning decisions, not additional answers supplied by Zach.

## 3. Problem and opportunity

Static anatomy resources explain individual structures but make it difficult to connect those structures to a fast, coordinated athletic action. Exercise demonstrations show the external movement but rarely explain the anatomy phase by phase. Coaching information and fascial frameworks often live in separate resources.

The app must bridge the gap between knowing a muscle's name and understanding its possible contribution within a movement. It must also teach that multiple structures can contribute simultaneously and that visible motion alone does not establish exact internal muscle activation or tissue load.

The opportunity is a practical learning environment where a coach can repeatedly ask: "What is happening here, what changes when I adjust this, and what does that mean for coaching?"

## 4. Users and jobs to be done

### Primary persona

An experienced sports-performance coach who understands training but wants deeper functional-anatomy knowledge. Frequently studies baseball, softball, sprinting, strength exercises, and whole-body coordination. Wants simple explanations with optional technical depth and sources.

### Primary jobs

- When studying a movement, identify the relevant structures and understand their phase-specific roles.
- When comparing technique variations, see what changes in the modeled movement and which conclusions are supported.
- When exploring an exercise, connect local joint actions with coordinated whole-body behavior.
- When learning an unfamiliar structure, find it in the body and in relevant movements.
- When preparing to coach, save a scene with a clear explanation, assumptions, and practical questions.

### Future users

Other strength coaches, personal trainers, sport coaches, educators, and athletes. Team management, athlete accounts, classroom administration, and client reporting are expansion opportunities rather than first-release requirements.

## 5. Success definition

A successful first session lets Zach request a supported movement, play it, isolate an anatomical structure, inspect a phase, change a supported parameter, and get a grounded explanation of the difference.

**North-star metric:** Meaningful learning sessions per active user per week. A meaningful session includes movement exploration and at least one learning action: structure inspection, phase explanation, scenario comparison, or a substantive AI question.

Proposed private-beta targets:

| Metric | Target and measurement |
|---|---|
| Core task completion | At least 90% of observed sessions complete the primary flow without assistance |
| Time to useful insight | Median under three minutes in moderated first-use sessions |
| Learning usefulness | Zach rates at least 80% of sampled explanations useful and understandable |
| Grounding integrity | Every factual explanation provides inspectable source or reviewed content provenance |
| Unsupported-output handling | Every unsupported calculation/request in the test set is labeled or declined correctly |
| Critical accuracy defects | Zero unresolved material anatomical or misleading numerical defects at release |
| Saved-state fidelity | Every tested scene restores movement, model version, phase, camera, layers, and parameters |

Targets are release proposals. Establish baselines during usability tests; do not treat usage counts as proof of improved anatomy knowledge. Optional pre/post learning checks can be added during beta.

## 6. Scope and release strategy

### Release A: Personal learning lab

Complete the primary journey with a small reviewed movement collection, all requested anatomy layer categories, phase navigation, contextual AI explanations, saved scenes, comparison, and constrained parameter exploration. Accept arbitrary text requests and route them honestly. Some controls may offer educational visualization only; numerical mechanics require a supported solver/model combination.

### Release B: Expanded experimentation

Expand motion families, equipment interactions, body-model choices, supported parameter ranges, and mechanical calculations. Add reviewed generated variations and a scalable content-review workflow. Optional voice input and richer learning paths follow demonstrated demand.

### Release C: Broad movement generation and personal analysis

Explore open-ended motion generation, custom sequence composition, video reconstruction, and research-grade integrations. Video-based motion estimates and subject-specific force estimates remain separate capabilities with separate validation requirements.

### Exclusions from Release A

Injury diagnosis, rehabilitation prescriptions, injury-risk scoring, live movement capture, automatic exercise programming, team administration, payments, social feeds, and native app-store distribution. Exclusions preserve the core learning and simulation goal; they do not remove broad movement-request support.

## 7. Proposed initial movement coverage

Prioritize breadth across movement families rather than large numbers of nearly identical exercises. Final selection follows asset and model feasibility work.

| Family | Proposed reviewed movement | Important distinctions |
|---|---|---|
| Running | Sprint acceleration and upright sprinting | Treat as distinct motion contexts |
| Knee dominant | Front squat; split squat | Bilateral versus unilateral |
| Hip dominant | Trap-bar deadlift; single-leg RDL | Equipment and balance constraints |
| Upper-body push | Push-up; landmine press | Closed-chain and implement interaction |
| Upper-body pull | Inverted row; pull-up | Body position and grip variations |
| Rotation | Medicine-ball rotational throw | Implement release and contact |
| Sport skill | Baseball/softball swing | Handedness, implement, and phases |
| Throwing | Overhand throw; baseball pitch | Distinguish general throw from pitching |
| Jump/landing | Countermovement jump | Takeoff, flight, and landing |
| Direction change | Planned lateral cut | Approach speed and foot contact |

Target approximately 12–15 reviewed clips, not a contractual coverage guarantee. The first feasibility slice should pair a front squat with a sprint cycle: these expose equipment, slower movement, repeated contact, and high-speed coordination. Swing and throw follow once upper-body rigging and implement interaction are satisfactory.

## 8. Primary user journey

1. Open the movement lab and enter "Show me a right-handed baseball swing."
2. The app resolves the movement, handedness, equipment, and support status.
3. If material details are missing, offer a short choice such as swing type or starting stance. Avoid lengthy intake.
4. Load the body and movement with a visible support badge and short assumptions summary.
5. Play, rotate, slow playback, scrub, or jump to a named phase.
6. Reveal anatomy layers and select a structure directly or through search.
7. Read "what it is," "what it contributes here," and "why this matters for coaching."
8. Ask the AI coach a follow-up grounded in the current phase and selected structure.
9. Duplicate the baseline into a comparison and change a supported parameter.
10. See updated motion and supported explanations or calculations, with unavailable outputs clearly identified.
11. Save the scene and notes; reopen later with the same model and assumptions.

No sign-in should be required to explore a demo. Personal persistence can use an account or a local personal mode, subject to the architecture decision.

## 9. Functional requirements

Priority definitions: **P0** required for Release A; **P1** expansion after the core journey is reliable; **P2** longer-term capability.

### 9.1 Movement request and resolution

- **MOV-01 · P0:** Accept text requests for any movement or exercise. Search names, aliases, sport terms, movement families, and anatomical terms.
- **MOV-02 · P0:** Parse the request into a structured specification: movement family, variation, handedness, equipment, stance/grip, relevant contacts, speed/tempo, load, and known constraints. Show a readable summary before an experimental run.
- **MOV-03 · P0:** Resolve requests through the following routes, in order: reviewed exact movement; reviewed constrained variation; supported composite or approximation; unsupported request. Experimental routes must never inherit the parent movement's review status automatically.
- **MOV-04 · P0:** Ask a clarifying choice when ambiguity materially changes the movement. "Hit" must not silently become a baseball swing when another sport is equally plausible.
- **MOV-05 · P0:** For unsupported requests, explain the missing capability and offer a related supported movement. Preserve the request for optional feedback submission; never claim it has been simulated.
- **MOV-06 · P1:** Compose multi-stage actions, such as sprint → plant → throw, with contact and transition checks.

### 9.2 Three-dimensional viewer

- **VIEW-01 · P0:** Orbit, zoom, pan, reset, and select front/back/side/oblique views. Provide touch and keyboard equivalents.
- **VIEW-02 · P0:** Play, pause, loop, scrub, step frames, and jump to phases. Playback-rate control is independent of modeled execution speed.
- **VIEW-03 · P0:** Show equipment and meaningful ground/body contact. Keep a selected structure highlighted during animation without losing its label.
- **VIEW-04 · P0:** Allow isolate, hide, opacity adjustment, and reveal-deeper-layer operations. A structure search/list must provide an alternative to precise 3D tapping.
- **VIEW-05 · P0:** Synchronize the anatomy highlight, phase text, parameter values, and AI context to the same scene revision and simulation time.
- **VIEW-06 · P1:** Add cross-sectional views and richer cutaway inspection where licensed assets support them.

### 9.3 Anatomical layers and structure cards

- **ANAT-01 · P0:** Include selectable muscles, bones, joints, ligaments, and fascia. Include tendons where necessary to explain muscle-to-bone relationships. Layer existence does not imply every fine structure is modeled at equal resolution.
- **ANAT-02 · P0:** Muscles show reviewed names, attachments at the asset's supported resolution, crossed joints, common actions, and phase-specific modeled or educational roles. Separate musculotendon length behavior from inferred activation and fiber contraction behavior.
- **ANAT-03 · P0:** Bones show landmarks and articulations; do not label bones as activating. Joints show modeled axes/degrees of freedom, motion, and convention-defined angles where available.
- **ANAT-04 · P0:** Ligaments show attachments and passive constraint/support explanations. Dynamic strain, tension, or safety claims are unavailable unless the specific tissue is represented and validated in the mechanical model.
- **ANAT-05 · P0:** Fascia offers a conventional tissue/connectivity layer and an optional Myers-inspired line overlay. The overlay is an educational representation; it does not itself establish a quantitative load pathway.
- **ANAT-06 · P0:** Every card distinguishes general anatomy, contribution in the current modeled scenario, coaching interpretation, and evidence limitations. Provide a short explanation first, with technical detail on expansion.
- **ANAT-07 · P0:** Use separate visual legends for structure identity, length behavior, inferred role, and quantitative results. Avoid a universal red heat map that appears to measure all structures identically. Labels and patterns accompany color.

### 9.4 Phase analysis

- **PHASE-01 · P0:** Reviewed clips include meaningful phases and transition events, with movement-specific terminology.
- **PHASE-02 · P0:** A phase card describes body position, joint actions, relevant structures, supported roles, contacts, and coaching questions. The card must explain coordinated contributions rather than nominate one universal "working muscle."
- **PHASE-03 · P0:** Show whether phase boundaries are manually reviewed or algorithmically estimated. Time-normalized comparisons identify differing event timing.

### 9.5 Simulation controls

- **SIM-01 · P0:** Each movement declares its supported controls, units, ranges, output capabilities, and validity envelope. Controls unavailable for a movement remain visible with an explanation of the dependency, rather than appearing to work.
- **SIM-02 · P0:** Explore stance, grip, joint positions, range, technique, and tempo where supported. Joint changes must respect rig constraints, contacts, equipment, and the movement's reviewed parameter envelope.
- **SIM-03 · P0:** Accept load magnitude and placement, resistance direction, and external-force settings when applicable. All inputs must have explicit units. Body mass is distinct from external load.
- **SIM-04 · P0:** If a control only changes an educational scenario, state that clearly. Changing barbell weight must not invent muscle-activation percentages or automatically alter tissue stress without a qualifying calculation.
- **SIM-05 · P0:** Numerical outputs require sufficient model and input data, a declared method, units, assumptions, and validation status. Show unavailable rather than numerical zero when a result cannot be computed.
- **SIM-06 · P0:** Detect impossible or out-of-envelope configurations. Reject them, offer a compatible range, or permit a separately labeled experimental scene. Do not silently clamp an input.
- **SIM-07 · P0:** Distinguish edited pose, retargeted animation, kinematic calculation, inverse-dynamics calculation, and forward-dynamics prediction. Record which actually produced the scene.
- **SIM-08 · P1:** Offer validated mechanical scenarios for selected movements, with forces, moments, muscle-force estimates, or other model-specific outputs. Add uncertainty intervals only when the method supports them; do not invent confidence percentages.

### 9.6 Scenario comparison

- **CMP-01 · P0:** Compare baseline and modified scenarios with synchronized playback, matched camera, and shared phase/event markers.
- **CMP-02 · P0:** Show the parameter differences and concise explanations of supported changes. Separate observed model changes from coaching hypotheses.
- **CMP-03 · P0:** On phone, switch A/B or use an overlay view instead of shrinking two full scenes into unreadable panels. Tablet/desktop may use side-by-side views.
- **CMP-04 · P0:** Preserve baseline settings and provide one-action reset. A changed scene must never show stale results from the previous run.

### 9.7 Contextual AI coach

- **AI-01 · P0:** Receive the movement specification, current phase/time, selected structures, active lens, parameter values, model version, actual available results, and reviewed source content.
- **AI-02 · P0:** Answer anatomy, movement, and coaching questions in plain language. Offer technical depth when requested. Useful prompts include "What contributes here?", "What changes in this variation?", and "Explain this as a coaching cue."
- **AI-03 · P0:** Ground factual answers in retrieved reviewed content and source metadata. Source links must resolve; missing evidence must be acknowledged. Do not invent citations, book quotations, or claims of endorsement.
- **AI-04 · P0:** Separate anatomy facts, model estimates, and coaching/fascial interpretations. Do not infer measured activation from the animation or claim a muscle is inactive merely because it is not highlighted.
- **AI-05 · P0:** Permit scene actions through a restricted structured command system: select a structure, navigate a phase, toggle a lens, or propose a supported parameter change. Validate commands before execution. Arbitrary generated code must not control the simulation engine.
- **AI-06 · P0:** Maintain context through follow-up questions and clearly identify when an answer references another movement or an earlier scene revision.
- **AI-07 · P0:** Avoid diagnosing pain or recommending treatment based on the avatar. If the question exceeds the product's evidence or capability, explain the boundary and return to supported education.
- **AI-08 · P1:** Voice input and optional spoken answers. Typed input remains available everywhere.

### 9.8 Personal learning workspace

- **SAVE-01 · P0:** Save named scenes, comparisons, notes, selected structures, and questions.
- **SAVE-02 · P0:** Restore camera, phase, layer visibility, parameters, model/asset versions, support status, and source provenance. If a version is retired, offer a migration with a change summary; never silently reinterpret saved results.
- **SAVE-03 · P0:** Favorites and recent movements support repeat learning.
- **SAVE-04 · P1:** Export annotated screenshots or a concise explanation with assumptions and source references. Exported images inherit support and estimate labels.
- **SAVE-05 · P1:** Optional guided lessons and checks based on previously explored structures. No mandatory curriculum blocks free exploration.

## 10. Accuracy, evidence, and support labels

Support status is multidimensional. A reviewed animation does not make every anatomical role or computed force validated.

| Dimension | Examples of allowable states |
|---|---|
| Motion | Reviewed reference, constrained variation, experimental approximation |
| Anatomy | Reviewed asset/mapping; limited-detail representation |
| Explanation | Reviewed source-based; qualified inference; unavailable |
| Mechanics | Not calculated; calculated under stated assumptions; validated for a specified context |
| Fascia | Anatomical tissue view; Myers-inspired interpretive overlay |

Use a short scene badge with expandable per-output detail. Prefer "Reviewed motion; forces not calculated" to a generic "Validated" label.

**Required evidence record:** claim or output identifier, source, author/publisher, relevant section, type of evidence, review date, reviewer, applicability, limitations, and associated content/model version.

Expert review roles should include an anatomy reviewer, a biomechanics reviewer for mechanical claims, and a coaching-content reviewer. One person can hold multiple roles if qualified. Review must cover the rendered movement and interaction, not just text.

All animation-derived conclusions apply to the generic modeled scenario. User-entered height or body mass alone does not make a model a faithful representation of a specific athlete.

## 11. UX and visual direction

The body is the primary workspace. Use a restrained, professional visual style with clear contrast, legible labels, a neutral background, and purposeful overlays. Favor anatomical clarity over dramatic visual effects.

### Core screens

| Screen | Main purpose |
|---|---|
| Explore | Search, prompt input, favorites, reviewed movements |
| Movement lab | Viewer, layers, timeline, structure cards, controls, AI coach |
| Compare | Baseline/modification, synchronized phases, result differences |
| Saved workspace | Scenes, notes, questions, comparisons |
| Evidence details | Sources, model assumptions, support status |
| Content administration | Review, versioning, source management, publication gates |

On desktop, use a central body view with collapsible anatomy and explanation panels. On tablet, use a full viewer with a docked or sliding inspector. On phone, use a full-width viewer, persistent compact transport, and bottom sheets for layers, controls, and explanations. Every core action remains possible on every device.

**Interaction requirements:** touch targets at least 44 CSS pixels; keyboard-accessible navigation and alternative structure selection; readable text at narrow widths; reduced-motion support; no automatic animation when reduced motion is requested; accessible text equivalents for phase/structure explanations. The 3D view must not be the only route to learning content.

## 12. Proposed technical architecture

This is an architectural contract, not a finalized stack selection. Conduct a feasibility spike before selecting rendering, asset, solver, or AI providers.

### Main components

1. **Responsive client:** Search, 3D scene, timeline, controls, comparisons, text-accessible anatomy, personal workspace.
2. **Movement resolver:** Converts language to a constrained movement specification and selects the correct support route.
3. **Motion engine:** Loads reviewed clips, applies supported retargeting/variation, enforces constraints, and reports provenance.
4. **Anatomy graph:** Maps anatomical entities to meshes, joints, movement phases, evidence, and teaching content.
5. **Simulation service:** Runs supported numerical calculations as versioned jobs, separate from animation rendering.
6. **Knowledge and AI service:** Retrieves reviewed evidence, answers contextual questions, and proposes validated scene commands.
7. **Persistence and content administration:** Saves user work and controls reviewed content/model publication.

Separate the high-detail visual body from the mathematical model. Maintain explicit mappings between them; a visual mesh is not a musculoskeletal solver.

Prefer cached reviewed trajectories and lightweight local calculations where justified. Expensive mechanics jobs can run on the server with cancellation, progress, and result caching. Do not block camera movement or structure inspection during computation.

### Movement-processing sequence

Request → structured specification → ambiguity/support check → model/clip selection → constraint validation → animation/optional mechanics → review-status assignment → scene plus grounded explanation.

All stages carry a scene revision identifier. A changed parameter invalidates dependent outputs. Reuse cached results only when movement, inputs, asset/model version, solver method, and assumptions match.

## 13. Data model

| Entity | Required information |
|---|---|
| AnatomicalStructure | ID, name/aliases, type, laterality, relationships, mesh IDs, reviewed content |
| JointDefinition | Bodies, axes, degrees of freedom, angle conventions, constraints, model version |
| MovementDefinition | Name/aliases, family, equipment, phases, supported parameters, contacts, review status |
| MotionAsset | Trajectory, rig mapping, event markers, source, license, review/version |
| MovementSpecification | Requested action, parsed parameters, units, defaults, ambiguity resolution |
| SimulationModel | Supported outputs, geometry/mechanics assumptions, valid domains, version, review |
| SimulationRun | Inputs, methods, status, outputs, units, limitations, job/scene revision |
| StructureContribution | Movement/phase/structure, educational role, inferred/calculated status, evidence |
| FascialOverlay | Connections, source/interpretation, mesh mapping, label, version |
| EvidenceRecord | Source, claim mapping, applicability, reviewer, review date |
| SavedScene | User ownership, scene state, version references, notes |
| Comparison | Two scene references, changed inputs, alignment mode |
| Conversation | User, scene revision context, questions, sourced answers |

Store units explicitly, normalize internally, and preserve the user's display-unit preference. Publish immutable versions of reviewed content and model configurations.

## 14. API and processing contracts

Suggested logical operations, independent of final endpoint names:

- **Resolve movement:** request text → specification, support route, missing choices, available controls.
- **Load movement:** definition/version → assets, phases, structure mappings, capabilities.
- **Submit simulation:** validated specification/model → job ID and scene revision.
- **Retrieve job:** job ID → queued/running/completed/failed/cancelled plus available results.
- **Ask coach:** question/context → answer, evidence references, limitations, proposed structured actions.
- **Save scene:** state/version references → owned saved scene.
- **Compare scenes:** scene IDs → alignment, parameter differences, compatible output comparison.

Use explicit errors for ambiguous movement, missing asset, invalid parameter, unsupported output, solver failure, stale scene, source unavailability, and version incompatibility. Retrying a save or job submission must not create accidental duplicates.

## 15. Nonfunctional requirements

Proposed performance targets must be verified on a named reference phone, tablet, and desktop with recorded network conditions.

- Cached reviewed movement becomes interactive within three seconds; uncached assets show progressive loading.
- Target at least 30 frames per second on the reference phone and 60 on capable desktop hardware during core exploration.
- Local camera and selection feedback should feel immediate; target under 100 milliseconds for UI acknowledgement.
- Parameter changes acknowledge immediately; cached/simple updates target under two seconds. Longer solver jobs show progress, cancellation, and continued exploration.
- AI requests show status promptly; target first useful streamed text within five seconds under normal service conditions.
- Degrade mesh detail, labels, and secondary effects before removing essential learning functionality.
- If 3D is unavailable, provide phase illustrations and structure/text navigation.
- If AI is unavailable, reviewed cards and explanations remain usable.
- Offline behavior states what is cached and what requires a connection; pending saves must be identifiable.
- Enforce ownership for scenes/conversations. Keep credentials server-side and avoid logging private prompts unnecessarily.
- Provide deletion of personal saved work and conversation history. Do not use personal content for model training without explicit opt-in.
- Collect minimal event telemetry; avoid recording complete conversation bodies for product analytics by default.

## 16. Content, assets, and attribution

Required assets include a licensed anatomical body with separately selectable structures, a compatible rig, reviewed movement clips, relevant equipment, and original reviewed educational explanations.

Before adoption, evaluate each asset for anatomical quality, naming, separable geometry, deformation during movement, mobile performance, rig compatibility, permitted commercial use, and attribution obligations. Licenses and permissions are dependencies to verify, not assumed approvals.

Boyle and Myers inform the educational approach. The app must not imply affiliation or reproduce proprietary diagrams, extensive book content, videos, or branded teaching assets without appropriate rights. The supplied concept references are not a completed source corpus. Obtain the exact Boyle edition and permitted materials before claiming book-specific coverage.

**Content publication workflow:** draft → source mapping → anatomy/coaching review → mechanical review where applicable → rendered scene review → approved version → release. Material defects retire affected outputs and flag saved scenes referencing them.

## 17. Acceptance scenarios

| ID | Scenario | Pass condition |
|---|---|---|
| AC-01 | Request a front squat | Correct movement loads with phases, equipment, support status, and defaults |
| AC-02 | Tap/select a structure | Correct structure highlights and its phase-specific card opens; list selection also works |
| AC-03 | Reveal deep anatomy | Layer visibility updates without changing movement time or losing selection |
| AC-04 | Slow playback | Motion timing display changes; physical modeled speed and calculated results remain unchanged |
| AC-05 | Change modeled speed | New scene revision is created; dependent results update or become unavailable |
| AC-06 | Change load | Input records correct units; only supported outputs update; no invented activation values appear |
| AC-07 | Compare technique | Baseline remains intact; changed inputs and phase alignment are visible |
| AC-08 | Ask about fascia | Answer labels Myers-inspired interpretation separately from calculated mechanics |
| AC-09 | Request an unknown movement | Approximation is labeled or request is declined with a useful supported alternative |
| AC-10 | Enter an impossible configuration | App explains constraints and does not silently produce a reviewed-looking scene |
| AC-11 | Lose AI connection | Viewer and reviewed explanations continue working |
| AC-12 | Save and reopen | Camera, layers, phase, parameters, versions, notes, and status restore correctly |
| AC-13 | Use phone/tablet/desktop | Entire core journey is usable without hidden essential controls or horizontal overflow |
| AC-14 | Select a ligament | Passive role is explained; quantitative tissue claims appear only when supported |
| AC-15 | Change scene while AI/solver runs | Old output cannot overwrite or masquerade as the current scene's result |
| AC-16 | Open evidence | Relevant source and review/model details are available for the specific claim |

Release validation includes moderated usability sessions, anatomy and motion review, regression tests for support routing, numerical validation for any published mechanics, responsive visual inspection, and access-control checks. Numerical acceptance tolerances must be defined per model/output before shipping that output.

## 18. Delivery plan and gates

### Stage 1: Feasibility and asset selection

Deliver a body/rig demonstration, selectable anatomy, front-squat and sprint playback, asset-rights inventory, and model capability matrix. Decide which controls are educational and which can produce defensible calculations. **Gate:** assets deform acceptably, anatomy is usable on phone, and the simulation boundary is technically understood.

### Stage 2: Complete vertical slice

Deliver one complete movement journey from request through inspection, AI explanation, one parameter modification, comparison, and save/restore. **Gate:** all applicable acceptance scenarios pass for that movement.

### Stage 3: Reviewed coverage and broad request routing

Expand the proposed core collection and deploy exact-match, variation, experimental, and unsupported routing. **Gate:** expert-reviewed content, visible per-output status, mobile usability, and no unsupported numerical claims.

### Stage 4: Private beta

Zach uses the app during actual study and coaching preparation. Capture confusing explanations, missing movements, and control requests. **Gate:** task completion, usefulness, performance, and accuracy targets are met or revised with explicit evidence.

### Stage 5: Expanded mechanics and generation

Add only the models and movement families that pass their own validation gates. Video analysis is a separate product increment. Schedule and budget are determined after asset/solver feasibility; this PRD does not assume arbitrary biomechanics generation is a simple feature.

## 19. Risks and mitigations

| Risk | Product response |
|---|---|
| Attractive animation implies scientific certainty | Separate motion, explanation, and mechanics status |
| Arbitrary motion generation produces plausible errors | Constraints, review queues, approximation labels, unsupported route |
| Exact muscle activation cannot be established from motion alone | Explain roles qualitatively; publish numerical estimates only with a qualifying method |
| Ligament/fascia outputs exceed model capability | Show anatomy and interpretation; gate tissue mechanics separately |
| Asset quality or licensing blocks development | Audit assets in Stage 1 and preserve replacement options |
| High-detail body overwhelms mobile devices | Progressive loading, mesh detail levels, accessible fallback |
| AI invents anatomy or attribution | Reviewed retrieval corpus, source validation, claim audits, constrained actions |
| Parameter interactions invalidate reviewed motions | Explicit validity envelopes and scene reclassification |
| Generic body is mistaken for an athlete-specific model | Persistent generic-model identity and clear personalization limits |
| Scope expands before learning value is proven | Complete the first learning journey and validate usefulness before expansion |

## 20. Remaining product decisions

These do not block using this PRD for feasibility work:

1. Final product name and visual identity.
2. Exact first movement set and launch depth for each anatomy category.
3. Budget and acceptable ongoing asset, solver, and AI service costs.
4. Account-based versus local-first personal persistence.
5. Exact Boyle source edition and permitted Myers materials.
6. Reviewers and criteria for each mechanical output.
7. Whether voice input belongs in Release A or B.
8. Whether this remains a personal learning tool or becomes a commercial coach platform.

## 21. Source grounding and implementation references

These references support the conceptual and feasibility boundaries; they are not a complete anatomical or movement knowledge base.

- **Anatomy Trains, About Us:** <https://www.anatomytrains.com/about-us/> — describes Myers's system of myofascial meridians and whole-body connections. The PRD treats that system as an attributed educational lens, not independent verification of every mechanical claim.
- **OpenSim, Overview of OpenSim Workflows:** <https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53084226/Overview%20of%20OpenSim%20Workflows> — differentiates workflows and the data/model assumptions used for musculoskeletal estimates.
- **OpenSim, Scaling, Inverse Kinematics, and Inverse Dynamics tutorial:** <https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53089741/Tutorial%2B3%2B-%2BScaling%2C%2BInverse%2BKinematics%2C%2Band%2BInverse%2BDynamics> — provides a primary technical reference for movement/force input distinctions.
- **OpenSim project:** <https://opensim.stanford.edu/> — potential feasibility reference, not a committed integration or endorsement.

---

**Definition of done for Release A:** Zach can request broadly, explore supported movements on all three device classes, inspect each requested anatomy category, modify supported scenarios, compare, ask grounded questions, and save his work. Every scene and output clearly communicates what is reviewed, interpreted, calculated, approximate, or unavailable.
