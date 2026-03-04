import { useHallStore } from '@/features/spatial/store/hallStore'
import { MIN_FLIGHT_DURATION, MAX_FLIGHT_DURATION } from '@/features/spatial/constants/layout'

export function HallHUD() {
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const activeWing = useHallStore((s) => s.activeWing)
  const polymaths = useHallStore((s) => s.polymaths)
  const corridorFlightDuration = useHallStore((s) => s.corridorFlightDuration)
  const navigateToRotunda = useHallStore((s) => s.navigateToRotunda)
  const exitCorridor = useHallStore((s) => s.exitCorridor)
  const setCorridorFlightDuration = useHallStore((s) => s.setCorridorFlightDuration)

  const activePolymath = polymaths.find((p) => p.id === activePolymathId)

  // Back button handler
  function handleBack() {
    if (depth === 'alcove' || depth === 'corridor') exitCorridor()
    else if (depth === 'wing') navigateToRotunda()
  }

  // Back button label
  function backLabel() {
    if (depth === 'alcove') return 'BACK TO WING'
    if (depth === 'corridor') return 'EXIT CORRIDOR'
    if (depth === 'wing') return 'BACK TO ROTUNDA'
    return ''
  }

  // Instructions text
  function instructions() {
    if (depth === 'rotunda') return 'Explore the wings — Click a portrait to enter their corridor'
    if (depth === 'wing') return 'Click a polymath to begin the journey'
    if (depth === 'corridor') return `Flying through ${activePolymath?.name ?? 'the corridor'}...`
    if (depth === 'alcove') return 'Press ESC to return'
    return ''
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* Title bar drag region */}
      <div className="titlebar-drag h-8 flex items-center justify-between px-4">
        <div
          className="text-xs tracking-[4px] uppercase"
          style={{ color: '#00e5ff', fontFamily: 'Orbitron, monospace' }}
        >
          The Halls of Polymathica
        </div>
        <div className="titlebar-no-drag flex gap-1 pointer-events-auto">
          <button
            onClick={() => window.api.window.minimize()}
            className="w-8 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white/60 hover:text-white text-xs"
          >
            _
          </button>
          <button
            onClick={() => window.api.window.maximize()}
            className="w-8 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white/60 hover:text-white text-xs"
          >
            []
          </button>
          <button
            onClick={() => window.api.window.close()}
            className="w-8 h-6 flex items-center justify-center hover:bg-red-500/30 rounded text-white/60 hover:text-white text-xs"
          >
            X
          </button>
        </div>
      </div>

      {/* Back button */}
      {depth !== 'rotunda' && (
        <div className="px-4 pt-2 pointer-events-auto">
          <button
            onClick={handleBack}
            onMouseDown={(e) => e.preventDefault()}
            className="cursor-pointer"
            style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: '#00e5ff',
              padding: '8px 20px',
              borderRadius: '6px',
              fontFamily: 'Orbitron, monospace',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
            }}
          >
            {backLabel()}
          </button>
          {activePolymath && (
            <span
              className="ml-3 text-sm"
              style={{
                color: activePolymath.color || '#00e5ff',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              {activePolymath.name.toUpperCase()}
            </span>
          )}
          {activeWing && !activePolymath && (
            <span
              className="ml-3 text-sm"
              style={{ color: '#8899aa', fontFamily: 'Orbitron, monospace' }}
            >
              {activeWing.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Instructions + flight slider */}
      <div className="fixed bottom-4 inset-x-0 flex flex-col items-center gap-3 pointer-events-none">
        {/* Flight duration slider (rotunda only) */}
        {depth === 'rotunda' && (
          <div className="flex items-center gap-3 pointer-events-auto">
            <span
              className="text-xs"
              style={{ color: '#8899aa', fontFamily: 'Orbitron, monospace' }}
            >
              Flight Speed
            </span>
            <input
              type="range"
              min={MIN_FLIGHT_DURATION}
              max={MAX_FLIGHT_DURATION}
              step={1}
              value={corridorFlightDuration}
              onChange={(e) => setCorridorFlightDuration(Number(e.target.value))}
              className="w-32 accent-[#00e5ff]"
            />
            <span
              className="text-xs"
              style={{ color: '#8899aa', fontFamily: 'Orbitron, monospace' }}
            >
              {corridorFlightDuration}s
            </span>
          </div>
        )}

        {/* Instructions */}
        <div
          className="px-6 py-2 rounded-full text-xs tracking-[2px] uppercase"
          style={{
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            color: '#8899aa',
            fontFamily: 'Orbitron, monospace',
          }}
        >
          {instructions()}
        </div>
      </div>
    </div>
  )
}
