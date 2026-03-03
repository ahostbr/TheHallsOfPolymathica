import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface TerminalInstanceProps {
  sessionId: string
  onTermRef?: (ref: Terminal | null) => void
}

export function TerminalInstance({ sessionId, onTermRef }: TerminalInstanceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // No custom theme — xterm.js defaults are calibrated for canvas renderer
    const term = new Terminal({
      scrollback: 5000,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Consolas, Courier New, monospace',
      cursorBlink: true,
      allowProposedApi: true,
      lineHeight: 1.0,
      letterSpacing: 0
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)

    setTimeout(() => {
      fitAddon.fit()
      window.api.pty.resize(sessionId, term.cols, term.rows)
    }, 50)

    termRef.current = term
    fitAddonRef.current = fitAddon
    onTermRef?.(term)

    // Ctrl+C copy / Ctrl+V paste
    term.attachCustomKeyEventHandler((event) => {
      if (event.type !== 'keydown') return true

      if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
        const selection = term.getSelection()
        if (selection) {
          event.preventDefault()
          navigator.clipboard.writeText(selection)
          return false
        }
        return true
      }

      if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
        event.preventDefault()
        navigator.clipboard.readText().then((text) => {
          if (text) window.api.pty.write(sessionId, text)
        }).catch(() => {})
        return false
      }

      return true
    })

    term.onData((data) => {
      window.api.pty.write(sessionId, data)
    })

    const unsubData = window.api.pty.onData(sessionId, (data) => {
      term.write(data)
    })

    const unsubExit = window.api.pty.onExit(sessionId, () => {
      term.write('\r\n[Session ended]\r\n')
    })

    const handleResize = () => {
      fitAddon.fit()
      window.api.pty.resize(sessionId, term.cols, term.rows)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      unsubData()
      unsubExit()
      onTermRef?.(null)
      term.dispose()
    }
  }, [sessionId])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
