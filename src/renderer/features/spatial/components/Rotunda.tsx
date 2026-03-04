import { Suspense } from 'react'
import { RotundaFloor } from './RotundaFloor'
import { RotundaDome } from './RotundaDome'
import { Archway } from './Archway'
import { SettingsPedestal } from './SettingsPedestal'
import { WINGS, WING_LIST } from '../constants/wings'

interface RotundaProps {
  onSettingsOpen?: () => void
}

export function Rotunda({ onSettingsOpen }: RotundaProps) {
  return (
    <group>
      <RotundaFloor />
      <RotundaDome />
      <Suspense fallback={null}>
        <SettingsPedestal onActivate={() => onSettingsOpen?.()} />
      </Suspense>
      {WING_LIST.map((wingId) => (
        <Archway key={wingId} wing={WINGS[wingId]} />
      ))}
    </group>
  )
}
