"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

const W = 120; // world edge, meters

// The whole floor is one 2048² canvas: coal base, faint gold grid, a checker
// start strip under the spawn, and a donut ring off to the east.
function makeGroundTexture() {
  const px = 2048;
  const m = px / W; // pixels per meter
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d");

  g.fillStyle = "#0b0a08";
  g.fillRect(0, 0, px, px);

  // grid every 4 m
  g.strokeStyle = "rgba(207, 185, 145, 0.05)";
  g.lineWidth = 2;
  for (let i = 0; i <= W; i += 4) {
    g.beginPath();
    g.moveTo(i * m, 0);
    g.lineTo(i * m, px);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i * m);
    g.lineTo(px, i * m);
    g.stroke();
  }

  // world (x, z) → canvas coords: u = (x + 60)·m, v = (60 − z)·m
  const X = (x) => (x + W / 2) * m;
  const Z = (z) => (W / 2 - z) * m;

  // checker start strip across the spawn area (z ≈ 12, 40 m wide)
  const sq = 1.2 * m;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 34; i++) {
      if ((i + row) % 2) continue;
      g.fillStyle = "rgba(242, 238, 230, 0.75)";
      g.fillRect(X(-20 + i * 1.2), Z(12) + row * sq, sq, sq);
    }
  }

  // donut pad: two gold rings east of the letters
  g.strokeStyle = "rgba(207, 185, 145, 0.16)";
  g.lineWidth = 0.35 * m;
  for (const r of [6, 10]) {
    g.beginPath();
    g.arc(X(30), Z(-10), r * m, 0, Math.PI * 2);
    g.stroke();
  }

  // pit-lane boundary lines flanking the letter row
  g.strokeStyle = "rgba(207, 185, 145, 0.12)";
  g.lineWidth = 0.25 * m;
  for (const z of [4, -4]) {
    g.beginPath();
    g.moveTo(X(-40), Z(z));
    g.lineTo(X(40), Z(z));
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const WALLS = [
  { pos: [0, 0, W / 2], size: [W / 2, 3, 0.35] },
  { pos: [0, 0, -W / 2], size: [W / 2, 3, 0.35] },
  { pos: [W / 2, 0, 0], size: [0.35, 3, W / 2] },
  { pos: [-W / 2, 0, 0], size: [0.35, 3, W / 2] },
];

export default function DriveWorld() {
  const tex = useMemo(makeGroundTexture, []);

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[W / 2, 1, W / 2]} position={[0, -1, 0]} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[W, W]} />
          <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
        </mesh>
      </RigidBody>

      {/* perimeter: low visible gold rumble strip, tall invisible collider */}
      {WALLS.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={w.pos}>
          <CuboidCollider args={w.size} position={[0, w.size[1] / 2, 0]} />
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[w.size[0] * 2, 0.5, w.size[2] * 2]} />
            <meshStandardMaterial color="#8E6F3E" roughness={0.6} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
