import { CalendarDays } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function HorarioDocente() {
  return (
    <EnConstruccion
      icono={CalendarDays}
      titulo="Mi horario"
      descripcion="Tus cursos asignados en el período activo."
      ticket="TKT-025"
      requisitos="RF-21 y RF-25"
      figma="07 · Docente - Mi Horario"
    />
  )
}
