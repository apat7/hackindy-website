"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CylinderCollider } from "@react-three/rapier";

const yQuat = (rad) => ({ x: 0, y: Math.sin(rad / 2), z: 0, w: Math.cos(rad / 2) });

// Chamfered pit-board face, drawn to match .btn-plate
function makeSlabTexture(label) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 300;
  const g = c.getContext("2d");
  const ch = 44; // chamfer px
  g.fillStyle = "#CFB991";
  g.beginPath();
  g.moveTo(ch, 0);
  g.lineTo(c.width, 0);
  g.lineTo(c.width, c.height - ch);
  g.lineTo(c.width - ch, c.height);
  g.lineTo(0, c.height);
  g.lineTo(0, ch);
  g.closePath();
  g.fill();
  g.fillStyle = "#12100c";
  g.beginPath();
  g.moveTo(ch + 4, 6);
  g.lineTo(c.width - 6, 6);
  g.lineTo(c.width - 6, c.height - ch - 4);
  g.lineTo(c.width - ch - 4, c.height - 6);
  g.lineTo(6, c.height - 6);
  g.lineTo(6, ch + 4);
  g.closePath();
  g.fill();
  g.fillStyle = "#CFB991";
  g.textAlign = "center";
  g.textBaseline = "middle";
  // shrink to fit: long labels ("2026 SEASON") overflow at a fixed size
  const text = label.split("").join(" ");
  let px = 96;
  do {
    g.font = `600 ${px}px monospace`;
    px -= 4;
  } while (px > 32 && g.measureText(text).width > c.width - 170);
  g.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const slabDark = new THREE.MeshStandardMaterial({ color: "#12100c", roughness: 0.6 });

export function PitSlab({ label, position, rotationY = 0, register }) {
  const mats = useMemo(() => {
    const face = new THREE.MeshStandardMaterial({
      map: makeSlabTexture(label),
      roughness: 0.5,
    });
    // box faces order: +x, -x, +y, -y, +z, -z
    return [slabDark, slabDark, slabDark, slabDark, face, face];
  }, [label]);
  return (
    <RigidBody
      ref={register({
        p: { x: position[0], y: position[1], z: position[2] },
        q: yQuat(rotationY),
      })}
      colliders="cuboid"
      density={0.5}
      friction={0.6}
      linearDamping={0.3}
      angularDamping={0.5}
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={[5.4, 1.5, 0.4]} />
      </mesh>
    </RigidBody>
  );
}
