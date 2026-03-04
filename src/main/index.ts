import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { homedir } from 'os'
import { registerPtyHandlers, ptyManager } from './ipc/pty-handlers'
import { registerDbHandlers } from './ipc/db-handlers'
import { PtyBridge } from './services/pty-bridge'
import { SessionSpawner } from './services/session-spawner'
import { getDb, upsertPolymath, closeDb } from './db/database'
import { POLYMATH_REGISTRY } from './polymath-seed'
import { initCorridorContent, getCorridorContent, getAllCorridorContent } from './services/agent-content-service'

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024')

let mainWindow: BrowserWindow | null = null
let ptyBridge: PtyBridge | null = null
let sessionSpawner: SessionSpawner | null = null

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#000508',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // F12 toggles DevTools
  mainWindow.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
    }
  }, 5000)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Window control IPC
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('window:close', () => {
    cleanup()
    app.quit()
  })
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-change', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false)
  })

  // Settings IPC
  const settingsDir = join(homedir(), '.polymathica')
  const settingsFile = join(settingsDir, 'settings.json')

  ipcMain.handle('settings:load', async () => {
    try {
      const content = await readFile(settingsFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  ipcMain.handle('settings:save', async (_e, data: string) => {
    try {
      await mkdir(settingsDir, { recursive: true })
      await writeFile(settingsFile, data, 'utf-8')
    } catch { /* ignore */ }
  })

  // Session spawner IPC
  ipcMain.handle('session:spawn', (_e, polymathId: string) => {
    if (!sessionSpawner) throw new Error('Session spawner not initialized')
    const polymath = POLYMATH_REGISTRY.find(p => p.id === polymathId)
    if (!polymath) throw new Error(`Unknown polymath: ${polymathId}`)
    return sessionSpawner.spawn(polymathId, polymath.agentFile)
  })

  // Corridor content IPC
  ipcMain.handle('corridor:get-content', (_event, polymathId: string) => getCorridorContent(polymathId))
  ipcMain.handle('corridor:get-all-content', () => getAllCorridorContent())

  // Register handlers
  try { registerPtyHandlers() } catch (e) { console.error('Failed to register pty handlers:', e) }
  try { registerDbHandlers() } catch (e) { console.error('Failed to register db handlers:', e) }

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function seedPolymaths(): void {
  try {
    getDb() // ensure schema exists
    for (const p of POLYMATH_REGISTRY) {
      upsertPolymath({
        id: p.id,
        name: p.name,
        title: p.title,
        agent_file: p.agentFile,
        color: p.color,
      })
    }
    console.log(`Seeded ${POLYMATH_REGISTRY.length} polymaths into database`)
  } catch (err) {
    console.error('Failed to seed polymaths:', err)
  }
}

function cleanup(): void {
  ptyBridge?.stop()
  ptyManager.killAll()
  closeDb()
}

app.whenReady().then(async () => {
  ptyBridge = new PtyBridge(ptyManager, () => mainWindow)
  sessionSpawner = new SessionSpawner(ptyManager, () => mainWindow)

  try {
    await ptyBridge.start()
  } catch (err) {
    console.error('Failed to start PTY Bridge:', err)
  }

  seedPolymaths()
  initCorridorContent()
  createWindow()
})

app.on('window-all-closed', () => {
  cleanup()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
