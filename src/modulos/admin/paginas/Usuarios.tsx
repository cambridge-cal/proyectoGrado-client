import { Users } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Usuarios() {
  return (
    <EnConstruccion
      icono={Users}
      titulo="Usuarios"
      descripcion="Gestión de cuentas de Administrador, Docente y Estudiante."
      ticket="TKT-012"
      requisitos="RF-06, RF-07 y RNF-32"
      figma="14 · Admin - Usuarios"
    />
  )
}
