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
  assert.ok(s.speed > T.maxSpeed * 0.85, `speed ${s.speed}`);
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
  assert.ok(s.speed >= -T.maxReverse - 0.01, `reverse speed ${s.speed}`);
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
  assert.ok(
    slid.slip > gripped.slip * 1.5,
    `slid ${slid.slip} vs gripped ${gripped.slip}`
  );
});

test("roughly framerate independent", () => {
  const a = run(createCarState(0, 0, 0), { throttle: 1, steer: 0.5 }, 4, 1 / 60);
  const b = run(createCarState(0, 0, 0), { throttle: 1, steer: 0.5 }, 4, 1 / 120);
  const dist = Math.hypot(a.x - b.x, a.z - b.z);
  assert.ok(dist < 3, `positions diverge by ${dist}m`);
});
