import { SpatialScene } from '@/features/spatial/components/SpatialScene'
import { HallLayout } from '@/features/spatial/components/HallLayout'
import { HallHUD } from '@/components/HallHUD'

export function App() {
  return (
    <div className="w-full h-full relative">
      <SpatialScene>
        <HallLayout />
      </SpatialScene>
      <HallHUD />
    </div>
  )
}
