# Changelog

## 2026-03-03 — Scene Rendering & Camera Navigation

### Fixed
- Empty scene bug: alcoves now render correctly (was caused by HoloText crashing without ErrorBoundary + camera pointing straight down)
- Camera no longer starts in top-down view (broke OrbitControls singularity with offset initial position)
- Camera no longer fights user zoom/orbit (lerp only runs during navigation transitions, not continuously)
- Back navigation works via "Back to Hall" button and ESC key
- Camera restores previous hall position when navigating back (instead of resetting to default)

### Added
- Full Alcove component: HoloGlassPanel backdrop, PolymathPortrait (2D texture), HoloText name/title labels
- Da Vinci 3D wireframe bust (only polymath with GLB model)
- "Back to Hall" / "Back to Alcove" styled HUD button
- ESC key handler (document-level capture phase) for depth navigation
- Click any card at any depth to navigate to it (not just from hall mode)
- Camera transition system with OrbitControls disable/re-enable during lerp
- Saved hall camera position restored on back navigation
- `run.bat` for build + preview launch

### Changed
- Camera position: `[0, 0.5, 0]` → `[0, 1.5, 0.01]` (standing height, no top-down singularity)
- OrbitControls: added polar angle constraints (45°–135°), removed damping (caused transition snaps)
- Alcove click distance: `ALCOVE_VIEW_DISTANCE` 8.5 → 2 (camera stays near center)
- HUD: replaced breadcrumb navigation with explicit back button
