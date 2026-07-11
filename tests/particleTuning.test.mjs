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
