import { useState } from 'react';
import { LAYERS, STRUCTURES, roleFor } from '../domain/anatomy';
import { MOVEMENTS } from '../domain/movements';
import type { LayerId } from '../domain/types';

// Text-first route to all learning content, so the 3D view is never the only way in.
export function Learn({ onOpen }: { onOpen: (movementId: string) => void }) {
  const [layer, setLayer] = useState<LayerId>('muscles');
  return (
    <div className="page">
      <h1>Learn</h1>
      <p className="muted">Browse every structure and phase as text. All content is draft and awaiting expert review.</p>
      <div className="seg seg--inline" role="radiogroup" aria-label="Layer">
        {LAYERS.map((l) => (
          <label key={l.id} className={layer === l.id ? 'is-on' : ''}>
            <input type="radio" checked={layer === l.id} onChange={() => setLayer(l.id)} /> {l.label}
          </label>
        ))}
      </div>
      <div className="grid">
        {STRUCTURES.filter((s) => s.layer === layer).map((s) => (
          <article key={s.id} className="card">
            <h2 className="h3">{s.name}</h2>
            <p>{s.whatItIs}</p>
            {MOVEMENTS.map((m) => (
              <details key={m.id}>
                <summary>In {m.name.toLowerCase()}</summary>
                <ul>
                  {m.phases.filter((p, i, arr) => arr.findIndex((x) => (x.roleKey ?? x.id) === (p.roleKey ?? p.id)) === i).map((p) => {
                    const r = roleFor(s.id, m.id, p.roleKey ?? p.id);
                    return r ? <li key={p.id}><strong>{p.name.replace(/ \((R|L)\)/, '')}:</strong> {r.role}</li> : null;
                  })}
                </ul>
                <button className="link" onClick={() => onOpen(m.id)}>Open {m.name}</button>
              </details>
            ))}
            <p className="small muted">{s.limitations}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
