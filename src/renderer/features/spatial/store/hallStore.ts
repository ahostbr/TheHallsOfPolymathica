import { create } from 'zustand'
import type { Vector3Tuple } from 'three'
import {
  ROTUNDA_CAMERA_POS,
  ROTUNDA_CAMERA_LOOK,
  DEFAULT_FLIGHT_DURATION,
  WING_VIEW_DISTANCE,
  CORRIDOR_LENGTH,
} from '../constants/layout'
import type { WingId } from '../constants/wings'
import { WINGS, getWingForPolymath } from '../constants/wings'

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

  // Terminal display
  terminalFocused: boolean
  terminalScale: number
  terminalWidth: number
  terminalHeight: number
  terminalY: number

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
  setTerminalFocused(focused: boolean): void
  setTerminalScale(scale: number): void
  setTerminalWidth(width: number): void
  setTerminalHeight(height: number): void
  setTerminalY(y: number): void
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
  terminalFocused: false,
  terminalScale: 0.19,
  terminalWidth: 1200,
  terminalHeight: 1000,
  terminalY: 2.5,

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
      cameraLookAt: [wing.archPosition[0], 3.5, wing.archPosition[2]],
    })
  },

  navigateToPolymath: (polymathId) =>
    set({
      depth: 'corridor',
      activePolymathId: polymathId,
      activeWing: getWingForPolymath(polymathId),
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

  arriveAtAlcove: () => {
    const { activeWing } = get()
    if (!activeWing) {
      set({ depth: 'alcove' })
      return
    }
    const wing = WINGS[activeWing]
    const len = Math.sqrt(wing.archPosition[0] ** 2 + wing.archPosition[2] ** 2)
    const dx = wing.archPosition[0] / len
    const dz = wing.archPosition[2] / len

    // Camera stays where spline ended
    const camDist = len + CORRIDOR_LENGTH - 8
    // Look at alcove wall a few units further
    const lookDist = len + CORRIDOR_LENGTH - 3

    set({
      depth: 'alcove',
      cameraTarget: [dx * camDist, 1.5, dz * camDist],
      cameraLookAt: [dx * lookDist, 1.5, dz * lookDist],
    })
  },

  enterConversation: (sessionId) => set({ activeSessionId: sessionId }),

  exitConversation: () => {
    const { activeWing } = get()
    set({ activeSessionId: null, activePolymathId: null, corridorProgress: 0, terminalFocused: false })
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

  setTerminalFocused: (focused) => set({ terminalFocused: focused }),
  setTerminalScale: (scale) => set({ terminalScale: scale }),
  setTerminalWidth: (width) => set({ terminalWidth: width }),
  setTerminalHeight: (height) => set({ terminalHeight: height }),
  setTerminalY: (y) => set({ terminalY: y }),
}))

// Expose store for Playwright e2e tests
if (typeof window !== 'undefined') {
  ;(window as any).__hallStore = useHallStore
}
