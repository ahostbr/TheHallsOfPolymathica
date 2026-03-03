import { useMemo } from 'react'
import { ShaderMaterial, DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float scanline = sin(vUv.y * 800.0) * 0.5 + 0.5;
    scanline = smoothstep(0.4, 0.6, scanline);

    float sweep = sin(uTime * 0.3 + vUv.y * 6.28) * 0.5 + 0.5;
    sweep = smoothstep(0.95, 1.0, sweep);

    float alpha = scanline * 0.03 + sweep * 0.02;
    gl_FragColor = vec4(0.0, 0.9, 1.0, alpha);
  }
`

export function ScanlineOverlay() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  )

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    state.invalidate()
  })

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
