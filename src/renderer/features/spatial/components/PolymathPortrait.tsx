import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { EdgesGeometry, PlaneGeometry } from 'three'
import type { Vector3Tuple } from 'three'

interface PolymathPortraitProps {
  polymathId: string
  width?: number
  height?: number
  position?: Vector3Tuple
  color: string
}

export function PolymathPortrait({
  polymathId,
  width = 1.4,
  height = 1.6,
  position = [0, 0, 0.05],
  color,
}: PolymathPortraitProps) {
  const texture = useTexture(`portraits/${polymathId}.png`)
  const edgesGeo = useMemo(
    () => new EdgesGeometry(new PlaneGeometry(width, height)),
    [width, height],
  )

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </lineSegments>
    </group>
  )
}
