import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3, Quaternion, Matrix4 } from 'three'
import { useHallStore } from '../store/hallStore'

const LERP_SPEED = 5
// 0.001 world units at R=12 scale is far below sub-pixel — the hard copy() at
// arrival is visually imperceptible. Large thresholds (e.g. 0.05) make the
// copy() itself visible as a snap even when orientation is fully interpolated.
const ARRIVE_THRESHOLD = 0.001

// Reusable scratch objects — never allocated inside the render loop
const _scratchMatrix = new Matrix4()
const _scratchQuat = new Quaternion()

export function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const targetPos = useRef(new Vector3())
  const targetLook = useRef(new Vector3())
  const isTransitioning = useRef(false)
  const prevDepth = useRef<string>('hall')
  const prevCameraTarget = useRef<string>('')

  // Save hall camera state so we can restore it on "back"
  const savedHallPos = useRef(new Vector3(0, 1.5, 0.01))
  const savedHallLook = useRef(new Vector3(0, 1.0, 0))

  const depth = useHallStore((s) => s.depth)
  const cameraTarget = useHallStore((s) => s.cameraTarget)
  const cameraLookAt = useHallStore((s) => s.cameraLookAt)

  // Set initial OrbitControls target once the ref is available.
  // We cannot use the JSX `target` prop because drei applies it via React
  // reconciliation — any re-render (e.g. a Zustand state change during a
  // lerp) would overwrite controls.target and cause a start-of-transition
  // snap by resetting the orbit pivot to the static hall value.
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.0, 0)
      controlsRef.current.update()
    }
  }, [])

  // Detect camera target changes and save/restore hall position
  const targetKey = cameraTarget.join(',')
  useEffect(() => {
    if (targetKey !== prevCameraTarget.current) {
      // Leaving hall → save current camera state
      if (prevDepth.current === 'hall' && depth !== 'hall') {
        savedHallPos.current.copy(camera.position)
        if (controlsRef.current) {
          savedHallLook.current.copy(controlsRef.current.target)
        }
      }

      // Set lerp targets based on navigation direction
      if (depth === 'hall' && prevDepth.current !== 'hall') {
        // Returning to hall → use saved position
        targetPos.current.copy(savedHallPos.current)
        targetLook.current.copy(savedHallLook.current)
      } else {
        // Going to alcove/conversation → use store targets
        targetPos.current.set(...cameraTarget)
        targetLook.current.set(...cameraLookAt)
      }

      // Disable OrbitControls for the duration of the transition.
      // Do NOT call saveState() — it saves position/target but has no effect
      // on preventing the end-snap.
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }

      isTransitioning.current = true
      prevCameraTarget.current = targetKey
      prevDepth.current = depth
    }
  }, [targetKey, depth, camera])

  // ESC key handler inside the Canvas context
  useEffect(() => {
    const navigateToHall = useHallStore.getState().navigateToHall
    const exitConversation = useHallStore.getState().exitConversation

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const currentDepth = useHallStore.getState().depth
        if (currentDepth === 'conversation') exitConversation()
        else if (currentDepth === 'alcove') navigateToHall()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  useFrame((state, delta) => {
    if (!isTransitioning.current) {
      state.invalidate()
      return
    }

    const alpha = 1 - Math.exp(-LERP_SPEED * delta)

    // Lerp position
    camera.position.lerp(targetPos.current, alpha)

    // Lerp the OrbitControls orbit pivot
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, alpha)
    }

    // Lerp camera orientation toward the look target each frame.
    //
    // Root cause of the end-snap: OrbitControls is disabled during the
    // transition, so it does not call object.lookAt() each frame. The camera
    // quaternion is frozen at the orientation it had when controls were
    // disabled (facing the OLD target). When controls.update() fires at
    // arrival it calls object.lookAt(new_target), and the full accumulated
    // rotation delta fires as a single-frame snap.
    //
    // Fix: compute the quaternion that would result from camera.lookAt(target)
    // from the current (lerped) position, then slerp toward it each frame.
    // At arrival the rotation is already at the destination, so update() is
    // a true no-op on orientation.
    //
    // Guard: skip if camera is at exactly the look point (zero-length direction
    // vector makes Matrix4.lookAt produce NaN). This cannot happen in practice
    // since camera moves toward targetPos and looks at targetLook which are
    // always distinct, but the guard prevents any edge-case corruption.
    const lookDist = camera.position.distanceTo(targetLook.current)
    if (lookDist > 1e-4) {
      _scratchMatrix.lookAt(camera.position, targetLook.current, camera.up)
      _scratchQuat.setFromRotationMatrix(_scratchMatrix)
      camera.quaternion.slerp(_scratchQuat, alpha)
    }

    const dist = camera.position.distanceTo(targetPos.current)
    if (dist < ARRIVE_THRESHOLD) {
      isTransitioning.current = false

      // Snap position to the exact final value
      camera.position.copy(targetPos.current)

      // Snap orientation: compute final lookAt quaternion from the exact
      // final camera position → look target direction. This avoids any
      // floating-point drift in _scratchQuat from the last slerp step.
      _scratchMatrix.lookAt(targetPos.current, targetLook.current, camera.up)
      _scratchQuat.setFromRotationMatrix(_scratchMatrix)
      camera.quaternion.copy(_scratchQuat)

      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current)
        controlsRef.current.enabled = true
        // update() re-derives spherical from the current position+target,
        // then calls object.lookAt(target). Both are now at the exact final
        // values — this call is a mathematical no-op, producing zero delta.
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
