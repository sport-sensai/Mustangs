import { useMemo, useState } from 'react';
import { MOVEMENT_BY_ID, MOVEMENTS, PLANNED } from '../domain/movements';
import { resolveMovement } from '../domain/resolver';
import { supportBadge } from '../domain/simulation';
import { getFavorites, getRecent, toggleFavorite } from '../domain/storage';
import type { ResolveResult } from '../domain/types';

interface Props {
  onOpen: (movementId: string, params?: Record<string, number>, experimental?: boolean) => void;
  mode: 'explore' | 'library';
}

const ROUTE_LABEL: Record<ResolveResult['route'], string> = {
  exact: 'Reference movement',
  variation: 'Constrained variation',
  approximation: 'Experimental approximation',
  unsupported: 'Not yet supported',
  ambiguous: 'Needs a choice',
  empty: '',
};

const EXAMPLES = ['Front squat', 'Wide stance paused front squat', 'Sprint acceleration', 'Show me a right-handed baseball swing', 'Hit', 'Goblet squat'];

export function Explore({ onOpen, mode }: Props) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ResolveResult>();
  const [favs, setFavs] = useState(getFavorites());
  const [feedback, setFeedback] = useState<string[]>([]);
  const recent = useMemo(() => getRecent().filter((id) => MOVEMENT_BY_ID[id]), []);

  const submit = (q: string) => {
    setText(q);
    setResult(resolveMovement(q));
  };

  return (
    <div className="page explore">
      {mode === 'explore' && (
        <section className="hero">
          <p className="eyebrow">Explore / Understand / Move better</p>
          <h1>What movement do you want to understand?</h1>
          <form
            className="search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submit(text);
            }}
          >
            <span className="search__icon" aria-hidden="true">⌕</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Explore any movement…" aria-label="Describe a movement or exercise" />
            <button className="btn btn--primary" type="submit">Explore</button>
          </form>
          <div className="chips" aria-label="Example requests">
            {EXAMPLES.map((ex) => (
              <button key={ex} className="chip" onClick={() => submit(ex)}>{ex}</button>
            ))}
          </div>

          {result && result.route !== 'empty' && (
            <div className={`resolve card resolve--${result.route}`} role="status" aria-live="polite">
              <div className="resolve__head">
                <span className={`pill pill--${result.route}`}>{ROUTE_LABEL[result.route]}</span>
                <p>{result.message}</p>
              </div>
              {result.choices && (
                <div className="chips">
                  {result.choices.map((c) => (
                    <button key={c.label} className="chip chip--strong" onClick={() => submit(c.request)}>{c.label}</button>
                  ))}
                </div>
              )}
              {result.spec.movementId && (
                <>
                  <ul className="assumptions">
                    {result.assumptions.map((a) => <li key={a}>{a}</li>)}
                    {result.spec.parsedParams.length > 0 && (
                      <li>Parsed from your request: {result.spec.parsedParams.map((k) => `${k} = ${result.spec.params[k]}`).join(', ')}</li>
                    )}
                  </ul>
                  <button className="btn btn--primary" onClick={() => onOpen(result.spec.movementId!, result.spec.params, result.route === 'approximation')}>
                    {result.route === 'approximation' ? 'Open experimental scene' : 'Open in lab'}
                  </button>
                </>
              )}
              {result.route === 'unsupported' && (
                <div className="resolve__actions">
                  {result.alternative && (
                    <button className="btn" onClick={() => onOpen(result.alternative!.movementId)}>
                      Try {MOVEMENT_BY_ID[result.alternative.movementId].name} instead
                    </button>
                  )}
                  <button
                    className="btn btn--ghost"
                    disabled={feedback.includes(result.spec.requestText)}
                    onClick={() => setFeedback((f) => [...f, result.spec.requestText])}
                  >
                    {feedback.includes(result.spec.requestText) ? 'Request noted for this session' : 'Save request as feedback'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {mode === 'explore' && recent.length > 0 && (
        <section>
          <h2 className="section-title">Recent</h2>
          <div className="chips">
            {recent.map((id) => <button key={id} className="chip" onClick={() => onOpen(id)}>{MOVEMENT_BY_ID[id].name}</button>)}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">{mode === 'library' ? 'Movement library' : 'Available movements'}</h2>
        <div className="grid">
          {MOVEMENTS.map((m) => (
            <article key={m.id} className="card movement-card">
              <div className="movement-card__top">
                <span className="family">{m.family}</span>
                <button
                  className={`icon-btn${favs.includes(m.id) ? ' is-on' : ''}`}
                  aria-pressed={favs.includes(m.id)}
                  aria-label={favs.includes(m.id) ? `Remove ${m.name} from favorites` : `Add ${m.name} to favorites`}
                  onClick={() => {
                    toggleFavorite(m.id);
                    setFavs(getFavorites());
                  }}
                >
                  {favs.includes(m.id) ? '★' : '☆'}
                </button>
              </div>
              <h3>{m.name}</h3>
              <p>{m.summary}</p>
              <p className="badge-line"><span className="dot dot--draft" aria-hidden="true" />{supportBadge(m.support)}</p>
              <p className="meta">{m.phases.length} phases · {m.parameters.length} controls{m.equipment.length ? ` · ${m.equipment.join(', ')}` : ''}</p>
              <button className="btn btn--primary" onClick={() => onOpen(m.id)}>Open</button>
            </article>
          ))}
        </div>
      </section>

      {mode === 'library' && (
        <section>
          <h2 className="section-title">Planned coverage</h2>
          <p className="muted">These are catalogued but not simulated. Requesting one says so and suggests a related movement.</p>
          <ul className="planned">
            {PLANNED.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong> <span className="family">{p.family}</span>
                <span className="muted"> · needs {p.missingCapability}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
