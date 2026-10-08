import { useEffect, useRef, useState } from 'react';
import { offlineCoach, validateCommand, type ClaimKind, type CoachAnswer, type CoachCommand, type CoachProvider } from '../domain/coach';
import { MOVEMENT_BY_ID } from '../domain/movements';
import type { SceneState, SimulationRun } from '../domain/types';

const KIND_LABEL: Record<ClaimKind, string> = {
  anatomy: 'Anatomy',
  'model-estimate': 'Model estimate',
  'coaching-interpretation': 'Coaching interpretation',
  'fascial-interpretation': 'Fascial interpretation',
  boundary: 'Boundary',
};

const PROMPTS = ['What contributes here?', 'Explain this as a coaching cue', 'What changes in this variation?', 'How does fascia fit in?', 'How much force is on the knee?'];

/** `?coach=offline` simulates a service outage (AC-11). */
const unavailableProvider: CoachProvider = { ask: () => Promise.reject(new Error('Coach service unavailable')) };
const provider = typeof location !== 'undefined' && new URLSearchParams(location.search).get('coach') === 'offline' ? unavailableProvider : offlineCoach;

interface Props {
  scene: SceneState;
  run: SimulationRun;
  pending?: string;
  onPendingConsumed: () => void;
  onCommand: (c: CoachCommand) => void;
  onEvidence: (ids: string[]) => void;
  onAsked: (q: string) => void;
}

export function CoachPanel({ scene, run, pending, onPendingConsumed, onCommand, onEvidence, onAsked }: Props) {
  const [q, setQ] = useState('');
  const [answers, setAnswers] = useState<CoachAnswer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const endRef = useRef<HTMLDivElement>(null);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setBusy(true);
    setError(undefined);
    onAsked(question);
    try {
      const a = await provider.ask(question, { scene: sceneRef.current, run });
      setAnswers((x) => [...x, a]);
    } catch {
      setError('The coach is unavailable right now. Structure cards, phase cards and results still work.');
    } finally {
      setBusy(false);
      setQ('');
    }
  };

  useEffect(() => {
    if (pending) {
      ask(pending);
      onPendingConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  useEffect(() => endRef.current?.scrollIntoView?.({ block: 'nearest' }), [answers.length]);

  return (
    <div className="panel coach">
      <div className="panel__head">
        <h2>Coach</h2>
        <span className="tag" title="Answers only from this scene's cards and computed results. No language model is connected in this prototype.">Grounded · offline</span>
      </div>
      <div className="coach__log" aria-live="polite">
        {answers.length === 0 && <p className="muted small">Questions use the current movement, phase, selected structure, parameters and results.</p>}
        {answers.map((a, i) => {
          const stale = a.revision !== scene.revision || a.movementId !== scene.movementId;
          return (
            <article key={i} className={`answer${stale ? ' is-stale' : ''}`}>
              <p className="answer__q">{a.question}</p>
              {stale && (
                <p className="tag tag--warn">
                  Answered for an earlier scene ({MOVEMENT_BY_ID[a.movementId].name}, {a.revision}). Parameters have changed since.
                </p>
              )}
              {a.parts.map((p, j) => (
                <div key={j} className={`claim claim--${p.kind}`}>
                  <span className="kind">{KIND_LABEL[p.kind]}</span>
                  <p>{p.text}</p>
                  {p.evidenceIds.length > 0 && <button className="link small" onClick={() => onEvidence(p.evidenceIds)}>Sources</button>}
                </div>
              ))}
              {!stale && a.commands.length > 0 && (
                <div className="chips">
                  {a.commands.filter((c) => validateCommand(c, scene)).map((c, k) => (
                    <button key={k} className="chip chip--strong" onClick={() => onCommand(c)}>{c.label}</button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
        {busy && <p className="muted small">Thinking…</p>}
        {error && <p className="error small" role="alert">{error}</p>}
        <div ref={endRef} />
      </div>
      <div className="chips">
        {PROMPTS.map((p) => <button key={p} className="chip" onClick={() => ask(p)} disabled={busy}>{p}</button>)}
      </div>
      <form className="coach__input" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about this phase or structure…" aria-label="Ask the coach" />
        <button className="btn btn--primary" disabled={busy || !q.trim()}>Ask</button>
      </form>
    </div>
  );
}
