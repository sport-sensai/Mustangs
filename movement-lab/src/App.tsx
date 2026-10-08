import { useState } from 'react';
import { createScene } from './domain/scene';
import type { MassUnit } from './domain/scene';
import type { SceneState } from './domain/types';
import { pushRecent } from './domain/storage';
import { Explore } from './ui/Explore';
import { Lab } from './ui/Lab';
import { Saved } from './ui/Saved';
import { Learn } from './ui/Learn';

type View = { name: 'explore' } | { name: 'library' } | { name: 'saved' } | { name: 'learn' } | { name: 'lab'; scene: SceneState; savedId?: string; savedName?: string; key: number };

export function App() {
  const [view, setView] = useState<View>({ name: 'explore' });
  const [unit, setUnit] = useState<MassUnit>('kg');

  const openScene = (scene: SceneState, saved?: { id: string; name: string }) => {
    pushRecent(scene.movementId);
    setView({ name: 'lab', scene, savedId: saved?.id, savedName: saved?.name, key: Date.now() });
  };
  const openMovement = (movementId: string, params?: Record<string, number>, experimental = false) =>
    openScene(createScene(movementId, params, experimental));

  const nav: { id: View['name']; label: string }[] = [
    { id: 'explore', label: 'Explore' },
    { id: 'library', label: 'Library' },
    { id: 'saved', label: 'Saved' },
    { id: 'learn', label: 'Learn' },
  ];
  const active = view.name === 'lab' ? 'explore' : view.name;

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <button className="brand" onClick={() => setView({ name: 'explore' })}>Movement Lab</button>
        <nav aria-label="Primary">
          {nav.map((n) => (
            <button key={n.id} className={`nav__item${active === n.id ? ' is-active' : ''}`} aria-current={active === n.id ? 'page' : undefined} onClick={() => setView({ name: n.id } as View)}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="topbar__right">
          <label className="unit-toggle">
            <span className="sr-only">Mass display unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value as MassUnit)} aria-label="Mass display unit">
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
        </div>
      </header>
      <main id="main">
        {view.name === 'explore' && <Explore onOpen={openMovement} mode="explore" />}
        {view.name === 'library' && <Explore onOpen={openMovement} mode="library" />}
        {view.name === 'saved' && <Saved onOpen={openScene} />}
        {view.name === 'learn' && <Learn onOpen={openMovement} />}
        {view.name === 'lab' && (
          <Lab key={view.key} initial={view.scene} unit={unit} savedId={view.savedId} savedName={view.savedName} onBack={() => setView({ name: 'explore' })} />
        )}
      </main>
    </div>
  );
}
