export const PALETTE = {
  panelBase: '#0a1628',
  glowPrimary: '#00e5ff',
  glowSecondary: '#0088cc',
  glowAccent: '#00ff88',
  edgeGlow: '#00c8ff',
  textPrimary: '#e0f0ff',
  textSecondary: '#8899aa',
  scanlineColor: 'rgba(0, 229, 255, 0.03)',
  particleColor: '#00e5ff',
  sceneBackground: '#000508',
  cardHover: '#0d2a44',
  cardSelected: '#0f3355',
  danger: '#ff3366',
  warning: '#ffaa00',
} as const

export type PaletteKey = keyof typeof PALETTE
