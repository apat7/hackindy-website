"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFont } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { TUNING as T } from "./tuning";

const goldSide = new THREE.MeshStandardMaterial({
  color: "#CFB991",
  metalness: 0.75,
  roughness: 0.32,
});

export default function LetterBodies({
  text = "HACK INDY",
  size = 3.4,
  depth = 0.9,
  z = 0,
  register,
  shake,
  reduceMotion,
}) {
  const font = useFont("/fonts/saira-bold.typeface.json");
  const pulses = useRef([]);

  const letters = useMemo(() => {
    const out = [];
    let cursor = 0;
    const spaceW = size * 0.55;
    const tracking = size * 0.14;
    for (const ch of text) {
      if (ch === " ") {
        cursor += spaceW;
        continue;
      }
      const geo = new TextGeometry(ch, {
        font,
        size,
        depth,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.05,
        bevelSegments: 2,
      });
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const w = bb.max.x - bb.min.x;
      // origin at letter center-bottom so bodies rest on y=0
      geo.translate(-bb.min.x - w / 2, -bb.min.y, -bb.min.z - depth / 2);
      out.push({ ch, geo, x: cursor + w / 2 });
      cursor += w + tracking;
    }
    const total = cursor - tracking;
    for (const L of out) L.x -= total / 2;
    return out;
  }, [font, text, size, depth]);

  // per-letter face material so impacts can glint individually
  const faceMats = useMemo(
    () =>
      letters.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#F2EEE6",
            roughness: 0.55,
            emissive: "#CFB991",
            emissiveIntensity: 0,
          })
      ),
    [letters]
  );

  useFrame((_, dt) => {
    for (let i = 0; i < faceMats.length; i++) {
      const p = pulses.current[i] || 0;
      if (p > 0.01) {
        pulses.current[i] = p * Math.exp(-5 * dt);
        faceMats[i].emissiveIntensity = pulses.current[i] * 0.6;
      } else if (faceMats[i].emissiveIntensity !== 0) {
        faceMats[i].emissiveIntensity = 0;
      }
    }
  });

  return letters.map((L, i) => (
    <RigidBody
      key={`${L.ch}-${i}`}
      ref={register({ p: { x: L.x, y: 0, z }, q: { x: 0, y: 0, z: 0, w: 1 } })}
      colliders="hull"
      density={T.letterDensity}
      friction={T.letterFriction}
      restitution={T.letterRestitution}
      linearDamping={0.3}
      angularDamping={0.6}
      position={[L.x, 0, z]}
      onContactForce={(e) => {
        if (e.totalForceMagnitude < T.impactForceMin) return;
        pulses.current[i] = 1;
        if (!reduceMotion) shake.current = Math.min(shake.current + 0.18, 0.5);
      }}
    >
      {/* TextGeometry group 0 = faces, group 1 = bevel/sides */}
      <mesh geometry={L.geo} material={[faceMats[i], goldSide]} castShadow receiveShadow />
    </RigidBody>
  ));
}
