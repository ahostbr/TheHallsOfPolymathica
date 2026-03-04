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
