import { ASSET_VERSION, defaultParams, MOVEMENT_BY_ID } from './movements';
import { sceneRevision } from './simulation';
import type { SceneState } from './types';

export function createScene(movementId: string, params?: Record<string, number>, experimental = false): SceneState {
  const m = MOVEMENT_BY_ID[movementId];
  const p = { ...defaultParams(m), ...(params ?? {}) };
  return {
    movementId,
    movementVersion: m.version,
    assetVersion: ASSET_VERSION,
    params: p,
    experimental,
    revision: sceneRevision(movementId, m.version, ASSET_VERSION, p, experimental),
    time: 0,
    playbackRate: 1,
    camera: { azimuth: 35, elevation: 12, distance: 3.1 },
    layers: { muscles: true, bones: false, joints: false, ligaments: false, fascia: false },
    skinOpacity: 0.85,
    isolate: false,
    lens: 'anatomy',
  };
}

/** Any result-affecting change produces a new revision; view-only changes do not (AC-04/AC-05). */
export function withParams(scene: SceneState, params: Record<string, number>, experimental: boolean): SceneState {
  const p = { ...scene.params, ...params };
  return { ...scene, params: p, experimental, revision: sceneRevision(scene.movementId, scene.movementVersion, scene.assetVersion, p, experimental) };
}

// ---- display units (stored internally in kg) -------------------------------
export type MassUnit = 'kg' | 'lb';
export const KG_PER_LB = 0.45359237;
export const toDisplayMass = (kg: number, u: MassUnit) => (u === 'kg' ? kg : Math.round((kg / KG_PER_LB) * 10) / 10);
export const fromDisplayMass = (v: number, u: MassUnit) => (u === 'kg' ? v : Math.round(v * KG_PER_LB * 100) / 100);
