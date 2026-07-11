// Every feel knob for drive mode lives here. Tune by driving, not by faith.
export const TUNING = {
  // engine & brakes (m/s, m/s²)
  maxSpeed: 32,
  maxReverse: 6,
  engineAccel: 26,
  brakeDecel: 42,
  reverseAccel: 8,
  drag: 0.045, // × |v| → aero decel
  rollingResist: 1.4,

  // steering
  steerRate: 3.6, // rad/s at full authority
  fullSteerSpeed: 3.5, // m/s at which steering reaches full authority
  steerFalloff: 0.012, // authority ÷ (1 + falloff·|v|)

  // grip (velocity-direction rotation toward heading, per second)
  grip: 6.5,
  driftGrip: 2.6, // handbrake: some slide, not a skating rink
  handbrakeDecel: 4,
  slipScrub: 0.5, // × |sin slip| × speed → sliding sideways burns speed

  // camera — fixed world-space offset from the car (follows position only)
  camOffset: [0, 9, 13],
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
  impactForceMin: 1200, // onContactForce threshold for shake/glint (calibrated: resting contacts ≈40, full-speed hits ≈5500)
};
