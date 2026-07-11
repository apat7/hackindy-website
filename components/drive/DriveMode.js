"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import DriveWorld from "./DriveWorld";
import DriveCar, { FollowCamera, SPAWN } from "./DriveCar";
import { TireSmoke, SkidMarks } from "./Effects";
import TuningPanel from "./TuningPanel";

// Mounts only once Suspense inside the Canvas has resolved — signals "world ready".
function SceneReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
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
  const [flashKey, setFlashKey] = useState(0);
  const telemetry = useRef({
    x: SPAWN.x,
    z: SPAWN.z,
    yaw: SPAWN.yaw,
    fx: Math.sin(SPAWN.yaw),
    fz: Math.cos(SPAWN.yaw),
    speed: 0,
    slip: 0,
    handbrake: false,
    burnout: false,
    rl: { x: 0, z: 0 },
    rr: { x: 0, z: 0 },
  });
  const shake = useRef(0);
  const resetSignal = useRef(0);

  // every dynamic body registers its spawn transform; reset teleports them
  // back and zeroes velocities (the car listens to resetSignal instead).
  // The ref callback must unregister on null: StrictMode tears the physics
  // world down and up again, and a stale api whose world was freed makes any
  // rapier call — even isValid() — blow up inside the WASM.
  const registry = useRef(new Map());
  const register = useCallback((init) => {
    let current = null;
    return (api) => {
      if (api) {
        current = api;
        registry.current.set(api, init);
      } else if (current) {
        registry.current.delete(current);
        current = null;
      }
    };
  }, []);
  const doReset = useCallback(() => {
    resetSignal.current++;
    for (const [api, init] of registry.current) {
      try {
        if (!api.isValid()) {
          registry.current.delete(api);
          continue;
        }
        api.setTranslation(init.p, true);
        api.setRotation(init.q, true);
        api.setLinvel({ x: 0, y: 0, z: 0 }, true);
        api.setAngvel({ x: 0, y: 0, z: 0 }, true);
        // no api.sleep() here: the lib skips mesh sync for sleeping bodies,
        // so force-sleeping a just-teleported body freezes its visual at the
        // old pose; they fall asleep on their own once settled
      } catch {
        registry.current.delete(api); // freed-world ghost — drop it
      }
    }
    setFlashKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onExit();
      if (e.code === "KeyR") doReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, doReset]);

  return (
    <div className="fixed inset-0 z-40 bg-coal">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 9, 29], fov: 55 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onExit();
          });
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#0b0a08"]} />
          <fog attach="fog" args={["#0b0a08", 70, 150]} />
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[25, 35, 15]}
            intensity={2.4}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-70}
            shadow-camera-right={70}
            shadow-camera-top={70}
            shadow-camera-bottom={-70}
            shadow-camera-far={120}
          />
          {/* fill from the spawn side so the car's tail isn't pure shadow */}
          <directionalLight position={[-12, 18, 35]} intensity={0.9} />
          <Environment files="/night_sky.hdr" />
          <Physics timeStep={1 / 60}>
            <DriveWorld register={register} shake={shake} reduceMotion={reduceMotion} />
            <DriveCar telemetry={telemetry} resetSignal={resetSignal} register={register} />
            <TireSmoke telemetry={telemetry} reduceMotion={reduceMotion} />
            <SkidMarks telemetry={telemetry} />
          </Physics>
          <FollowCamera telemetry={telemetry} shake={shake} reduceMotion={reduceMotion} />
          <SceneReady onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>

      {flashKey > 0 && !reduceMotion && (
        <div key={flashKey} className="drive-flash drive-flash--go" />
      )}

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
          <button
            type="button"
            onClick={(e) => {
              doReset();
              e.currentTarget.blur(); // or the next Space "clicks" reset again
            }}
            className="btn-plate btn-plate--compact pointer-events-auto absolute top-6 right-6"
          >
            <span>RESET GRID</span>
          </button>
          <TuningPanel />
          <p className="absolute bottom-6 inset-x-0 text-center text-[0.6rem] tracking-[0.4em] text-steel">
            W A S D DRIVE · SPACE SLIDE · R RESET · ESC PITS
          </p>
        </div>
      )}
    </div>
  );
}
