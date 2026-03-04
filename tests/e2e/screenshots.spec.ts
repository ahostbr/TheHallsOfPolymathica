import { test, expect, type ElectronApplication, type Page } from '@playwright/test'
import {
  launchApp,
  snap,
  getState,
  goToWing,
  goToPolymath,
  goToRotunda,
  waitForAlcove,
  setCamera,
  setFlightDuration,
  invalidate,
  seedPolymathsInStore,
} from './helpers'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_SCREENSHOTS = path.join(__dirname, '../../docs/screenshots')

// Ensure docs/screenshots exists
if (!fs.existsSync(DOCS_SCREENSHOTS)) {
  fs.mkdirSync(DOCS_SCREENSHOTS, { recursive: true })
}

/** Copy screenshot from tests/screenshots → docs/screenshots */
function copyToDocsScreenshots(name: string) {
  const src = path.join(__dirname, '../screenshots', name)
  const dst = path.join(DOCS_SCREENSHOTS, name)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
    console.log(`  → copied to docs/screenshots/${name}`)
  }
}

test.describe.serial('README Screenshots', () => {
  let app: ElectronApplication
  let page: Page

  test.beforeAll(async () => {
    const result = await launchApp()
    app = result.app
    page = result.page
    // Speed up corridor flights for faster test runs
    await setFlightDuration(page, 3)
  })

  test.afterAll(async () => {
    await app.close()
  })

  test('00 — seed polymaths into store', async () => {
    // DB may not load in Playwright Electron context (native module issue)
    // Inject polymath data directly into the Zustand store
    await seedPolymathsInStore(page)
    const state = await getState(page)
    expect(state?.polymathCount).toBe(25)
  })

  test('01 — rotunda overview', async () => {
    const state = await getState(page)
    expect(state?.depth).toBe('rotunda')

    // Elevated angle from center showing wing card ahead
    await setCamera(page, [0, 2.5, -3], [0, 1.5, 15])
    await invalidate(page)
    await page.waitForTimeout(500)

    await snap(page, 'rotunda-overview.png')
    copyToDocsScreenshots('rotunda-overview.png')
  })

  test('02 — bird\'s eye view', async () => {
    // High overhead shot showing rotunda + all 4 wing archways
    await setCamera(page, [0, 25, 0.1], [0, 0, 0])
    await invalidate(page)
    await page.waitForTimeout(500)

    await snap(page, 'birdseye.png')
    copyToDocsScreenshots('birdseye.png')
  })

  test('03 — wing gallery (reduction)', async () => {
    // Navigate to the Reduction wing (cyan, +Z)
    await goToWing(page, 'reduction')
    await page.waitForTimeout(1000)
    await invalidate(page)

    await snap(page, 'wing-gallery.png')
    copyToDocsScreenshots('wing-gallery.png')
  })

  test('04 — wing resonance', async () => {
    // Navigate to the Resonance wing (orange, -X)
    await goToWing(page, 'resonance')
    await page.waitForTimeout(1000)
    await invalidate(page)

    await snap(page, 'wing-resonance.png')
    copyToDocsScreenshots('wing-resonance.png')
  })

  test('05 — corridor flight (feynman)', async () => {
    // Enter Feynman's corridor from reduction wing
    await goToWing(page, 'reduction')
    await page.waitForTimeout(500)
    await goToPolymath(page, 'feynman')

    // Wait for ~40% through the flight for a dramatic mid-corridor shot
    await page.waitForTimeout(1500)
    await invalidate(page)

    await snap(page, 'corridor-flight.png')
    copyToDocsScreenshots('corridor-flight.png')
  })

  test('06 — alcove end wall (feynman)', async () => {
    // Wait for flight to complete
    const arrived = await waitForAlcove(page)
    expect(arrived).toBe(true)
    await page.waitForTimeout(1000)
    await invalidate(page)

    await snap(page, 'alcove-endwall.png')
    copyToDocsScreenshots('alcove-endwall.png')
  })

  test('07 — return to rotunda and grab vision wing', async () => {
    await goToRotunda(page)
    await goToWing(page, 'vision')
    await page.waitForTimeout(1000)
    await invalidate(page)

    await snap(page, 'wing-vision.png')
    copyToDocsScreenshots('wing-vision.png')
  })
})
