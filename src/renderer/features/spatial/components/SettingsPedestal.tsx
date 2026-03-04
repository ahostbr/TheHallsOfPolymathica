import { useRef, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'

interface SettingsPedestalProps {
  onActivate: () => void
}

export function SettingsPedestal({ onActivate }: SettingsPedestalProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const { scene } = useGLTF('models/pedestal.glb')

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    const mat = new THREE.MeshBasicMaterial({
      color: '#00e5ff',
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    })
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        ;(child as Mesh).material = mat
      }
    })
    return clone
  }, [scene])

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
      const target = hovered ? 0.7 : 0.5
      const mat = clonedScene.children[0] as Mesh
      if (mat?.material && 'opacity' in mat.material) {
        ;(mat.material as THREE.MeshBasicMaterial).opacity +=
          (target - (mat.material as THREE.MeshBasicMaterial).opacity) * 0.1
      }
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      scale={1.2}
      onClick={(e) => {
        e.stopPropagation()
        onActivate()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <primitive object={clonedScene} />
    </group>
  )
}
