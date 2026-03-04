import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  setCamera,
  goToWing,
  goToPolymath,
  goToRotunda,
  waitForAlcove,
  invalidate,
} from './helpers'

test.describe.serial('09 — Camera Showcase (Artistic Angles)', () => {
  let app: ElectronApplication
  let page: Page

  test.beforeAll(async () => {
    const result = await launchApp()
    app = result.app
    page = result.page
  })

  test.afterAll(async () => {
    await app.close()
  })

  // --- Bird's eye view ---
  test('bird-eye view — rotunda from above', async () => {
    await setCamera(page, [0, 30, 0.1], [0, 0, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09a-birdseye.png')
  })

  // --- Low angle looking up ---
  test('low angle — looking up at dome', async () => {
    await setCamera(page, [0, 0.3, 0], [0, 8, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09b-low-angle-dome.png')
  })

  // --- Close to Reduction archway ---
  test('close to Reduction archway', async () => {
    await setCamera(page, [0, 2, 10], [0, 3.5, 15])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09c-close-reduction-arch.png')
  })

  // --- Close to Vision archway ---
  test('close to Vision archway', async () => {
    await setCamera(page, [10, 2, 0], [15, 3.5, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09d-close-vision-arch.png')
  })

  // --- Close to Inversion archway ---
  test('close to Inversion archway', async () => {
    await setCamera(page, [0, 2, -10], [0, 3.5, -15])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09e-close-inversion-arch.png')
  })

  // --- Close to Resonance archway ---
  test('close to Resonance archway', async () => {
    await setCamera(page, [-10, 2, 0], [-15, 3.5, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09f-close-resonance-arch.png')
  })

  // --- Diagonal view showing two archways ---
  test('diagonal view — Reduction + Vision', async () => {
    await setCamera(page, [5, 3, 5], [10, 2, 10])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09g-diagonal-reduction-vision.png')
  })

  // --- Wide establishing shot ---
  test('wide establishing shot', async () => {
    await setCamera(page, [0, 5, 20], [0, 1, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09h-establishing-shot.png')
  })

  // --- Looking across from one wing to another ---
  test('cross-wing view — from Resonance looking at Vision', async () => {
    await setCamera(page, [-12, 2, 0], [12, 2, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09i-cross-resonance-to-vision.png')
  })

  // --- Floor level looking along the grid ---
  test('floor level — grid perspective', async () => {
    await setCamera(page, [3, 0.3, 3], [0, 0.3, 15])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09j-floor-grid.png')
  })

  // --- Inside a corridor looking back toward rotunda ---
  test('corridor interior — looking back toward rotunda', async () => {
    // Navigate to corridor then set camera to look backward
    await goToRotunda(page)
    await goToPolymath(page, 'feynman')
    await page.waitForTimeout(3000) // mid-flight

    // Override camera to look backward
    await setCamera(page, [0, 1.5, 30], [0, 1.5, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09k-corridor-looking-back.png')
  })

  // --- Alcove close-up ---
  test('alcove close-up', async () => {
    await goToRotunda(page)
    await goToPolymath(page, 'feynman')
    await waitForAlcove(page, 15000)

    // Get a nice close-up angle of the alcove
    await page.waitForTimeout(500)
    await snap(page, '09l-alcove-closeup.png')
  })

  // --- High angle panorama ---
  test('high angle panorama — tilted view', async () => {
    await goToRotunda(page)
    await setCamera(page, [8, 12, 8], [0, 0, 0])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09m-high-angle-panorama.png')
  })

  // --- Side profile of archway ---
  test('side profile — archway silhouette', async () => {
    await setCamera(page, [5, 2, 14], [0, 4, 15])
    await invalidate(page)
    await page.waitForTimeout(500)
    await snap(page, '09n-archway-side-profile.png')
  })
})
