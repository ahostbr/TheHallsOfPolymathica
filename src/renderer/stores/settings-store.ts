import { create } from 'zustand'

interface SettingsState {
  terminalFontSize: number
  loaded: boolean
  setSetting: (key: string, value: unknown) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  terminalFontSize: 13,
  loaded: false,

  setSetting: (key, value) => {
    set({ [key]: value } as Partial<SettingsState>)
    const state = get()
    const data = { terminalFontSize: state.terminalFontSize, [key]: value }
    window.api.settings.save(JSON.stringify(data)).catch(() => {})
  },

  loadSettings: async () => {
    try {
      const data = await window.api.settings.load() as Record<string, unknown> | null
      if (data) {
        set({
          terminalFontSize: (data.terminalFontSize as number) || 13,
          loaded: true,
        })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },
}))
