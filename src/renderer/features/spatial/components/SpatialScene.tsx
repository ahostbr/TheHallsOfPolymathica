import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import { ENTRANCE_CAMERA_POS, CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '../constants/layout'
import { PALETTE } from '../constants/palette'
import { ParticleField } from './ParticleField'
import { ScanlineOverlay } from './ScanlineOverlay'

const chromaticOffset = new Vector2(0.0008, 0.0008)

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color={PALETTE.glowPrimary} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.3}
        color="#ffffff"
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={0.8}
        color={PALETTE.glowPrimary}
        distance={30}
        decay={2}
      />
    </>
  )
}

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.03}
      />
      <ChromaticAberration
        offset={chromaticOffset}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  )
}

interface SpatialSceneProps {
  children?: React.ReactNode
}

export function SpatialScene({ children }: SpatialSceneProps) {
  return (
    <Canvas
      camera={{
        position: ENTRANCE_CAMERA_POS,
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      frameloop="demand"
      style={{
        position: 'absolute',
        inset: 0,
        background: PALETTE.sceneBackground,
      }}
    >
      <Suspense fallback={null}>
        <SceneLighting />
        <ParticleField />
        <ScanlineOverlay />
        {children}
        <PostProcessing />
      </Suspense>
    </Canvas>
  )
}
