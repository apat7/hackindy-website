"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { setRimBlur } from "../livery";
import useDriveControls from "./useDriveControls";
import { createCarState, stepCar } from "./carPhysics";
import { TUNING as T } from "./tuning";

export const SPAWN = { x: 0, z: 16, yaw: Math.PI }; // facing the letter row at z=0
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _box = new THREE.Box3();

// The glb has per-corner group nodes (WHEEL_LF/RF/LR/RR) holding tire, rim,
// brake disc, and blur discs — but with identity transforms (geometry baked in
// model space), so each gets re-parented under a pivot at its own center.
// Pivot rotation order YXZ: y = steer, then x = spin.
function buildWheelRig(root) {
  const pivots = [];
  let radius = 0.5;
  for (const name of ["WHEEL_LF", "WHEEL_RF", "WHEEL_LR", "WHEEL_RR"]) {
    const node = root.getObjectByName(name);
    if (!node) continue;
    _box.setFromObject(node);
    const c = _box.getCenter(new THREE.Vector3());
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    pivot.rotation.order = "YXZ";
    node.parent.add(pivot);
    pivot.add(node);
    node.position.sub(c);
    pivots.push({ pivot, front: /F$/.test(name), z: c.z });
    radius = (_box.max.y - _box.min.y) / 2;
  }
  const avg = (list) => list.reduce((s, p) => s + p.z, 0) / (list.length || 1);
  const forwardSign =
    avg(pivots.filter((p) => p.front)) >= avg(pivots.filter((p) => !p.front)) ? 1 : -1;
  return { pivots, radius, forwardSign };
}

export default function DriveCar({ telemetry, resetSignal }) {
  const { scene } = useGLTF("/indycar.glb");
  const bodyRef = useRef();
  const leanRef = useRef();
  const stateRef = useRef(createCarState(SPAWN.x, SPAWN.z, SPAWN.yaw));
  const lastReset = useRef(0);
  const steerVisual = useRef(0);
  const blurOn = useRef(false);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const keys = useDriveControls();

  const { clone, rig, fit } = useMemo(() => {
    const clone = scene.clone(true); // teaser owns the cached original
    clone.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    const rig = buildWheelRig(clone);
    _box.setFromObject(clone);
    const size = _box.getSize(new THREE.Vector3());
    const center = _box.getCenter(new THREE.Vector3());
    const s = T.carLength / size.z;
    return {
      clone,
      rig,
      fit: {
        s,
        offset: [-center.x, -_box.min.y, -center.z],
        half: [(size.x * s) / 2, (size.y * s) / 2, (size.z * s) / 2],
        modelYaw: rig.forwardSign > 0 ? 0 : Math.PI,
        rearAxle: size.z * s * 0.36, // distance behind center, ≈ rear axle
        halfTrack: size.x * s * 0.4,
      },
    };
  }, [scene]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const k = keys.current;
    const input = {
      throttle: k.up ? 1 : 0,
      brake: k.down ? 1 : 0,
      steer: (k.left ? 1 : 0) - (k.right ? 1 : 0),
      handbrake: k.handbrake,
    };

    if (resetSignal.current !== lastReset.current) {
      lastReset.current = resetSignal.current;
      stateRef.current = createCarState(SPAWN.x, SPAWN.z, SPAWN.yaw);
    }

    const s = stepCar(stateRef.current, input, dt, T);
    s.x = Math.max(-T.worldHalf, Math.min(T.worldHalf, s.x));
    s.z = Math.max(-T.worldHalf, Math.min(T.worldHalf, s.z));
    stateRef.current = s;

    const body = bodyRef.current;
    if (body) {
      body.setNextKinematicTranslation({ x: s.x, y: 0, z: s.z });
      quat.setFromAxisAngle(Y_AXIS, s.yaw);
      body.setNextKinematicRotation(quat);
    }

    // --- visuals ---
    const burnout = input.throttle > 0 && input.brake > 0 && Math.abs(s.speed) < 2;
    const spin =
      (s.speed / (rig.radius * fit.s) + (burnout ? 40 : 0)) * dt * rig.forwardSign;
    steerVisual.current +=
      (input.steer * T.maxVisualSteer - steerVisual.current) * Math.min(1, 10 * dt);
    for (const p of rig.pivots) {
      p.pivot.rotation.x += spin;
      if (p.front) p.pivot.rotation.y = steerVisual.current * rig.forwardSign;
    }
    if (leanRef.current) {
      const lateral = s.slip * Math.sign(s.yawRate || 1);
      leanRef.current.rotation.z +=
        (lateral * 0.015 - leanRef.current.rotation.z) * Math.min(1, 6 * dt);
      const pitch = (input.brake ? 0.014 : 0) - (input.throttle ? 0.01 : 0);
      leanRef.current.rotation.x +=
        (pitch - leanRef.current.rotation.x) * Math.min(1, 6 * dt);
    }
    const fast = Math.abs(s.speed) > T.blurSpeed;
    if (fast !== blurOn.current) {
      blurOn.current = fast;
      setRimBlur(clone, fast);
    }

    // --- telemetry for camera & effects ---
    const t = telemetry.current;
    const fx = Math.sin(s.yaw);
    const fz = Math.cos(s.yaw);
    t.x = s.x;
    t.z = s.z;
    t.yaw = s.yaw;
    t.fx = fx;
    t.fz = fz;
    t.speed = s.speed;
    t.slip = s.slip;
    t.handbrake = input.handbrake;
    t.burnout = burnout;
    const bx = s.x - fx * fit.rearAxle;
    const bz = s.z - fz * fit.rearAxle;
    t.rl = { x: bx - fz * fit.halfTrack, z: bz + fx * fit.halfTrack };
    t.rr = { x: bx + fz * fit.halfTrack, z: bz - fx * fit.halfTrack };
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[SPAWN.x, 0, SPAWN.z]}
      rotation={[0, SPAWN.yaw, 0]}
    >
      <CuboidCollider args={fit.half} position={[0, fit.half[1], 0]} />
      <group ref={leanRef}>
        <group rotation-y={fit.modelYaw} scale={fit.s}>
          <primitive object={clone} position={fit.offset} />
        </group>
      </group>
    </RigidBody>
  );
}

const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export function ChaseCamera({ telemetry, shake, reduceMotion }) {
  const pos = useRef(null);
  const look = useRef(new THREE.Vector3(0, 1, 0));

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = telemetry.current;
    _camTarget.set(t.x - t.fx * T.camDist, T.camHeight, t.z - t.fz * T.camDist);
    if (!pos.current) pos.current = _camTarget.clone();
    const a = 1 - Math.exp(-T.camLerp * dt);
    pos.current.lerp(_camTarget, a);
    camera.position.copy(pos.current);
    if (shake.current > 0.001 && !reduceMotion) {
      camera.position.x += (Math.random() - 0.5) * shake.current;
      camera.position.y += (Math.random() - 0.5) * shake.current * 0.6;
      shake.current *= Math.exp(-T.camShakeDecay * dt);
    }
    _lookTarget.set(t.x + t.fx * T.camLookAhead, 1.1, t.z + t.fz * T.camLookAhead);
    look.current.lerp(_lookTarget, a);
    camera.lookAt(look.current);
    const fov = T.fovBase + T.fovSpan * Math.min(Math.abs(t.speed) / T.maxSpeed, 1);
    camera.fov += (fov - camera.fov) * a;
    camera.updateProjectionMatrix();
  });

  return null;
}
