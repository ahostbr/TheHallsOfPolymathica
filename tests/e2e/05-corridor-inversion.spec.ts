import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  goToPolymath,
  waitForAlcove,
} from './helpers'

test.describe.serial('05 — Inversion Corridor (Bezos)', () => {
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

  test('enter Bezos corridor', async () => {
    await goToPolymath(page, 'bezos')
    await page.waitForTimeout(500)
    const state = await getState(page)
    expect(state!.depth).toBe('corridor')
    expect(state!.activePolymathId).toBe('bezos')
    await snap(page, '05a-inversion-enter.png')
  })

  test('HUD shows BEZOS name in header', async () => {
    const name = page.locator('span').filter({ hasText: 'JEFF BEZOS' })
    await expect(name).toBeVisible()
  })

  test('screenshot — early flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '05b-inversion-early.png')
  })

  test('screenshot — mid flight', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '05c-inversion-mid.png')
  })

  test('screenshot — deep corridor', async () => {
    await page.waitForTimeout(1500)
    await snap(page, '05d-inversion-deep.png')
  })

  test('flight completes — alcove arrival', async () => {
    const arrived = await waitForAlcove(page, 10000)
    expect(arrived).toBe(true)
    const state = await getState(page)
    expect(state!.depth).toBe('alcove')
    await snap(page, '05e-inversion-alcove.png')
  })
})
