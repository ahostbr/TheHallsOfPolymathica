import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appPath = path.join(__dirname, '../../out/main/index.js')
const screenshotDir = path.join(__dirname, '../screenshots')

// Helper to launch the app and wait for scene render
async function launchApp() {
  const electronApp = await electron.launch({
    args: [appPath],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const window = await electronApp.firstWindow()
  await window.waitForLoadState('domcontentloaded')
  await window.waitForTimeout(4000) // 3D scene init
  return { electronApp, window }
}

async function screenshot(window: Awaited<ReturnType<typeof launchApp>>['window'], name: string) {
  const p = path.join(screenshotDir, name)
  await window.screenshot({ path: p })
  console.log(`Screenshot saved: ${name}`)
}

test.describe('Rotunda View', () => {
  test('01 — app launches and shows rotunda', async () => {
    const { electronApp, window } = await launchApp()
    await screenshot(window, '01-rotunda-launch.png')
    await electronApp.close()
  })

  test('02 — bird-eye view showing all four wings', async () => {
    const { electronApp, window } = await launchApp()

    // Directly position camera above the rotunda looking down
    await window.evaluate(() => {
      // R3F stores its state on the canvas __r3f property
      const canvas = document.querySelector('canvas') as any
      const store = canvas?.__r3f?.store
      if (!store) return
      const { camera, invalidate } = store.getState()
      camera.position.set(0, 25, 0.1) // above center, tiny Z offset to avoid gimbal lock
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      invalidate()
    })
    await window.waitForTimeout(1000)

    await screenshot(window, '02-rotunda-birdseye.png')
    await electronApp.close()
  })

  test('03 — navigate to Feynman corridor via store', async () => {
    const { electronApp, window } = await launchApp()

    // Use the Zustand store directly to navigate — more reliable than click raycasting
    // First, expose the store on window for test access
    await window.evaluate(() => {
      // The hallStore is imported as a module singleton.
      // We can find the React fiber root and traverse, but simpler:
      // R3F attaches state to canvas.__r3f
      // But hallStore is separate from R3F state. We'll use a different approach:
      // Dispatch a click event to navigate to wing first, then polymath
    })

    // Click on the Reduction archway (center of screen, where the portraits are)
    const canvas = await window.$('canvas')
    if (canvas) {
      const box = await canvas.boundingBox()
      if (box) {
        // Click on a portrait — they're roughly in the center-upper area
        // Try clicking the leftmost portrait (Feynman)
        await canvas.click({ position: { x: box.width * 0.35, y: box.height * 0.37 } })
      }
    }
    await window.waitForTimeout(1000)
    await screenshot(window, '03a-after-click.png')

    // Take progressive screenshots during the flight
    await window.waitForTimeout(1500)
    await screenshot(window, '03b-flight-2s.png')

    await window.waitForTimeout(2000)
    await screenshot(window, '03c-flight-4s.png')

    await window.waitForTimeout(2000)
    await screenshot(window, '03d-flight-end.png')

    await electronApp.close()
  })
})
