"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";

const _box = new THREE.Box3();
const yQuat = (rad) => ({ x: 0, y: Math.sin(rad / 2), z: 0, w: Math.cos(rad / 2) });

// wheels.glb holds two complete wheels tilted diagonally in model space.
// These lay-flat rotations were solved offline by minimizing vertical extent.
const WHEEL_VARIANTS = [
  { name: "gold", rotDeg: [134, 90] },
  { name: "black", rotDeg: [137, 90] },
];
const WHEEL_DIAMETER = 1.05;
const CONE_HEIGHT = 0.85;

// wrap `object` so it lies flat, scaled to `targetDiameter`, bottom at y=0
function prep(object, rotDeg, targetDiameter) {
  const inner = new THREE.Group();
  inner.rotation.set((rotDeg[0] * Math.PI) / 180, 0, (rotDeg[1] * Math.PI) / 180);
  inner.add(object);
  inner.updateMatrixWorld(true);
  _box.setFromObject(inner);
  const size = _box.getSize(new THREE.Vector3());
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

// one clone + partition of the (heavy) wheels scene, shared by all instances
function useWheelDecos() {
  const { scene } = useGLTF("/wheels.glb");
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true); // clones carry stale render matrices
    const root = clone.getObjectByName("GLTF_SceneRootNode") || clone;
    const blackNode = root.getObjectByName("WHEELS_11");
    const gold = new THREE.Group();
    const black = new THREE.Group();
    for (const child of [...root.children]) {
      (child === blackNode ? black : gold).add(child);
    }
    return [
      prep(gold, WHEEL_VARIANTS[0].rotDeg, WHEEL_DIAMETER),
      prep(black, WHEEL_VARIANTS[1].rotDeg, WHEEL_DIAMETER),
    ];
  }, [scene]);
}

function WheelStack({ wheels, position, count = 1, variant = 0, yaw = 0, register }) {
  const w = wheels[variant % wheels.length];
  const instances = useMemo(
    () => Array.from({ length: count }, () => w.object.clone(true)),
    [w, count]
  );
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
      <WheelStack wheels={wheels} position={[-26, 0, 20]} count={2} variant={1} yaw={0.3} register={register} />
      <WheelStack wheels={wheels} position={[-23, 0, 21]} count={1} variant={0} yaw={1.2} register={register} />
      <WheelStack wheels={wheels} position={[30, 0, 16]} count={2} variant={0} yaw={2.1} register={register} />
      <WheelStack wheels={wheels} position={[-18, 0, -24]} count={3} variant={1} yaw={0.7} register={register} />
    </>
  );
}
