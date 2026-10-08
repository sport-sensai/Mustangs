import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MESH_TO_STRUCTURE, STRUCTURE_BY_ID } from '../domain/anatomy';
import { poseAt, segmentFrame, type SegmentId, type Skeleton, type V3 } from '../domain/kinematics';
import { cycleDuration, MOVEMENT_BY_ID } from '../domain/movements';
import { lengthTrend, RIG_VISUALS, visualPoints, type RigVisual } from '../domain/rig';
import type { LayerId, SceneState } from '../domain/types';
import type { Clock } from './clock';

export type ColorMode = 'identity' | 'length';

export interface ViewerProps {
  scene: SceneState;
  clock: Clock;
  /** Only the master viewer advances the shared clock (comparison mode). */
  master?: boolean;
  colorMode: ColorMode;
  onSelect?: (structureId: string | undefined) => void;
  onCamera?: (c: SceneState['camera']) => void;
  onUnavailable?: () => void;
  label?: string;
  compact?: boolean;
}

const LAYER_OF_KIND: Record<RigVisual['kind'], LayerId> = {
  muscle: 'muscles', tendon: 'muscles', bone: 'bones', ligament: 'ligaments', fascia: 'fascia', line: 'fascia',
};

function cssVar(name: string, fallback: string) {
  if (typeof getComputedStyle === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const IDENTITY_COLORS: Record<RigVisual['kind'], string> = {
  muscle: '#c8705f', tendon: '#e2d6bf', bone: '#efe8d8', ligament: '#d7a94f', fascia: '#9db8cc', line: '#2f8f8a',
};
const TREND_COLORS = { lengthening: '#3f78c9', shortening: '#d9822b', 'near-constant': '#8d939b' } as const;
const SELECT_COLOR = new THREE.Color('#1f7a78');

const SKIN: { seg: SegmentId; r: number; upper: boolean }[] = [
  { seg: 'thighL', r: 0.072, upper: false }, { seg: 'thighR', r: 0.072, upper: false },
  { seg: 'shankL', r: 0.05, upper: false }, { seg: 'shankR', r: 0.05, upper: false },
  { seg: 'footL', r: 0.04, upper: false }, { seg: 'footR', r: 0.04, upper: false },
  { seg: 'upperArmL', r: 0.045, upper: true }, { seg: 'upperArmR', r: 0.045, upper: true },
  { seg: 'forearmL', r: 0.038, upper: true }, { seg: 'forearmR', r: 0.038, upper: true },
];

const Y = new THREE.Vector3(0, 1, 0);
const v3 = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

function placeCapsule(mesh: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
  const d = new THREE.Vector3().subVectors(b, a);
  const L = Math.max(d.length(), 1e-4);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(Y, d.normalize());
  mesh.scale.set(1, L, 1);
}

/** Tapered tube through a polyline: cylinders between points, spheres at points. */
function makeTube(radii: number[], mat: THREE.Material, scene: THREE.Scene, meshId?: string) {
  const segs = radii.slice(1).map((r, i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, radii[i], 1, 14, 1, true), mat);
    if (meshId) m.userData.meshId = meshId;
    scene.add(m);
    return m;
  });
  const balls = radii.map((r) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
    if (meshId) m.userData.meshId = meshId;
    scene.add(m);
    return m;
  });
  const meshes = [...segs, ...balls];
  return {
    meshes,
    setVisible(v: boolean) {
      meshes.forEach((m) => (m.visible = v));
    },
    update(pts: THREE.Vector3[]) {
      segs.forEach((m, i) => placeCapsule(m, pts[i], pts[i + 1]));
      balls.forEach((m, i) => m.position.copy(pts[i]));
    },
  };
}

/** Radii profile: spindle-shaped for muscles, constant otherwise. */
function profile(v: RigVisual): number[] {
  const n = v.path.length;
  if (v.kind !== 'muscle') return Array(n).fill(v.radius);
  return v.path.map((_, i) => (i === 0 || i === n - 1 ? v.radius * 0.4 : v.radius));
}

