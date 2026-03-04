import { _electron as electron, type ElectronApplication, type Page } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const APP_PATH = path.join(__dirname, '../../out/main/index.js')
export const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

/** Launch the Electron app and wait for the 3D scene to initialize */
export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [APP_PATH],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  // Wait for 3D scene to fully render (shaders compile, textures load, DB seed)
  await page.waitForTimeout(4000)
  return { app, page }
}

/** Save a screenshot with a descriptive name */
export async function snap(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, name)
  await page.screenshot({ path: filePath })
  console.log(`  screenshot: ${name}`)
}

/** Get current navigation depth from the store */
export async function getDepth(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = (window as any).__hallStore
    return store?.getState()?.depth ?? 'unknown'
  })
}

/** Get current store state (subset) */
export async function getState(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).__hallStore
    if (!store) return null
    const s = store.getState()
    return {
      depth: s.depth as string,
      activeWing: s.activeWing as string | null,
      activePolymathId: s.activePolymathId as string | null,
      corridorProgress: s.corridorProgress as number,
      corridorFlightDuration: s.corridorFlightDuration as number,
      polymathCount: s.polymaths.length as number,
    }
  })
}

/** Navigate to a wing via store action */
export async function goToWing(page: Page, wingId: string) {
  await page.evaluate((wid) => {
    const store = (window as any).__hallStore
    store?.getState().navigateToWing(wid)
  }, wingId)
  // Wait for camera lerp to settle
  await page.waitForTimeout(2000)
}

/** Navigate to a polymath (triggers corridor flight) via store action */
export async function goToPolymath(page: Page, polymathId: string) {
  await page.evaluate((pid) => {
    const store = (window as any).__hallStore
    store?.getState().navigateToPolymath(pid)
  }, polymathId)
}

/** Navigate back to rotunda via store action */
export async function goToRotunda(page: Page) {
  await page.evaluate(() => {
    const store = (window as any).__hallStore
    store?.getState().navigateToRotunda()
  })
  await page.waitForTimeout(2000)
}

/** Exit corridor via store action */
export async function exitCorridor(page: Page) {
  await page.evaluate(() => {
    const store = (window as any).__hallStore
    store?.getState().exitCorridor()
  })
  await page.waitForTimeout(2000)
}

/** Press ESC key */
export async function pressEsc(page: Page) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(2000)
}

/** Wait for corridor flight to complete (depth changes to 'alcove') */
export async function waitForAlcove(page: Page, timeout = 25000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const depth = await getDepth(page)
    if (depth === 'alcove') return true
    await page.waitForTimeout(300)
  }
  return false
}

/** Set camera position directly (for showcase/artistic shots) */
export async function setCamera(
  page: Page,
  pos: [number, number, number],
  lookAt: [number, number, number],
) {
  await page.evaluate(
    ({ p, l }) => {
      // Update store targets so CameraController doesn't fight us
      const store = (window as any).__hallStore
      if (store) {
        store.setState({ cameraTarget: p, cameraLookAt: l })
      }

      // Directly position camera for immediate effect
      const canvas = document.querySelector('canvas') as any
      const r3f = canvas?.__r3f?.store
      if (!r3f) return
      const state = r3f.getState()
      const { camera } = state

      // Disable orbit controls temporarily
      if (state.controls) state.controls.enabled = false

      camera.position.set(p[0], p[1], p[2])
      camera.lookAt(l[0], l[1], l[2])
      camera.updateProjectionMatrix()
      state.invalidate()
    },
    { p: pos, l: lookAt },
  )
  await page.waitForTimeout(500)
}

/** Set flight duration via store */
export async function setFlightDuration(page: Page, seconds: number) {
  await page.evaluate((s) => {
    const store = (window as any).__hallStore
    store?.getState().setCorridorFlightDuration(s)
  }, seconds)
}

/** Force a scene render */
export async function invalidate(page: Page) {
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as any
    const r3f = canvas?.__r3f?.store
    if (r3f) r3f.getState().invalidate()
  })
  await page.waitForTimeout(200)
}

/** Get corridor progress (0-1) */
export async function getCorridorProgress(page: Page): Promise<number> {
  return page.evaluate(() => {
    const store = (window as any).__hallStore
    return store?.getState()?.corridorProgress ?? 0
  })
}

