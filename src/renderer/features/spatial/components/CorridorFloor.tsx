import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial } from 'three'
import { CORRIDOR_LENGTH, CORRIDOR_WIDTH } from '../constants/layout'

const vertexShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vWorldPos;
  void main() {
    float gridSize = 1.5;
    vec2 grid = abs(fract(vWorldPos.xz / gridSize - 0.5) - 0.5) / fwidth(vWorldPos.xz / gridSize);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);
    float pulse = 0.8 + 0.2 * sin(uTime * 0.8 + vWorldPos.z * 0.3);
    gl_FragColor = vec4(uColor, gridAlpha * pulse * 0.3);
  }
`

interface CorridorFloorProps {
  color: string
}

export function CorridorFloor({ color }: CorridorFloorProps) {
  const matRef = useRef<ShaderMaterial>(null)
  const c = useMemo(() => new Color(color), [color])
  const uniforms = useMemo(
    () => ({
      uColor: { value: c },
      uTime: { value: 0 },
    }),
    [c],
  )

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -CORRIDOR_LENGTH / 2]}>
      <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
