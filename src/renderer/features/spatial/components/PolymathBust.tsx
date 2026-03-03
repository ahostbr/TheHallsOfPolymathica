import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, Vector3Tuple } from 'three'
import * as THREE from 'three'

interface PolymathBustProps {
  modelPath: string
  position?: Vector3Tuple
  scale?: number
  color: string
}

export function PolymathBust({
  modelPath,
  position = [0, 0.2, 0.3],
  scale = 1,
  color,
}: PolymathBustProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(modelPath)

  // Clone scene so we can swap materials without affecting cache
  const clonedScene = scene.clone(true)

  // Apply holographic wireframe material to all meshes
  const holoMaterial = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    toneMapped: false,
  })

  clonedScene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      ;(child as Mesh).material = holoMaterial
    }
  })

  // Slow idle rotation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  )
}