/** Inject polymath data directly into the store (bypasses DB) */
export async function seedPolymathsInStore(page: Page) {
  await page.evaluate(() => {
    const store = (window as any).__hallStore
    if (!store) return
    const registry = [
      { id: 'feynman', name: 'Richard Feynman', title: 'First-Principles Reasoning', color: '#FF6B35' },
      { id: 'carmack', name: 'John Carmack', title: 'Constraint-First Engineering', color: '#00FF41' },
      { id: 'shannon', name: 'Claude Shannon', title: 'Signal & Noise Separation', color: '#00E5FF' },
      { id: 'tao', name: 'Terence Tao', title: 'Structured Exploration', color: '#9D4EDD' },
      { id: 'davinci', name: 'Leonardo da Vinci', title: 'Saper Vedere', color: '#FFD700' },
      { id: 'lovelace', name: 'Ada Lovelace', title: 'Poetical Science', color: '#FF69B4' },
      { id: 'vangogh', name: 'Vincent van Gogh', title: 'Emotional Truth Engineering', color: '#FFA500' },
      { id: 'tesla', name: 'Nikola Tesla', title: 'Mental Simulation', color: '#00BFFF' },
      { id: 'jobs', name: 'Steve Jobs', title: 'Intersection of Tech & Humanities', color: '#EEEEEE' },
      { id: 'gates', name: 'Bill Gates', title: 'Platform Thinking', color: '#0078D4' },
      { id: 'linus', name: 'Linus Torvalds', title: 'Good Taste in Code', color: '#F0DB4F' },
      { id: 'graham', name: 'Paul Graham', title: 'Essay-Driven Clarity', color: '#FF4500' },
      { id: 'bezos', name: 'Jeff Bezos', title: 'Working Backwards', color: '#FF9900' },
      { id: 'andreessen', name: 'Marc Andreessen', title: 'Technological Discontinuities', color: '#1DA1F2' },
      { id: 'ogilvy', name: 'David Ogilvy', title: 'Research-First Advertising', color: '#DC143C' },
      { id: 'aurelius', name: 'Marcus Aurelius', title: 'Stoic Deliberation', color: '#C0C0C0' },
      { id: 'godin', name: 'Seth Godin', title: 'Smallest Viable Audience', color: '#8B5CF6' },
      { id: 'thiel', name: 'Peter Thiel', title: 'Zero to One', color: '#00FF88' },
      { id: 'disney', name: 'Walt Disney', title: 'Dreamer / Realist / Critic', color: '#FF1493' },
      { id: 'munger', name: 'Charlie Munger', title: 'Mental Model Lattice', color: '#B8860B' },
      { id: 'suntzu', name: 'Sun Tzu', title: 'Strategic Intelligence', color: '#8B0000' },
      { id: 'socrates', name: 'Socrates', title: 'Elenctic Examination', color: '#E0E0E0' },
      { id: 'musk', name: 'Elon Musk', title: 'Physics-Constrained Reasoning', color: '#E04230' },
      { id: 'mrbeast', name: 'MrBeast', title: 'Attention Engineering', color: '#00CFFF' },
      { id: 'rams', name: 'Dieter Rams', title: 'Less But Better', color: '#666666' },
    ]
    const RING_0_COUNT = 13
    const data = registry.map((p, i) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      color: p.color,
      totalSessions: 0,
      ring: i < RING_0_COUNT ? 0 : 1,
      index: i < RING_0_COUNT ? i : i - RING_0_COUNT,
    }))
    store.getState().setPolymaths(data)

    // Force R3F re-render
    const canvas = document.querySelector('canvas') as any
    const r3f = canvas?.__r3f?.store
    if (r3f) r3f.getState().invalidate()
  })
  await page.waitForTimeout(1000)
}

/** Check if a text is visible in the page */
export async function hasText(page: Page, text: string): Promise<boolean> {
  const el = page.locator(`text=${text}`).first()
  return el.isVisible().catch(() => false)
}

/** Click the back button in the HUD */
export async function clickBackButton(page: Page) {
  const btn = page.locator('button').filter({ hasText: /BACK TO|EXIT/ }).first()
  if (await btn.isVisible()) {
    await btn.click()
    await page.waitForTimeout(2000)
  }
}
