import { useEffect, useState } from 'react';
import { MOVEMENT_BY_ID } from '../domain/movements';
import { fromDisplayMass, toDisplayMass, type MassUnit } from '../domain/scene';
import { checkParam } from '../domain/simulation';
import type { ParameterDefinition, SceneState } from '../domain/types';

interface Props {
  scene: SceneState;
  unit: MassUnit;
  onApply: (params: Record<string, number>, experimental: boolean) => void;
  onReset: () => void;
  onCompare?: () => void;
}

const EFFECT_LABEL: Record<ParameterDefinition['effect'], string> = {
  'changes-motion': 'Changes motion',
  'changes-timing': 'Changes modeled timing',
  'educational-only': 'Educational only',
};

export function ControlsPanel({ scene, unit, onApply, onReset, onCompare }: Props) {
  const m = MOVEMENT_BY_ID[scene.movementId];
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => setDraft({}), [scene.revision]);

  const isMass = (d: ParameterDefinition) => d.unit === 'kg';
  const shown = (d: ParameterDefinition, v: number) => (isMass(d) ? toDisplayMass(v, unit) : v);
  const unitOf = (d: ParameterDefinition) => (isMass(d) ? unit : d.unit);
  const valueOf = (d: ParameterDefinition) => {
    const raw = draft[d.id];
    if (raw === undefined) return scene.params[d.id];
    const n = raw.trim() === '' ? NaN : Number(raw);
    return isMass(d) ? fromDisplayMass(n, unit) : n;
  };

  const checks = m.parameters.map((d) => ({ d, v: valueOf(d), c: checkParam(d, valueOf(d)) }));
  const dirty = m.parameters.some((d) => draft[d.id] !== undefined && valueOf(d) !== scene.params[d.id]);
  const rejected = checks.filter((x) => x.c.level === 'rejected');
  const experimental = checks.filter((x) => x.c.level === 'experimental');
  const next = Object.fromEntries(checks.map((x) => [x.d.id, x.v]));

  return (
    <div className="panel">
      <div className="panel__head">
        <h2>Adjust & explore</h2>
        {scene.experimental && <span className="tag tag--warn">Experimental scene</span>}
      </div>
      <p className="muted small">Each control says what it really changes. Applying creates a new scene revision, and results are recomputed for it.</p>
      {m.parameters.map((d) => {
        const v = valueOf(d);
        const c = checkParam(d, v);
        const lo = d.experimentalMin ?? d.min;
        const hi = d.experimentalMax ?? d.max;
        return (
          <div key={d.id} className={`control control--${c.level}`}>
            <div className="control__head">
              <label htmlFor={`p-${d.id}`}>{d.label}</label>
              <span className={`tag tag--${d.effect}`}>{EFFECT_LABEL[d.effect]}</span>
            </div>
            {d.options ? (
              <div className="control__row control__row--select">
                <select
                  id={`p-${d.id}`}
                  value={String(v)}
                  onChange={(e) => setDraft((x) => ({ ...x, [d.id]: e.target.value }))}
                  aria-describedby={`p-${d.id}-note`}
                >
                  {d.options.map((o, i) => <option key={o} value={i}>{o}</option>)}
                </select>
              </div>
            ) : (
              <div className="control__row">
                <input
                  type="range"
                  min={shown(d, lo)}
                  max={shown(d, hi)}
                  step={d.step}
                  value={Number.isFinite(v) ? shown(d, Math.min(hi, Math.max(lo, v))) : shown(d, d.default)}
                  onChange={(e) => setDraft((x) => ({ ...x, [d.id]: e.target.value }))}
                  aria-label={`${d.label} slider`}
                />
                <input
                  id={`p-${d.id}`}
                  className="num"
                  type="number"
                  inputMode="decimal"
                  step={d.step}
                  value={draft[d.id] ?? String(shown(d, scene.params[d.id]))}
                  onChange={(e) => setDraft((x) => ({ ...x, [d.id]: e.target.value }))}
                  aria-describedby={`p-${d.id}-note`}
                />
                <span className="unit">{unitOf(d)}</span>
              </div>
            )}
            <p id={`p-${d.id}-note`} className="small muted">
              {d.options ? '' : `Reference range ${shown(d, d.min)}–${shown(d, d.max)} ${unitOf(d)}. `}{d.effectNote}
            </p>
            {c.level !== 'ok' && <p className={`small ${c.level === 'rejected' ? 'error' : 'warn'}`} role="alert">{c.message}</p>}
          </div>
        );
      })}

      <div className="row sticky-actions">
        <button className="btn btn--primary" disabled={!dirty || rejected.length > 0 || experimental.length > 0} onClick={() => onApply(next, false)}>
          Apply
        </button>
        {experimental.length > 0 && rejected.length === 0 && (
          <button className="btn btn--warn" onClick={() => onApply(next, true)}>Run as experimental scene</button>
        )}
        <button className="btn btn--ghost" onClick={() => { setDraft({}); onReset(); }}>Reset to baseline</button>
        {onCompare && <button className="btn btn--ghost" onClick={onCompare}>Compare with baseline</button>}
      </div>

      {m.unavailableControls.length > 0 && (
        <div className="unavailable">
          <h3 className="sub">Not available for this movement</h3>
          <ul>
            {m.unavailableControls.map((u) => (
              <li key={u.label}>
                <button className="btn btn--disabled" disabled aria-describedby={`u-${u.label}`}>{u.label}</button>
                <span id={`u-${u.label}`} className="small muted">{u.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
