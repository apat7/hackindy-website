# HackIndy Drive Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicking the teaser-page IndyCar drops the visitor into a full-screen arcade driving world where the homepage (HACK INDY letters, 2027, pit-board buttons, race props) is physical and smashable.

**Architecture:** The teaser page stays untouched for non-players. A `driving` state in `ComingSoon` mounts a code-split `DriveMode` overlay (Rapier physics via `@react-three/rapier`). The car is a `kinematicPosition` rigid body driven by a pure, unit-tested arcade step function; world objects are dynamic bodies. All feel constants live in one `tuning.js`.

**Tech Stack:** Next 16 (app router, JS), React 19, react-three-fiber 9, drei 10, three 0.184, @react-three/rapier 2.2.0, Tailwind v4, node:test.

**Spec:** `docs/superpowers/specs/2026-07-10-drive-mode-design.md`

## Global Constraints

- Repo is mid-migration: `git status` shows many deletions/untracked files that are NOT ours. **Never run `git add -A`, `git add -u`, or `git add .`** — stage only the exact files each task touches.
- Per `AGENTS.md`: this Next version has breaking changes — consult `node_modules/next/dist/docs/` before using an unfamiliar Next API. (Already verified: `next/dynamic` + `ssr: false` inside a client component is the sanctioned lazy-load pattern — see `01-app/02-guides/lazy-loading.md`.)
- Car mesh classification is always by **mesh name**, never material name (drei caches the glb scene; StrictMode re-runs traversals).
- Drive mode must **clone** the glb scene (`scene.clone(true)`) — the teaser uses the cached original. Never re-run `applyLivery` on the clone and never mutate shared materials from drive code (cloned meshes share material/geometry objects; `visible` flags are per-node and safe).
- The only new npm dependency is `@react-three/rapier@^2.2.0`.
- Plain JavaScript (no TS). All UI copy is UPPERCASE in the mono font, matching the site.
- Design tokens: coal `#0B0A08`, gold `#CFB991`, aged gold `#8E6F3E`, chalk `#F2EEE6`, steel `#8B8F96`. Tailwind classes `bg-coal text-chalk text-gold text-steel` exist.
- Desktop only: every drive affordance is gated on `(pointer: fine)`.
- Every feel/physics constant goes in `components/drive/tuning.js` — no magic numbers in components.
- Dev server may already be running on `localhost:3000` (don't start a second one).
- Playwright verification runs from the session scratchpad dir, never committed. Screenshots use `page.emulateMedia({ reducedMotion: "reduce" })` (software WebGL runs rAF slowly; reduced-motion paths show settled states — and also exercise the instant-entry path).

---

### Task 1: Dependency, font asset, and baseline

**Files:**
- Modify: `package.json` (via npm install; also add `"test"` script)
- Create: `scripts/convert-font.mjs`
- Create: `public/fonts/saira-bold.typeface.json` (generated)

**Interfaces:**
- Produces: `@react-three/rapier` importable; `/fonts/saira-bold.typeface.json` servable, containing at least glyphs `A-Z 0-9` and `space`; `npm test` runs node:test over `tests/`.

- [ ] **Step 1: Record the baseline bundle size** (used by Task 10 to prove the teaser bundle is unchanged). Stop any running dev server first if the build errors on a locked `.next`.

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027 && npm run build 2>&1 | tail -20
```

Note the `First Load JS` figure for route `/` in a scratch file, e.g. `echo "baseline / first-load: <value>" > <scratchpad>/baseline.txt`.

- [ ] **Step 2: Install rapier**

```bash
npm install @react-three/rapier@^2.2.0
```

Expected: adds `@react-three/rapier` 2.2.x plus `@dimforge/rapier3d-compat` to the tree, no peer warnings for three/fiber/react.

- [ ] **Step 3: Add the test script** to `package.json` scripts:

```json
"test": "node --test tests/"
```

- [ ] **Step 4: Write the font conversion script**

`scripts/convert-font.mjs`:

```js
// One-time: converts a TTF into a three.js typeface JSON, keeping only the
// glyphs the drive world needs (A-Z, 0-9, space).
// Usage: node scripts/convert-font.mjs <in.ttf> <out.json>
import { readFileSync, writeFileSync } from "fs";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader.js";

const [ttfPath, outPath] = process.argv.slice(2);
const KEEP = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ".split(""));

const buf = readFileSync(ttfPath);
const json = new TTFLoader().parse(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
);
json.glyphs = Object.fromEntries(
  Object.entries(json.glyphs).filter(([ch]) => KEEP.has(ch))
);
writeFileSync(outPath, JSON.stringify(json));
console.log(`wrote ${outPath}: ${Object.keys(json.glyphs).length} glyphs`);
```

- [ ] **Step 5: Download the TTF and generate the JSON**

```bash
mkdir -p public/fonts
curl -sL -o /tmp/SairaCondensed-Bold.ttf \
  "https://github.com/google/fonts/raw/main/ofl/sairacondensed/SairaCondensed-Bold.ttf"
node scripts/convert-font.mjs /tmp/SairaCondensed-Bold.ttf public/fonts/saira-bold.typeface.json
```

Expected: `wrote public/fonts/saira-bold.typeface.json: 37 glyphs`. If the curl 404s, list actual filenames with `curl -sL https://api.github.com/repos/google/fonts/contents/ofl/sairacondensed` and pick the Bold static TTF.

- [ ] **Step 6: Sanity-check the JSON parses as a three Font**

```bash
node -e "
import('three/examples/jsm/loaders/FontLoader.js').then(({ FontLoader }) => {
  const json = JSON.parse(require('fs').readFileSync('public/fonts/saira-bold.typeface.json'));
  const font = new FontLoader().parse(json);
  const shapes = font.generateShapes('HACK INDY 2027', 1);
  console.log('shapes:', shapes.length);
});
" --input-type=module
```

Expected: `shapes:` followed by a number > 10. (If `require` trips in module scope, use `readFileSync` from an `import` instead.)

- [ ] **Step 7: Commit (scoped files only)**

```bash
git add package.json package-lock.json scripts/convert-font.mjs public/fonts/saira-bold.typeface.json docs/superpowers/specs/2026-07-10-drive-mode-design.md docs/superpowers/plans/2026-07-10-drive-mode.md
git commit -m "feat(drive): add rapier dependency, typeface asset, and design docs"
```

---

### Task 2: Extract shared livery module + media-query hook

**Files:**
- Create: `components/livery.js`
- Create: `components/useMediaQuery.js`
- Modify: `components/IndyCarCanvas.js`

**Interfaces:**
- Produces:
  - `livery.js` exports: `GOLD` (string), `makeLivery()` → materials object, `applyLivery(scene, livery)` → void (classification traversal + vent gilding), `setRimBlur(scene, visible)` → void.
  - `useMediaQuery(query: string)` → boolean (default export, `false` until mounted).
- Consumers: `IndyCarCanvas` (now), `DriveCar` (`setRimBlur`), `ComingSoon` (`useMediaQuery`).

- [ ] **Step 1: Create `components/useMediaQuery.js`**

```js
"use client";

import { useEffect, useState } from "react";

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Create `components/livery.js`** by moving code out of `IndyCarCanvas.js` **verbatim**: the `GOLD` constant, `makeLivery()`, `GOLD_BODY_RE`, `VENT_ZONES`, and `gildVents()` (currently `IndyCarCanvas.js:13-185`). Then add two exports that wrap the existing logic:

```js
// applyLivery: the classification traversal currently inside IndyCar's useMemo
// (IndyCarCanvas.js:252-294), unchanged, ending with the VENT_ZONES loop.
export function applyLivery(scene, livery) {
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const name = child.name || "";

    if (/Rim_Alpha/i.test(name)) {
      child.visible = false;
      child.material = livery.rimBlur;
      return;
    }

    const assign = (material) => {
      if (Array.isArray(child.material)) child.material[0] = material;
      else child.material = material;
    };

    if (/WCWINDOW/i.test(name)) assign(livery.glass);
    else if (/SWHEEL_GLASS|mirror/i.test(name)) assign(livery.darkMetal);
    else if (/WCRIMS/i.test(name)) assign(livery.gold);
    else if (/INDY19_TYRES/i.test(name)) assign(livery.tire);
    else if (/TWALL/i.test(name)) assign(livery.tireWall);
    else if (/WCCARBODY/i.test(name))
      assign(GOLD_BODY_RE.test(name) ? livery.gold : livery.bodyBlack);
    else if (/CARBON|WCEXTRA9/i.test(name)) assign(livery.carbon);
    else if (/METAL|BDISC|WCEXTRA3/i.test(name)) assign(livery.darkMetal);
    else assign(livery.dark);
  });

  for (const zone of VENT_ZONES) {
    gildVents(scene.getObjectByName(zone.mesh), zone.boxes, livery.gold);
  }
}