export function Viewer(props: ViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const [failed, setFailed] = useState(false);
  const camRef = useRef({ ...props.scene.camera, panY: 0 });
  const resetRef = useRef<() => void>(() => {});

  // Sync external camera changes (view buttons, restore).
  useEffect(() => {
    camRef.current = { ...props.scene.camera, panY: camRef.current.panY };
  }, [props.scene.camera]);

  useEffect(() => {
    const host = hostRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      propsRef.current.onUnavailable?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
    scene3.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c8, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 4, 3);
    scene3.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-3, 2, -2);
    scene3.add(rim);

    // Ground + treadmill stripes (sprint is shown in place).
    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshStandardMaterial({ color: cssVar('--ground', '#e8e3da'), roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    scene3.add(ground);
    const stripes = new THREE.Group();
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xcfc7ba });
    for (let i = -6; i <= 6; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.012), stripeMat);
      s.rotation.x = -Math.PI / 2;
      s.position.set(0, 0.001, i * 0.3);
      stripes.add(s);
    }
    scene3.add(stripes);

    // Skin (stylised clothing): translucent to reveal deeper layers.
    const upperMat = new THREE.MeshStandardMaterial({ color: '#2f5f6b', roughness: 0.75, transparent: true });
    const lowerMat = new THREE.MeshStandardMaterial({ color: '#3a3f46', roughness: 0.8, transparent: true });
    const headMat = new THREE.MeshStandardMaterial({ color: '#b9b5ae', roughness: 0.6, transparent: true });
    const skin = SKIN.map((sd) => ({ ...sd, tube: makeTube([sd.r, sd.r * 0.92], sd.upper ? upperMat : lowerMat, scene3) }));
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.3, 6, 18), upperMat);
    scene3.add(torso);
    const pelvisSkin = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), lowerMat);
    scene3.add(pelvisSkin);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), headMat);
    head.scale.set(0.85, 1.1, 0.95);
    scene3.add(head);
    const skinMeshes = [...skin.flatMap((sd) => sd.tube.meshes), torso, pelvisSkin, head];

    // Anatomy visuals.
    const visuals = RIG_VISUALS.map((v) => {
      const mat = new THREE.MeshStandardMaterial({
        color: IDENTITY_COLORS[v.kind], roughness: 0.55,
        transparent: v.kind === 'fascia', opacity: v.kind === 'fascia' ? 0.55 : 1,
      });
      const tube = makeTube(profile(v), mat, scene3, v.meshId);
      return { v, mat, tube, meshes: tube.meshes, structureId: MESH_TO_STRUCTURE[v.meshId] };
    });

    // Joints.
    const jointMat = new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.4 });
    const jointPts: [string, keyof Skeleton['points']][] = [
      ['j-hip-l', 'hipL'], ['j-hip-r', 'hipR'], ['j-knee-l', 'kneeL'], ['j-knee-r', 'kneeR'],
      ['j-ankle-l', 'ankleL'], ['j-ankle-r', 'ankleR'], ['j-shoulder-l', 'shoulderL'], ['j-shoulder-r', 'shoulderR'],
    ];
    const joints = jointPts.map(([id, p]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), jointMat.clone());
      m.userData.meshId = id;
      scene3.add(m);
      return { id, p, mesh: m, structureId: MESH_TO_STRUCTURE[id] };
    });

    // Equipment: barbell.
    const bar = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: '#9aa0a6', metalness: 0.8, roughness: 0.3 });
    const plateMat = new THREE.MeshStandardMaterial({ color: '#1d1f22', roughness: 0.6 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.2, 12), steel);
    shaft.rotation.z = Math.PI / 2;
    bar.add(shaft);
    for (const x of [-0.82, 0.82]) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.06, 32), plateMat);
      plate.rotation.z = Math.PI / 2;
      plate.position.x = x;
      bar.add(plate);
    }
    scene3.add(bar);

    // Foot contact markers.
    const contactMat = new THREE.MeshBasicMaterial({ color: '#1f7a78', transparent: true, opacity: 0.55 });
    const contacts = [0, 1].map(() => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.095, 28), contactMat);
      m.rotation.x = -Math.PI / 2;
      scene3.add(m);
      return m;
    });

    // ---------------------------------------------------------------- camera
    const target = new THREE.Vector3(0, 0.72, 0);
    const updateCamera = () => {
      const c = camRef.current;
      const az = THREE.MathUtils.degToRad(c.azimuth);
      const el = THREE.MathUtils.degToRad(c.elevation);
      const t = target.clone().add(new THREE.Vector3(0, c.panY, 0));
      camera.position.set(t.x + c.distance * Math.cos(el) * Math.sin(az), t.y + c.distance * Math.sin(el), t.z + c.distance * Math.cos(el) * Math.cos(az));
      camera.lookAt(t);
    };
    resetRef.current = updateCamera;

    // ------------------------------------------------------------- pointer
    const el = renderer.domElement;
    el.style.touchAction = 'none';
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt = { x: 0, y: 0, t: 0 };
    let pinch = 0;
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const c = camRef.current;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) c.distance = THREE.MathUtils.clamp(c.distance * (pinch / d), 1.2, 7);
        pinch = d;
      } else if (e.shiftKey || e.buttons === 2) {
        c.panY = THREE.MathUtils.clamp(c.panY + dy * 0.003, -0.6, 0.8);
      } else {
        c.azimuth -= dx * 0.4;
        c.elevation = THREE.MathUtils.clamp(c.elevation + dy * 0.25, -10, 75);
      }
    };
    const raycaster = new THREE.Raycaster();
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      if (moved < 6 && performance.now() - downAt.t < 400) {
        const r = el.getBoundingClientRect();
        const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const pickables = [...visuals.flatMap((v) => v.meshes), ...joints.map((j) => j.mesh)].filter((m) => m.visible);
        const hit = raycaster.intersectObjects(pickables, false)[0];
        const sid = hit ? MESH_TO_STRUCTURE[hit.object.userData.meshId as string] : undefined;
        propsRef.current.onSelect?.(sid);
      } else {
        const { panY: _p, ...cam } = camRef.current;
        void _p;
        propsRef.current.onCamera?.(cam);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = camRef.current;
      c.distance = THREE.MathUtils.clamp(c.distance * (1 + e.deltaY * 0.001), 1.2, 7);
    };
    const onContext = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContext);

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // ---------------------------------------------------------------- frame
    let raf = 0;
    let last = performance.now();
    let trendCache = { key: '', map: new Map<string, string>() };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const p = propsRef.current;
      const s = p.scene;
      const m = MOVEMENT_BY_ID[s.movementId];
      const clock = p.clock;
      if (p.master !== false) {
        clock.duration = cycleDuration(m, s.params);
        clock.advance(dt);
      }
      const t = clock.time;
      const sk = poseAt(s.movementId, t, s.params);
      const P = sk.points;

      // Skin.
      const isolating = s.isolate && !!s.selectedStructureId;
      const skinOpacity = isolating ? Math.min(0.12, s.skinOpacity) : s.skinOpacity;
      for (const mat of [upperMat, lowerMat, headMat]) {
        mat.opacity = skinOpacity;
        mat.depthWrite = skinOpacity > 0.95;
      }
      skinMeshes.forEach((mm) => (mm.visible = skinOpacity > 0.02));
      for (const sd of skin) {
        const fr = segmentFrame(sk, sd.seg);
        sd.tube.update([v3(fr.origin), v3(fr.origin).addScaledVector(v3(fr.axis), fr.length)]);
      }
      const trunkFr = segmentFrame(sk, 'trunk');
      const trunkQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(v3(trunkFr.side), v3(trunkFr.axis), v3(trunkFr.fwd)));
      torso.position.copy(v3(P.hipC)).addScaledVector(v3(trunkFr.axis), 0.31);
      torso.quaternion.copy(trunkQ);
      torso.scale.set(1.05, 1, 0.7);
      pelvisSkin.position.copy(v3(P.hipC)).addScaledVector(v3(trunkFr.axis), 0.03);
      pelvisSkin.quaternion.copy(trunkQ);
      pelvisSkin.scale.set(1.12, 0.8, 0.82);
      head.position.copy(v3(P.head));

      // Length-trend colours are cached per (revision, coarse time).
      const tk = `${s.revision}|${Math.round(t * 100)}`;
      if (p.colorMode === 'length' && trendCache.key !== tk) {
        const map = new Map<string, string>();
        for (const vis of visuals) {
          if (vis.v.kind !== 'muscle' || map.has(vis.v.meshId)) continue;
          map.set(vis.v.meshId, lengthTrend(s.movementId, vis.v.meshId, t, s.params).trend);
        }
        trendCache = { key: tk, map };
      }

      let labelPos: THREE.Vector3 | undefined;
      for (const vis of visuals) {
        const layerOn = s.layers[LAYER_OF_KIND[vis.v.kind]];
        const fascialLine = vis.v.kind === 'line';
        const selected = vis.structureId === s.selectedStructureId;
        let visible = layerOn && (!fascialLine || s.lens === 'fascial' || selected);
        if (isolating) visible = selected;
        const pts = visualPoints(sk, vis.v).map(v3);
        vis.tube.setVisible(visible);
        if (visible) vis.tube.update(pts);
        const base = p.colorMode === 'length' && vis.v.kind === 'muscle'
          ? TREND_COLORS[(trendCache.map.get(vis.v.meshId) ?? 'near-constant') as keyof typeof TREND_COLORS]
          : IDENTITY_COLORS[vis.v.kind];
        vis.mat.color.set(selected ? SELECT_COLOR : base);
        vis.mat.emissive.set(selected ? '#0e3d3c' : '#000000');
        if (selected && visible && !labelPos) labelPos = pts[Math.floor(pts.length / 2)];
      }
      for (const j of joints) {
        j.mesh.position.copy(v3(P[j.p]));
        const selected = j.structureId === s.selectedStructureId;
        j.mesh.visible = isolating ? selected : s.layers.joints;
        (j.mesh.material as THREE.MeshStandardMaterial).color.set(selected ? SELECT_COLOR : '#f4efe4');
        if (selected && j.mesh.visible && !labelPos) labelPos = j.mesh.position.clone();
      }
      // Selected structure whose layer is hidden: still label it (VIEW-03).
      if (!labelPos && s.selectedStructureId) {
        const vis = visuals.find((v) => v.structureId === s.selectedStructureId);
        if (vis) {
          const pts = visualPoints(sk, vis.v);
          labelPos = v3(pts[Math.floor(pts.length / 2)]);
        }
      }

      bar.visible = !!sk.equipment.bar && !isolating;
      if (sk.equipment.bar) bar.position.copy(v3(sk.equipment.bar.center));

      contacts[0].visible = sk.contacts.footL;
      contacts[1].visible = sk.contacts.footR;
      contacts[0].position.set(P.ankleL[0], 0.002, (P.toeL[2] + P.heelL[2]) / 2);
      contacts[1].position.set(P.ankleR[0], 0.002, (P.toeR[2] + P.heelR[2]) / 2);

      // Treadmill stripes move with the stance foot.
      stripes.visible = s.movementId === 'sprint-acceleration';
      if (stripes.visible && clock.playing) {
        const e = 0.004;
        const sk2 = poseAt(s.movementId, t + e, s.params);
        const foot = sk.contacts.footR ? 'toeR' : sk.contacts.footL ? 'toeL' : undefined;
        if (foot) {
          const v = (sk2.points[foot][2] - P[foot][2]) / (e * clock.duration);
          stripes.children.forEach((c) => {
            c.position.z += v * dt * clock.rate;
            if (c.position.z < -1.8) c.position.z += 3.9;
            if (c.position.z > 2.1) c.position.z -= 3.9;
          });
        }
      }

      updateCamera();
      renderer.render(scene3, camera);

      const lbl = labelRef.current;
      if (lbl) {
        if (labelPos && s.selectedStructureId) {
          const pr = labelPos.clone().project(camera);
          lbl.style.display = pr.z < 1 ? 'block' : 'none';
          lbl.style.transform = `translate(${((pr.x + 1) / 2) * host.clientWidth}px, ${((1 - pr.y) / 2) * host.clientHeight}px)`;
          lbl.textContent = STRUCTURE_BY_ID[s.selectedStructureId]?.name ?? '';
        } else lbl.style.display = 'none';
      }
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContext);
      scene3.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => mm.dispose());
        }
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  // Keyboard camera control when the canvas region has focus (VIEW-01).
  const onKey = (e: React.KeyboardEvent) => {
    const c = camRef.current;
    const map: Record<string, () => void> = {
      a: () => (c.azimuth -= 10), d: () => (c.azimuth += 10),
      w: () => (c.elevation = Math.min(75, c.elevation + 5)), s: () => (c.elevation = Math.max(-10, c.elevation - 5)),
      '+': () => (c.distance = Math.max(1.2, c.distance * 0.9)), '=': () => (c.distance = Math.max(1.2, c.distance * 0.9)),
      '-': () => (c.distance = Math.min(7, c.distance * 1.1)),
    };
    const fn = map[e.key.toLowerCase()];
    if (fn) {
      e.preventDefault();
      fn();
      const { panY: _p, ...cam } = c;
      void _p;
      props.onCamera?.(cam);
    }
  };

  if (failed) {
    return (
      <div className="viewer viewer--fallback" role="status">
        <p>3D view is unavailable on this device. Phase descriptions, structure cards and the coach still work. Use the structure list and phase timeline.</p>
      </div>
    );
  }

  return (
    <div
      className={`viewer${props.compact ? ' viewer--compact' : ''}`}
      ref={hostRef}
      tabIndex={0}
      onKeyDown={onKey}
      role="application"
      aria-label={`${props.label ? props.label + ': ' : ''}3D view of ${MOVEMENT_BY_ID[props.scene.movementId].name}. Drag to rotate, scroll or pinch to zoom, shift-drag to pan. Keys: A/D rotate, W/S tilt, plus/minus zoom. Use the structure list to select without tapping.`}
    >
      <div className="viewer__label" ref={labelRef} aria-hidden="true" />
      {props.label && <div className="viewer__tag">{props.label}</div>}
    </div>
  );
}
