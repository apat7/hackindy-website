"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

// Mounts only once Suspense inside the Canvas has resolved — signals "world ready".
function SceneReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

// Placeholder world — replaced with the physics world in a later task.
function PlaceholderWorld() {
  return (
    <>
      <color attach="background" args={["#0b0a08"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#141210" />
      </mesh>
    </>
  );
}

// F1 start gantry: lights come on one by one, hold, then out — reveal.
function StartLights({ ready, reduceMotion, onCovered, onDone }) {
  const [stage, setStage] = useState("enter"); // enter → covered → out → reveal
  const [lit, setLit] = useState(0);
  const coveredSent = useRef(false);

  const cover = () => {
    if (!coveredSent.current) {
      coveredSent.current = true;
      onCovered();
    }
  };

  // fade the coal backdrop in (instantly under reduced motion)
  useEffect(() => {
    if (reduceMotion) {
      setStage("covered");
      cover();
      return;
    }
    const raf = requestAnimationFrame(() => setStage("covered"));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // light the gantry one lamp at a time
  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => setLit((n) => Math.min(n + 1, 5)), 350);
    return () => clearInterval(t);
  }, [reduceMotion]);

  // each transition gets its own effect: a shared effect keyed on `stage`
  // would cancel the second timeout the moment the first one fires

  // covered + all lit + world ready → hold → lights out
  useEffect(() => {
    if (stage !== "covered" || !ready) return;
    if (!reduceMotion && lit < 5) return;
    const t = setTimeout(() => setStage("out"), reduceMotion ? 100 : 650);
    return () => clearTimeout(t);
  }, [stage, ready, lit, reduceMotion]);

  // lights out → reveal
  useEffect(() => {
    if (stage !== "out") return;
    const t = setTimeout(() => setStage("reveal"), reduceMotion ? 100 : 350);
    return () => clearTimeout(t);
  }, [stage, reduceMotion]);

  // reduced motion disables the CSS transitions, so transitionend never
  // fires — finish the reveal directly
  useEffect(() => {
    if (stage === "reveal" && reduceMotion) onDone();
  }, [stage, reduceMotion, onDone]);

  return (
    <div
      className={`gantry font-mono ${stage !== "enter" ? "gantry--covered" : ""} ${
        stage === "reveal" ? "gantry--reveal" : ""
      }`}
      onTransitionEnd={(e) => {
        if (e.propertyName !== "opacity") return;
        if (stage === "reveal") onDone();
        else cover();
      }}
    >
      <div className="flex gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`gantry-light ${i < lit && stage === "covered" ? "on" : ""}`}
          />
        ))}
      </div>
      <p className="plate-note mt-8 text-steel">
        {stage === "out" || stage === "reveal" ? "LIGHTS OUT" : "WARMING TIRES"}
      </p>
    </div>
  );
}

export default function DriveMode({ onExit, onCovered, reduceMotion }) {
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-40 bg-coal">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.2, 26], fov: 55 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onExit();
          });
        }}
      >
        <Suspense fallback={null}>
          <PlaceholderWorld />
          <SceneReady onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>

      {!revealed && (
        <StartLights
          ready={ready}
          reduceMotion={reduceMotion}
          onCovered={onCovered}
          onDone={() => setRevealed(true)}
        />
      )}

      {revealed && (
        <div className="pointer-events-none absolute inset-0 font-mono">
          <button
            type="button"
            onClick={onExit}
            className="btn-plate btn-plate--compact pointer-events-auto absolute top-6 left-6"
          >
            <span>◄ BACK TO THE PITS</span>
          </button>
          <p className="absolute bottom-6 inset-x-0 text-center text-[0.6rem] tracking-[0.4em] text-steel">
            W A S D DRIVE · SPACE SLIDE · R RESET · ESC PITS
          </p>
        </div>
      )}
    </div>
  );
}
