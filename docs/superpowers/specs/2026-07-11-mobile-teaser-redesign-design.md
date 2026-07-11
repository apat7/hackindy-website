# Mobile teaser redesign — unified flow layout

**Date:** 2026-07-11
**Status:** Approved pending spec review
**Scope:** `components/ComingSoon.js`, `components/ParticleText.js`, `components/IndyCarCanvas.js`, `app/globals.css`, `public/night_sky.hdr`

## Problem

On phones the teaser breaks four ways (verified against an iPhone screenshot,
2026-07-11):

1. **Illegible wordmark.** `ParticleText` dot radius scales with the sampling
   `step` (`fontSize / 38`, floor 4). At phone widths the two-line wordmark
   font lands near ~100px, so dots bottom out at ~0.4–0.7px radius at 30–70%
   opacity. The idle shimmer amplitude (`amp` = 2.2–5.2px) is a fixed pixel
   value — proportionally huge on ~100px letters — so strokes dissolve into
   noise.
2. **Text/car overlap.** The car canvas is a full-screen absolute layer with
   the car vertically centered; the chrome layer stacks from the bottom. On
   tall portrait screens "DRAG TO INSPECT" lands on the nose and
   "SPRING 2027 · INDIANAPOLIS, IN" hides behind the nose cone.
3. **Unbalanced rhythm.** Cramped overlap mid-screen, dead space below the
   CONTACT US button, no safe-area padding.
4. **Desktop-flavored affordances.** Mouse copy ("DRAG"), hover-only button
   states, and heavy GPU/network cost (11MB glb + 6.8MB HDR + two always-on
   canvases).

## Decisions made during brainstorming

- Priorities: fix the broken items, rethink the portrait layout, trim
  performance. No new touch-only delight features.
- Phones stay a **single non-scrolling screen** (`h-dvh`, no scroll).
- The **3D car stays interactive on phones**; costs get trimmed (no
  tap-to-load, no static image swap).
- Chosen approach: **C — unified flow refactor.** One layout tree for all
  breakpoints; the absolute-layer composition is retired.
- **MLH badge is hidden on phones** (below the `sm` breakpoint). Flagged that
  MLH's placement guidelines don't carve out mobile; owner accepted the risk.
  Desktop badge unchanged.

## Design

### 1. Layout — one flow column, every breakpoint

`ComingSoon.js` renders a single flex column inside `main.h-dvh` (rows top to
bottom); no content layer uses absolute positioning anymore:

| Row | Phone (<640px) | Desktop (≥640px) |
| --- | --- | --- |
| Wordmark band (`ParticleText`) | ~26dvh tall, two lines | ~34dvh, single line |
| 2027 | flow element under wordmark (replaces `top: 33%`) | same |
| Car band (`IndyCarCanvas`) | `flex-1 min-h-0`, contained | same |
| Hint | "TOUCH TO SPIN" | "DRAG TO INSPECT · CLICK TO DRIVE" |
| Headline + sub | COMING SOON / SPRING 2027 · INDIANAPOLIS, IN | same |
| CTAs | UPDATE ME full-width primary; 2026 + CONTACT compact pair beneath | horizontal row, current order |
| Bottom padding | `max(1.5rem, env(safe-area-inset-bottom))` | current padding |

Band heights marked with `~` are starting values — tune them during visual
verification; the invariant is the row order and that rows never overlap.

- `ParticleText` already sizes text to its own canvas box and listens for the
  pointer on `window`, so containment preserves desktop interaction. Pass
  `centerY` ≈ 0.5 now that the band is dedicated.
- `IndyCarCanvas`'s `CameraRig` already derives FOV from canvas aspect, so the
  contained band re-frames automatically; tune FOV thresholds only if the car
  clips.
- The MLH badge keeps its `fixed` top-edge placement on desktop; add
  `display: none` below 640px.
- The `anim-rise` entrance stagger, drive-mode entry (desktop-only via
  `(pointer: fine)`), `DriveBoundary`, and `UpdateMe` form are unchanged.
- Drive mode's `onCovered` currently unmounts the teaser layers; the flow
  column must keep that behavior (unmount wordmark/year/car rows while
  covered).

### 2. Wordmark legibility (`ParticleText.js`)

Scale the particle geometry with the sampled grid so small wordmarks stay
crisp; desktop output stays visually identical:

- Sampling step: `Math.max(3, Math.round(fontSize / 38))` (floor 4 → 3) so
  ~100px text keeps near-desktop relative dot density.
- Dot radius: `Math.max(0.55, step * (0.09 + Math.random() * 0.09))` — floor
  keeps phone dots visible; desktop values (step 8 → 0.72–1.44px) unchanged.
- Shimmer amplitude: `step * (0.28 + Math.random() * 0.38)` — desktop step 8
  reproduces today's 2.2–5.3px; phone step 3 gives ~0.8–2.0px so strokes hold.

### 3. Performance trims

- `IndyCarCanvas` DPR cap: `[1, 1.5]` on coarse pointers, `[1, 2]` otherwise
  (reuse `useMediaQuery("(pointer: coarse)")`).
- `ContactShadows frames={1}` on coarse pointers — the car body never moves on
  phones (the easter-egg lap requires the desktop-only click handler), so the
  shadow can bake once.
- Downsize `public/night_sky.hdr` (6.8MB). Target ≤ ~500KB (1k equirect).
  Reflections on the gloss car are the only consumer; if a side-by-side
  desktop screenshot shows no visible difference, ship one downsized file for
  all devices — otherwise serve the small file to coarse pointers only.
- The contained wordmark band shrinks the per-frame 2D canvas work on phones
  as a side effect of the layout change.
- Out of scope: glb compression (meshopt/draco) — noted as a future follow-up.

### 4. Touch affordances

- Hint copy switches on `(pointer: coarse)` as per the layout table.
- `.btn-plate:active` mirrors the hover fill so taps give feedback.

## Error handling

No new failure modes. Existing `DriveBoundary`/`PitLaneClosed` path is
untouched. If the downsized HDR fails to load, drei's `Environment` behaves as
today (car renders without env reflections until loaded).

## Testing & verification

- `npm test` (carPhysics suite) must still pass — no drive-mode code changes
  expected.
- Headless before/after screenshots at 390×844 (phone) and 1440×900 (desktop)
  using the reduced-motion trick (per project memory) for stable frames.
  Verify: no text/car overlap at 390×844, wordmark legible, badge hidden
  <640px, safe-area padding present, desktop composition visually matches the
  pre-refactor screenshot.
- Manual desktop check: drag-to-orbit, click-to-drive still work; UPDATE ME
  form submits.
- Manual phone check (or DevTools device mode): touch-orbit works, buttons
  tappable, no scroll.
