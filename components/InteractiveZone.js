"use client";

import { useState, useRef } from "react";
import { Text, Html } from "@react-three/drei";

export default function InteractiveZone({ position, rotation, args = [4, 1.2], label, children }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const meshRef = useRef();

  return (
    <group position={position} rotation={rotation}>
      {/* Clickable highlight plane */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setOpen((o) => !o)}
      >
        <planeGeometry args={args} />
        <meshStandardMaterial
          color={hovered ? "#CFB991" : "#ffffff"}
          opacity={hovered ? 0.25 : 0.1}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Label text floating above the plane */}
      <Text
        position={[0, args[1] / 2 + 0.15, 0.01]}
        fontSize={0.22}
        color="#CFB991"
        anchorX="center"
        anchorY="bottom"

      >
        {label}
      </Text>

      {/* Pop-up panel rendered as HTML overlay */}
      {open && (
        <Html
          position={[0, 0, 0.1]}
          center
          distanceFactor={6}
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              background: "rgba(10,10,10,0.92)",
              border: "1px solid #CFB991",
              borderRadius: "8px",
              padding: "16px 20px",
              color: "#f0f0f0",
              fontSize: "13px",
              width: "260px",
              lineHeight: "1.6",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <strong style={{ color: "#CFB991", fontSize: "14px" }}>{label}</strong>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </Html>
      )}
    </group>
  );
}
