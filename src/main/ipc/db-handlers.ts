import { ipcMain } from 'electron'
import {
  getAllPolymaths,
  getPolymath,
  getConversations,
  getConversation,
  createConversation,
  addTag,
  getTagsForConversation,
  searchConversations,
  getPolymathStats,
} from '../db/database'

export function registerDbHandlers(): void {
  ipcMain.handle('db:get-all-polymaths', () => {
    return getAllPolymaths()
  })

  ipcMain.handle('db:get-polymath', (_e, id: string) => {
    return getPolymath(id) ?? null
  })

  ipcMain.handle('db:get-conversations', (_e, polymathId: string, limit?: number, offset?: number) => {
    return getConversations(polymathId, limit, offset)
  })

  ipcMain.handle('db:get-conversation', (_e, id: number) => {
    return getConversation(id) ?? null
  })

  ipcMain.handle('db:create-conversation', (_e, data: {
    polymath_id: string
    user_prompt: string
    full_response: string
    framework_sections?: string
    rubric_scores?: string
    token_count?: number
    duration_ms?: number
  }) => {
    return createConversation(data)
  })

  ipcMain.handle('db:add-tag', (_e, conversationId: number, tag: string) => {
    addTag(conversationId, tag)
  })

  ipcMain.handle('db:get-tags', (_e, conversationId: number) => {
    return getTagsForConversation(conversationId)
  })

  ipcMain.handle('db:search-conversations', (_e, query: string) => {
    return searchConversations(query)
  })

  ipcMain.handle('db:get-polymath-stats', (_e, polymathId: string) => {
    return getPolymathStats(polymathId)
  })
}
