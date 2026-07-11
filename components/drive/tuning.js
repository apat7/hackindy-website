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
  impactForceMin: 2500, // onContactForce threshold for shake/glint
};
