// Local-first personal persistence (one of the two options in PRD §20.4). Every
// access is wrapped: storage may be unavailable (private mode, blocked site data).

import { MOVEMENT_BY_ID, ASSET_VERSION } from './movements';
import type { SavedScene, SceneState } from './types';

export const SCHEMA_VERSION = 1;
const KEY = 'movement-lab.saved.v1';
const RECENT = 'movement-lab.recent.v1';
const FAVS = 'movement-lab.favorites.v1';

export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }

function store(): KV | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function read<T>(kv: KV | null, key: string, fallback: T): T {
  try {
    const raw = kv?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(kv: KV | null, key: string, value: unknown): boolean {
  try {
    if (!kv) return false;
    kv.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function listSaved(kv = store()): SavedScene[] {
  return read<SavedScene[]>(kv, KEY, []);
}

/** Saving with the same id updates in place, so a retried save never duplicates. */
export function saveScene(s: SavedScene, kv = store()): boolean {
  const all = listSaved(kv).filter((x) => x.id !== s.id);
  return write(kv, KEY, [{ ...s, updatedAt: new Date().toISOString() }, ...all]);
}

export function deleteSaved(id: string, kv = store()) {
  return write(kv, KEY, listSaved(kv).filter((x) => x.id !== id));
}

export function deleteAllPersonalData(kv = store()) {
  try {
    kv?.removeItem(KEY);
    kv?.removeItem(RECENT);
    kv?.removeItem(FAVS);
  } catch {
    /* ignore */
  }
}

export type RestoreCheck =
  | { ok: true; scene: SceneState }
  | { ok: false; reason: 'movement-retired' | 'version-changed'; summary: string; scene: SceneState };

/** SAVE-02: never silently reinterpret a saved scene against a newer model. */
export function checkRestore(saved: SavedScene): RestoreCheck {
  const m = MOVEMENT_BY_ID[saved.scene.movementId];
  if (!m) return { ok: false, reason: 'movement-retired', summary: 'This movement is no longer available.', scene: saved.scene };
  if (m.version !== saved.scene.movementVersion || saved.scene.assetVersion !== ASSET_VERSION) {
    return {
      ok: false,
      reason: 'version-changed',
      summary: `Saved with ${m.name} v${saved.scene.movementVersion} / ${saved.scene.assetVersion}; current is v${m.version} / ${ASSET_VERSION}. Results may differ after migration.`,
      scene: saved.scene,
    };
  }
  return { ok: true, scene: saved.scene };
}

export function getRecent(kv = store()): string[] {
  return read<string[]>(kv, RECENT, []);
}
export function pushRecent(id: string, kv = store()) {
  write(kv, RECENT, [id, ...getRecent(kv).filter((x) => x !== id)].slice(0, 8));
}
export function getFavorites(kv = store()): string[] {
  return read<string[]>(kv, FAVS, []);
}
export function toggleFavorite(id: string, kv = store()) {
  const f = getFavorites(kv);
  write(kv, FAVS, f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
}
