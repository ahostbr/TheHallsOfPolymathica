import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3, Quaternion, Matrix4 } from 'three'
import { useHallStore } from '../store/hallStore'
import { ROTUNDA_CAMERA_POS } from '../constants/layout'

const LERP_SPEED = 5
const ARRIVE_THRESHOLD = 0.001

const _m = new Matrix4()

export function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const targetPos = useRef(new Vector3())
  const targetLook = useRef(new Vector3())
  const finalQuat = useRef(new Quaternion())
  const isTransitioning = useRef(false)
  const prevCameraTarget = useRef<string>(ROTUNDA_CAMERA_POS.join(','))

  const cameraTarget = useHallStore((s) => s.cameraTarget)
  const cameraLookAt = useHallStore((s) => s.cameraLookAt)

  // Set initial OrbitControls target imperatively (not via JSX prop which
  // re-applies on every React reconciliation, overwriting mid-lerp values).
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...cameraLookAt)
      controlsRef.current.update()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // All navigation uses the same code path: lerp position + orbit target,
  // slerp orientation toward a precomputed final quaternion.
  const targetKey = cameraTarget.join(',')
  useEffect(() => {
    if (targetKey !== prevCameraTarget.current) {
      targetPos.current.set(...cameraTarget)
      targetLook.current.set(...cameraLookAt)

      // Precompute the exact final orientation from final position → final
      // lookAt. This is slerped toward every frame so we never need to call
      // Matrix4.lookAt from the MOVING camera position (which can pass near
      // the lookAt point, producing a near-zero direction vector and violent
      // orientation flips).
      _m.lookAt(
        targetPos.current,
        targetLook.current,
        camera.up,
      )
      finalQuat.current.setFromRotationMatrix(_m)

      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }

      isTransitioning.current = true
      prevCameraTarget.current = targetKey
    }
  }, [targetKey, cameraTarget, cameraLookAt, camera])

  const depth = useHallStore((s) => s.depth)

  // ESC key handler — pops one navigation depth level
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const state = useHallStore.getState()
        const d = state.depth
        if (d === 'alcove') state.exitCorridor()
        else if (d === 'corridor') state.exitCorridor()
        else if (d === 'wing') state.navigateToRotunda()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  useFrame((state, delta) => {
    // SplineCameraController owns the camera during corridor flight
    if (depth === 'corridor') return

    if (!isTransitioning.current) {
      state.invalidate()
      return
    }

    const alpha = 1 - Math.exp(-LERP_SPEED * delta)

    camera.position.lerp(targetPos.current, alpha)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, alpha)
    }

    // Slerp toward the precomputed final orientation — stable regardless
    // of intermediate camera positions.
    camera.quaternion.slerp(finalQuat.current, alpha)

    const dist = camera.position.distanceTo(targetPos.current)
    if (dist < ARRIVE_THRESHOLD) {
      isTransitioning.current = false
      camera.position.copy(targetPos.current)
      camera.quaternion.copy(finalQuat.current)

      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current)
        controlsRef.current.enabled = true
        controlsRef.current.update()
      }
    }

    state.invalidate()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enableRotate
      enablePan={false}
      zoomSpeed={0.3}
      rotateSpeed={0.3}
      minDistance={0.5}
      maxDistance={14}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={(3 * Math.PI) / 4}
      makeDefault
    />
  )
}
