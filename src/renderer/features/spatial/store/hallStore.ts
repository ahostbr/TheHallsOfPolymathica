import { create } from 'zustand'
import type { Vector3Tuple } from 'three'
import { CAMERA_POSITION } from '../constants/layout'

export type NavigationDepth = 'hall' | 'alcove' | 'conversation'

export interface PolymathData {
  id: string
  name: string
  title: string | null
  color: string | null
  totalSessions: number
  ring: number
  index: number
}

export interface HallState {
  // Navigation
  depth: NavigationDepth
  activePolymathId: string | null
  previousDepth: NavigationDepth | null

  // Camera target (animated to)
  cameraTarget: Vector3Tuple
  cameraLookAt: Vector3Tuple

  // Polymaths data (loaded from DB)
  polymaths: PolymathData[]

  // Active terminal session
  activeSessionId: string | null

  // Conversations for active polymath
  conversations: ConversationData[]

  // Actions
  setPolymaths: (polymaths: PolymathData[]) => void
  navigateToAlcove: (polymathId: string, cameraPos: Vector3Tuple, lookAt: Vector3Tuple) => void
  navigateToHall: () => void
  enterConversation: (sessionId: string) => void
  exitConversation: () => void
  setConversations: (conversations: ConversationData[]) => void
  setActiveSessionId: (sessionId: string | null) => void
}

export interface ConversationData {
  id: number
  polymathId: string
  userPrompt: string
  fullResponse: string
  frameworkSections: Record<string, string> | null
  createdAt: string
}

export const useHallStore = create<HallState>((set) => ({
  depth: 'hall',
  activePolymathId: null,
  previousDepth: null,
  cameraTarget: CAMERA_POSITION,
  cameraLookAt: [0, 1.0, 0] as Vector3Tuple,
  polymaths: [],
  activeSessionId: null,
  conversations: [],

  setPolymaths: (polymaths) => set({ polymaths }),

  navigateToAlcove: (polymathId, cameraPos, lookAt) =>
    set((state) => ({
      depth: 'alcove',
      activePolymathId: polymathId,
      previousDepth: state.depth,
      cameraTarget: cameraPos,
      cameraLookAt: lookAt,
    })),

  navigateToHall: () =>
    set((state) => ({
      depth: 'hall',
      activePolymathId: null,
      previousDepth: state.depth,
      cameraTarget: CAMERA_POSITION,
      cameraLookAt: [0, 1.0, 0] as Vector3Tuple,
      activeSessionId: null,
    })),

  enterConversation: (sessionId) =>
    set((state) => ({
      depth: 'conversation',
      previousDepth: state.depth,
      activeSessionId: sessionId,
    })),

  exitConversation: () =>
    set((state) => ({
      depth: 'alcove',
      previousDepth: state.depth,
      activeSessionId: null,
    })),

  setConversations: (conversations) => set({ conversations }),

  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
}))
