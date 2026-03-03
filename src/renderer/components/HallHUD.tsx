import { useHallStore } from '@/features/spatial/store/hallStore'

export function HallHUD() {
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const polymaths = useHallStore((s) => s.polymaths)
  const navigateToHall = useHallStore((s) => s.navigateToHall)
  const exitConversation = useHallStore((s) => s.exitConversation)

  const activePolymath = polymaths.find((p) => p.id === activePolymathId)

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* Title bar drag region */}
      <div className="titlebar-drag h-8 flex items-center justify-between px-4">
        <div className="text-xs tracking-[4px] uppercase" style={{ color: '#00e5ff', fontFamily: 'Orbitron, monospace' }}>
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

      {/* Navigation breadcrumbs */}
      {depth !== 'hall' && (
        <div className="px-4 pt-2 pointer-events-auto">
          <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
            <button
              onClick={navigateToHall}
              className="text-[#00e5ff] hover:text-[#00ff88] transition-colors cursor-pointer bg-transparent border-none"
              style={{ fontFamily: 'inherit' }}
            >
              HALL
            </button>
            {activePolymath && (
              <>
                <span className="text-white/30">/</span>
                <span style={{ color: activePolymath.color || '#00e5ff' }}>
                  {activePolymath.name.toUpperCase()}
                </span>
              </>
            )}
            {depth === 'conversation' && (
              <>
                <span className="text-white/30">/</span>
                <button
                  onClick={exitConversation}
                  className="text-[#00ff88] hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                  style={{ fontFamily: 'inherit' }}
                >
                  CONVERSATION
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hall view instructions */}
      {depth === 'hall' && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none">
          <div
            className="px-6 py-2 rounded-full text-xs tracking-[2px] uppercase"
            style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.15)',
              color: '#8899aa',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            Click a polymath to approach — Scroll to zoom — Drag to orbit
          </div>
        </div>
      )}
    </div>
  )
}
