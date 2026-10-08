import { useEffect, useMemo, useRef, useState } from 'react';
import type { CoachCommand } from '../domain/coach';
import { cycleDuration, defaultParams, MOVEMENT_BY_ID, phaseAt, phasesFor } from '../domain/movements';
import { createScene, withParams, type MassUnit } from '../domain/scene';
import { changedParams, formatParam, runSimulation, sceneSupport, supportBadge } from '../domain/simulation';
import { saveScene } from '../domain/storage';
import type { LayerId, SceneState, SupportStatus } from '../domain/types';
import { Clock } from '../viewer/clock';
import { Viewer, type ColorMode } from '../viewer/Viewer';
import { CoachPanel } from './Coach';
import { ControlsPanel } from './Controls';
import { prefersReducedMotion, useClock, useMedia } from './hooks';
import { EvidenceDialog, LayersPanel, Legend, PhasePanel, ResultsPanel, StructurePanel } from './Panels';
import { Transport } from './Transport';

type Tab = 'phase' | 'structure' | 'adjust' | 'coach' | 'results' | 'layers';

const VIEWS: { label: string; azimuth: number; elevation: number }[] = [
  { label: 'Front', azimuth: 0, elevation: 8 },
  { label: 'Side', azimuth: 90, elevation: 8 },
  { label: 'Back', azimuth: 180, elevation: 8 },
  { label: 'Oblique', azimuth: 35, elevation: 12 },
];

interface Props {
  initial: SceneState;
  unit: MassUnit;
  savedId?: string;
  savedName?: string;
  onBack: () => void;
}

