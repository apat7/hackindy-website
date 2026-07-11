# HackIndy Drive Mode — Design Spec

**Date:** 2026-07-10
**Status:** Approved direction, pre-implementation

## Summary

Turn the teaser page's IndyCar into a driveable arcade minigame. Clicking the car
launches it off-screen (reusing the existing lap easter-egg animation) and drops the
visitor into a full-screen physics world where the homepage itself is the map: giant
HACK INDY block letters, a 2027, the pit-board buttons, and race props — all physical
objects the car can smash, nudge, and send flying. Arcade handling with handbrake
drifts, donuts, tire smoke, and skid marks.

Reference feel: lab.patrickheintzmann.com demoFormula (drive mode only — no kit/studio
features).

## Decisions already made

- **Desktop/keyboard only.** No touch controls in v1. On coarse-pointer devices the
  entry affordances are hidden and the teaser behaves exactly as today.
- **World contents: full homepage recreation.** Letters + 2027 + physical pit-board
  slabs + cones and tire stacks.
- **Physics: arcade kinematic car.** Rapier simulates the world objects; the car is a
  kinematic body driven by a hand-tuned arcade model. The car never flips or gets
  stuck; letters still react with real momentum.
- **No audio in v1.** Autoplay policy headaches and asset work; clean add later.
- **Integration over chrome.** No third button in the bottom nav. The car is the
  button.

## Entry & exit

**Affordances (desktop, fine pointer only):**

- The existing hint line under the car reads `DRAG TO INSPECT · CLICK TO DRIVE`.
- After ~4s idle, a mini chamfered pit-board tag ("TAKE IT FOR A SPIN") slides in
  near the car — same `btn-plate` visual language, positioned by the car rather than
  in the nav row. Clicking it or the car enters drive mode.
- Hovering the car sets `cursor: pointer`.

**Click vs drag:** OrbitControls owns dragging. A click counts as entry only if
pointer-down → pointer-up moves less than a small threshold (~6px) — otherwise it's a
rotate. The old double-click lap easter egg is absorbed: the lap-out animation *is*
the entry transition.

**Transition in:** click → car swings its nose out and launches off screen-left
(existing `startLap` first phase) → full-screen overlay fades in with the five-light
start gantry → Rapier WASM + drive components lazy-load behind it → lights go out one
by one as loading completes → world revealed, car rolls in from off-screen with
momentum. If loading beats the animation, lights still play a fast (~1s) out sequence.

**Transition out:** `ESC` key or a "BACK TO THE PITS" plate (top corner) → overlay
fades → teaser page exactly as it was (car parked on its mark). Drive mode unmounts
fully; re-entry re-mounts with a fresh world.

**Reduced motion:** `prefers-reduced-motion` skips the lap-out launch and light
sequence (simple fade), and disables screen shake and particle effects in-world.
Drive mode itself remains available — it's explicitly opt-in.

## The world

- **Ground:** large fixed plane (~120×120 units), coal `#0B0A08` with Boilermaker
  Gold pit-lane markings, a start/finish checker strip, and faint grid texture —
  drawn procedurally (canvas texture or shader), no new image assets.
- **Walls:** invisible colliders at the perimeter; a low visible barrier (tire-wall
  strip or gold rumble line) signals the edge.
- **HACK INDY letters:** extruded 3D text in Saira Condensed (typeface JSON converted
  once from the Google font and committed to `public/`, rendered via `TextGeometry`). Each letter is a dynamic
  `RigidBody` with a convex-hull collider. Mass/damping tuned so a slow bump nudges,
  a full-speed hit sends it tumbling. Letters start asleep (zero physics cost until
  touched). Chalk-white faces with gold bevel accents to echo the wordmark.
- **2027:** same treatment, smaller, placed behind/near the letters.
- **Pit-board slabs:** physical versions of the three teaser buttons ("UPDATE ME",
  "2026 SEASON", "CONTACT US") as chamfered boxes with the plate styling. Dynamic
  bodies; purely decorative (no navigation on hit).
- **Props:** a handful of cones (cylinder colliders) and stacked tires (short
  cylinders) scattered for smash variety.
