import { CalendarDays } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Horarios() {
  return (
    <EnConstruccion
      icono={CalendarDays}
      titulo="Horarios"
      descripcion="Grilla semanal del horario activo con filtros por docente, aula y nivel."
      ticket="TKT-024 y TKT-025"
      requisitos="RF-20, RF-21, RF-22, RF-24 y RF-25"
      figma="03b · Admin - Horarios (ajustada)"
    />
  )
}
