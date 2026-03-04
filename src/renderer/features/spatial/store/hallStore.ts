import { create } from 'zustand'
import type { Vector3Tuple } from 'three'
import {
  ROTUNDA_CAMERA_POS,
  ROTUNDA_CAMERA_LOOK,
  DEFAULT_FLIGHT_DURATION,
  WING_VIEW_DISTANCE,
} from '../constants/layout'
import type { WingId } from '../constants/wings'
import { WINGS } from '../constants/wings'

export type NavigationDepth = 'rotunda' | 'wing' | 'corridor' | 'alcove'

export interface PolymathData {
  id: string
  name: string
  title: string
  color: string
  totalSessions: number
  ring: number
  index: number
}

export interface ConversationData {
  id: number
  polymathId: string
  userPrompt: string
  fullResponse: string
  frameworkSections: Record<string, string> | null
  createdAt: string
}

interface HallState {
  // Navigation
  depth: NavigationDepth
  activeWing: WingId | null
  activePolymathId: string | null

  // Corridor flight
  corridorProgress: number
  corridorFlightDuration: number

  // Camera target (animated to)
  cameraTarget: Vector3Tuple
  cameraLookAt: Vector3Tuple

  // Polymaths data (loaded from DB)
  polymaths: PolymathData[]

  // Conversations for active polymath
  conversations: ConversationData[]

  // Active terminal session
  activeSessionId: string | null

  // Actions
  setPolymaths(polymaths: PolymathData[]): void
  navigateToWing(wingId: WingId): void
  navigateToPolymath(polymathId: string): void
  navigateToRotunda(): void
  exitCorridor(): void
  arriveAtAlcove(): void
  setCorridorProgress(t: number): void
  enterConversation(sessionId: string): void
  exitConversation(): void
  setConversations(conversations: ConversationData[]): void
  setActiveSessionId(sessionId: string | null): void
  setCorridorFlightDuration(seconds: number): void
}

export const useHallStore = create<HallState>((set, get) => ({
  depth: 'rotunda',
  activeWing: null,
  activePolymathId: null,
  corridorProgress: 0,
  corridorFlightDuration: DEFAULT_FLIGHT_DURATION,
  cameraTarget: ROTUNDA_CAMERA_POS,
  cameraLookAt: ROTUNDA_CAMERA_LOOK,
  polymaths: [],
  conversations: [],
  activeSessionId: null,

  setPolymaths: (polymaths) => set({ polymaths }),

  navigateToWing: (wingId) => {
    const wing = WINGS[wingId]
    // Camera moves toward archway, looking into it
    const dir = [wing.archPosition[0], 0, wing.archPosition[2]] as const
    const len = Math.sqrt(dir[0] ** 2 + dir[2] ** 2)
    const camDist = WING_VIEW_DISTANCE
    set({
      depth: 'wing',
      activeWing: wingId,
      activePolymathId: null,
      cameraTarget: [(dir[0] / len) * camDist, 1.5, (dir[2] / len) * camDist],
      cameraLookAt: [...wing.archPosition],
    })
  },

  navigateToPolymath: (polymathId) =>
    set({
      depth: 'corridor',
      activePolymathId: polymathId,
      corridorProgress: 0,
    }),

  navigateToRotunda: () =>
    set({
      depth: 'rotunda',
      activeWing: null,
      activePolymathId: null,
      activeSessionId: null,
      cameraTarget: ROTUNDA_CAMERA_POS,
      cameraLookAt: ROTUNDA_CAMERA_LOOK,
    }),

  exitCorridor: () => {
    const { activeWing } = get()
    if (activeWing) {
      get().navigateToWing(activeWing)
    } else {
      get().navigateToRotunda()
    }
    set({ activePolymathId: null, corridorProgress: 0 })
  },

  arriveAtAlcove: () => set({ depth: 'alcove' }),

  enterConversation: (sessionId) => set({ activeSessionId: sessionId }),

  exitConversation: () => {
    const { activeWing } = get()
    set({ activeSessionId: null, activePolymathId: null, corridorProgress: 0 })
    if (activeWing) {
      get().navigateToWing(activeWing)
    } else {
      get().navigateToRotunda()
    }
  },

  setCorridorProgress: (t) => set({ corridorProgress: t }),

  setConversations: (conversations) => set({ conversations }),

  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),

  setCorridorFlightDuration: (seconds) => set({ corridorFlightDuration: seconds }),
}))
