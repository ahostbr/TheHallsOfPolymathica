import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  goToPolymath,
  waitForAlcove,
} from './helpers'

test.describe.serial('06 — Resonance Corridor (Jobs)', () => {
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

  test('enter Jobs corridor', async () => {
    await goToPolymath(page, 'jobs')
    await page.waitForTimeout(500)
    const state = await getState(page)
    expect(state!.depth).toBe('corridor')
    expect(state!.activePolymathId).toBe('jobs')
    await snap(page, '06a-resonance-enter.png')
  })

  test('HUD shows JOBS name in header', async () => {
    const name = page.locator('span').filter({ hasText: 'STEVE JOBS' })
    await expect(name).toBeVisible()
  })

  test('screenshot — early flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '06b-resonance-early.png')
  })

  test('screenshot — mid flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '06c-resonance-mid.png')
  })

  test('screenshot — deep corridor', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '06d-resonance-deep.png')
  })

  test('flight completes — alcove arrival', async () => {
    const arrived = await waitForAlcove(page, 10000)
    expect(arrived).toBe(true)
    const state = await getState(page)
    expect(state!.depth).toBe('alcove')
    await snap(page, '06e-resonance-alcove.png')
  })
})
