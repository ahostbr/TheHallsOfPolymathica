import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  getDepth,
  goToPolymath,
  waitForAlcove,
  getCorridorProgress,
} from './helpers'

test.describe.serial('03 — Reduction Corridor (Feynman)', () => {
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

  test('enter Feynman corridor — depth changes to corridor', async () => {
    await goToPolymath(page, 'feynman')
    await page.waitForTimeout(500)
    const state = await getState(page)
    expect(state!.depth).toBe('corridor')
    expect(state!.activePolymathId).toBe('feynman')
    await snap(page, '03a-reduction-enter.png')
  })

  test('HUD shows "Flying through" message', async () => {
    const flyingText = page.locator('text=/Flying through/')
    await expect(flyingText).toBeVisible()
  })

  test('HUD shows EXIT CORRIDOR button', async () => {
    const btn = page.locator('button').filter({ hasText: 'EXIT CORRIDOR' })
    await expect(btn).toBeVisible()
  })

  test('corridor progress starts near 0', async () => {
    const progress = await getCorridorProgress(page)
    expect(progress).toBeLessThan(0.5)
  })

  test('screenshot — early flight (1s)', async () => {
    await page.waitForTimeout(1000)
    await snap(page, '03b-reduction-early.png')
  })

  test('screenshot — mid flight (2.5s)', async () => {
    await page.waitForTimeout(1500)
    const progress = await getCorridorProgress(page)
    expect(progress).toBeGreaterThan(0.1)
    await snap(page, '03c-reduction-mid.png')
  })

  test('screenshot — deep corridor (4s)', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '03d-reduction-deep.png')
  })

  test('flight completes — arrives at alcove', async () => {
    const arrived = await waitForAlcove(page, 10000)
    expect(arrived).toBe(true)
    const state = await getState(page)
    expect(state!.depth).toBe('alcove')
    expect(state!.corridorProgress).toBe(1)
    await snap(page, '03e-reduction-alcove.png')
  })

  test('alcove HUD shows BACK TO WING button', async () => {
    const btn = page.locator('button').filter({ hasText: 'BACK TO WING' })
    await expect(btn).toBeVisible()
  })

  test('alcove HUD shows polymath name', async () => {
    const name = page.locator('span').filter({ hasText: 'RICHARD FEYNMAN' })
    await expect(name).toBeVisible()
  })

  test('alcove instructions say "Press ESC"', async () => {
    const instructions = page.locator('text=Press ESC')
    await expect(instructions).toBeVisible()
  })
})
