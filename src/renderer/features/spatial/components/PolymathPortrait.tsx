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
  onClick?: () => void
}

export function PolymathPortrait({
  polymathId,
  width = 1.4,
  height = 1.6,
  position = [0, 0, 0.05],
  color,
  onClick,
}: PolymathPortraitProps) {
  const texture = useTexture(`portraits/${polymathId}.png`)
  const edgesGeo = useMemo(
    () => new EdgesGeometry(new PlaneGeometry(width, height)),
    [width, height],
  )

  return (
    <group position={position}>
      <mesh
        onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined}
        onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
        onPointerOut={onClick ? () => { document.body.style.cursor = 'default' } : undefined}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <lineSegments geometry={edgesGeo} raycast={() => null}>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </lineSegments>
    </group>
  )
}
