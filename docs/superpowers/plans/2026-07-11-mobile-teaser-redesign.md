# Mobile Teaser Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the HackIndy 2027 teaser work on phones — legible wordmark, zero text/car overlap, balanced single-screen layout, lighter GPU/network cost — while keeping desktop visually identical.

**Architecture:** `ComingSoon.js` becomes one flex column used by every breakpoint (spacer row for the wordmark → 2027 → contained car band `flex-1` → hint → headline → CTAs). The particle wordmark canvas stays a full-bleed background paint layer; a spacer row reserves its region so content rows can never overlap it or each other. Particle dot geometry moves into a pure, tested module. Mobile perf comes from a DPR cap, one-shot contact shadows, and a downsized HDR.

**Tech Stack:** Next 16 (App Router, JS), Tailwind v4, react-three-fiber v9 + drei v10, `node --test` for unit tests, Playwright (scratchpad-only install) for visual verification, Python venv + opencv-python-headless (scratchpad-only) for the HDR resize.

## Global Constraints

- Repo root for all commands and paths: `/Users/aooman/Documents/code/purdue/hack_indy/2027`
- Spec: `docs/superpowers/specs/2026-07-11-mobile-teaser-redesign-design.md` — desktop (≥640px) must end up visually matching the pre-change baseline screenshots.
- Scratchpad (never commit anything from here): `/private/tmp/claude-501/-Users-aooman-Documents-code-purdue-hack-indy/320ad9b5-e051-4fee-a6f1-18a43f791a34/scratchpad` — referred to as `$SCRATCH` below; define it in your shell before use.
- Do NOT touch `components/drive/**` or `components/livery.js`.
- Do NOT add dependencies to `package.json` — Playwright and Python deps live only in `$SCRATCH`.
- Per repo AGENTS.md: this Next version has breaking changes — if you find yourself touching any Next-specific API (routing, metadata, `next/dynamic`, etc.), read the matching guide in `node_modules/next/dist/docs/` first. The tasks below only touch client components and CSS.
- Values marked `TUNE` are starting points; Task 6 adjusts them against screenshots. Everything else is exact.
- The dev server may already be running on `localhost:3000` (check before starting another).

---

### Task 1: Baseline screenshots + screenshot harness

**Files:**
- Create: `$SCRATCH/shots/shoot.mjs` (scratchpad only, not committed)
- Create: `$SCRATCH/shots/baseline-desktop.png`, `$SCRATCH/shots/baseline-phone.png`

**Interfaces:**
- Produces: `node $SCRATCH/shots/shoot.mjs <width> <height> <outfile>` — screenshots `http://localhost:3000` at the given viewport with reduced motion (settled particles, static car). Tasks 5 and 6 reuse it verbatim.

- [ ] **Step 1: Ensure the dev server is up**

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027
curl -sf http://localhost:3000 > /dev/null && echo RUNNING || echo DOWN
```

If `DOWN`, start it in the background (`npm run dev`, wait for "Ready", re-check with curl).

- [ ] **Step 2: Install Playwright in the scratchpad**

```bash
SCRATCH=/private/tmp/claude-501/-Users-aooman-Documents-code-purdue-hack-indy/320ad9b5-e051-4fee-a6f1-18a43f791a34/scratchpad
mkdir -p "$SCRATCH/shots" && cd "$SCRATCH/shots"
npm init -y && npm i playwright && npx playwright install chromium
```

Expected: chromium downloads without error.

- [ ] **Step 3: Write the screenshot script**

Create `$SCRATCH/shots/shoot.mjs`:

```js
// Usage: node shoot.mjs <width> <height> <outfile>
// Reduced motion => anim-rise settles instantly, particles draw at home
// positions, autorotate is off — frames are deterministic.
import { chromium } from "playwright";

