import { SpatialScene } from '@/features/spatial/components/SpatialScene'
import { RotundaLayout } from '@/features/spatial/components/RotundaLayout'
import { HallHUD } from '@/components/HallHUD'

export function App() {
  return (
    <div className="w-full h-full relative">
      <SpatialScene>
        <RotundaLayout />
      </SpatialScene>
      <HallHUD />
    </div>
  )
}
