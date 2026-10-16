import { UsersRound } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function GruposEstudiante() {
  return (
    <EnConstruccion
      icono={UsersRound}
      titulo="Mis grupos"
      descripcion="Únete a un grupo con su código de acceso o date de baja."
      ticket="TKT-026"
      requisitos="RF-26 y RF-27"
    />
  )
}
