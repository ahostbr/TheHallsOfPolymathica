import { useState } from 'react'
import { SpatialScene } from '@/features/spatial/components/SpatialScene'
import { RotundaLayout } from '@/features/spatial/components/RotundaLayout'
import { HallHUD } from '@/components/HallHUD'
import { SettingsModal } from '@/components/SettingsModal'

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="w-full h-full relative">
      <SpatialScene>
        <RotundaLayout onSettingsOpen={() => setSettingsOpen(true)} />
      </SpatialScene>
      <HallHUD />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
