import { contextBridge, ipcRenderer, webFrame } from 'electron'

declare const __COMMIT_HASH__: string
declare const __BUILD_DATE__: string

const api = {
  appInfo: {
    version: '1.0.0',
    commitHash: __COMMIT_HASH__,
    buildDate: __BUILD_DATE__,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    platform: process.platform
  },

  pty: {
    create: (shell?: string, cwd?: string): Promise<string> =>
      ipcRenderer.invoke('pty:create', shell, cwd),
    write: (sessionId: string, data: string): void =>
      ipcRenderer.send('pty:write', sessionId, data),
    resize: (sessionId: string, cols: number, rows: number): void =>
      ipcRenderer.send('pty:resize', sessionId, cols, rows),
    kill: (sessionId: string): void =>
      ipcRenderer.send('pty:kill', sessionId),
    onData: (sessionId: string, callback: (data: string) => void): (() => void) => {
      const channel = `pty:data:${sessionId}`
      const handler = (_e: unknown, data: string) => callback(data)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },
    onExit: (sessionId: string, callback: (exitCode: number) => void): (() => void) => {
      const channel = `pty:exit:${sessionId}`
      const handler = (_e: unknown, exitCode: number) => callback(exitCode)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },
    onFocus: (callback: (sessionId: string) => void): (() => void) => {
      const handler = (_e: unknown, sessionId: string) => callback(sessionId)
      ipcRenderer.on('pty:focus', handler)
      return () => ipcRenderer.removeListener('pty:focus', handler)
    }
  },

  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    maximize: (): void => ipcRenderer.send('window:maximize'),
    close: (): void => ipcRenderer.send('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
    onMaximizeChange: (callback: (maximized: boolean) => void): (() => void) => {
      const handler = (_e: unknown, maximized: boolean) => callback(maximized)
      ipcRenderer.on('window:maximize-change', handler)
      return () => ipcRenderer.removeListener('window:maximize-change', handler)
    },
    zoomIn: (): number => { const l = webFrame.getZoomLevel() + 0.5; webFrame.setZoomLevel(l); return l },
    zoomOut: (): number => { const l = webFrame.getZoomLevel() - 0.5; webFrame.setZoomLevel(l); return l },
    zoomReset: (): number => { webFrame.setZoomLevel(0); return 0 },
    getZoomLevel: (): number => webFrame.getZoomLevel(),
    setZoomLevel: (level: number): void => { webFrame.setZoomLevel(level) },
  },

  db: {
    getAllPolymaths: (): Promise<unknown[]> =>
      ipcRenderer.invoke('db:get-all-polymaths'),
    getPolymath: (id: string): Promise<unknown> =>
      ipcRenderer.invoke('db:get-polymath', id),
    getConversations: (polymathId: string, limit?: number, offset?: number): Promise<unknown[]> =>
      ipcRenderer.invoke('db:get-conversations', polymathId, limit, offset),
    getConversation: (id: number): Promise<unknown> =>
      ipcRenderer.invoke('db:get-conversation', id),
    createConversation: (data: {
      polymath_id: string
      user_prompt: string
      full_response: string
      framework_sections?: string
      rubric_scores?: string
      token_count?: number
      duration_ms?: number
    }): Promise<number> =>
      ipcRenderer.invoke('db:create-conversation', data),
    addTag: (conversationId: number, tag: string): Promise<void> =>
      ipcRenderer.invoke('db:add-tag', conversationId, tag),
    getTagsForConversation: (conversationId: number): Promise<string[]> =>
      ipcRenderer.invoke('db:get-tags', conversationId),
    searchConversations: (query: string): Promise<unknown[]> =>
      ipcRenderer.invoke('db:search-conversations', query),
    getPolymathStats: (polymathId: string): Promise<{ total_sessions: number; last_session: string | null }> =>
      ipcRenderer.invoke('db:get-polymath-stats', polymathId),
  },

  settings: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke('settings:load'),
    save: (data: string): Promise<void> =>
      ipcRenderer.invoke('settings:save', data)
  },

  session: {
    spawn: (polymathId: string): Promise<string> =>
      ipcRenderer.invoke('session:spawn', polymathId),
  },

  corridor: {
    getContent: (polymathId: string) => ipcRenderer.invoke('corridor:get-content', polymathId),
    getAllContent: () => ipcRenderer.invoke('corridor:get-all-content'),
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
