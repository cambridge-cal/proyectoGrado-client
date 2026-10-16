import { Clock } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function DisponibilidadDocente() {
  return (
    <EnConstruccion
      icono={Clock}
      titulo="Mi disponibilidad"
      descripcion="Franjas horarias en las que puedes ser asignado."
      ticket="TKT-018"
      requisitos="RF-16"
    />
  )
}
