"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";

const _box = new THREE.Box3();
const yQuat = (rad) => ({ x: 0, y: Math.sin(rad / 2), z: 0, w: Math.cos(rad / 2) });

// wheels.glb holds two complete wheels tilted diagonally in model space.
// These lay-flat rotations were solved offline by minimizing vertical extent
// (gold wheel = smaller x in the pair, black = larger).
const WHEEL_ROTATIONS = [
  [134, 90],
  [137, 90],
];
const WHEEL_DIAMETER = 1.05;
const CONE_HEIGHT = 0.85;

// wrap `object` so it lies flat, scaled to `targetDiameter`, bottom at y=0.
// Returns null for degenerate input — a zero/NaN-sized collider panics the
// rapier WASM and poisons the whole world ("recursive use of an object").
function prep(object, rotDeg, targetDiameter) {
  const inner = new THREE.Group();
  inner.rotation.set((rotDeg[0] * Math.PI) / 180, 0, (rotDeg[1] * Math.PI) / 180);
  inner.add(object);
  inner.updateMatrixWorld(true);
  _box.setFromObject(inner);
  const size = _box.getSize(new THREE.Vector3());
  if (!isFinite(size.x) || !isFinite(size.y) || Math.max(size.x, size.z) < 0.01) {
    return null;
  }
  const center = _box.getCenter(new THREE.Vector3());
  const s = targetDiameter / Math.max(size.x, size.z);
  const wrapper = new THREE.Group();
  wrapper.add(inner);
  inner.scale.setScalar(s);
  inner.position.set(-center.x * s, -_box.min.y * s, -center.z * s);
  wrapper.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return { object: wrapper, radius: targetDiameter / 2, height: size.y * s };
}

// Bake a mesh's world transform into plain float geometry. Sidesteps the
// quantized (normalized-int) attributes gltf-transform produces — attribute
// getters dequantize on read.
function bakeMesh(mesh) {
  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  mesh.updateWorldMatrix(true, false);
  const nrm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const v = new THREE.Vector3();
  const out = new THREE.BufferGeometry();
  for (const name of ["position", "normal", "uv"]) {
    const attr = src.attributes[name];
    if (!attr) continue;
    const item = attr.itemSize;
    const arr = new Float32Array(attr.count * item);
    for (let i = 0; i < attr.count; i++) {
      if (item >= 3) {
        v.fromBufferAttribute(attr, i);
        if (name === "position") v.applyMatrix4(mesh.matrixWorld);
        if (name === "normal") v.applyMatrix3(nrm).normalize();
        arr[i * item] = v.x;
        arr[i * item + 1] = v.y;
        arr[i * item + 2] = v.z;
      } else {
        arr[i * item] = attr.getX(i);
        arr[i * item + 1] = attr.getY(i);
      }
    }
    out.setAttribute(name, new THREE.BufferAttribute(arr, item));
  }
  return out;
}

// connected components of a baked non-indexed geometry, welding vertices by
// rounded position (same trick as the livery vent splitter)
function geometryComponents(geo) {
  const pos = geo.attributes.position;
  const n = pos.count;
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  const byPos = new Map();
  for (let i = 0; i < n; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    const seen = byPos.get(key);
    if (seen === undefined) byPos.set(key, i);
    else union(i, seen);
  }
  for (let t = 0; t < n / 3; t++) {
    union(t * 3, t * 3 + 1);
    union(t * 3, t * 3 + 2);
  }
  const groups = new Map();
  for (let t = 0; t < n / 3; t++) {
    const root = find(t * 3);
    let g = groups.get(root);
    if (!g) {
      g = { tris: [], sx: 0, sy: 0, sz: 0, c: 0 };
      groups.set(root, g);
    }
    g.tris.push(t);
    for (let k = 0; k < 3; k++) {
      g.sx += pos.getX(t * 3 + k);
      g.sy += pos.getY(t * 3 + k);
      g.sz += pos.getZ(t * 3 + k);
      g.c += 1;
    }
  }
  return [...groups.values()].map((g) => ({
    tris: g.tris,
    centroid: [g.sx / g.c, g.sy / g.c, g.sz / g.c],
  }));
}

function extractTriangles(geo, tris, material) {
  const part = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(geo.attributes)) {
    const item = attr.itemSize;
    const arr = new Float32Array(tris.length * 3 * item);
    for (let i = 0; i < tris.length; i++) {
      for (let k = 0; k < 3; k++) {
        for (let c = 0; c < item; c++) {
          arr[(i * 3 + k) * item + c] = attr.array[(tris[i] * 3 + k) * item + c];
        }
      }
    }
    part.setAttribute(name, new THREE.BufferAttribute(arr, item));
  }
  return new THREE.Mesh(part, material);
}

