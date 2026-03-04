import { EdgesGeometry, SphereGeometry } from 'three'
import { useMemo } from 'react'
import { ROTUNDA_RADIUS, ROTUNDA_HEIGHT } from '../constants/layout'

export function RotundaDome() {
  const edges = useMemo(() => {
    const geo = new SphereGeometry(ROTUNDA_RADIUS, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
    return new EdgesGeometry(geo, 15)
  }, [])

  return (
    <lineSegments geometry={edges} position={[0, ROTUNDA_HEIGHT, 0]}>
      <lineBasicMaterial color="#00e5ff" transparent opacity={0.08} />
    </lineSegments>
  )
}
