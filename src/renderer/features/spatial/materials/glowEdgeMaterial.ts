import { LineBasicMaterial } from 'three'
import { PALETTE } from '../constants/palette'

export function createGlowEdgeMaterial(
  variant: 'hover' | 'selected' = 'hover',
): LineBasicMaterial {
  const isSelected = variant === 'selected'
  return new LineBasicMaterial({
    color: isSelected ? PALETTE.glowAccent : PALETTE.edgeGlow,
    transparent: true,
    opacity: isSelected ? 0.9 : 0.6,
    linewidth: 1,
  })
}

export function createIdleEdgeMaterial(): LineBasicMaterial {
  return new LineBasicMaterial({
    color: PALETTE.edgeGlow,
    transparent: true,
    opacity: 0.2,
    linewidth: 1,
  })
}
