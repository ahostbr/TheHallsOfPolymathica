import { useMemo, useRef } from 'react'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { EdgesGeometry, PlaneGeometry } from 'three'
import type { Mesh, Vector3Tuple } from 'three'
import { PALETTE } from '../constants/palette'

interface HoloGlassPanelProps {
  width?: number
  height?: number
  position?: Vector3Tuple
  rotation?: Vector3Tuple
  color?: string
  edgeColor?: string
  children?: React.ReactNode
}

export function HoloGlassPanel({
  width = 2.6,
  height = 1.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#0a2e3a',
  edgeColor,
  children,
}: HoloGlassPanelProps) {
  const meshRef = useRef<Mesh>(null)
  const edgesGeo = useMemo(
    () => new EdgesGeometry(new PlaneGeometry(width, height)),
    [width, height],
  )

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <MeshTransmissionMaterial
          transmission={0.92}
          thickness={0.05}
          roughness={0.1}
          chromaticAberration={0.05}
          color={color}
          attenuationColor={edgeColor || PALETTE.glowPrimary}
          attenuationDistance={2}
          backside={false}
        />
      </mesh>

      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial
          color={edgeColor || PALETTE.edgeGlow}
          transparent
          opacity={0.4}
        />
      </lineSegments>

      {children}
    </group>
  )
}
