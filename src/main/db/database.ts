import Database from 'better-sqlite3'
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dataDir = join(homedir(), '.polymathica')
  mkdirSync(dataDir, { recursive: true })

  const dbPath = join(dataDir, 'polymathica.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initSchema(db)
  return db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS polymaths (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      agent_file TEXT NOT NULL,
      portrait_path TEXT,
      model_path TEXT,
      color TEXT,
      total_sessions INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      polymath_id TEXT NOT NULL REFERENCES polymaths(id),
      user_prompt TEXT NOT NULL,
      full_response TEXT NOT NULL,
      framework_sections JSON,
      rubric_scores JSON,
      token_count INTEGER,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      tag TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_polymath ON conversations(polymath_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_tags_conversation ON tags(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
  `)
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

// --- CRUD Operations ---

export function getAllPolymaths(): unknown[] {
  return getDb().prepare('SELECT * FROM polymaths ORDER BY name').all()
}

export function getPolymath(id: string): unknown | undefined {
  return getDb().prepare('SELECT * FROM polymaths WHERE id = ?').get(id)
}

export function upsertPolymath(data: {
  id: string
  name: string
  title?: string
  agent_file: string
  portrait_path?: string
  model_path?: string
  color?: string
}): void {
  getDb().prepare(`
    INSERT INTO polymaths (id, name, title, agent_file, portrait_path, model_path, color)
    VALUES (@id, @name, @title, @agent_file, @portrait_path, @model_path, @color)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      title = COALESCE(@title, title),
      agent_file = @agent_file,
      portrait_path = COALESCE(@portrait_path, portrait_path),
      model_path = COALESCE(@model_path, model_path),
      color = COALESCE(@color, color)
  `).run({
    id: data.id,
    name: data.name,
    title: data.title ?? null,
    agent_file: data.agent_file,
    portrait_path: data.portrait_path ?? null,
    model_path: data.model_path ?? null,
    color: data.color ?? null,
  })
}

export function getConversations(polymathId: string, limit = 50, offset = 0): unknown[] {
  return getDb().prepare(
    'SELECT * FROM conversations WHERE polymath_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(polymathId, limit, offset)
}

export function getConversation(id: number): unknown | undefined {
  return getDb().prepare('SELECT * FROM conversations WHERE id = ?').get(id)
}

export function createConversation(data: {
  polymath_id: string
  user_prompt: string
  full_response: string
  framework_sections?: string
  rubric_scores?: string
  token_count?: number
  duration_ms?: number
}): number {
  const result = getDb().prepare(`
    INSERT INTO conversations (polymath_id, user_prompt, full_response, framework_sections, rubric_scores, token_count, duration_ms)
    VALUES (@polymath_id, @user_prompt, @full_response, @framework_sections, @rubric_scores, @token_count, @duration_ms)
  `).run({
    polymath_id: data.polymath_id,
    user_prompt: data.user_prompt,
    full_response: data.full_response,
    framework_sections: data.framework_sections ?? null,
    rubric_scores: data.rubric_scores ?? null,
    token_count: data.token_count ?? null,
    duration_ms: data.duration_ms ?? null,
  })

  // Increment session count
  getDb().prepare(
    'UPDATE polymaths SET total_sessions = total_sessions + 1 WHERE id = ?'
  ).run(data.polymath_id)

  return Number(result.lastInsertRowid)
}

export function addTag(conversationId: number, tag: string): void {
  getDb().prepare(
    'INSERT INTO tags (conversation_id, tag) VALUES (?, ?)'
  ).run(conversationId, tag)
}

export function getTagsForConversation(conversationId: number): string[] {
  const rows = getDb().prepare(
    'SELECT tag FROM tags WHERE conversation_id = ?'
  ).all(conversationId) as Array<{ tag: string }>
  return rows.map((r) => r.tag)
}

export function searchConversations(query: string): unknown[] {
  const pattern = `%${query}%`
  return getDb().prepare(`
    SELECT c.*, p.name as polymath_name
    FROM conversations c
    JOIN polymaths p ON c.polymath_id = p.id
    WHERE c.user_prompt LIKE ? OR c.full_response LIKE ?
    ORDER BY c.created_at DESC
    LIMIT 100
  `).all(pattern, pattern)
}

export function getPolymathStats(polymathId: string): { total_sessions: number; last_session: string | null } {
  const row = getDb().prepare(`
    SELECT
      (SELECT total_sessions FROM polymaths WHERE id = ?) as total_sessions,
      (SELECT MAX(created_at) FROM conversations WHERE polymath_id = ?) as last_session
  `).get(polymathId, polymathId) as { total_sessions: number; last_session: string | null }
  return row
}
