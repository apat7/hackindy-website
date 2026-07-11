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