// The compressed wheels.glb merges both wheels into shared meshes (gltf-
// transform's join step), so names can't partition them. Instead: bake every
// mesh, break it into connected components, seed two clusters from the two
// largest well-separated components (the tires), and assign every component
// to the nearer seed. Whole components only — no stray triangles.
function partitionWheels(scene) {
  const meshes = [];
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  if (meshes.length === 0) return [];

  const comps = [];
  for (const mesh of meshes) {
    const geo = bakeMesh(mesh);
    for (const c of geometryComponents(geo)) {
      comps.push({ ...c, geo, material: mesh.material });
    }
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const bySize = [...comps].sort((a, b) => b.tris.length - a.tris.length);
  const seedA = bySize[0];
  const seedB = bySize.find((c) => dist(c.centroid, seedA.centroid) > 1.0);

  const groups = seedB ? [new THREE.Group(), new THREE.Group()] : [new THREE.Group()];
  for (const c of comps) {
    const side =
      seedB && dist(c.centroid, seedB.centroid) < dist(c.centroid, seedA.centroid)
        ? 1
        : 0;
    groups[side].add(extractTriangles(c.geo, c.tris, c.material));
  }
  // deterministic order: smaller centroid-x first (the gold wheel)
  if (groups.length === 2) {
    const gx = (g) => {
      _box.setFromObject(g);
      return (_box.min.x + _box.max.x) / 2;
    };
    groups.sort((a, b) => gx(a) - gx(b));
  }
  return groups;
}

// one partition + prep of the wheels scene, shared by all instances
function useWheelDecos() {
  const { scene } = useGLTF("/wheels.glb");
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true); // clones carry stale render matrices
    const parts = partitionWheels(clone);
    return parts
      .map((part, i) => prep(part, WHEEL_ROTATIONS[i % WHEEL_ROTATIONS.length], WHEEL_DIAMETER))
      .filter(Boolean);
  }, [scene]);
}

function WheelStack({ wheels, position, count = 1, variant = 0, yaw = 0, register }) {
  const w = wheels.length ? wheels[variant % wheels.length] : null;
  const instances = useMemo(
    () => (w ? Array.from({ length: count }, () => w.object.clone(true)) : []),
    [w, count]
  );
  if (!w) return null; // partition failed — skip gracefully
  return instances.map((obj, i) => {
    const p = { x: position[0], y: i * w.height, z: position[2] };
    const spin = yaw + i * 0.9; // stagger so stacked rims don't align
    return (
      <RigidBody
        key={i}
        ref={register({ p, q: yQuat(spin) })}
        colliders={false}
        density={0.5}
        friction={0.7}
        linearDamping={0.2}
        angularDamping={0.4}
        position={[p.x, p.y, p.z]}
        rotation={[0, spin, 0]}
      >
        <CylinderCollider args={[w.height / 2, w.radius]} position={[0, w.height / 2, 0]} />
        <primitive object={obj} />
      </RigidBody>
    );
  });
}

function useConeDeco() {
  const { scene } = useGLTF("/cone.glb");
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    _box.setFromObject(clone);
    const size = _box.getSize(new THREE.Vector3());
    const center = _box.getCenter(new THREE.Vector3());
    const s = CONE_HEIGHT / size.y;
    const wrapper = new THREE.Group();
    wrapper.add(clone);
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -_box.min.y * s, -center.z * s);
    wrapper.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    return { object: wrapper, radius: (Math.max(size.x, size.z) * s) / 2, height: CONE_HEIGHT };
  }, [scene]);
}

function TrafficCone({ cone, position, yaw = 0, register }) {
  const instance = useMemo(() => cone.object.clone(true), [cone]);
  return (
    <RigidBody
      ref={register({ p: { x: position[0], y: 0, z: position[1] }, q: yQuat(yaw) })}
      colliders={false}
      density={0.25}
      friction={0.7}
      position={[position[0], 0, position[1]]}
      rotation={[0, yaw, 0]}
    >
      {/* squat cylinder over the cone body — close enough for arcade knocks */}
      <CylinderCollider args={[cone.height / 2, cone.radius * 0.8]} position={[0, cone.height / 2, 0]} />
      <primitive object={instance} />
    </RigidBody>
  );
}

const CONES = [
  [6, 20, 0.4],
  [8, 22, 1.7],
  [26, -6, 0.2],
  [28, -12, 2.4],
  [24, -14, 1.1],
  [-22, -14, 0.8],
  [-24, 8, 2.0],
];

export default function Decorations({ register }) {
  const wheels = useWheelDecos();
  const cone = useConeDeco();
  return (
    <>
      {CONES.map(([x, z, yaw]) => (
        <TrafficCone key={`${x},${z}`} cone={cone} position={[x, z]} yaw={yaw} register={register} />
      ))}
      <WheelStack wheels={wheels} position={[7, 0, 12]} count={1} variant={0} yaw={0.6} register={register} />
      <WheelStack wheels={wheels} position={[-7, 0, 13]} count={2} variant={1} yaw={1.9} register={register} />
      <WheelStack wheels={wheels} position={[-26, 0, 20]} count={2} variant={1} yaw={0.3} register={register} />
      <WheelStack wheels={wheels} position={[-23, 0, 21]} count={1} variant={0} yaw={1.2} register={register} />
      <WheelStack wheels={wheels} position={[30, 0, 16]} count={2} variant={0} yaw={2.1} register={register} />
      <WheelStack wheels={wheels} position={[-18, 0, -24]} count={3} variant={1} yaw={0.7} register={register} />
    </>
  );
}