const [width, height, outfile] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
});
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(4000); // glb + HDR decode on software WebGL
await page.screenshot({ path: outfile });
await browser.close();
```

- [ ] **Step 4: Capture baselines**

```bash
cd "$SCRATCH/shots"
node shoot.mjs 1440 900 baseline-desktop.png
node shoot.mjs 390 844 baseline-phone.png
```

- [ ] **Step 5: Verify the baselines**

Read both PNGs (as images). Expected: desktop shows the current good layout (wordmark dots, 2027, car, chrome); phone shows the known-broken state (faint noise wordmark, text on car). If the car is missing, raise the timeout to 8000 and re-shoot.

No commit — scratchpad artifacts only.

---

### Task 2: Particle tuning module (TDD) + wire into ParticleText

**Files:**
- Create: `components/particleTuning.js`
- Test: `tests/particleTuning.test.mjs`
- Modify: `components/ParticleText.js:86-102`

**Interfaces:**
- Produces: `sampleStep(fontSize) -> integer ≥ 3`; `dotRadius(step, rand) -> number` (px); `shimmerAmp(step, rand) -> number` (px). `rand` is a 0..1 float supplied by the caller.

- [ ] **Step 1: Write the failing test**

Create `tests/particleTuning.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  sampleStep,
  dotRadius,
  shimmerAmp,
} from "../components/particleTuning.js";

const close = (a, b) => Math.abs(a - b) < 1e-9;

test("sampleStep keeps desktop grid, densifies small text", () => {
  assert.equal(sampleStep(300), 8); // desktop single line — unchanged
  assert.equal(sampleStep(99), 3); // phone two-line — was 4, now denser
  assert.equal(sampleStep(38), 3); // floor drops 4 -> 3
});

test("dotRadius matches old desktop values, floors tiny dots", () => {
  assert.ok(close(dotRadius(8, 0), 0.72)); // old formula lower bound
  assert.ok(close(dotRadius(8, 1), 1.44)); // old formula upper bound
  assert.ok(close(dotRadius(3, 0), 0.55)); // 0.27 floored — visible on phone
  assert.ok(close(dotRadius(3, 1), 0.55)); // 0.54 floored
});

