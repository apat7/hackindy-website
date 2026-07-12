// Pure arcade car model. No three.js, no react — unit-testable in node.
// Heading: forward = (sin yaw, cos yaw) in the xz-plane (matches the teaser).
//
// The core of the model is the standard arcade grip trick done right:
// each step, the velocity VECTOR is rotated toward the car's heading at the
// grip rate. Momentum is redirected, never created — sliding sideways keeps
// your speed (minus tire scrub) and hooking up converts it into forward
// motion for free, but nothing can pump energy into the car. The handbrake
// simply lowers the grip rate so the slide persists.

export function createCarState(x = 0, z = 0, yaw = 0) {
  return { x, z, yaw, vx: 0, vz: 0, speed: 0, slip: 0, yawRate: 0 };
}

// Cosmetic body-lean targets. Roll is clamped: slip reaches ~20 in a
// full-speed handbrake drift, and an unclamped roll about anything but the
// exact contact line would sink the outer wheels through the floor.
export function leanTargets(state, input, T) {
  const lateral = state.slip * Math.sign(state.yawRate || 1);
  const roll = Math.max(-T.leanMax, Math.min(T.leanMax, lateral * T.leanPerSlip));
  const pitch =
    (input.brake > 0 ? T.pitchBrake : 0) - (input.throttle > 0 ? T.pitchThrottle : 0);
  return { roll, pitch };
}

export function stepCar(state, input, dt, T) {
  const fx = Math.sin(state.yaw);
  const fz = Math.cos(state.yaw);
  let vx = state.vx;
  let vz = state.vz;
  let vF = vx * fx + vz * fz;

  // engine and brake act along the heading
  if (input.throttle > 0 && vF < T.maxSpeed) {
    const a = T.engineAccel * input.throttle * (1 - Math.max(vF, 0) / T.maxSpeed) * dt;
    vx += fx * a;
    vz += fz * a;
  }
  if (input.brake > 0) {
    if (vF > 0.25) {
      const a = Math.min(T.brakeDecel * input.brake * dt, vF); // brake to zero, not past it
      vx -= fx * a;
      vz -= fz * a;
    } else {
      const headroom = vF + T.maxReverse; // how much reverse speed is left
      const a = Math.min(T.reverseAccel * input.brake * dt, Math.max(headroom, 0));
      vx -= fx * a;
      vz -= fz * a;
    }
  }
  vF = vx * fx + vz * fz;
  let speed = Math.hypot(vx, vz);

  // steering authority ramps in with planar speed (mid-drift the velocity is
  // mostly lateral and the car must stay steerable) and falls off at the top
  // end. Steering only mirrors when deliberately reversing under brake — a
  // car sliding backwards mid-spin must still counter-steer normally.
  const authority =
    Math.min(speed / T.fullSteerSpeed, 1) / (1 + T.steerFalloff * speed);
  const reversing = vF < -0.5 && input.brake > 0;
  const yawRate = input.steer * T.steerRate * authority * (reversing ? -1 : 1);
  const yaw = state.yaw + yawRate * dt;

  const nfx = Math.sin(yaw);
  const nfz = Math.cos(yaw);
  let slip = 0;

  if (speed > 0.01) {
    const sign = vF >= 0 ? 1 : -1;
    const tx = nfx * sign; // where the tires want the velocity to point
    const tz = nfz * sign;
    const dx = vx / speed;
    const dz = vz / speed;
    const cross = Math.abs(dx * tz - dz * tx); // |sin(slip angle)|
    slip = cross * speed;

    // rotate the velocity direction toward the heading at the grip rate
    const grip = input.handbrake ? T.driftGrip : T.grip;
    const k = 1 - Math.exp(-grip * dt);
    let rx = dx + (tx - dx) * k;
    let rz = dz + (tz - dz) * k;
    const rlen = Math.hypot(rx, rz) || 1;
    rx /= rlen;
    rz /= rlen;

    // losses: rolling + aero, tire scrub while sliding, handbrake drag
    const decel =
      (T.rollingResist +
        T.drag * speed +
        T.slipScrub * cross * speed +
        (input.handbrake ? T.handbrakeDecel : 0)) *
      dt;
    speed = Math.max(0, speed - decel);
    vx = rx * speed;
    vz = rz * speed;
  } else {
    vx = 0;
    vz = 0;
    speed = 0;
  }

  return {
    x: state.x + vx * dt,
    z: state.z + vz * dt,
    yaw,
    vx,
    vz,
    speed: vx * nfx + vz * nfz, // signed forward component
    slip,
    yawRate,
  };
}
