import { useMemo, useState } from 'react';
import { LAYERS, roleFor, searchStructures, STRUCTURE_BY_ID } from '../domain/anatomy';
import { evidenceFor } from '../domain/coach';
import { jointAngles, poseAt } from '../domain/kinematics';
import { lengthTrend, primaryMesh } from '../domain/rig';
import type { LayerId, Lens, PhaseDefinition, SceneState, SimulationRun, StructureType } from '../domain/types';
import type { ColorMode } from '../viewer/Viewer';

const TYPE_ICON: Record<StructureType, string> = { muscle: '◍', tendon: '⌇', bone: '⟋', joint: '◎', ligament: '⛉', fascia: '⋈' };

// ------------------------------------------------------------------ layers
export function LayersPanel(props: {
  scene: SceneState;
  colorMode: ColorMode;
  onLayer: (id: LayerId, on: boolean) => void;
  onOpacity: (v: number) => void;
  onIsolate: (v: boolean) => void;
  onLens: (l: Lens) => void;
  onColorMode: (m: ColorMode) => void;
  onSelect: (id: string | undefined) => void;
}) {
  const { scene } = props;
  const [q, setQ] = useState('');
  const results = useMemo(() => searchStructures(q), [q]);
  return (
    <div className="panel layers">
      <fieldset>
        <legend className="panel__title">Layers</legend>
        <div className="layer-list">
          {LAYERS.map((l) => (
            <label key={l.id} className={`layer${scene.layers[l.id] ? ' is-on' : ''}`}>
              <input type="checkbox" checked={scene.layers[l.id]} onChange={(e) => props.onLayer(l.id, e.target.checked)} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>Body surface opacity <span className="muted">(reveal deeper layers)</span></span>
        <input type="range" min={0} max={1} step={0.05} value={scene.skinOpacity} onChange={(e) => props.onOpacity(Number(e.target.value))} />
      </label>
      <label className="check">
        <input type="checkbox" checked={scene.isolate} onChange={(e) => props.onIsolate(e.target.checked)} disabled={!scene.selectedStructureId} />
        Isolate selected structure
      </label>
      <fieldset className="seg">
        <legend className="panel__title">Lens</legend>
        {(['anatomy', 'coaching', 'fascial'] as Lens[]).map((l) => (
          <label key={l} className={scene.lens === l ? 'is-on' : ''}>
            <input type="radio" name="lens" checked={scene.lens === l} onChange={() => props.onLens(l)} />
            {l === 'fascial' ? 'Fascial (Myers-inspired)' : l[0].toUpperCase() + l.slice(1)}
          </label>
        ))}
      </fieldset>
      <fieldset className="seg">
        <legend className="panel__title">Muscle colour</legend>
        <label className={props.colorMode === 'identity' ? 'is-on' : ''}>
          <input type="radio" name="cmode" checked={props.colorMode === 'identity'} onChange={() => props.onColorMode('identity')} /> Identity
        </label>
        <label className={props.colorMode === 'length' ? 'is-on' : ''}>
          <input type="radio" name="cmode" checked={props.colorMode === 'length'} onChange={() => props.onColorMode('length')} /> Length trend
        </label>
      </fieldset>
      <Legend mode={props.colorMode} />

      <div className="structure-search">
        <label className="panel__title" htmlFor="struct-q">Find a structure</label>
        <input id="struct-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. hamstrings, ACL, fascia" />
        <ul className="structure-list" aria-label="Structures">
          {results.map((s) => (
            <li key={s.id}>
              <button className={scene.selectedStructureId === s.id ? 'is-selected' : ''} aria-pressed={scene.selectedStructureId === s.id} onClick={() => props.onSelect(s.id)}>
                <span aria-hidden="true" className="ticon">{TYPE_ICON[s.type]}</span>
                {s.name}
                <span className="type">{s.type}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Legend({ mode }: { mode: ColorMode }) {
  if (mode === 'identity') {
    return (
      <ul className="legend" aria-label="Colour legend: structure identity">
        <li><i style={{ background: '#c8705f' }} />Muscle</li>
        <li><i style={{ background: '#e2d6bf' }} />Tendon</li>
        <li><i style={{ background: '#efe8d8', outline: '1px solid #bbb' }} />Bone / joint</li>
        <li><i style={{ background: '#d7a94f' }} />Ligament</li>
        <li><i style={{ background: '#9db8cc' }} />Fascia</li>
        <li><i style={{ background: '#1f7a78' }} />Selected</li>
      </ul>
    );
  }
  return (
    <ul className="legend" aria-label="Colour legend: modeled path length trend">
      <li><i style={{ background: '#3f78c9' }} />↑ Lengthening</li>
      <li><i style={{ background: '#d9822b' }} />↓ Shortening</li>
      <li><i style={{ background: '#8d939b' }} />≈ Near-constant</li>
      <li className="legend__note">Geometric path length of the generic rig, not activation.</li>
    </ul>
  );
}

// ------------------------------------------------------------------- phase
export function PhasePanel({ scene, phase, onSelect }: { scene: SceneState; phase: PhaseDefinition; onSelect: (id: string) => void }) {
  const ja = jointAngles(poseAt(scene.movementId, scene.time, scene.params));
  const roleKey = phase.roleKey ?? phase.id;
  return (
    <div className="panel">
      <div className="panel__head">
        <h2>{phase.name}</h2>
        <span className="tag">{phase.boundarySource === 'manually-keyed' ? 'Boundaries manually keyed' : 'Boundaries estimated'}</span>
      </div>
      <p>{phase.bodyPosition}</p>
      <h3 className="sub">Joint actions</h3>
      <ul>{phase.jointActions.map((a) => <li key={a}>{a}</li>)}</ul>
      <h3 className="sub">Contacts</h3>
      <p>{phase.contacts}</p>
      <h3 className="sub">Modeled joint angles now <span className="tag tag--calc">Kinematic calculation</span></h3>
      <table className="angles">
        <thead><tr><th scope="col">Joint</th><th scope="col">Left</th><th scope="col">Right</th></tr></thead>
        <tbody>
          <tr><th scope="row">Hip flexion</th><td>{ja.hipFlexL.toFixed(0)}°</td><td>{ja.hipFlexR.toFixed(0)}°</td></tr>
          <tr><th scope="row">Knee flexion</th><td>{ja.kneeFlexL.toFixed(0)}°</td><td>{ja.kneeFlexR.toFixed(0)}°</td></tr>
          <tr><th scope="row">Ankle dorsiflexion</th><td>{ja.ankleDorsiL.toFixed(0)}°</td><td>{ja.ankleDorsiR.toFixed(0)}°</td></tr>
          <tr><th scope="row">Elbow flexion</th><td>{ja.elbowFlexL.toFixed(0)}°</td><td>{ja.elbowFlexR.toFixed(0)}°</td></tr>
          <tr><th scope="row">Arm elevation</th><td>{ja.shoulderElevL.toFixed(0)}°</td><td>{ja.shoulderElevR.toFixed(0)}°</td></tr>
          <tr><th scope="row">Trunk lean</th><td colSpan={2}>{ja.trunkLean.toFixed(0)}° from vertical</td></tr>
          <tr><th scope="row">Hip–shoulder separation</th><td colSpan={2}>{ja.separation.toFixed(0)}° (horizontal plane)</td></tr>
        </tbody>
      </table>
      <h3 className="sub">Structures that contribute together</h3>
      <p className="muted small">Several structures act at once. Highlighting shows what the card discusses, not measured activation.</p>
      <ul className="contrib">
        {phase.keyStructures.map((id) => {
          const s = STRUCTURE_BY_ID[id];
          return (
            <li key={id}>
              <button className="link" onClick={() => onSelect(id)}>{s.name}</button>
              <span>{roleFor(id, scene.movementId, roleKey)?.role}</span>
            </li>
          );
        })}
      </ul>
      <h3 className="sub">Coaching questions</h3>
      <ul>{phase.coachingQuestions.map((q) => <li key={q}>{q}</li>)}</ul>
      <p className="draft-note">Draft content: not yet source-mapped or expert reviewed.</p>
    </div>
  );
}

// --------------------------------------------------------------- structure
export function StructurePanel({ scene, phase, onEvidence, onAsk }: { scene: SceneState; phase: PhaseDefinition; onEvidence: (ids: string[]) => void; onAsk: (q: string) => void }) {
  const [more, setMore] = useState(false);
  const s = scene.selectedStructureId ? STRUCTURE_BY_ID[scene.selectedStructureId] : undefined;
  if (!s) {
    return (
      <div className="panel empty">
        <p>Tap a structure on the body, or pick one from <strong>Layers → Find a structure</strong>.</p>
      </div>
    );
  }
  const role = roleFor(s.id, scene.movementId, phase.roleKey ?? phase.id);
  const mesh = primaryMesh(s.id);
  const lt = mesh && (s.type === 'muscle' || s.type === 'tendon') ? lengthTrend(scene.movementId, mesh, scene.time, scene.params) : undefined;
  const isLine = s.id.startsWith('line-');
  return (
    <div className="panel">
      <div className="panel__head">
        <h2>{s.name}</h2>
        <span className="tag">{s.type}</span>
      </div>
      <section className="claim claim--anatomy">
        <h3>What it is <span className="kind">General anatomy</span></h3>
        <p>{s.whatItIs}</p>
        {more && s.attachments && <p><strong>Attachments / landmarks:</strong> {s.attachments}</p>}
        {more && s.crosses && <p><strong>Crosses:</strong> {s.crosses.join(', ')}</p>}
        {more && s.commonActions && <p><strong>Common actions:</strong> {s.commonActions.join('; ')}</p>}
        {s.type === 'bone' && <p className="muted small">Bones provide levers and landmarks; they do not activate.</p>}
        {s.type === 'ligament' && <p className="muted small">Ligaments act as passive restraints. Strain and tension are not calculated here.</p>}
      </section>
      <section className={`claim ${isLine ? 'claim--fascial' : 'claim--coaching'}`}>
        <h3>What it contributes here <span className="kind">{isLine ? 'Fascial interpretation' : 'Educational role (draft)'}</span></h3>
        <p><strong>{phase.name}:</strong> {role?.role ?? 'No phase-specific content yet for this movement.'}</p>
      </section>
      {lt && (
        <section className="claim claim--model">
          <h3>Modeled path length <span className="kind">Model estimate · geometry</span></h3>
          <p>
            <strong>{lt.trend === 'lengthening' ? '↑ Lengthening' : lt.trend === 'shortening' ? '↓ Shortening' : '≈ Near-constant'}</strong> · {Math.round(lt.relLength * 100)}% of start-position length
          </p>
          <p className="muted small">Straight-line path through simplified attachment points on a generic rig. This says nothing about activation or fibre contraction.</p>
        </section>
      )}
      {s.coaching?.[scene.movementId] && (
        <section className="claim claim--coaching">
          <h3>Why it matters for coaching <span className="kind">Coaching interpretation</span></h3>
          <p>{s.coaching[scene.movementId]}</p>
        </section>
      )}
      <section className="claim claim--limits">
        <h3>Evidence limitations</h3>
        <p>{s.limitations}</p>
      </section>
      <div className="row">
        <button className="btn btn--ghost" onClick={() => setMore((m) => !m)} aria-expanded={more}>{more ? 'Less detail' : 'Technical detail'}</button>
        <button className="btn btn--ghost" onClick={() => onEvidence(s.evidenceIds)}>Evidence</button>
        <button className="btn btn--primary" onClick={() => onAsk(`What does the ${s.name.replace(/\s*\(.*\)/, '').toLowerCase()} contribute here?`)}>Ask coach</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- results
export function ResultsPanel({ run, onEvidence }: { run: SimulationRun; onEvidence: (ids: string[]) => void }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <h2>Results</h2>
        <span className="tag mono" title="Scene revision">{run.revision}</span>
      </div>
      <p className="small">
        <strong>Produced by:</strong> {run.producedBy.map((p) => p.replace(/-/g, ' ')).join(' → ')}
      </p>
      <table className="results">
        <thead><tr><th scope="col">Output</th><th scope="col">Value</th><th scope="col">Status</th></tr></thead>
        <tbody>
          {run.outputs.map((o) => (
            <tr key={o.id} className={o.value === null ? 'is-unavailable' : ''}>
              <th scope="row">{o.label}</th>
              <td>{o.value === null ? <span className="unavail">Unavailable</span> : `${o.value} ${o.unit ?? ''}`}</td>
              <td className="small">{o.value === null ? o.unavailableReason : 'Calculated under assumptions'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <details>
        <summary>Method & assumptions</summary>
        <p className="small">{run.outputs.find((o) => o.value !== null)?.method}</p>
        <p className="small">{run.outputs.find((o) => o.value !== null)?.assumptions}</p>
        <ul className="small">{run.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
        <button className="btn btn--ghost" onClick={() => onEvidence(['ev-opensim-workflows', 'ev-opensim-id'])}>Why forces aren’t calculated</button>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------- evidence
export function EvidenceDialog({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const records = evidenceFor(ids);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="ev-title" onClick={(e) => e.stopPropagation()}>
        <div className="panel__head">
          <h2 id="ev-title">Evidence</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close evidence" autoFocus>✕</button>
        </div>
        {records.map((r) => (
          <article key={r.id} className="evidence">
            <h3>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.source}</a> : r.source}</h3>
            {r.publisher && <p className="muted small">{r.publisher}</p>}
            <dl>
              <dt>Claim</dt><dd>{r.claim}</dd>
              <dt>Type</dt><dd>{r.evidenceType === 'pending' ? 'Source mapping pending' : r.evidenceType.replace(/-/g, ' ')}</dd>
              <dt>Applies to</dt><dd>{r.applicability}</dd>
              <dt>Limitations</dt><dd>{r.limitations}</dd>
              <dt>Review</dt><dd>{r.reviewer ? `${r.reviewer}, ${r.reviewDate}` : 'Not yet reviewed'}</dd>
              <dt>Content version</dt><dd className="mono">{r.contentVersion}</dd>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
