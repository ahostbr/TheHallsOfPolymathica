// Client-side polymath registry for renderer lookups
// Mirrors the seed data in src/main/polymath-seed.ts

export interface PolymathInfo {
  id: string
  name: string
  title: string
  color: string
  description: string
  frameworkSections: string[]
}

export const POLYMATH_FRAMEWORKS: Record<string, string[]> = {
  feynman: ['First Principles', 'The Freshman Test', 'Play', 'Verification'],
  carmack: ['Constraint Analysis', 'The Shortcut', 'Ship Plan', 'Verification'],
  shannon: ['Reduction', 'Invariant Structure', 'Signal', 'Noise Separation'],
  tao: ['Structured Exploration', 'Cross-Field Arbitrage', 'Decomposition'],
  davinci: ['Observation', 'Mechanism', 'Cross-Domain Analog', 'Synthesis'],
  lovelace: ['Operational Structure', 'Pattern Abstraction', 'Poetical Science'],
  vangogh: ['Emotional Truth', 'Color Language', 'Rule Breaking', 'Expression'],
  tesla: ['Mental Simulation', 'Systems Thinking', 'Complete Architecture'],
  jobs: ['Taste', 'Simplification', 'Reality Distortion', 'Intersection'],
  gates: ['Platform Analysis', 'Deep Reading', 'Atomic Decomposition'],
  linus: ['Good Taste', 'Working Code', 'Pragmatic Empiricism'],
  graham: ['Pattern Observation', 'Experiment', 'Essay Clarity'],
  bezos: ['Working Backwards', 'PR/FAQ', 'Door Analysis'],
  andreessen: ['Discontinuity', 'Pattern Synthesis', 'Conviction'],
  ogilvy: ['Research', 'Headline', 'Direct Response'],
  aurelius: ['Control Dichotomy', 'Premeditatio', 'Obstacle as Way', 'Reflection'],
  godin: ['Smallest Audience', 'Worldview', 'Permission', 'Remarkable'],
  thiel: ['Secrets', 'Zero to One', 'Monopoly', 'Contrarian Truth'],
  disney: ['Dream', 'Realize', 'Critique', 'Plus', 'Storyboard'],
  munger: ['Mental Models', 'Inversion', 'Lollapalooza', 'Checklist'],
  suntzu: ['Intelligence', 'Terrain', 'Strategy', 'Victory Without Fighting'],
  socrates: ['Examination', 'Maieutics', 'Aporia', 'Definition'],
  musk: ['Question Requirements', 'Delete', 'Simplify', 'Accelerate', 'Automate'],
  mrbeast: ['Attention', 'Retention', 'Variation Testing', 'Viral Mechanics'],
  rams: ['Less But Better', 'Function', 'Honesty', 'Principles'],
}
