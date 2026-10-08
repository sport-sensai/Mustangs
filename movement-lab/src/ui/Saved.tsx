import { useState } from 'react';
import { MOVEMENT_BY_ID } from '../domain/movements';
import { supportBadge } from '../domain/simulation';
import { checkRestore, deleteAllPersonalData, deleteSaved, listSaved } from '../domain/storage';
import type { SavedScene, SceneState } from '../domain/types';

export function Saved({ onOpen }: { onOpen: (s: SceneState, saved: { id: string; name: string }) => void }) {
  const [items, setItems] = useState<SavedScene[]>(listSaved());
  const [warning, setWarning] = useState<{ item: SavedScene; summary: string }>();

  const open = (item: SavedScene) => {
    const r = checkRestore(item);
    if (r.ok) onOpen(r.scene, { id: item.id, name: item.name });
    else setWarning({ item, summary: r.summary });
  };

  return (
    <div className="page">
      <h1>Saved workspace</h1>
      <p className="muted">Stored only in this browser. Nothing is sent to a server.</p>
      {warning && (
        <div className="card warn-card" role="alert">
          <p>{warning.summary}</p>
          <p className="small">Saved results are not reinterpreted silently. You can open the saved inputs with the current model; results will be recomputed and labelled with the new version.</p>
          <div className="row">
            {MOVEMENT_BY_ID[warning.item.scene.movementId] && (
              <button className="btn btn--primary" onClick={() => onOpen({ ...warning.item.scene, movementVersion: MOVEMENT_BY_ID[warning.item.scene.movementId].version }, { id: warning.item.id, name: warning.item.name })}>
                Migrate and open
              </button>
            )}
            <button className="btn btn--ghost" onClick={() => setWarning(undefined)}>Cancel</button>
          </div>
        </div>
      )}
      {items.length === 0 ? (
        <p className="card">No saved scenes yet. Open a movement and press <strong>Save</strong>.</p>
      ) : (
        <ul className="saved-list">
          {items.map((it) => (
            <li key={it.id} className="card">
              <div>
                <h2>{it.name}</h2>
                <p className="small muted">
                  {MOVEMENT_BY_ID[it.scene.movementId]?.name ?? it.scene.movementId} v{it.scene.movementVersion} · {new Date(it.updatedAt).toLocaleString()} · {supportBadge(it.support)}
                </p>
                {it.notes && <p>{it.notes}</p>}
                {it.questions.length > 0 && <p className="small">Questions: {it.questions.join(' · ')}</p>}
              </div>
              <div className="row">
                <button className="btn btn--primary" onClick={() => open(it)}>Open</button>
                <button className="btn btn--ghost" onClick={() => { deleteSaved(it.id); setItems(listSaved()); }} aria-label={`Delete ${it.name}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn--ghost danger" onClick={() => { if (confirm('Delete all saved scenes, favorites and recents from this browser?')) { deleteAllPersonalData(); setItems([]); } }}>
        Delete all personal data
      </button>
    </div>
  );
}
