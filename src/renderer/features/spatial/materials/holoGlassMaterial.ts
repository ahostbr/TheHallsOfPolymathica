import { PALETTE } from '../constants/palette'

export const holoGlassConfig = {
  transmission: 0.92,
  thickness: 0.05,
  roughness: 0.1,
  chromaticAberration: 0.05,
  color: '#0a2e3a',
  attenuationColor: PALETTE.glowPrimary,
  attenuationDistance: 2,
  backside: false,
} as const

export const holoGlassSelectedConfig = {
  ...holoGlassConfig,
  transmission: 0.85,
  chromaticAberration: 0.1,
  color: PALETTE.cardSelected,
  attenuationColor: PALETTE.glowAccent,
  attenuationDistance: 1.2,
} as const
