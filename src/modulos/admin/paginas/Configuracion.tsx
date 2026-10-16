import { Settings } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Configuracion() {
  return (
    <EnConstruccion
      icono={Settings}
      titulo="Configuración académica"
      descripcion="Períodos, niveles, cursos, grupos, aulas, franjas, docentes y disponibilidades."
      ticket="TKT-018"
      requisitos="RF-09 a RF-16"
    />
  )
}