export function setRimBlur(scene, visible) {
  scene.traverse((child) => {
    if (child.isMesh && /Rim_Alpha/i.test(child.name)) child.visible = visible;
  });
}
```

Exports: `GOLD`, `makeLivery`, `applyLivery`, `setRimBlur`. Keep `GOLD_BODY_RE`, `VENT_ZONES`, `gildVents` module-private. Preserve the existing comments (they explain the StrictMode/mesh-name gotcha and vent geometry splitting).

- [ ] **Step 3: Slim down `IndyCarCanvas.js`**
  - Delete the moved code; `import { GOLD, makeLivery, applyLivery, setRimBlur } from "./livery";`
  - The `useMemo` becomes: `applyLivery(scene, livery);` followed by the existing box/fit math (`IndyCarCanvas.js:296-303`), unchanged.
  - Replace the local `setRimBlur` helper (`IndyCarCanvas.js:204-210`) with calls to the imported `setRimBlur(scene, visible)`.
  - Replace the inline reduced-motion `useEffect`/state (`IndyCarCanvas.js:337-345`) with `const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");`

- [ ] **Step 4: Verify the teaser is pixel-identical**

Dev server running, then from the scratchpad (one-time setup: `npm init -y && npm i playwright && npx playwright install chromium` if not already there):

```js
// shot.mjs — screenshot the teaser
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: "teaser-after-extract.png" });
await browser.close();
```

Run `node shot.mjs`, Read the PNG, confirm: gold/black car (not all-black — the StrictMode regression symptom), wordmark, buttons. Also check the dev server log / browser console for errors.

- [ ] **Step 5: Commit**

```bash
git add components/livery.js components/useMediaQuery.js components/IndyCarCanvas.js
git commit -m "refactor: extract shared livery module and media-query hook"
```

---

### Task 3: Drive-mode shell — overlay, start lights, enter/exit round-trip

**Files:**
- Create: `components/drive/DriveMode.js`
- Modify: `components/ComingSoon.js`
- Modify: `components/IndyCarCanvas.js`
- Modify: `app/globals.css`

**Interfaces:**
- Produces:
  - `DriveMode({ onExit, onCovered, reduceMotion })` — full-screen overlay component (default export).
  - `IndyCarCanvas({ className, onEnterDrive })` — when `onEnterDrive` is set, a non-drag click on the car calls `startLap()` + `onEnterDrive()`.
  - CSS classes: `.gantry`, `.gantry--covered`, `.gantry--reveal`, `.gantry-light`, `.gantry-light.on`, `.btn-plate--compact`.
- Consumes: `useMediaQuery` from Task 2.
- Note: **no Rapier yet** — this task's world is a placeholder plane so the overlay mechanics are reviewable in isolation. Task 5 replaces it.

- [ ] **Step 1: Create `components/drive/DriveMode.js`**

