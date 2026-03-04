import { RotundaFloor } from './RotundaFloor'
import { RotundaDome } from './RotundaDome'
import { Archway } from './Archway'
import { WINGS, WING_LIST } from '../constants/wings'

export function Rotunda() {
  return (
    <group>
      <RotundaFloor />
      <RotundaDome />
      {WING_LIST.map((wingId) => (
        <Archway key={wingId} wing={WINGS[wingId]} />
      ))}
    </group>
  )
}