export function Lab({ initial, unit, savedId, savedName, onBack }: Props) {
  const [scene, setScene] = useState<SceneState>(initial);
  const [baseline, setBaseline] = useState<SceneState>(() => createScene(initial.movementId));
  const [comparing, setComparing] = useState(false);
  const [abSide, setAbSide] = useState<'A' | 'B'>('B');
  const [colorMode, setColorMode] = useState<ColorMode>('identity');
  const [tab, setTab] = useState<Tab>('phase');
  const [evidence, setEvidence] = useState<string[]>();
  const [pendingQ, setPendingQ] = useState<string>();
  const [questions, setQuestions] = useState<string[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string>();
  const [showSupport, setShowSupport] = useState(false);
  const [no3d, setNo3d] = useState(false);
  const desktop = useMedia('(min-width: 1100px)');
  const phone = useMedia('(max-width: 699px)');

  const clockRef = useRef<Clock>();
  if (!clockRef.current) {
    const c = new Clock();
    c.time = initial.time;
    c.rate = initial.playbackRate;
    c.playing = !prefersReducedMotion(); // no autoplay under reduced motion
    clockRef.current = c;
  }
  const clock = clockRef.current;
  useClock(clock);

  const m = MOVEMENT_BY_ID[scene.movementId];
  const phases = useMemo(() => phasesFor(m, scene.params), [m, scene.params]);
  const now = { ...scene, time: clock.time };
  const phase = phaseAt(phases, clock.time);
  // Results are keyed by revision; a changed scene can never show stale results.
  const run = useMemo(() => runSimulation(scene.movementId, scene.params, scene.experimental), [scene.revision]); // eslint-disable-line react-hooks/exhaustive-deps
  const baseRun = useMemo(() => runSimulation(baseline.movementId, baseline.params, baseline.experimental), [baseline.revision]); // eslint-disable-line react-hooks/exhaustive-deps
  const support: SupportStatus = sceneSupport(m, scene.params, scene.experimental);
  const duration = cycleDuration(m, scene.params);

  useEffect(() => {
    if (desktop && tab === 'layers') setTab('phase');
  }, [desktop, tab]);

  const select = (id: string | undefined) => {
    setScene((s) => ({ ...s, selectedStructureId: id, isolate: id ? s.isolate : false }));
    if (id) setTab('structure');
  };
  const setLayer = (id: LayerId, on: boolean) => setScene((s) => ({ ...s, layers: { ...s.layers, [id]: on } }));

  const applyParams = (params: Record<string, number>, experimental: boolean) => {
    setScene((s) => withParams(s, params, experimental));
  };

  const onCommand = (c: CoachCommand) => {
    if (c.type === 'select-structure') select(c.structureId);
    if (c.type === 'go-to-phase') {
      const p = phases.find((x) => x.id === c.phaseId);
      if (p) { clock.setPlaying(false); clock.set((p.start + p.end) / 2); }
    }
    if (c.type === 'set-lens') setScene((s) => ({ ...s, lens: c.lens, layers: { ...s.layers, fascia: c.lens === 'fascial' ? true : s.layers.fascia } }));
    if (c.type === 'propose-param') { setTab('adjust'); applyParams({ [c.paramId]: c.value }, false); }
  };

  const ask = (q: string) => { setPendingQ(q); setTab('coach'); };

  const doSave = (name: string, notes: string) => {
    const id = savedId ?? `scene-${Date.now().toString(36)}`;
    const ok = saveScene({
      id, name, notes, questions,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      scene: { ...scene, time: clock.time, playbackRate: clock.rate },
      support, schemaVersion: 1,
    });
    setSavedMsg(ok ? `Saved “${name}” on this device.` : 'Could not save: browser storage is unavailable. Nothing was stored.');
    setSaveOpen(false);
  };

  const diffs = changedParams(m, scene.params).map((p) => ({ p, a: baseline.params[p.id], b: scene.params[p.id] }));

  const tabs: { id: Tab; label: string }[] = [
    ...(!desktop ? [{ id: 'layers' as Tab, label: 'Layers' }] : []),
    { id: 'phase', label: 'Phase' },
    { id: 'structure', label: 'Structure' },
    { id: 'adjust', label: 'Adjust' },
    { id: 'coach', label: 'Coach' },
    { id: 'results', label: 'Results' },
  ];

  const layersPanel = (
    <LayersPanel
      scene={scene}
      colorMode={colorMode}
      onLayer={setLayer}
      onOpacity={(v) => setScene((s) => ({ ...s, skinOpacity: v }))}
      onIsolate={(v) => setScene((s) => ({ ...s, isolate: v }))}
      onLens={(l) => setScene((s) => ({ ...s, lens: l, layers: { ...s.layers, fascia: l === 'fascial' ? true : s.layers.fascia } }))}
      onColorMode={setColorMode}
      onSelect={select}
    />
  );

  const viewerB = (
    <Viewer scene={scene} clock={clock} colorMode={colorMode} onSelect={select} onCamera={(c) => setScene((s) => ({ ...s, camera: c }))} onUnavailable={() => setNo3d(true)} label={comparing ? 'B · Variation' : undefined} />
  );
  // Baseline viewer shares the camera and the clock (synchronised, time-normalised).
  const viewerA = (
    <Viewer scene={{ ...baseline, camera: scene.camera, layers: scene.layers, skinOpacity: scene.skinOpacity, lens: scene.lens, selectedStructureId: scene.selectedStructureId, isolate: scene.isolate }} clock={clock} master={false} colorMode={colorMode} onSelect={select} onCamera={(c) => setScene((s) => ({ ...s, camera: c }))} label="A · Baseline" />
  );

  return (
    <div className={`lab${comparing ? ' is-comparing' : ''}`}>
      <div className="lab__header">
        <button className="back" onClick={onBack}>‹ Back</button>
        <div className="lab__title">
          <h1>{m.name}</h1>
          <p className="muted">{m.summary}</p>
        </div>
        <div className="lab__actions">
          <button className={`badge${scene.experimental ? ' badge--warn' : ''}`} onClick={() => setShowSupport((x) => !x)} aria-expanded={showSupport}>
            <span className="dot dot--draft" aria-hidden="true" /> {supportBadge(support)}
          </button>
          <button className="btn" onClick={() => setComparing((c) => !c)} aria-pressed={comparing}>{comparing ? 'Exit compare' : 'Compare'}</button>
          <button className="btn btn--primary" onClick={() => setSaveOpen(true)}>Save</button>
        </div>
        {showSupport && (
          <div className="support card">
            <dl>
              <dt>Motion</dt><dd>{support.motion.replace(/-/g, ' ')}. Procedurally keyed generic clip, not expert reviewed.</dd>
              <dt>Anatomy</dt><dd>Limited-detail representation. Structures are simplified volumes on a generic rig.</dd>
              <dt>Explanation</dt><dd>Draft content, not yet source-mapped.</dd>
              <dt>Mechanics</dt><dd>Kinematics calculated under stated assumptions. Forces, moments, activation and tissue strain are not calculated.</dd>
              <dt>Fascia</dt><dd>Anatomical tissue layer plus an optional Myers-inspired interpretive overlay.</dd>
              <dt>Generated by</dt><dd>{run.producedBy.map((p) => p.replace(/-/g, ' ')).join(' → ')}</dd>
              <dt>Versions</dt><dd className="mono">{m.id}@{m.version} · {scene.assetVersion} · {scene.revision}</dd>
            </dl>
          </div>
        )}
        {savedMsg && <p className="toast" role="status">{savedMsg} <button className="link" onClick={() => setSavedMsg(undefined)}>Dismiss</button></p>}
      </div>

      {desktop && <aside className="lab__rail" aria-label="Anatomy layers">{layersPanel}</aside>}

      <section className="lab__stage" aria-label="Movement viewer">
        {comparing && (
          <div className="compare-bar">
            <div>
              <strong>Compare:</strong>{' '}
              {diffs.length ? diffs.map(({ p, a, b }) => `${p.label} ${formatParam(p, a)} → ${formatParam(p, b)}`).join(' · ') : 'No differences yet. Change a parameter in Adjust to create the variation.'}
            </div>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setBaseline(createScene(scene.movementId, defaultParams(m)))}>Reset baseline</button>
              <button className="btn btn--ghost" onClick={() => setScene((s) => withParams(s, baseline.params, baseline.experimental))}>Reset variation to baseline</button>
            </div>
            {phone && (
              <div className="seg seg--inline" role="radiogroup" aria-label="Show scene">
                {(['A', 'B'] as const).map((x) => (
                  <label key={x} className={abSide === x ? 'is-on' : ''}>
                    <input type="radio" checked={abSide === x} onChange={() => setAbSide(x)} /> {x === 'A' ? 'A · Baseline' : 'B · Variation'}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={`stage${comparing && !phone ? ' stage--split' : ''}`}>
          {comparing && (!phone || abSide === 'A') && viewerA}
          {(!comparing || !phone || abSide === 'B') && viewerB}
          <div className="view-buttons" role="group" aria-label="Camera views">
            {VIEWS.map((v) => (
              <button key={v.label} onClick={() => setScene((s) => ({ ...s, camera: { ...s.camera, azimuth: v.azimuth + (m.facingYaw ?? 0) * (s.params.handedness === 1 ? -1 : 1), elevation: v.elevation } }))}>{v.label}</button>
            ))}
            <button onClick={() => setScene((s) => ({ ...s, camera: createScene(s.movementId).camera }))}>Reset</button>
          </div>
          {colorMode === 'length' && <div className="stage-legend"><Legend mode="length" /></div>}
          {no3d && <p className="sr-only">3D unavailable; use the panels.</p>}
        </div>
        <Transport clock={clock} phases={phases} duration={duration} onRate={(r) => { clock.rate = r; clock.emit(); }} />
        {comparing && (
          <div className="compare-results card">
            <h2 className="sub">Result differences (time-normalised)</h2>
            <p className="small muted">
              Modeled cycle: A {cycleDuration(m, baseline.params).toFixed(2)} s · B {duration.toFixed(2)} s. Phases are aligned by normalised time, so event timing can differ.
            </p>
            <table className="results">
              <thead><tr><th scope="col">Output</th><th scope="col">A</th><th scope="col">B</th></tr></thead>
              <tbody>
                {run.outputs.map((o) => {
                  const a = baseRun.outputs.find((x) => x.id === o.id);
                  const changed = a?.value !== o.value;
                  return (
                    <tr key={o.id} className={o.value === null ? 'is-unavailable' : changed ? 'is-changed' : ''}>
                      <th scope="row">{o.label}</th>
                      <td>{a?.value === null || a === undefined ? 'Unavailable' : `${a.value} ${a.unit}`}</td>
                      <td>{o.value === null ? 'Unavailable' : `${o.value} ${o.unit}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="small"><span className="kind">Observed in model</span> Rows marked as changed differ in the generic rig's kinematics. <span className="kind">Coaching hypothesis</span> Ask the coach “What changes in this variation?” for interpretation, which is labelled separately.</p>
          </div>
        )}
      </section>

      <aside className="lab__inspector" aria-label="Inspector">
        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="tabpanel" role="tabpanel">
          {tab === 'layers' && layersPanel}
          {tab === 'phase' && <PhasePanel scene={now} phase={phase} onSelect={select} />}
          {tab === 'structure' && <StructurePanel scene={now} phase={phase} onEvidence={setEvidence} onAsk={ask} />}
          {tab === 'adjust' && (
            <ControlsPanel
              scene={scene}
              unit={unit}
              onApply={applyParams}
              onReset={() => setScene((s) => withParams(s, defaultParams(m), false))}
              onCompare={comparing ? undefined : () => { setBaseline(createScene(scene.movementId)); setComparing(true); }}
            />
          )}
          <div hidden={tab !== 'coach'}>
            <CoachPanel scene={now} run={run} pending={pendingQ} onPendingConsumed={() => setPendingQ(undefined)} onCommand={onCommand} onEvidence={setEvidence} onAsked={(q) => setQuestions((x) => [...x, q])} />
          </div>
          {tab === 'results' && <ResultsPanel run={run} onEvidence={setEvidence} />}
        </div>
      </aside>

      {evidence && <EvidenceDialog ids={evidence} onClose={() => setEvidence(undefined)} />}
      {saveOpen && <SaveDialog defaultName={savedName ?? `${m.name}: ${phase.name}`} onSave={doSave} onClose={() => setSaveOpen(false)} />}
    </div>
  );
}

function SaveDialog({ defaultName, onSave, onClose }: { defaultName: string; onSave: (n: string, notes: string) => void; onClose: () => void }) {
  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState('');
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="save-title" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(name.trim() || defaultName, notes); }}>
        <h2 id="save-title">Save scene</h2>
        <p className="small muted">Saves the movement and its version, phase, camera, layers, parameters, support status, notes and your coach questions on this device.</p>
        <label className="field"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
        <label className="field"><span>Notes</span><textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <div className="row">
          <button className="btn btn--primary" type="submit">Save</button>
          <button className="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
