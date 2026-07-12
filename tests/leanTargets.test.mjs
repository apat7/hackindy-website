import test from "node:test";
import assert from "node:assert/strict";
import { leanTargets } from "../components/drive/carPhysics.js";
import { TUNING as T } from "../components/drive/tuning.js";

const close = (a, b) => Math.abs(a - b) < 1e-9;

test("gentle slip rolls the body into the turn, sign follows yawRate", () => {
  assert.ok(close(leanTargets({ slip: 2, yawRate: 1 }, { brake: 0, throttle: 0 }, T).roll, 2 * T.leanPerSlip));
  assert.ok(close(leanTargets({ slip: 2, yawRate: -1 }, { brake: 0, throttle: 0 }, T).roll, -2 * T.leanPerSlip));
  // straight-line slip (yawRate 0) keeps the historical positive-sign fallback
  assert.ok(close(leanTargets({ slip: 2, yawRate: 0 }, { brake: 0, throttle: 0 }, T).roll, 2 * T.leanPerSlip));
});

test("hard drifts clamp at leanMax so wheels stay above the floor", () => {
  // slip ~20 = full-speed handbrake drift; unclamped this was 0.3 rad and
  // sank the outer wheels through the ground plane
  assert.ok(close(leanTargets({ slip: 20, yawRate: 1 }, { brake: 0, throttle: 0 }, T).roll, T.leanMax));
  assert.ok(close(leanTargets({ slip: 20, yawRate: -1 }, { brake: 0, throttle: 0 }, T).roll, -T.leanMax));
});

test("pitch: brake dives, throttle squats, both cancel toward dive", () => {
  assert.ok(close(leanTargets({ slip: 0, yawRate: 0 }, { brake: 1, throttle: 0 }, T).pitch, T.pitchBrake));
  assert.ok(close(leanTargets({ slip: 0, yawRate: 0 }, { brake: 0, throttle: 1 }, T).pitch, -T.pitchThrottle));
  assert.ok(
    close(
      leanTargets({ slip: 0, yawRate: 0 }, { brake: 1, throttle: 1 }, T).pitch,
      T.pitchBrake - T.pitchThrottle
    )
  );
});
