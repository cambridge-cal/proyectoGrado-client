import { UserCheck } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Asignaciones() {
  return (
    <EnConstruccion
      icono={UserCheck}
      titulo="Asignación de evaluaciones"
      descripcion="Asigna el formulario a un docente o a todos, y consulta o elimina evaluaciones."
      ticket="TKT-031"
      requisitos="RF-31, RF-32, RF-37 y RF-38"
      figma="18 · Admin - Asignación de evaluaciones"
    />
  )
}
