declare const __COMMIT_HASH__: string
declare const __BUILD_DATE__: string

interface PolymathicaApi {
  appInfo: {
    version: string
    commitHash: string
    buildDate: string
    electronVersion: string
    nodeVersion: string
    platform: string
  }

  pty: {
    create: (shell?: string, cwd?: string) => Promise<string>
    write: (sessionId: string, data: string) => void
    resize: (sessionId: string, cols: number, rows: number) => void
    kill: (sessionId: string) => void
    onData: (sessionId: string, callback: (data: string) => void) => () => void
    onExit: (sessionId: string, callback: (exitCode: number) => void) => () => void
    onFocus: (callback: (sessionId: string) => void) => () => void
  }

  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    isMaximized: () => Promise<boolean>
    onMaximizeChange: (callback: (maximized: boolean) => void) => () => void
    zoomIn: () => number
    zoomOut: () => number
    zoomReset: () => number
    getZoomLevel: () => number
    setZoomLevel: (level: number) => void
  }

  db: {
    getAllPolymaths: () => Promise<PolymathRow[]>
    getPolymath: (id: string) => Promise<PolymathRow | null>
    getConversations: (polymathId: string, limit?: number, offset?: number) => Promise<ConversationRow[]>
    getConversation: (id: number) => Promise<ConversationRow | null>
    createConversation: (data: {
      polymath_id: string
      user_prompt: string
      full_response: string
      framework_sections?: string
      rubric_scores?: string
      token_count?: number
      duration_ms?: number
    }) => Promise<number>
    addTag: (conversationId: number, tag: string) => Promise<void>
    getTagsForConversation: (conversationId: number) => Promise<string[]>
    searchConversations: (query: string) => Promise<ConversationRow[]>
    getPolymathStats: (polymathId: string) => Promise<{ total_sessions: number; last_session: string | null }>
  }

  settings: {
    load: () => Promise<unknown>
    save: (data: string) => Promise<void>
  }

  session: {
    spawn: (polymathId: string) => Promise<string>
    getAgentPath: (polymathId: string) => Promise<string>
  }

  corridor: {
    getContent: (polymathId: string) => Promise<CorridorContentData | null>
    getAllContent: () => Promise<Record<string, CorridorContentData>>
  }
}

interface CorridorContentData {
  name: string
  description: string
  color: string
  kernel: string
  identityTraits: string[]
  phases: { name: string; description: string }[]
  outputFormat: string
  decisionGates: string[]
  keyQuotes: string[]
}

interface PolymathRow {
  id: string
  name: string
  title: string | null
  agent_file: string
  portrait_path: string | null
  model_path: string | null
  color: string | null
  total_sessions: number
}

interface ConversationRow {
  id: number
  polymath_id: string
  user_prompt: string
  full_response: string
  framework_sections: string | null
  rubric_scores: string | null
  token_count: number | null
  duration_ms: number | null
  created_at: string
}

interface Window {
  api: PolymathicaApi
  __focusPtySession?: (sessionId: string) => void
}

declare module '*.glb' {
  const src: string
  export default src
}