- **Reset:** `R` key and an on-screen control return every body to its spawn
  transform (teleport + zero velocities, brief fade so it doesn't pop).

## The car

- Reuses `public/indycar.glb`. The livery/material logic currently inside
  `IndyCarCanvas.js` (makeLivery, mesh-name classification, vent gilding) is
  extracted to a shared module `components/livery.js` used by both canvases.
  Classification stays keyed on **mesh names**, never material names (drei caches
  the scene; StrictMode re-runs traversals).
- Physics: `kinematicVelocityBased` RigidBody + single cuboid collider sized to the
  chassis.
- **Arcade model** (all constants in one `TUNING` object):
  - `W`/`↑` throttle, `S`/`↓` brake then reverse.
  - `A`/`D` steering; steering angle scales down with speed for stability.
  - Lateral velocity is blended toward the heading each frame (grip). A drift
    factor lowers grip during handbrake or hard high-speed cornering — this is
    what makes donuts/slides work.
  - `Space` handbrake: kills rear grip, mild speed scrub.
  - Burnout: throttle + brake from standstill spins rear wheels in place, smoke
    without movement.
- Visuals: wheels spin proportional to speed; front wheels yaw with steering input;
  the glb's built-in `Rim_Alpha` blur discs fade in above a speed threshold; slight
  chassis roll/pitch lean from lateral/longitudinal acceleration (visual only).

## Feel & effects

- **Chase camera:** follows a point behind/above the car with lerped position and
  look-at, slight yaw lag so it swings in corners, FOV eases up with speed. Small
  screen-shake impulse on hard letter impacts (disabled under reduced motion).
- **Tire smoke:** instanced billboard puffs emitted at rear-wheel contact points when
  slip exceeds a threshold or during burnout. Pooled/capped (~200 particles).
- **Skid marks:** dark quad-strip trails laid at rear wheel contacts while sliding;
  ring buffer capped (~500 segments), oldest fade out.
- **Impact feedback:** letters flash a subtle gold rim glint on hard hits (cheap
  emissive pulse).

## Code structure

```
components/
  livery.js              — extracted shared livery (materials + mesh classification)
  IndyCarCanvas.js       — teaser canvas; + click-to-enter affordances
  drive/
    DriveMode.js         — full-screen overlay: Canvas, Physics world, HUD, loading lights
    DriveCar.js          — car rig: kinematic body, arcade controller, wheel visuals
    DriveWorld.js        — ground, walls, letters, slabs, props, reset logic
    LetterBodies.js      — TextGeometry letters as rigid bodies
    Effects.js           — smoke particles + skid marks
    useDriveControls.js  — keyboard state hook (WASD/arrows/space/R/ESC)
    tuning.js            — every feel constant in one place
public/
  saira-condensed-bold.typeface.json   — generated once from the Google font
```

- **Lazy loading:** `DriveMode` is imported with `next/dynamic` (`ssr: false`) only
  when entry is triggered. `@react-three/rapier` and the typeface JSON ride in that
  chunk. The teaser bundle is unchanged for visitors who never click.
- **New dependency:** `@react-three/rapier` (must be compatible with three 0.184 /
  R3F v9 — verify version at install).
- **State:** `ComingSoon` holds a `driving` boolean; entry callback passed to
  `IndyCarCanvas`. No route change.

## Error handling & edge cases

- Rapier chunk fails to load → lights gantry shows a brief "PIT LANE CLOSED" message,
  auto-returns to the teaser.
- WebGL context loss in drive mode → return to teaser (same path as ESC).
- Coarse pointer / no keyboard → affordances hidden entirely (media query
  `(pointer: fine)` + hover capability check).
- Car escapes bounds (shouldn't, but) → position clamped to world bounds each frame.
- Letters knocked out of bounds → caught by perimeter walls; floor is infinite plane
  so nothing falls through.

## Testing & verification

- Feel is tuned by driving, not unit tests: run dev server, iterate on `tuning.js`.
- Headless verification via Playwright screenshots with
  `page.emulateMedia({ reducedMotion: "reduce" })` (rAF runs slowly in software
  WebGL; reduced-motion shows settled states).
- Manual checklist: enter/exit round-trip, letters wake and tumble, drift + smoke +
  skids trigger, reset works, teaser unaffected on touch simulation, no console
  errors, teaser bundle size unchanged.

## Out of scope (v1)

Audio, mobile/touch controls, lap timing or scoring, multiplayer/ghosts, navigation
via driving into the physical buttons, damage/deformation.