test("shimmerAmp scales with grid so small text stays legible", () => {
  assert.ok(close(shimmerAmp(8, 0), 2.24)); // ~today's 2.2 desktop floor
  assert.ok(close(shimmerAmp(8, 1), 5.28)); // ~today's 5.2 desktop ceiling
  assert.ok(close(shimmerAmp(3, 0), 0.84)); // phone: was 2.2 on 100px text
  assert.ok(close(shimmerAmp(3, 1), 1.98)); // phone: was 5.2 — noise
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../components/particleTuning.js'` (carPhysics suite still passes).

- [ ] **Step 3: Write the implementation**

Create `components/particleTuning.js`:

```js
// Pure geometry knobs for the particle wordmark, sized off the sampled text
// grid so the mark stays crisp at phone font sizes and pixel-identical at
// desktop sizes. Tested in tests/particleTuning.test.mjs.

export function sampleStep(fontSize) {
  return Math.max(3, Math.round(fontSize / 38));
}

export function dotRadius(step, rand) {
  return Math.max(0.55, step * (0.09 + rand * 0.09));
}

export function shimmerAmp(step, rand) {
  return step * (0.28 + rand * 0.38);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all suites).

- [ ] **Step 5: Wire into ParticleText**

In `components/ParticleText.js`, add the import at the top (after the existing import):

```js
import { sampleStep, dotRadius, shimmerAmp } from "./particleTuning";
```

Then in `build()`, replace:

```js
      // finer sampling grid = denser, smaller dots (r scales with step)
      const step = Math.max(4, Math.round(fontSize / 38));
```

with:

```js
      // finer sampling grid = denser, smaller dots (r scales with step)
      const step = sampleStep(fontSize);
```

and inside the particle object literal, replace:

```js
              r: step * (0.09 + Math.random() * 0.09),
```

with:

```js
              r: dotRadius(step, Math.random()),
```

and replace:

```js
              amp: 2.2 + Math.random() * 3,
```

with:

```js
              amp: shimmerAmp(step, Math.random()),
```

- [ ] **Step 6: Lint and commit**

```bash
npm run lint && npm test
git add components/particleTuning.js components/ParticleText.js tests/particleTuning.test.mjs
git commit -m "fix: scale wordmark particle size and shimmer with text size

Phone-width wordmarks sampled at step 4 produced 0.4-0.7px dots with a
fixed 2.2-5.2px idle wander, dissolving the mark into noise. Dot radius
and shimmer amplitude now scale with the sampling grid (desktop values
unchanged), and small text samples a denser grid.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: ComingSoon flow-column refactor + CSS (badge, compact CTAs, active states)

**Files:**
- Modify: `components/ComingSoon.js:82-193` (the `ComingSoon` component's JSX)
- Modify: `app/globals.css:44-50` (mlh media query) and additions after line 113

**Interfaces:**
- Consumes: existing `ParticleText`, `IndyCarCanvas`, `UpdateMe`, `CopyEmailButton`, `useMediaQuery` — signatures unchanged.
- Produces: the flow-column layout Tasks 4–6 verify. No API changes.

- [ ] **Step 1: Replace the ComingSoon JSX**

In `components/ComingSoon.js`, replace the entire `return (...)` of `ComingSoon` (the `<main>...</main>`) with:

```jsx
  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-coal text-chalk select-none">
      {/* MLH trust badge — official embed, must hang from the top edge.
          Hidden below 640px (owner-accepted deviation from MLH placement). */}
      <a
        id="mlh-trust-badge"
        className="mlh-badge"
        href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2027-season&utm_content=white"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://s3.amazonaws.com/logged-assets/trust-badge/2027/mlh-trust-badge-2027-white.svg"
          alt="Major League Hacking 2027 Hackathon Season"
          style={{ width: "100%" }}
        />
      </a>

      {/* background paint layer — full-bleed particle canvas; the spacer row
          below reserves the region where the wordmark text lands */}
      {!covered && (
        <ParticleText
          text="HACK INDY"
          centerY={0.24}
          className="font-display pointer-events-none absolute inset-0 z-0 h-full w-full"
        />
      )}

      {covered ? (
        <div className="flex-1" />
      ) : (
        <>
          {/* spacer matching the wordmark text region (paired with centerY) */}
          <div aria-hidden="true" className="h-[33dvh] flex-none sm:h-[31dvh]" />

          <div
            aria-hidden="true"
            className="anim-rise z-[1] flex flex-none justify-center"
            style={{ animationDelay: "0.5s" }}
          >
            <span
              className="font-display font-bold leading-none text-chalk"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
                letterSpacing: "0.28em",
                textIndent: "0.28em",
              }}
            >
              2027
            </span>
          </div>

          {/* the car, contained in its own band — text below can't overlap it */}
          <IndyCarCanvas
            className="anim-rise z-10 min-h-0 w-full flex-1"
            onEnterDrive={canDrive ? enterDrive : undefined}
          />
        </>
      )}

      {/* chrome — flows after the car band */}
      <div
        className="z-20 flex flex-none flex-col items-center font-mono"
        style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom))" }}
      >
        <p
          className="anim-rise mb-6 text-center text-[0.6rem] tracking-[0.5em] text-steel"
          style={{ animationDelay: "1.4s", textIndent: "0.5em" }}
        >
          {finePointer
            ? `DRAG TO INSPECT${canDrive ? " · CLICK TO DRIVE" : ""}`
            : "TOUCH TO SPIN"}
        </p>

        <div className="anim-rise text-center" style={{ animationDelay: "0.7s" }}>
          <h1 className="font-display text-2xl font-bold tracking-[0.18em] text-chalk sm:text-3xl">
            COMING SOON
          </h1>
          <p className="mt-2 text-[0.65rem] tracking-[0.35em] text-steel">
            SPRING 2027 · INDIANAPOLIS, IN
          </p>
        </div>

        <nav
          className="anim-rise mt-6 grid w-full max-w-xs grid-cols-2 gap-3 px-6 sm:mt-7 sm:flex sm:w-auto sm:max-w-none sm:gap-4 sm:px-0"
          style={{ animationDelay: "0.85s" }}
          aria-label="Primary"
        >
          <div className="col-span-2 flex justify-center sm:order-2 sm:col-auto">
            <UpdateMe />
          </div>
          <a href="/2026" className="btn-plate sm:order-1">
            <span>2026 SEASON</span>
          </a>
          <CopyEmailButton />
        </nav>
      </div>

      {/* the drive world */}
      {driving && (
        <DriveBoundary onExit={exitDrive}>
          <DriveMode
            onExit={exitDrive}
            onCovered={() => setCovered(true)}
            reduceMotion={reduceMotion}
          />
        </DriveBoundary>
      )}
    </main>
  );
```

Notes on what changed (for the reviewer):
- Layout notes: `TUNE h-[33dvh] sm:h-[31dvh]` (spacer mirrors the old `top-[33%]`/`sm:top-[31%]` year offsets). `pointer-events-none/auto` juggling is gone — rows no longer overlap, so buttons need no rescue. The old full-height layer-3 wrapper and its `flex-1` spacer are gone; `{covered && <div className="flex-1" />}` keeps the footer pinned while the drive world covers the teaser.
- In `CopyEmailButton` (same file, line 62), change the button's className from `"btn-plate pointer-events-auto sm:order-3"` to `"btn-plate sm:order-3"`.
- In `UpdateMe.js` nothing changes (its `pointer-events-auto` classes are harmless).

- [ ] **Step 2: CSS — hide badge on phones, compact plates, active states**

In `app/globals.css`, replace lines 44–50 (the existing `@media (max-width: 640px) { .mlh-badge {...} }` block) with:

```css
@media (width < 640px) {
  /* owner call (2026-07-11): badge off on phones — see mobile redesign spec */
  .mlh-badge {
    display: none;
  }

  /* compact plates: fill the CTA grid instead of forcing 13rem columns */
  .btn-plate {
    width: 100%;
  }

  .btn-plate > span {
    width: 100%;
    min-width: 0;
    padding: 0.9rem 0.5rem;
    font-size: 0.68rem;
  }

  .btn-plate--form input {
    max-width: 48vw;
  }
}
```

Then, directly after the `.btn-plate--solid:hover` rule (line 110–113), add tap feedback:

```css
/* touch feedback — mirror the hover fill on press */
.btn-plate:active > span {
  background: var(--color-gold);
  color: var(--color-coal);
}

.btn-plate--solid:active > span {
  background: #e6d8b4;
}
```

- [ ] **Step 3: Visual smoke check**

```bash
cd "$SCRATCH/shots"
node shoot.mjs 390 844 task3-phone.png
node shoot.mjs 1440 900 task3-desktop.png
```

Read both images. Expected on phone: wordmark crisp and readable, 2027 below it, car alone in its band, hint/headline below the car (no overlap), UPDATE ME full-width with 2026 + CONTACT side by side, no MLH badge, hint reads TOUCH TO SPIN (Playwright device emulation isn't coarse-pointer here, so DRAG TO INSPECT is acceptable in the shot — verify the copy branch by grep instead). Expected on desktop: composition closely matches `baseline-desktop.png` (wordmark/2027/car positions within a few px; car may sit slightly lower/cropped — Task 4's rig and Task 6 tuning address the car band).

- [ ] **Step 4: Tests, lint, commit**

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027
npm test && npm run lint
git add components/ComingSoon.js app/globals.css
git commit -m "feat: unified flow-column teaser layout

One flex column for every breakpoint: wordmark spacer, 2027, contained
car band, then hint/headline/CTAs — content rows can no longer overlap
on any screen height. Phone gets compact full-width plates, touch copy,
tap feedback, safe-area padding, and no MLH badge (owner-accepted).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Car canvas — band-aware camera + mobile GPU trims

**Files:**
- Modify: `components/IndyCarCanvas.js:116-168` (`CameraRig` and `IndyCarCanvas`)

**Interfaces:**
- Consumes: `useMediaQuery("(pointer: coarse)")` from `components/useMediaQuery.js`.
- Produces: `IndyCarCanvas` public props unchanged (`className`, `onEnterDrive`).

- [ ] **Step 1: Update CameraRig for band aspects**

The canvas now lives in a short, wide band (aspect ~2.4 on phones, ~5+ on desktop) instead of the full viewport. Replace the `camera.fov` line in `CameraRig`:

```js
    camera.fov = aspect < 0.8 ? 46 : aspect < 1.4 ? 31 : 25;
```

with:

```js
    // contained band: the wider (shorter) the band, the more we zoom out so
    // the car's rear wing clears the top edge while auto-rotating
    camera.fov = aspect < 0.8 ? 46 : aspect < 1.4 ? 31 : aspect < 3.2 ? 34 : 30; // TUNE
```

- [ ] **Step 2: DPR cap and one-shot shadows on coarse pointers**

In `IndyCarCanvas`, add below the `reduceMotion` line:

```js
  const coarsePointer = useMediaQuery("(pointer: coarse)");
```

Change the `<Canvas>` `dpr` prop from `dpr={[1, 2]}` to:

```js
        dpr={coarsePointer ? [1, 1.5] : [1, 2]}
```

Change `<ContactShadows ... />` to bake once on touch devices (the easter-egg
lap that moves the car is gated on the desktop-only click handler, so the
shadow never goes stale there):

```jsx
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={9}
          blur={2.6}
          far={1.4}
          frames={coarsePointer ? 1 : Infinity}
        />
```

- [ ] **Step 3: Visual smoke check**

```bash
cd "$SCRATCH/shots"
node shoot.mjs 1440 900 task4-desktop.png
node shoot.mjs 390 844 task4-phone.png
```

Read both. Expected: car fully inside its band on both (nose, rear wing, and contact shadow visible, nothing clipped by the band edges); desktop car size close to `baseline-desktop.png`. If clipped or noticeably smaller than baseline, adjust the two new fov values (`34`/`30`) by ±3 and re-shoot — record the final values.

- [ ] **Step 4: Tests, lint, commit**

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027
npm test && npm run lint
git add components/IndyCarCanvas.js
git commit -m "perf: band-aware car framing, mobile DPR cap, one-shot shadows

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Downsize night_sky.hdr

**Files:**
- Modify: `public/night_sky.hdr` (6.8MB → target ≤ ~500KB)
- Create: `$SCRATCH/hdr/resize.py` (scratchpad only)

**Interfaces:**
- Consumes: nothing from other tasks (independent of Tasks 2–4).
- Produces: smaller `public/night_sky.hdr`, same filename — no code changes anywhere.

- [ ] **Step 1: Set up the scratchpad venv**

```bash
SCRATCH=/private/tmp/claude-501/-Users-aooman-Documents-code-purdue-hack-indy/320ad9b5-e051-4fee-a6f1-18a43f791a34/scratchpad
mkdir -p "$SCRATCH/hdr"
python3 -m venv "$SCRATCH/hdr/venv"
"$SCRATCH/hdr/venv/bin/pip" install opencv-python-headless numpy
```

- [ ] **Step 2: Write the resize script**

Create `$SCRATCH/hdr/resize.py`:

```python
# Downsize a Radiance .hdr equirect. OpenCV reads/writes RGBE (RLE) natively.
import sys
import cv2

src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
if img is None:
    sys.exit(f"could not read {src}")
h, w = img.shape[:2]
print(f"in : {w}x{h}")
out = cv2.resize(img, (width, width // 2), interpolation=cv2.INTER_AREA)
ok = cv2.imwrite(dst, out)
if not ok:
    sys.exit("write failed")
print(f"out: {width}x{width // 2} -> {dst}")
```

- [ ] **Step 3: Back up and resize**

```bash
cp /Users/aooman/Documents/code/purdue/hack_indy/2027/public/night_sky.hdr "$SCRATCH/hdr/night_sky.orig.hdr"
"$SCRATCH/hdr/venv/bin/python" "$SCRATCH/hdr/resize.py" \
  "$SCRATCH/hdr/night_sky.orig.hdr" \
  /Users/aooman/Documents/code/purdue/hack_indy/2027/public/night_sky.hdr \
  1024
ls -la /Users/aooman/Documents/code/purdue/hack_indy/2027/public/night_sky.hdr
```

Expected: new file well under 1MB. If it's over ~700KB, re-run with width `512`.

- [ ] **Step 4: Verify the gloss survives**

```bash
cd "$SCRATCH/shots"
node shoot.mjs 1440 900 task5-desktop.png
```

Read `task5-desktop.png` next to `task4-desktop.png` (or `baseline-desktop.png`). Expected: car reflections/gloss visually indistinguishable. If the car's finish is visibly flatter or banded, retry at width `2048`; if still degraded, restore the original (`cp "$SCRATCH/hdr/night_sky.orig.hdr" public/night_sky.hdr`), and instead serve the 1024 file only to coarse pointers as `public/night_sky_1k.hdr` via `<Environment files={coarsePointer ? "/night_sky_1k.hdr" : "/night_sky.hdr"} />` in `IndyCarCanvas` (then commit both files and that change).

- [ ] **Step 5: Commit**

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027
git add public/night_sky.hdr
git commit -m "perf: downsize night_sky.hdr env map (6.8MB -> ~0.4MB)

Reflections on the gloss car are its only consumer; a 1k equirect is
visually indistinguishable there.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Full verification + tuning pass

**Files:**
- Possibly modify (tuning only): spacer classes in `components/ComingSoon.js`, fov values in `components/IndyCarCanvas.js`

**Interfaces:**
- Consumes: `shoot.mjs` from Task 1; all prior tasks landed.

- [ ] **Step 1: Fresh screenshots**

```bash
cd "$SCRATCH/shots"
node shoot.mjs 1440 900 final-desktop.png
node shoot.mjs 390 844 final-phone.png
node shoot.mjs 390 660 final-phone-short.png   # small-viewport stress (SE-ish)
```

- [ ] **Step 2: Compare against baseline and the spec checklist**

Read `final-desktop.png` vs `baseline-desktop.png`: wordmark size/position, 2027 position, car size/position, chrome — must visually match (minor few-px shifts fine).

Read `final-phone.png` and `final-phone-short.png` against the spec: wordmark legible; no text over the car; car fully in band; UPDATE ME + compact pair; no MLH badge; no dead-space slab at the bottom; nothing clipped at 660px height.

- [ ] **Step 3: Tune if needed**

Allowed knobs, one at a time, re-shooting after each: spacer `h-[33dvh]`/`sm:h-[31dvh]` (±4dvh), CameraRig band fovs `34`/`30` (±4), hint/headline margins (`mb-6`, `mt-6`) on phones. If desktop drifts from baseline, bias the `sm:` values back toward the original numbers.

- [ ] **Step 4: Interaction checks (desktop, real browser)**

Ask the human to (or use browser tooling if available): drag-orbit the car, click it — drive mode must still enter and exit; submit UPDATE ME with a test email; hover a plate (gold fill). On a phone (or DevTools device mode): touch-orbit works, page doesn't scroll, buttons give pressed feedback, hint says TOUCH TO SPIN.

- [ ] **Step 5: Suite, lint, final commit**

```bash
cd /Users/aooman/Documents/code/purdue/hack_indy/2027
npm test && npm run lint
git add -A && git status --short   # expect only tuned files, if any
git commit -m "chore: tune teaser band sizes from screenshot verification

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Skip the commit if Step 3 changed nothing.)
