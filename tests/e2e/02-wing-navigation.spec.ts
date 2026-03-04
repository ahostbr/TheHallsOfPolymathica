import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import { launchApp, snap, getState, goToWing, goToRotunda } from './helpers'

test.describe.serial('02 — Wing Navigation', () => {
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

  // --- Reduction Wing (North, +Z) ---
  test('navigate to Reduction wing', async () => {
    await goToWing(page, 'reduction')
    const state = await getState(page)
    expect(state!.depth).toBe('wing')
    expect(state!.activeWing).toBe('reduction')
    await snap(page, '02a-wing-reduction.png')
  })

  test('Reduction wing — HUD shows back button and wing name', async () => {
    const backBtn = page.locator('button').filter({ hasText: 'BACK TO ROTUNDA' })
    await expect(backBtn).toBeVisible()
    const wingLabel = page.locator('text=REDUCTION')
    await expect(wingLabel).toBeVisible()
  })

  test('Reduction wing — instructions say "Click a polymath"', async () => {
    const instructions = page.locator('text=Click a polymath')
    await expect(instructions).toBeVisible()
  })

  test('Reduction wing — flight slider is hidden', async () => {
    const slider = page.locator('input[type="range"]')
    await expect(slider).toHaveCount(0)
  })

  // --- Return to Rotunda ---
  test('return to rotunda from Reduction', async () => {
    await goToRotunda(page)
    const state = await getState(page)
    expect(state!.depth).toBe('rotunda')
    expect(state!.activeWing).toBeNull()
    await snap(page, '02b-rotunda-after-reduction.png')
  })

  // --- Vision Wing (East, +X) ---
  test('navigate to Vision wing', async () => {
    await goToWing(page, 'vision')
    const state = await getState(page)
    expect(state!.depth).toBe('wing')
    expect(state!.activeWing).toBe('vision')
    await snap(page, '02c-wing-vision.png')
  })

  test('Vision wing — HUD shows VISION label', async () => {
    const wingLabel = page.locator('text=VISION')
    await expect(wingLabel).toBeVisible()
  })

  // --- Return to Rotunda ---
  test('return to rotunda from Vision', async () => {
    await goToRotunda(page)
    const state = await getState(page)
    expect(state!.depth).toBe('rotunda')
  })

  // --- Inversion Wing (South, -Z) ---
  test('navigate to Inversion wing', async () => {
    await goToWing(page, 'inversion')
    const state = await getState(page)
    expect(state!.depth).toBe('wing')
    expect(state!.activeWing).toBe('inversion')
    await snap(page, '02d-wing-inversion.png')
  })

  test('Inversion wing — HUD shows INVERSION label', async () => {
    const wingLabel = page.locator('text=INVERSION')
    await expect(wingLabel).toBeVisible()
  })

  // --- Return to Rotunda ---
  test('return to rotunda from Inversion', async () => {
    await goToRotunda(page)
    const state = await getState(page)
    expect(state!.depth).toBe('rotunda')
  })

  // --- Resonance Wing (West, -X) ---
  test('navigate to Resonance wing', async () => {
    await goToWing(page, 'resonance')
    const state = await getState(page)
    expect(state!.depth).toBe('wing')
    expect(state!.activeWing).toBe('resonance')
    await snap(page, '02e-wing-resonance.png')
  })

  test('Resonance wing — HUD shows RESONANCE label', async () => {
    const wingLabel = page.locator('text=RESONANCE')
    await expect(wingLabel).toBeVisible()
  })

  // --- Final return ---
  test('final return to rotunda', async () => {
    await goToRotunda(page)
    const state = await getState(page)
    expect(state!.depth).toBe('rotunda')
    expect(state!.activeWing).toBeNull()
    await snap(page, '02f-rotunda-final.png')
  })
})
