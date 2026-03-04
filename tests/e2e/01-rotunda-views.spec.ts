import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import { launchApp, snap, getState, invalidate } from './helpers'

test.describe.serial('01 — Rotunda Views', () => {
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

  test('app launches to rotunda depth', async () => {
    const state = await getState(page)
    expect(state).not.toBeNull()
    expect(state!.depth).toBe('rotunda')
    expect(state!.polymathCount).toBeGreaterThan(0)
    await snap(page, '01a-rotunda-launch.png')
  })

  test('title bar shows "The Halls of Polymathica"', async () => {
    const title = page.locator('text=The Halls of Polymathica')
    await expect(title).toBeVisible()
  })

  test('instructions text shows at rotunda', async () => {
    const instructions = page.locator('text=Explore the wings')
    await expect(instructions).toBeVisible()
  })

  test('flight speed slider is visible at rotunda', async () => {
    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()
    const label = page.locator('text=Flight Speed')
    await expect(label).toBeVisible()
  })

  test('no back button at rotunda depth', async () => {
    const backBtn = page.locator('button').filter({ hasText: /BACK TO|EXIT/ })
    await expect(backBtn).toHaveCount(0)
  })

  test('window controls are visible (minimize, maximize, close)', async () => {
    const minimize = page.locator('button:has-text("_")')
    const maximize = page.locator('button:has-text("[]")')
    const close = page.locator('button:has-text("X")')
    await expect(minimize).toBeVisible()
    await expect(maximize).toBeVisible()
    await expect(close).toBeVisible()
  })

  test('canvas element exists (3D scene active)', async () => {
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(400)
    expect(box!.height).toBeGreaterThan(300)
  })

  test('25 polymaths loaded from database', async () => {
    const state = await getState(page)
    expect(state!.polymathCount).toBe(25)
  })

  test('default flight duration is 5 seconds', async () => {
    const state = await getState(page)
    expect(state!.corridorFlightDuration).toBe(5)
  })

  test('screenshot — rotunda default view', async () => {
    await invalidate(page)
    await snap(page, '01b-rotunda-full.png')
  })
})
