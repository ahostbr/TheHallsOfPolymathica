import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'
import { ROTUNDA_RADIUS } from '../constants/layout'

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    float gridSize = 2.0;
    vec2 grid = abs(fract(vWorldPos.xz / gridSize - 0.5) - 0.5) / fwidth(vWorldPos.xz / gridSize);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);
    float dist = length(vWorldPos.xz) / ${ROTUNDA_RADIUS.toFixed(1)};
    float edgeFade = smoothstep(1.0, 0.7, dist);
    float pulse = 0.7 + 0.3 * sin(uTime * 0.5);
    float alpha = gridAlpha * edgeFade * pulse * 0.25;
    gl_FragColor = vec4(uColor, alpha);
  }
`

export function RotundaFloor() {
  const matRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: [0, 0.9, 1.0] },
    }),
    [],
  )

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    state.invalidate()
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[ROTUNDA_RADIUS, 64]} />
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
