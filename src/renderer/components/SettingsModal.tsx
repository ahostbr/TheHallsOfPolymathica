import { useHallStore } from '@/features/spatial/store/hallStore'
import { MIN_FLIGHT_DURATION, MAX_FLIGHT_DURATION } from '@/features/spatial/constants/layout'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const corridorFlightDuration = useHallStore((s) => s.corridorFlightDuration)
  const terminalScale = useHallStore((s) => s.terminalScale)
  const terminalWidth = useHallStore((s) => s.terminalWidth)
  const terminalHeight = useHallStore((s) => s.terminalHeight)
  const terminalY = useHallStore((s) => s.terminalY)
  const setCorridorFlightDuration = useHallStore((s) => s.setCorridorFlightDuration)
  const setTerminalScale = useHallStore((s) => s.setTerminalScale)
  const setTerminalWidth = useHallStore((s) => s.setTerminalWidth)
  const setTerminalHeight = useHallStore((s) => s.setTerminalHeight)
  const setTerminalY = useHallStore((s) => s.setTerminalY)

  const labelStyle = { color: '#8899aa', fontFamily: 'Orbitron, monospace' } as const
  const valueStyle = { color: '#00e5ff', fontFamily: 'Orbitron, monospace' } as const

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 5, 15, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 w-[420px]"
        style={{
          background: 'rgba(0, 15, 30, 0.95)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 0 40px rgba(0, 229, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-sm tracking-[3px] uppercase"
            style={{ color: '#00e5ff', fontFamily: 'Orbitron, monospace' }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/60 hover:text-white text-xs"
          >
            X
          </button>
        </div>

        {/* Flight Speed */}
        <div className="mb-5">
          <div className="text-xs mb-2 tracking-[2px] uppercase" style={labelStyle}>
            Corridor Flight Speed
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_FLIGHT_DURATION}
              max={MAX_FLIGHT_DURATION}
              step={1}
              value={corridorFlightDuration}
              onChange={(e) => setCorridorFlightDuration(Number(e.target.value))}
              className="flex-1 accent-[#00e5ff]"
            />
            <span className="text-xs tabular-nums w-8 text-right" style={valueStyle}>
              {corridorFlightDuration}s
            </span>
          </div>
        </div>

        {/* Terminal Settings */}
        <div className="text-xs mb-3 tracking-[2px] uppercase" style={labelStyle}>
          Terminal Display
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs w-12" style={labelStyle}>Scale</span>
            <input
              type="range" min={10} max={500} step={10}
              value={Math.round(terminalScale * 1000)}
              onChange={(e) => setTerminalScale(Number(e.target.value) / 1000)}
              className="flex-1 accent-[#00e5ff]"
            />
            <span className="text-xs tabular-nums w-10 text-right" style={valueStyle}>
              {(terminalScale * 1000).toFixed(0)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs w-12" style={labelStyle}>Width</span>
            <input
              type="range" min={200} max={1200} step={50}
              value={terminalWidth}
              onChange={(e) => setTerminalWidth(Number(e.target.value))}
              className="flex-1 accent-[#00e5ff]"
            />
            <span className="text-xs tabular-nums w-10 text-right" style={valueStyle}>
              {terminalWidth}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs w-12" style={labelStyle}>Height</span>
            <input
              type="range" min={200} max={1200} step={50}
              value={terminalHeight}
              onChange={(e) => setTerminalHeight(Number(e.target.value))}
              className="flex-1 accent-[#00e5ff]"
            />
            <span className="text-xs tabular-nums w-10 text-right" style={valueStyle}>
              {terminalHeight}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs w-12" style={labelStyle}>Y Pos</span>
            <input
              type="range" min={-20} max={60} step={1}
              value={Math.round(terminalY * 10)}
              onChange={(e) => setTerminalY(Number(e.target.value) / 10)}
              className="flex-1 accent-[#00e5ff]"
            />
            <span className="text-xs tabular-nums w-10 text-right" style={valueStyle}>
              {terminalY.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
