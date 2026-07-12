"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useCursor,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { GOLD, makeLivery, applyLivery, setRimBlur } from "./livery";
import useMediaQuery from "./useMediaQuery";

// Easter-egg lap: nose swings out, car launches off screen-left, re-enters
// from the right and brakes back onto its mark.
const PARK_YAW = -0.6;
const EXIT_YAW = -1.35;
const EXIT_DIR = new THREE.Vector3(Math.sin(EXIT_YAW), 0, Math.cos(EXIT_YAW));
const LAP_DIST = 20;
const OUT_END = 0.9;
const LAP_END = 2.4;

const easeOutCubic = (u) => 1 - (1 - u) ** 3;

function IndyCar({ reduceMotion, onEnter }) {
  const { scene } = useGLTF("/indycar.glb");
  const livery = useMemo(makeLivery, []);
  const groupRef = useRef();
  const lapStart = useRef(null);
  const downPos = useRef(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !!onEnter);

  const startLap = () => {
    if (lapStart.current !== null || reduceMotion) return;
    lapStart.current = performance.now();
    setRimBlur(scene, true);
  };

  useFrame(() => {
    if (lapStart.current === null || !groupRef.current) return;
    const t = (performance.now() - lapStart.current) / 1000;
    const group = groupRef.current;

    if (t >= LAP_END) {
      group.position.set(0, 0, 0);
      group.rotation.y = PARK_YAW;
      lapStart.current = null;
      setRimBlur(scene, false);
      return;
    }

    let dist;
    if (t < OUT_END) {
      // launch: swing the nose out, accelerate away
      const u = t / OUT_END;
      dist = LAP_DIST * u * u;
      const yawU = Math.min(t / 0.3, 1);
      group.rotation.y = PARK_YAW + (EXIT_YAW - PARK_YAW) * easeOutCubic(yawU);
    } else {
      // return: brake in from the far side, swing back onto the mark
      const u = (t - OUT_END) / (LAP_END - OUT_END);
      dist = -LAP_DIST * (1 - easeOutCubic(u));
      const backU = Math.max(0, (t - (LAP_END - 0.4)) / 0.4);
      group.rotation.y = EXIT_YAW + (PARK_YAW - EXIT_YAW) * easeOutCubic(backU);
    }
    group.position.copy(EXIT_DIR).multiplyScalar(dist);
  });

  const { scale, position } = useMemo(() => {
    applyLivery(scene, livery);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 4.2 / Math.max(size.x, size.z);
    return {
      scale: s,
      position: [-center.x * s, -box.min.y * s, -center.z * s],
    };
  }, [scene, livery]);

  // fit transform lives on a wrapper group — putting scale/position props on
  // <primitive> would mutate the drei-cached scene, corrupting the fit math
  // on remount (and any other consumer of the cached glb)
  return (
    <group ref={groupRef} rotation={[0, PARK_YAW, 0]}>
      <group scale={scale} position={position}>
        <primitive
          object={scene}
          onPointerDown={(e) => {
            downPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
          }}
          onClick={(e) => {
            if (!onEnter || !downPos.current) return;
            const dx = e.nativeEvent.clientX - downPos.current.x;
            const dy = e.nativeEvent.clientY - downPos.current.y;
            if (dx * dx + dy * dy > 64) return; // that was an orbit drag
            e.stopPropagation();
            startLap(); // self-skips under reduced motion; overlay fades in over the launch
            onEnter();
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/indycar.glb");

// Widen the view on narrow screens so the car never fills the frame. The
// canvas must stay full-viewport: a tight band-sized fov leaves no headroom
// for the orbit tilt (a top-down car projects ~3x its side-on height).
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.fov = aspect < 0.8 ? 46 : aspect < 1.4 ? 31 : 25;
    // portrait: dolly out (not crop) so the car's full length clears the
    // narrow view at any autorotate yaw; setLength keeps the orbit direction
    const dist = aspect < 0.8 ? 11.6 : 9.05;
    const target = new THREE.Vector3(0, 0.5, 0); // OrbitControls target
    camera.position.sub(target).setLength(dist).add(target);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function IndyCarCanvas({ className = "", onEnterDrive }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [5.6, 2.2, 6.8], fov: 25 }}
        dpr={coarsePointer ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraRig />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 7, 4]} intensity={3.6} />
        <directionalLight position={[-3, 2.5, 6]} intensity={1.7} />
        <directionalLight position={[-5, 3, -4]} intensity={2.0} color={GOLD} />
        <directionalLight position={[0, 2, -6]} intensity={0.8} />
        <Suspense fallback={null}>
          <Environment files="/night_sky.hdr" />
          <IndyCar reduceMotion={reduceMotion} onEnter={onEnterDrive} />
        </Suspense>
        {/* the easter-egg lap that moves the car is desktop-only, so the
            shadow can bake a single frame on touch devices */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={9}
          blur={2.6}
          far={1.4}
          frames={coarsePointer ? 1 : Infinity}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate && !reduceMotion}
          autoRotateSpeed={0.8}
          minPolarAngle={0.9}
          maxPolarAngle={1.45}
          target={[0, 0.5, 0]}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
    </div>
  );
}
