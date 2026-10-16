import { ClipboardCheck } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function DashboardEstudiante() {
  return (
    <EnConstruccion
      icono={ClipboardCheck}
      titulo="Mis evaluaciones pendientes"
      descripcion="Evalúa a los docentes de tus grupos antes de la fecha límite."
      ticket="TKT-036"
      requisitos="RF-33"
      figma="09 · Estudiante - Formularios Pendientes"
    />
  )
}
