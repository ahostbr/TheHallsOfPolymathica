import * as http from 'http'
import type { BrowserWindow } from 'electron'
import type { PtyManager } from './pty-manager'

const PORT = 7426
const HOST = '127.0.0.1'

export class PtyBridge {
  private server: http.Server | null = null
  private ptyManager: PtyManager
  private getMainWindow: () => BrowserWindow | null

  constructor(ptyManager: PtyManager, getMainWindow: () => BrowserWindow | null) {
    this.ptyManager = ptyManager
    this.getMainWindow = getMainWindow
  }

  private async focusTerminal(sessionId: string): Promise<void> {
    const win = this.getMainWindow()
    if (win) {
      await win.webContents.executeJavaScript(
        `window.__focusPtySession && window.__focusPtySession('${sessionId}')`
      ).catch(() => {})
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res)
      })
      this.server.on('error', reject)
      this.server.listen(PORT, HOST, () => {
        console.log(`PTY Bridge listening on ${HOST}:${PORT}`)
        resolve()
      })
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve())
      } else {
        resolve()
      }
    })
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || ''
    const method = req.method || ''

    if (method === 'GET' && url === '/pty/list') {
      const sessions = this.ptyManager.listSessions()
      this.json(res, 200, { sessions })
      return
    }

    if (method === 'POST' && (url === '/pty/read' || url === '/pty/write' || url === '/pty/talk')) {
      this.readBody(req, (err, body) => {
        if (err) {
          this.json(res, 400, { error: 'Invalid request body' })
          return
        }

        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(body)
        } catch {
          this.json(res, 400, { error: 'Invalid JSON' })
          return
        }

        if (url === '/pty/read') {
          this.handleRead(res, parsed)
        } else if (url === '/pty/talk') {
          this.handleTalk(res, parsed)
        } else {
          this.handleWrite(res, parsed)
        }
      })
      return
    }

    this.json(res, 404, { error: 'Not found' })
  }

  private handleRead(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.json(res, 200, { session_id: sessionId, output })
  }

  private handleWrite(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    const data = body.data as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }
    if (data === undefined || data === null) {
      this.json(res, 400, { error: 'Missing data' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, String(data))
        if (!success) {
          this.json(res, 500, { ok: false, error: `Write failed for session '${sessionId}'` })
          return
        }
        this.json(res, 200, { ok: true, bytes: String(data).length })
      }, 200)
    })
  }

  private handleTalk(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    const command = body.command as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }
    if (command === undefined || command === null) {
      this.json(res, 400, { error: 'Missing command' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, command + '\r')
        if (!success) {
          this.json(res, 500, { ok: false, error: `Talk failed for session '${sessionId}'` })
          return
        }
        this.json(res, 200, { ok: true, bytes: command.length + 1 })
      }, 200)
    })
  }

  private json(res: http.ServerResponse, status: number, data: unknown): void {
    const payload = JSON.stringify(data)
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    })
    res.end(payload)
  }

  private readBody(req: http.IncomingMessage, cb: (err: Error | null, body: string) => void): void {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => cb(null, Buffer.concat(chunks).toString('utf-8')))
    req.on('error', (err) => cb(err, ''))
  }
}
