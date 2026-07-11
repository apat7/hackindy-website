"use client";

import { Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Environment, Clone } from "@react-three/drei";
import * as THREE from "three";

function GarageModel() {
  const { scene } = useGLTF("/garage.glb");
  const { raycaster, camera, gl } = useThree();

  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();

        const meshName = child.name.toLowerCase();
        const matName = child.material.name.toLowerCase();

        if (
          meshName.includes("extinguisher") ||
          meshName.includes("fire") ||
          matName.includes("extinguisher")
        ) {
          return;
        }

        const c = child.material.color;
        const blueIsDominant = c.b > c.r * 1.5 && c.b > c.g * 1.2 && c.b > 0.01;

        if (
          matName.includes("blue") ||
          matName.includes("dark") ||
          matName.includes("navy") ||
          blueIsDominant
        ) {
          child.material.color.set("#111111");
          child.material.roughness = 0.8;
          child.material.metalness = 0.1;
        }

        if (
          matName.includes("red") ||
          (child.material.color.r > 0.5 && child.material.color.b < 0.3)
        ) {
          child.material.color.set("#CFB991");
          child.material.roughness = 0.3;
          child.material.metalness = 0.5;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
    };

    const handlePointerUp = (event) => {
      if (event.button !== 0) return;

      const diffX = event.clientX - startX;
      const diffY = event.clientY - startY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);

      // Ignore drags/pans
      if (distance > 4) return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(scene, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log(`Clicked Surface: [${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`);
      }
    };

    const dom = gl.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointerup", handlePointerUp);

    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointerup", handlePointerUp);
    };
  }, [scene, raycaster, camera, gl]);

  return <primitive object={scene} scale={1} />;
}

function Mountains() {
  const { scene } = useGLTF("/mountains.glb");

  const instances = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    console.log(`mountains.glb native size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);

    // Scale so the mountain range is ~60 units tall in world space
    const scale = 60 / size.y;

    const cx = -5, cz = -47;
    const radius = 400;
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [cx + Math.cos(angle) * radius, -30, cz + Math.sin(angle) * radius],
        rotation: [0, angle + Math.PI, 0],
        scale,
      };
    });
  }, [scene]);

  return instances.map(({ position, rotation, scale }, i) => (
    <Clone key={i} object={scene} position={position} rotation={rotation} scale={scale} />
  ));
}

function PanLimits() {
  const { controls, camera } = useThree();

  useFrame(() => {
    if (controls && controls.target) {
      controls.target.y = 16.30;

      const isInside = camera.position.x > -22;
      const targetIsInside = controls.target.x > -22;

      if (controls.target.x < -85) controls.target.x = -85;
      if (controls.target.x > 75) controls.target.x = 75;

      const minTargetZ = targetIsInside ? -64 : -95;
      const maxTargetZ = targetIsInside ? -15 : 0;
      if (controls.target.z < minTargetZ) controls.target.z = minTargetZ;
      if (controls.target.z > maxTargetZ) controls.target.z = maxTargetZ;

      let clamped = false;

      if (camera.position.x < -85) { camera.position.x = -85; clamped = true; }
      if (camera.position.x > 75) { camera.position.x = 75; clamped = true; }
      if (camera.position.y < -7) { camera.position.y = -7; clamped = true; }

      const minCamZ = isInside ? -64 : -95;
      const maxCamZ = isInside ? -15 : 0;
      if (camera.position.z < minCamZ) { camera.position.z = minCamZ; clamped = true; }
      if (camera.position.z > maxCamZ) { camera.position.z = maxCamZ; clamped = true; }

      if (clamped) {
        controls.update();
      }
    }
  });
  return null;
}

export default function GarageCanvas() {
  return (
    <Canvas camera={{ position: [-27.61, 5, -40.90], fov: 60 }}>
      <color attach="background" args={['#020202']} />
      <ambientLight intensity={0.1} />
      <pointLight position={[15, 21, -45]} intensity={5000} distance={150} decay={2} color="#ffffff" castShadow />
      <Stars radius={600} depth={80} count={7000} factor={5} saturation={0} fade />
      <Suspense fallback={null}>
        <Environment files="/night_sky.hdr" />
        <GarageModel />
        <Mountains />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={60}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        target={[-27.61, -6.21, -40.90]}
      />
      <PanLimits />
    </Canvas>
  );
}
