import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  goToPolymath,
  waitForAlcove,
  getCorridorProgress,
} from './helpers'

test.describe.serial('04 — Vision Corridor (Tesla)', () => {
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

  test('enter Tesla corridor', async () => {
    await goToPolymath(page, 'tesla')
    await page.waitForTimeout(500)
    const state = await getState(page)
    expect(state!.depth).toBe('corridor')
    expect(state!.activePolymathId).toBe('tesla')
    await snap(page, '04a-vision-enter.png')
  })

  test('HUD shows polymath name in header', async () => {
    const name = page.locator('span').filter({ hasText: 'NIKOLA TESLA' })
    await expect(name).toBeVisible()
  })

  test('screenshot — early flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '04b-vision-early.png')
  })

  test('screenshot — mid flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '04c-vision-mid.png')
  })

  test('screenshot — deep corridor', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '04d-vision-deep.png')
  })

  test('flight completes — alcove arrival', async () => {
    const arrived = await waitForAlcove(page, 10000)
    expect(arrived).toBe(true)
    const state = await getState(page)
    expect(state!.depth).toBe('alcove')
    await snap(page, '04e-vision-alcove.png')
  })

  test('corridor progress is 1 at alcove', async () => {
    const progress = await getCorridorProgress(page)
    expect(progress).toBe(1)
  })
})
