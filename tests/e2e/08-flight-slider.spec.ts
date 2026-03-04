import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  goToPolymath,
  goToRotunda,
  waitForAlcove,
  setFlightDuration,
  pressEsc,
} from './helpers'

test.describe.serial('08 — Flight Speed Slider', () => {
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

  test('slider is visible at rotunda depth', async () => {
    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()
    await snap(page, '08a-slider-default.png')
  })

  test('default value is 5s', async () => {
    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(5)
    const label = page.locator('text=5s')
    await expect(label).toBeVisible()
  })

  test('set flight duration to 3s (fastest)', async () => {
    await setFlightDuration(page, 3)
    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(3)
    await snap(page, '08b-slider-3s.png')
  })

  test('fast flight (3s) — completes quickly', async () => {
    await goToPolymath(page, 'musk')
    const start = Date.now()
    await waitForAlcove(page, 10000)
    const elapsed = Date.now() - start

    // With 3s flight + overhead, should arrive within ~5s
    expect(elapsed).toBeLessThan(8000)
    await snap(page, '08c-fast-flight-alcove.png')
  })

  test('return to rotunda after fast flight', async () => {
    await pressEsc(page) // alcove → wing
    await pressEsc(page) // wing → rotunda
    const state = await getState(page)
    expect(state!.depth).toBe('rotunda')
  })

  test('set flight duration to 10s (slow)', async () => {
    await setFlightDuration(page, 10)
    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(10)
    await snap(page, '08d-slider-10s.png')
  })

  test('slow flight (10s) — takes longer, more screenshots', async () => {
    await goToPolymath(page, 'linus')
    await page.waitForTimeout(2000)
    await snap(page, '08e-slow-flight-2s.png')

    await page.waitForTimeout(3000)
    await snap(page, '08f-slow-flight-5s.png')

    await page.waitForTimeout(3000)
    await snap(page, '08g-slow-flight-8s.png')

    const arrived = await waitForAlcove(page, 10000)
    expect(arrived).toBe(true)
    await snap(page, '08h-slow-flight-alcove.png')
  })

  test('set flight duration to 20s (maximum)', async () => {
    await pressEsc(page)
    await pressEsc(page)
    await setFlightDuration(page, 20)
    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(20)
  })

  test('slider changes via DOM interaction', async () => {
    // Reset to rotunda first
    await goToRotunda(page)

    // Use DOM to move the slider
    const slider = page.locator('input[type="range"]')
    await slider.fill('7')
    await page.waitForTimeout(500)

    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(7)
    await snap(page, '08i-slider-7s-via-dom.png')
  })
})
