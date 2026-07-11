"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TUNING as T } from "./tuning";

const SMOKE_MAX = 140;
const rnd = (a) => (Math.random() - 0.5) * 2 * a;

function makeSmokeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function TireSmoke({ telemetry, reduceMotion }) {
  const ref = useRef();
  const tex = useMemo(makeSmokeTexture, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pool = useMemo(
    () => ({
      pos: new Float32Array(SMOKE_MAX * 3),
      vel: new Float32Array(SMOKE_MAX * 3),
      life: new Float32Array(SMOKE_MAX),
      max: new Float32Array(SMOKE_MAX),
      next: 0,
      acc: 0,
    }),
    []
  );

  useFrame(({ camera }, rawDt) => {
    if (!ref.current) return;
    const dt = Math.min(rawDt, 1 / 30);
    const t = telemetry.current;
    const emitting = !reduceMotion && (t.slip > T.slipForSmoke || t.burnout);
    if (emitting) {
      pool.acc += dt * 90;
      while (pool.acc >= 1) {
        pool.acc -= 1;
        const i = pool.next;
        pool.next = (pool.next + 1) % SMOKE_MAX;
        const w = Math.random() < 0.5 ? t.rl : t.rr;
        pool.pos[i * 3] = w.x + rnd(0.25);
        pool.pos[i * 3 + 1] = 0.12;
        pool.pos[i * 3 + 2] = w.z + rnd(0.25);
        pool.vel[i * 3] = rnd(0.9);
        pool.vel[i * 3 + 1] = 0.8 + Math.random() * 0.9;
        pool.vel[i * 3 + 2] = rnd(0.9);
        pool.life[i] = pool.max[i] = 0.75 + Math.random() * 0.5;
      }
    }
    for (let i = 0; i < SMOKE_MAX; i++) {
      if (pool.life[i] <= 0) {
        dummy.scale.setScalar(0);
      } else {
        pool.life[i] -= dt;
        const u = 1 - pool.life[i] / pool.max[i];
        pool.pos[i * 3] += pool.vel[i * 3] * dt;
        pool.pos[i * 3 + 1] += pool.vel[i * 3 + 1] * dt;
        pool.pos[i * 3 + 2] += pool.vel[i * 3 + 2] * dt;
        dummy.position.set(pool.pos[i * 3], pool.pos[i * 3 + 1], pool.pos[i * 3 + 2]);
        dummy.quaternion.copy(camera.quaternion); // billboard
        dummy.scale.setScalar(0.5 + u * 1.8);
      }
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SMOKE_MAX]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.22}
        depthWrite={false}
        color="#9a9a9a"
      />
    </instancedMesh>
  );
}

const SKID_SEGS = 500; // ring buffer; oldest marks get overwritten
const SKID_W = 0.26;

export function SkidMarks({ telemetry }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(new Float32Array(SKID_SEGS * 6 * 3), 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", attr);
    return g;
  }, []);
  const stt = useRef({ next: 0, prev: { rl: null, rr: null } });

  useFrame(() => {
    const t = telemetry.current;
    const sliding = t.slip > T.slipForSkid && Math.abs(t.speed) > 1.5;
    const attr = geo.attributes.position;
    for (const key of ["rl", "rr"]) {
      const cur = t[key];
      const prev = stt.current.prev[key];
      if (sliding && prev) {
        const dx = cur.x - prev.x;
        const dz = cur.z - prev.z;
        const len = Math.hypot(dx, dz);
        if (len > 0.18 && len < 3) {
          const ox = (-dz / len) * (SKID_W / 2);
          const oz = (dx / len) * (SKID_W / 2);
          const y = 0.02;
          const o = stt.current.next * 18;
          const v = attr.array;
          // two triangles: (a-, a+, b-), (a+, b+, b-)
          v[o] = prev.x - ox; v[o + 1] = y; v[o + 2] = prev.z - oz;
          v[o + 3] = prev.x + ox; v[o + 4] = y; v[o + 5] = prev.z + oz;
          v[o + 6] = cur.x - ox; v[o + 7] = y; v[o + 8] = cur.z - oz;
          v[o + 9] = prev.x + ox; v[o + 10] = y; v[o + 11] = prev.z + oz;
          v[o + 12] = cur.x + ox; v[o + 13] = y; v[o + 14] = cur.z + oz;
          v[o + 15] = cur.x - ox; v[o + 16] = y; v[o + 17] = cur.z - oz;
          attr.needsUpdate = true;
          stt.current.next = (stt.current.next + 1) % SKID_SEGS;
          stt.current.prev[key] = { ...cur };
        }
      } else {
        stt.current.prev[key] = sliding ? { ...cur } : null;
      }
    }
  });

  return (
    <mesh geometry={geo} frustumCulled={false} renderOrder={1}>
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.42}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}
