import { existsSync } from 'fs'
import { BrowserWindow } from 'electron'
import type { PtyManager } from './pty-manager'

export class SessionSpawner {
  private ptyManager: PtyManager
  private getMainWindow: () => BrowserWindow | null

  constructor(ptyManager: PtyManager, getMainWindow: () => BrowserWindow | null) {
    this.ptyManager = ptyManager
    this.getMainWindow = getMainWindow
  }

  spawn(polymathId: string, agentFile: string): string {
    if (!existsSync(agentFile)) {
      throw new Error(`Agent file not found: ${agentFile}`)
    }

    // Spawn a shell that will launch Claude Code with the polymath agent
    const sessionId = this.ptyManager.create(
      undefined, // default shell
      undefined, // default cwd
      (data) => {
        const windows = BrowserWindow.getAllWindows()
        for (const win of windows) {
          win.webContents.send(`pty:data:${sessionId}`, data)
        }
      },
      (exitCode) => {
        const windows = BrowserWindow.getAllWindows()
        for (const win of windows) {
          win.webContents.send(`pty:exit:${sessionId}`, exitCode)
        }
      }
    )

    return sessionId
  }
}
