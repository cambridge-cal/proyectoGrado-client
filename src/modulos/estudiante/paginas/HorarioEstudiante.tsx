import { CalendarDays } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function HorarioEstudiante() {
  return (
    <EnConstruccion
      icono={CalendarDays}
      titulo="Mi horario"
      descripcion="Horario de tus grupos activos, de la mañana a la noche."
      ticket="TKT-026"
      requisitos="RF-25"
    />
  )
}
