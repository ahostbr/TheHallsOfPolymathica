import { test, expect } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'
import {
  launchApp,
  snap,
  getState,
  getDepth,
  goToWing,
  goToPolymath,
  goToRotunda,
  pressEsc,
  waitForAlcove,
  clickBackButton,
} from './helpers'

test.describe.serial('07 — Navigation Flow (ESC + Back Button)', () => {
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

  // --- ESC from wing → rotunda ---
  test('ESC from wing returns to rotunda', async () => {
    await goToWing(page, 'reduction')
    expect(await getDepth(page)).toBe('wing')
    await snap(page, '07a-wing-before-esc.png')

    await pressEsc(page)
    expect(await getDepth(page)).toBe('rotunda')
    await snap(page, '07b-rotunda-after-esc.png')
  })

  // --- ESC during corridor flight → wing ---
  test('ESC during corridor flight returns to wing', async () => {
    await goToPolymath(page, 'carmack')
    await page.waitForTimeout(1500) // mid-flight
    expect(await getDepth(page)).toBe('corridor')
    await snap(page, '07c-corridor-mid-esc.png')

    await pressEsc(page)
    const depth = await getDepth(page)
    expect(depth).toBe('wing') // exitCorridor goes to wing
    await snap(page, '07d-wing-after-corridor-esc.png')
  })

  // --- ESC from alcove → wing ---
  test('ESC from alcove returns to wing', async () => {
    // First navigate to alcove via corridor
    await goToRotunda(page)
    await goToPolymath(page, 'shannon')
    const arrived = await waitForAlcove(page, 15000)
    expect(arrived).toBe(true)
    await snap(page, '07e-alcove-before-esc.png')

    await pressEsc(page)
    const depth = await getDepth(page)
    expect(depth).toBe('wing')
    await snap(page, '07f-wing-after-alcove-esc.png')
  })

  // --- Full ESC chain: alcove → wing → rotunda ---
  test('double ESC: alcove → wing → rotunda', async () => {
    await goToRotunda(page)
    await goToPolymath(page, 'rams')
    await waitForAlcove(page, 15000)
    expect(await getDepth(page)).toBe('alcove')
    await snap(page, '07g-alcove-double-esc.png')

    await pressEsc(page)
    expect(await getDepth(page)).toBe('wing')
    await snap(page, '07h-wing-double-esc.png')

    await pressEsc(page)
    expect(await getDepth(page)).toBe('rotunda')
    await snap(page, '07i-rotunda-double-esc.png')
  })

  // --- Back button at wing depth ---
  test('back button at wing returns to rotunda', async () => {
    await goToWing(page, 'vision')
    expect(await getDepth(page)).toBe('wing')
    await snap(page, '07j-wing-back-btn.png')

    await clickBackButton(page)
    expect(await getDepth(page)).toBe('rotunda')
    await snap(page, '07k-rotunda-after-back.png')
  })

  // --- Back button at alcove depth ---
  test('back button at alcove returns to wing', async () => {
    await goToPolymath(page, 'tesla')
    await waitForAlcove(page, 15000)
    expect(await getDepth(page)).toBe('alcove')
    await snap(page, '07l-alcove-back-btn.png')

    await clickBackButton(page)
    expect(await getDepth(page)).toBe('wing')
    await snap(page, '07m-wing-after-alcove-back.png')
  })

  // --- Multi-visit: different wings ---
  test('visit Feynman (Reduction), return, then visit Jobs (Resonance)', async () => {
    await goToRotunda(page)
    await snap(page, '07n-rotunda-multi-start.png')

    // First visit: Feynman (Reduction)
    await goToPolymath(page, 'feynman')
    await waitForAlcove(page, 15000)
    await snap(page, '07o-feynman-alcove.png')

    // Return to rotunda
    await pressEsc(page) // alcove → wing
    await pressEsc(page) // wing → rotunda
    expect(await getDepth(page)).toBe('rotunda')
    await snap(page, '07p-rotunda-between-visits.png')

    // Second visit: Jobs (Resonance)
    await goToPolymath(page, 'jobs')
    await waitForAlcove(page, 15000)
    await snap(page, '07q-jobs-alcove.png')

    const state = await getState(page)
    expect(state!.activePolymathId).toBe('jobs')
    expect(state!.depth).toBe('alcove')
  })
})