```jsx
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

  // all lit + world ready → hold → lights out → reveal
  useEffect(() => {
    if (stage !== "covered" || !ready) return;
    if (!reduceMotion && lit < 5) return;
    const t1 = setTimeout(() => setStage("out"), reduceMotion ? 100 : 650);
    const t2 = setTimeout(() => setStage("reveal"), reduceMotion ? 200 : 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage, ready, lit, reduceMotion]);

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
            className={`gantry-light ${
              i < lit && stage === "covered" ? "on" : ""
            }`}
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
```

- [ ] **Step 2: Add gantry + compact-plate CSS to `app/globals.css`** (after the `.btn-plate--form` rules):

```css
/* compact plate variant for drive-mode HUD chrome */
.btn-plate--compact > span {
  min-width: 0;
  padding: 0.6rem 1.2rem;
  font-size: 0.62rem;
}

/* drive-mode start-light gantry */
.gantry {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-coal);
  opacity: 0;
  transition: opacity 0.45s ease 0.3s;
}

.gantry--covered {
  opacity: 1;
}

.gantry--reveal {
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.gantry-light {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  background: #1c1712;
  border: 1px solid #2b241b;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.gantry-light.on {
  background: #e0432d;
  box-shadow: 0 0 22px rgba(224, 67, 45, 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .gantry,
  .gantry--reveal {
    transition: none;
  }
}
```

- [ ] **Step 3: Wire entry state into `components/ComingSoon.js`**

Add imports and the error boundary near the top of the file:

```jsx
import { Component, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useMediaQuery from "./useMediaQuery";

const DriveMode = dynamic(() => import("./drive/DriveMode"), { ssr: false });

// If the drive chunk or WASM fails, show a themed apology and bail out.
function PitLaneClosed({ onExit }) {
  useEffect(() => {
    const t = setTimeout(onExit, 1900);
    return () => clearTimeout(t);
  }, [onExit]);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-coal font-mono">
      <p className="plate-note text-gold">PIT LANE CLOSED — TRY AGAIN LATER</p>
    </div>
  );
}

class DriveBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <PitLaneClosed onExit={this.props.onExit} />;
    return this.props.children;
  }
}
```

In the `ComingSoon` component body:

```jsx
const [driving, setDriving] = useState(false);
const [covered, setCovered] = useState(false);
const finePointer = useMediaQuery("(pointer: fine)");
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
const canDrive = finePointer;

const enterDrive = useCallback(() => setDriving(true), []);
const exitDrive = useCallback(() => {
  setDriving(false);
  setCovered(false);
}, []);
```

Wrap the three teaser layers so they unmount once the overlay is opaque (frees the GPU while driving): `{!covered && <ParticleText ... />}`, `{!covered && (<div ...>2027</div>)}`, `{!covered && <IndyCarCanvas className="anim-rise absolute inset-0 z-10" onEnterDrive={canDrive ? enterDrive : undefined} />}`.

At the end of `<main>`, after the chrome layer:

```jsx
{driving && (
  <DriveBoundary onExit={exitDrive}>
    <DriveMode
      onExit={exitDrive}
      onCovered={() => setCovered(true)}
      reduceMotion={reduceMotion}
    />
  </DriveBoundary>
)}
```

- [ ] **Step 4: Make the car clickable in `components/IndyCarCanvas.js`**

