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

  // steering authority ramps in with PLANAR speed (forward + lateral), not
  // just forward speed: mid-drift the velocity is mostly lateral and the car
  // must stay steerable without touching the throttle. Mirrors only when
  // solidly reversing.
  const planar = Math.hypot(vF, vL);
  const authority =
    Math.min(planar / T.fullSteerSpeed, 1) / (1 + T.steerFalloff * planar);
  const yawRate = input.steer * T.steerRate * authority * (vF < -0.5 ? -1 : 1);
  const yaw = state.yaw + yawRate * dt;

  // grip bleeds lateral velocity — but the tires hooking up should convert
  // that momentum into forward drive, not delete it, or every drift exit
  // feels dead until the throttle rebuilds speed from zero
  const grip = input.handbrake ? T.driftGrip : T.grip;
  const vLBefore = Math.abs(vL);
  vL *= Math.exp(-grip * dt);
  vF += (vLBefore - Math.abs(vL)) * T.slipTransfer * (vF < -0.5 ? -1 : 1);
  if (vF > T.maxSpeed) vF = T.maxSpeed;

  // reassemble against the OLD heading: the velocity vector must not rotate
  // with the car — next frame's decomposition against the new heading is what
  // turns heading change into lateral slip, which grip then bleeds into the
  // turn. Reassembling on the new heading would corner on rails (slip ≡ 0).
  const vx = fx * vF + fz * vL;
  const vz = fz * vF - fx * vL;

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
