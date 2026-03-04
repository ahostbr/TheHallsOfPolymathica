import type { Vector3Tuple } from 'three'

export type WingId = 'reduction' | 'vision' | 'inversion' | 'resonance'

export interface WingDefinition {
  id: WingId
  name: string
  tagline: string
  color: string
  archPosition: Vector3Tuple
  archRotation: Vector3Tuple
  polymathIds: string[]
}

const R = 15

export const WINGS: Record<WingId, WingDefinition> = {
  reduction: {
    id: 'reduction',
    name: 'Hall of Reduction',
    tagline: 'Remove until the structure speaks for itself',
    color: '#00e5ff',
    archPosition: [0, 0, R],
    archRotation: [0, Math.PI, 0],
    polymathIds: ['feynman', 'carmack', 'shannon', 'rams', 'musk', 'linus'],
  },
  vision: {
    id: 'vision',
    name: 'Hall of Structural Vision',
    tagline: 'Build the complete model before you touch the world',
    color: '#FFD700',
    archPosition: [R, 0, 0],
    archRotation: [0, -Math.PI / 2, 0],
    polymathIds: ['tesla', 'davinci', 'lovelace', 'tao', 'munger', 'gates'],
  },
  inversion: {
    id: 'inversion',
    name: 'Hall of Inversion',
    tagline: 'Find freedom by first accepting what cannot be changed',
    color: '#E0E8FF',
    archPosition: [0, 0, -R],
    archRotation: [0, 0, 0],
    polymathIds: ['bezos', 'suntzu', 'thiel', 'disney', 'andreessen', 'aurelius'],
  },
  resonance: {
    id: 'resonance',
    name: 'Hall of Resonance',
    tagline: 'Signal is not real until it has landed in a receiver',
    color: '#FFAA44',
    archPosition: [-R, 0, 0],
    archRotation: [0, Math.PI / 2, 0],
    polymathIds: ['jobs', 'vangogh', 'ogilvy', 'godin', 'mrbeast', 'graham', 'socrates'],
  },
}

export const WING_LIST: WingId[] = ['reduction', 'vision', 'inversion', 'resonance']

export function getWingForPolymath(polymathId: string): WingId | null {
  for (const wing of WING_LIST) {
    if (WINGS[wing].polymathIds.includes(polymathId)) return wing
  }
  return null
}