`IndyCar` gains an `onEnter` prop (threaded from `IndyCarCanvas`'s `onEnterDrive`). Replace the `onDoubleClick` handler on `<primitive>` (the lap easter egg is absorbed into entry) with click-vs-drag detection and a hover cursor:

```jsx
import { useCursor } from "@react-three/drei";
```

Inside `IndyCar`:

```jsx
const downPos = useRef(null);
const [hovered, setHovered] = useState(false);
useCursor(hovered && !!onEnter);
```

On the `<primitive>`:

```jsx
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
```

- [ ] **Step 5: Verify the round-trip end-to-end**

Scratchpad script `enter.mjs`:

```js
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.mouse.click(720, 470); // the parked car sits mid-frame
await page.waitForTimeout(3500);
await page.screenshot({ path: "drive-shell.png" });
await page.keyboard.press("Escape");
await page.waitForTimeout(1500);
await page.screenshot({ path: "teaser-back.png" });
await browser.close();
```

Expected: `drive-shell.png` shows the dark placeholder plane with the HUD plate "◄ BACK TO THE PITS" (reduced motion skips the light show quickly); `teaser-back.png` shows the normal teaser. If the click misses the car, adjust coordinates using the teaser screenshot from Task 2. Confirm no console/server errors.

- [ ] **Step 6: Commit**

```bash
git add components/drive/DriveMode.js components/ComingSoon.js components/IndyCarCanvas.js app/globals.css
git commit -m "feat(drive): overlay shell with start-light gantry and car-click entry"
```

---

### Task 4: Entry affordances — hint copy, pit tag, launch polish

**Files:**
- Modify: `components/ComingSoon.js`

**Interfaces:**
- Consumes: `canDrive`, `enterDrive`, `driving` from Task 3.

- [ ] **Step 1: Update the hint line** (`DRAG TO INSPECT` paragraph):

```jsx
<p
  className="anim-rise mb-8 text-center text-[0.6rem] tracking-[0.5em] text-steel"
  style={{ animationDelay: "1.4s", textIndent: "0.5em" }}
>
  DRAG TO INSPECT{canDrive ? " · CLICK TO DRIVE" : ""}
</p>
```

- [ ] **Step 2: Add the pit-board tag.** Inside the chrome layer (the `z-20` div), before the flex column — a wrapper carries `anim-rise` (its animation ends at `transform: none`, so the rotation must live on the button, not the animated element):

```jsx
{canDrive && !driving && (
  <div
    className="anim-rise pointer-events-none absolute left-1/2 top-[52%] z-20"
    style={{ animationDelay: "4s" }}
  >
    <button
      type="button"
      onClick={enterDrive}
      className="btn-plate btn-plate--compact pointer-events-auto"
      style={{ transform: "translateX(9rem) rotate(-5deg)" }}
    >
      <span>TAKE IT FOR A SPIN</span>
    </button>
  </div>
)}
```

- [ ] **Step 3: Verify placement and behavior.** Re-run the Task 2 `shot.mjs` (reduced motion renders `anim-rise` instantly, so the tag is visible immediately). Read the screenshot: tag floats right of the car, slightly tilted, plate-styled; hint line shows `· CLICK TO DRIVE`. Then re-run `enter.mjs` but click the tag instead: replace the `page.mouse.click(...)` line with `await page.getByText("TAKE IT FOR A SPIN").click();` — expect the same drive shell. Adjust `top`/`translateX` values if the tag overlaps the car or hint line, and re-screenshot.

- [ ] **Step 4: Commit**

```bash
git add components/ComingSoon.js
git commit -m "feat(drive): click-to-drive hint and pit-board entry tag"
```

---

### Task 5: Physics world — ground, walls, markings

**Files:**
- Create: `components/drive/tuning.js`
- Create: `components/drive/DriveWorld.js`
- Modify: `components/drive/DriveMode.js`

**Interfaces:**
- Produces:
  - `tuning.js` default-less named export `TUNING` (all constants below — later tasks add keys, never inline numbers).
  - `DriveWorld()` — ground plane (physics + procedural markings texture) and four perimeter walls. World is 120×120 m centered at origin.
  - `DriveMode` now wraps scene content in `<Physics>` and real lighting.
- Consumes: `@react-three/rapier` (`Physics`, `RigidBody`, `CuboidCollider`), `Environment` from drei, `/night_sky.hdr`.

- [ ] **Step 1: Create `components/drive/tuning.js`**

```js
// Every feel knob for drive mode lives here. Tune by driving, not by faith.
export const TUNING = {
  // engine & brakes (m/s, m/s²)
  maxSpeed: 32,
  maxReverse: 9,
  engineAccel: 26,
  brakeDecel: 42,
  reverseAccel: 12,
  drag: 0.045, // × |v| → aero decel
  rollingResist: 1.4,

  // steering
  steerRate: 2.4, // rad/s at full authority
  fullSteerSpeed: 3.5, // m/s at which steering reaches full authority
  steerFalloff: 0.02, // authority ÷ (1 + falloff·|v|)

  // grip (lateral velocity decay, per second)
  grip: 6.5,
  driftGrip: 1.4,
  handbrakeDecel: 8,

  // camera
  camDist: 8,
  camHeight: 3.2,
  camLookAhead: 5,
  camLerp: 4.5,
  fovBase: 55,
  fovSpan: 14,
  camShakeDecay: 4,

  // world
  worldHalf: 58, // car position clamp; walls sit at ±60
  carLength: 5.2, // meters — the glb is scaled to this

  // car visuals
  blurSpeed: 17, // m/s at which rim-blur discs appear
  maxVisualSteer: 0.42, // rad, front-wheel yaw

  // effects
  slipForSmoke: 3.2,
  slipForSkid: 2.4,

  // dynamic props
  letterDensity: 0.4,
  letterFriction: 0.7,
  letterRestitution: 0.2,
  impactForceMin: 2500, // onContactForce threshold for shake/glint — tune with logging
};
```

- [ ] **Step 2: Create `components/drive/DriveWorld.js`**

```jsx
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

  // world (x, z) → canvas (u, v): u = (x + 60)·m, v = (60 − z)·m
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
```

- [ ] **Step 3: Swap the placeholder in `DriveMode.js`.** Delete `PlaceholderWorld`; add imports:

```jsx
import { Physics } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import DriveWorld from "./DriveWorld";
```

Replace the Suspense contents:

```jsx
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
  <Environment files="/night_sky.hdr" />
  <Physics timeStep={1 / 60}>
    <DriveWorld />
  </Physics>
  <SceneReady onReady={() => setReady(true)} />
</Suspense>
```

- [ ] **Step 4: Verify.** Re-run `enter.mjs`. Expected screenshot: coal floor with faint gold grid, chalk checker strip in the foreground, gold rings to the right, gold-dim rumble strips at the horizon edges. The gantry must have waited for the WASM load (SceneReady sits inside the same Suspense). No console errors — a red overlay or blank canvas means the Physics import/WASM failed.

- [ ] **Step 5: Commit**

```bash
git add components/drive/tuning.js components/drive/DriveWorld.js components/drive/DriveMode.js
git commit -m "feat(drive): rapier physics world with marked ground and walls"
```

---

### Task 6: The car — TDD'd arcade physics, kinematic body, wheels, chase camera

**Files:**
- Create: `tests/carPhysics.test.mjs`
- Create: `components/drive/carPhysics.js` (pure — no three, no react, no "use client")
- Create: `components/drive/useDriveControls.js`
- Create: `components/drive/DriveCar.js`
- Modify: `components/drive/DriveMode.js`

**Interfaces:**
- Produces:
  - `createCarState(x, z, yaw)` → `{ x, z, yaw, vx, vz, speed, slip, yawRate }`
  - `stepCar(state, input, dt, T)` → new state. `input = { throttle: 0..1, brake: 0..1, steer: -1..1 (+1 = left), handbrake: bool }`. Heading convention: forward = `(sin yaw, cos yaw)` in the xz-plane (matches the teaser's `EXIT_DIR`).
  - `useDriveControls()` → ref of `{ up, down, left, right, handbrake }` booleans (WASD + arrows + space; window blur clears all).
  - `DriveCar({ telemetry, resetSignal })` — kinematic car at spawn `(0, 16)` facing the letters (yaw π ⇒ −z). Writes per-frame telemetry: `{ x, z, yaw, fx, fz, speed, slip, handbrake, burnout, rl: {x,z}, rr: {x,z} }` (rl/rr = rear-wheel ground contacts).
  - `ChaseCamera({ telemetry, shake, reduceMotion })` (named export from `DriveCar.js`).
- Consumes: `TUNING`, `setRimBlur` (Task 2), `useGLTF`.

- [ ] **Step 1: Write the failing tests** — `tests/carPhysics.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createCarState, stepCar } from "../components/drive/carPhysics.js";
import { TUNING as T } from "../components/drive/tuning.js";

const IDLE = { throttle: 0, brake: 0, steer: 0, handbrake: false };
const DT = 1 / 60;

function run(state, input, seconds, dt = DT) {
  for (let t = 0; t < seconds; t += dt) state = stepCar(state, { ...IDLE, ...input }, dt, T);
  return state;
}

test("throttle accelerates forward along heading", () => {
  const s = run(createCarState(0, 0, 0), { throttle: 1 }, 1);
  assert.ok(s.speed > 5, `speed ${s.speed}`);
  assert.ok(s.z > 2, `z ${s.z}`); // yaw 0 ⇒ forward = +z
  assert.ok(Math.abs(s.x) < 0.01);
});

test("speed never exceeds maxSpeed", () => {
  const s = run(createCarState(0, 0, 0), { throttle: 1 }, 20);
  assert.ok(s.speed <= T.maxSpeed + 0.01, `speed ${s.speed}`);
  assert.ok(s.speed > T.maxSpeed * 0.85);
});

test("car coasts to a stop", () => {
  let s = run(createCarState(0, 0, 0), { throttle: 1 }, 3);
  s = run(s, {}, 15);
  assert.ok(Math.abs(s.speed) < 0.05, `speed ${s.speed}`);
});

test("brake stops the car, then reverses", () => {
  let s = run(createCarState(0, 0, 0), { throttle: 1 }, 3);
  s = run(s, { brake: 1 }, 2);
  assert.ok(s.speed <= 0.05, `speed ${s.speed}`);
  s = run(s, { brake: 1 }, 3);
  assert.ok(s.speed < -1, `reverse speed ${s.speed}`);
  assert.ok(s.speed >= -T.maxReverse - 0.01);
});

test("no steering authority at standstill", () => {
  const s = run(createCarState(0, 0, 0), { steer: 1 }, 1);
  assert.equal(s.yaw, 0);
});

test("steer +1 turns left (yaw increases); reversing flips it", () => {
  const fwd = run(createCarState(0, 0, 0), { throttle: 1, steer: 1 }, 1.5);
  assert.ok(fwd.yaw > 0.3, `yaw ${fwd.yaw}`);
  let rev = run(createCarState(0, 0, 0), { brake: 1 }, 2); // build reverse speed
  rev = run(rev, { brake: 1, steer: 1 }, 1.5);
  assert.ok(rev.yaw < -0.05, `reverse yaw ${rev.yaw}`);
});

test("handbrake keeps the slide alive", () => {
  const setup = () => run(createCarState(0, 0, 0), { throttle: 1 }, 3);
  const gripped = run(setup(), { throttle: 1, steer: 1 }, 0.6);
  const slid = run(setup(), { steer: 1, handbrake: true }, 0.6);
  assert.ok(slid.slip > gripped.slip * 1.5, `slid ${slid.slip} vs gripped ${gripped.slip}`);
});

test("roughly framerate independent", () => {
  const a = run(createCarState(0, 0, 0), { throttle: 1, steer: 0.5 }, 4, 1 / 60);
  const b = run(createCarState(0, 0, 0), { throttle: 1, steer: 0.5 }, 4, 1 / 120);
  const dist = Math.hypot(a.x - b.x, a.z - b.z);
  assert.ok(dist < 3, `positions diverge by ${dist}m`);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module .../carPhysics.js`.

- [ ] **Step 3: Implement `components/drive/carPhysics.js`**

```js
// Pure arcade car model. No three.js, no react — unit-testable in node.
// Heading: forward = (sin yaw, cos yaw) in the xz-plane (matches the teaser).
// The trick that makes it fun: velocity is decomposed into forward/lateral
// components each frame; lateral velocity bleeds away at "grip" rate. The
// handbrake drops grip so the rear stays loose — slides and donuts fall out.

export function createCarState(x = 0, z = 0, yaw = 0) {
  return { x, z, yaw, vx: 0, vz: 0, speed: 0, slip: 0, yawRate: 0 };
}

export function stepCar(state, input, dt, T) {
  const fx = Math.sin(state.yaw);
  const fz = Math.cos(state.yaw);
  // decompose world velocity onto heading; right vector = (fz, -fx)
  let vF = state.vx * fx + state.vz * fz;
  let vL = state.vx * fz - state.vz * fx;

  if (input.throttle > 0 && vF < T.maxSpeed) {
    vF += T.engineAccel * input.throttle * (1 - Math.max(vF, 0) / T.maxSpeed) * dt;
  }
  if (input.brake > 0) {
    vF =
      vF > 0.25
        ? Math.max(0, vF - T.brakeDecel * input.brake * dt)
        : Math.max(-T.maxReverse, vF - T.reverseAccel * input.brake * dt);
  }
  if (input.handbrake) {
    vF -= Math.sign(vF) * Math.min(Math.abs(vF), T.handbrakeDecel * dt);
  }
  const resist = (T.rollingResist + T.drag * Math.abs(vF)) * dt;
  vF -= Math.sign(vF) * Math.min(Math.abs(vF), resist);

  // steering authority ramps in with speed, falls off at the top end,
  // and mirrors when reversing (like a real steered front axle)
  const authority =
    Math.min(Math.abs(vF) / T.fullSteerSpeed, 1) / (1 + T.steerFalloff * Math.abs(vF));
  const yawRate = input.steer * T.steerRate * authority * (vF < 0 ? -1 : 1);
  const yaw = state.yaw + yawRate * dt;

  const grip = input.handbrake ? T.driftGrip : T.grip;
  vL *= Math.exp(-grip * dt);

  const nfx = Math.sin(yaw);
  const nfz = Math.cos(yaw);
  const vx = nfx * vF + nfz * vL;
  const vz = nfz * vF - nfx * vL;

  return {
    x: state.x + vx * dt,
    z: state.z + vz * dt,
    yaw,
    vx,
    vz,
    speed: vF,
    slip: Math.abs(vL),
    yawRate,
  };
}
```

- [ ] **Step 4: Run tests until green**

```bash
npm test
```

Expected: 8 passing. If `handbrake keeps the slide alive` fails, the decomposition sign convention is off — re-check the right-vector math before touching tuning values.

- [ ] **Step 5: Create `components/drive/useDriveControls.js`**

```js
"use client";

import { useEffect, useRef } from "react";

const KEYMAP = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "handbrake",
};

export default function useDriveControls() {
  const keys = useRef({ up: false, down: false, left: false, right: false, handbrake: false });

  useEffect(() => {
    const down = (e) => {
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault(); // keep space/arrows from scrolling
      keys.current[k] = true;
    };
    const up = (e) => {
      const k = KEYMAP[e.code];
      if (k) keys.current[k] = false;
    };
    const clear = () => {
      for (const k of Object.keys(keys.current)) keys.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return keys;
}
```

- [ ] **Step 6: Create `components/drive/DriveCar.js`**

```jsx
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

const SPAWN = { x: 0, z: 16, yaw: Math.PI }; // facing the letter row at z=0
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _box = new THREE.Box3();
const _v = new THREE.Vector3();

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
  const forwardSign = avg(pivots.filter((p) => p.front)) >= avg(pivots.filter((p) => !p.front)) ? 1 : -1;
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
      ((s.speed / (rig.radius * fit.s)) + (burnout ? 40 : 0)) * dt * rig.forwardSign;
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
```

- [ ] **Step 7: Mount the car in `DriveMode.js`.** Add refs and components:

```jsx
import DriveCar, { ChaseCamera } from "./DriveCar";
```

In `DriveMode`:

```jsx
const telemetry = useRef({
  x: 0, z: 16, yaw: Math.PI, fx: 0, fz: -1,
  speed: 0, slip: 0, handbrake: false, burnout: false,
  rl: { x: 0, z: 0 }, rr: { x: 0, z: 0 },
});
const shake = useRef(0);
const resetSignal = useRef(0);
```

Extend the ESC key handler to also catch `R`:

```jsx
const onKey = (e) => {
  if (e.key === "Escape") onExit();
  if (e.code === "KeyR") resetSignal.current++;
};
```

Inside `<Physics>` add `<DriveCar telemetry={telemetry} resetSignal={resetSignal} />`; next to it (inside Suspense, outside Physics is fine) add `<ChaseCamera telemetry={telemetry} shake={shake} reduceMotion={reduceMotion} />`.

- [ ] **Step 8: Verify by driving.** `npm test` still green. Then a scratchpad drive script:

```js
// drive.mjs — enter, hold W and steer, screenshot trajectory
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.getByText("TAKE IT FOR A SPIN").click();
await page.waitForTimeout(4000);
await page.keyboard.down("w");
await page.waitForTimeout(2500);
await page.keyboard.down("a");
await page.waitForTimeout(1500);
await page.screenshot({ path: "driving.png" });
await browser.close();
```

Expected: the car away from spawn, rotated, chase camera behind it (software WebGL is slow — the car may not be far, but it must have moved and turned; the camera must be following, not static). **Also drive it yourself in a real browser** — this is the moment to catch "feels wrong" early. Ask the human partner to try it if in doubt.

- [ ] **Step 9: Commit**

```bash
git add tests/carPhysics.test.mjs components/drive/carPhysics.js components/drive/useDriveControls.js components/drive/DriveCar.js components/drive/DriveMode.js package.json
git commit -m "feat(drive): arcade car physics (tested), kinematic body, wheel rig, chase camera"
```

---

### Task 7: HACK INDY letters + 2027 as tumbling rigid bodies, reset system

**Files:**
- Create: `components/drive/LetterBodies.js`
- Modify: `components/drive/DriveMode.js`
- Modify: `components/drive/DriveWorld.js` (mount letters)

**Interfaces:**
- Produces:
  - `LetterBodies({ text, size, depth, z, register, shake, reduceMotion })` — one dynamic RigidBody per glyph, hull-collided, centered row at world `z`, resting on the ground.
  - Reset registry pattern: `register(init)` returns a ref callback; `init = { p: {x,y,z}, q: {x,y,z,w} }`. `DriveMode` owns the registry Map, `doReset()`, and passes `register` down through `DriveWorld`.
- Consumes: `useFont` (drei), `TextGeometry` (`three/examples/jsm/geometries/TextGeometry.js`), `/fonts/saira-bold.typeface.json`, `TUNING`.

- [ ] **Step 1: Create `components/drive/LetterBodies.js`**

```jsx
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
```

- [ ] **Step 2: Add the registry + reset to `DriveMode.js`**

```jsx
const registry = useRef(new Map());
const register = useCallback(
  (init) => (api) => {
    if (api) registry.current.set(api, init);
  },
  []
);
const doReset = useCallback(() => {
  resetSignal.current++;
  for (const [api, init] of registry.current) {
    if (!api.isValid()) {
      registry.current.delete(api);
      continue;
    }
    api.setTranslation(init.p, true);
    api.setRotation(init.q, true);
    api.setLinvel({ x: 0, y: 0, z: 0 }, true);
    api.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }
}, []);
```

(`useCallback` import already needed — add it.) Change the `KeyR` handler to call `doReset()`. Add a HUD plate next to the back button:

```jsx
<button
  type="button"
  onClick={doReset}
  className="btn-plate btn-plate--compact pointer-events-auto absolute top-6 right-6"
>
  <span>RESET GRID</span>
</button>
```

- [ ] **Step 3: Mount letters.** Pass props through: `<DriveWorld register={register} shake={shake} reduceMotion={reduceMotion} />`; in `DriveWorld` accept them and add inside the fragment:

```jsx
<LetterBodies text="HACK INDY" size={3.4} depth={0.9} z={0} register={register} shake={shake} reduceMotion={reduceMotion} />
<LetterBodies text="2027" size={2.2} depth={0.7} z={-10} register={register} shake={shake} reduceMotion={reduceMotion} />
```

- [ ] **Step 4: Verify.** Extend the drive script: after entering, `w` for ~4s straight (the spawn faces the letters — the car should plow into "HACK INDY"), screenshot; press `r`, wait 1s, screenshot. Expected: first shot shows chalk-and-gold 3D letters with some knocked over/tumbling; second shows the row standing back on its marks. StrictMode note: the registry may hold dead handles from the double-mount — `isValid()` pruning covers it; confirm no console errors on reset. Also confirm letters don't jitter at rest (they should fall asleep; if they slide, raise `letterFriction`).

- [ ] **Step 5: Commit**

```bash
git add components/drive/LetterBodies.js components/drive/DriveMode.js components/drive/DriveWorld.js
git commit -m "feat(drive): physical HACK INDY letters with impact glint and grid reset"
```

---

### Task 8: Props — pit-board slabs, cones, tire stacks

**Files:**
- Create: `components/drive/Props.js`
- Modify: `components/drive/DriveWorld.js`

**Interfaces:**
- Produces: `PitSlab({ label, position, rotationY, register })`, `Cone({ position, register })`, `TireStack({ position, count, register })` — all dynamic bodies participating in the reset registry.
- Consumes: `register` pattern from Task 7, `TUNING`.

- [ ] **Step 1: Create `components/drive/Props.js`**

```jsx
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
  g.font = "600 84px monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(label.split("").join(" "), c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const slabDark = new THREE.MeshStandardMaterial({ color: "#12100c", roughness: 0.6 });

export function PitSlab({ label, position, rotationY = 0, register }) {
  const face = useMemo(() => {
    const tex = makeSlabTexture(label);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  }, [label]);
  // box faces order: +x, -x, +y, -y, +z, -z
  const mats = useMemo(() => [slabDark, slabDark, slabDark, slabDark, face, face], [face]);
  return (
    <RigidBody
      ref={register({ p: { x: position[0], y: position[1], z: position[2] }, q: yQuat(rotationY) })}
      colliders="cuboid"
      density={0.5}
      friction={0.6}
      linearDamping={0.3}
      angularDamping={0.5}
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.3, 0.35]} />
      </mesh>
    </RigidBody>
  );
}

const coneGold = new THREE.MeshStandardMaterial({ color: "#CFB991", roughness: 0.5 });

export function Cone({ position, register }) {
  return (
    <RigidBody
      ref={register({ p: { x: position[0], y: position[1], z: position[2] }, q: yQuat(0) })}
      colliders="hull"
      density={0.25}
      friction={0.7}
      position={position}
    >
      <mesh material={coneGold} castShadow>
        <coneGeometry args={[0.42, 1.05, 14]} />
      </mesh>
    </RigidBody>
  );
}

const tireBlack = new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.9 });

export function TireStack({ position, count = 2, register }) {
  return Array.from({ length: count }, (_, i) => {
    const p = [position[0], 0.19 + i * 0.38, position[2]];
    return (
      <RigidBody
        key={i}
        ref={register({ p: { x: p[0], y: p[1], z: p[2] }, q: yQuat(0) })}
        colliders={false}
        density={0.6}
        friction={0.8}
        position={p}
      >
        <CylinderCollider args={[0.19, 0.56]} />
        <mesh material={tireBlack} castShadow>
          <cylinderGeometry args={[0.56, 0.56, 0.38, 20]} />
        </mesh>
      </RigidBody>
    );
  });
}
```

- [ ] **Step 2: Scatter them in `DriveWorld.js`**

```jsx
import { PitSlab, Cone, TireStack } from "./Props";
```

```jsx
{/* the homepage buttons, made physical */}
<PitSlab label="UPDATE ME" position={[-16, 0.65, 7]} rotationY={0.3} register={register} />
<PitSlab label="2026 SEASON" position={[19, 0.65, 5]} rotationY={-0.25} register={register} />
<PitSlab label="CONTACT US" position={[14, 0.65, -13]} rotationY={0.6} register={register} />

{/* trackside clutter */}
{[[6, 20], [8, 22], [26, -6], [28, -12], [24, -14], [-22, -14], [-24, 8]].map(([x, z]) => (
  <Cone key={`${x},${z}`} position={[x, 0.525, z]} register={register} />
))}
<TireStack position={[-26, 0, 20]} count={3} register={register} />
<TireStack position={[-23, 0, 21]} count={2} register={register} />
<TireStack position={[30, 0, 16]} count={2} register={register} />
<TireStack position={[-18, 0, -24]} count={3} register={register} />
```

(Cone y = half its 1.05 height; cone positions avoid the donut rings at (30, −10) — cones at (26..28, −6..−14) frame the pad without sitting on the rings.)

- [ ] **Step 3: Verify.** Drive script: veer right toward a slab and cones, screenshot; `r` to reset, screenshot. Expected: slab shows chamfered gold-bordered face with mono label; cones scatter satisfyingly when hit (they're light); tire stacks topple; reset restores all. Check slab text isn't mirrored on the back face (it will be — acceptable, they're signs).

- [ ] **Step 4: Commit**

```bash
git add components/drive/Props.js components/drive/DriveWorld.js
git commit -m "feat(drive): physical pit-board slabs, cones, and tire stacks"
```

---

### Task 9: Effects — tire smoke, skid marks, reset flash

**Files:**
- Create: `components/drive/Effects.js`
- Modify: `components/drive/DriveMode.js`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `TireSmoke({ telemetry, reduceMotion })`, `SkidMarks({ telemetry })` (named exports). Both read the Task 6 telemetry contract (`slip`, `burnout`, `rl`, `rr`, `speed`).
- Consumes: `TUNING.slipForSmoke`, `TUNING.slipForSkid`.

- [ ] **Step 1: Create `components/drive/Effects.js`**

```jsx
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
      <meshBasicMaterial map={tex} transparent opacity={0.22} depthWrite={false} color="#9a9a9a" />
    </instancedMesh>
  );
}

const SKID_SEGS = 500; // ring buffer; oldest marks are overwritten
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
          // perpendicular half-width offset
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
```

- [ ] **Step 2: Mount in `DriveMode.js`** inside `<Physics>` (they're render-only but read telemetry after the car writes it):

```jsx
<TireSmoke telemetry={telemetry} reduceMotion={reduceMotion} />
<SkidMarks telemetry={telemetry} />
```

- [ ] **Step 3: Reset flash.** Add to `globals.css`:

```css
@keyframes drive-flash {
  from { opacity: 0.55; }
  to { opacity: 0; }
}
.drive-flash {
  position: absolute;
  inset: 0;
  background: var(--color-coal);
  pointer-events: none;
  opacity: 0;
}
.drive-flash--go {
  animation: drive-flash 0.35s ease-out;
}
```

In `DriveMode`: `const [flashKey, setFlashKey] = useState(0);` — `doReset` also calls `setFlashKey((k) => k + 1);`. Render inside the overlay (above the Canvas): `{flashKey > 0 && <div key={flashKey} className="drive-flash drive-flash--go" />}`. Under reduced motion skip it: `{flashKey > 0 && !reduceMotion && ...}`.

- [ ] **Step 4: Verify.** Drive script: enter, `w` 2.5s, then hold `space`+`a` 2s (slide), screenshot. Expected: gray smoke puffs around the rear, dark curved skid trails on the floor. Then standstill burnout: hold `w`+`s` 2s, screenshot — smoke with the car stationary. **Drive it yourself for the donut test** — reduced-motion Playwright can't show this well (smoke is disabled under reduced motion; verify smoke via the burnout screenshot with `emulateMedia` NOT set, accepting slow rAF). Confirm smoke does not emit under reduced motion.

- [ ] **Step 5: Commit**

```bash
git add components/drive/Effects.js components/drive/DriveMode.js app/globals.css
git commit -m "feat(drive): tire smoke, skid marks, and reset flash"
```

---

### Task 10: Hardening, tuning pass, full verification

**Files:**
- Modify: `components/drive/tuning.js` (feel iteration)
- Possibly touch: any drive file for fixes found below

- [ ] **Step 1: Impact threshold calibration.** Temporarily `console.log(e.totalForceMagnitude)` in `LetterBodies`' `onContactForce`, drive into letters at varied speeds in a real browser, set `TUNING.impactForceMin` so slow nudges don't shake but solid hits do. Remove the log.

- [ ] **Step 2: Feel pass with the human partner.** They drive; adjust `tuning.js` (grip/driftGrip/steerRate/camLerp are the big four). Commit tuning separately so it's easy to bisect: `git add components/drive/tuning.js && git commit -m "tune(drive): feel pass"`.

- [ ] **Step 3: Lazy-load proof.** Scratchpad script: collect requests on the teaser (no click) — assert nothing matches `/rapier|wasm|typeface/i`:

```js
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
const bad = [];
page.on("request", (r) => {
  if (/rapier|wasm|typeface/i.test(r.url())) bad.push(r.url());
});
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
console.log(bad.length ? `LEAK:\n${bad.join("\n")}` : "clean — no drive assets on teaser load");
await browser.close();
```

Expected: `clean`. If rapier leaks into the teaser bundle, something imports `drive/` statically — find it with `grep -rn "drive/" components/ app/ --include="*.js" | grep -v "components/drive"`.

- [ ] **Step 4: Production build + baseline compare.** Stop dev server; `npm run build`. Compare route `/` First Load JS against `baseline.txt` from Task 1 — allow a few KB (new ComingSoon logic), fail the task if it grew by >30 KB (rapier is ~1 MB+ and would be unmissable). Restart dev server after.

- [ ] **Step 5: Manual checklist** (real browser, human partner where noted):
  - Enter via car click (drag first — must NOT enter), enter via tag, exit via ESC and via plate; re-enter works (chunk cached, world fresh).
  - Letters tumble on hit; glint on hard hit; shake on hard hit; `R` and RESET GRID restore everything including the car.
  - Handbrake slide, donut, burnout each produce smoke + skids.
  - Car cannot leave the arena (drive hard at a wall and hold).
  - Teaser on a simulated touch device (`page.emulateMedia` won't do this — use Chromium device emulation `--use-mobile-user-agent` or Playwright `devices["iPhone 14"]`): no tag, no "CLICK TO DRIVE", car drag still works.
  - `prefers-reduced-motion: reduce`: entry is an instant cover (no lap launch, no light show), no shake, no smoke; driving still works.
  - No console errors across the whole flow; dev server log clean.
- [ ] **Step 6: Fix anything the checklist surfaced, re-run the relevant verification, then final commit**

```bash
git add <specific files touched>
git commit -m "fix(drive): hardening pass from verification checklist"
```

---

## Self-Review (completed at write time)

- **Spec coverage:** entry/exit + affordances (T3/T4), world/letters/props (T5/T7/T8), arcade car + camera (T6), effects (T9), reduced motion + error handling + edge cases (T3 boundary/context-loss, T6 clamp, T10 checks), lazy loading (T3 + T10 proof), no-audio (nothing added), desktop-only gating (T3/T4/T10). Reset fade → implemented as `drive-flash` (T9).
- **Type consistency:** `telemetry` contract defined in T6 and consumed unchanged in T9; `register(init)(api)` defined in T7 and reused in T8; `TUNING` keys referenced in T6/T7/T9 all exist in T5's definition.
- **Placeholders:** none — every code step carries the actual code.
