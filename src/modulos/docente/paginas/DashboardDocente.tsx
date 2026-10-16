import { TrendingUp } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function DashboardDocente() {
  return (
    <EnConstruccion
      icono={TrendingUp}
      titulo="Mis resultados de evaluación"
      descripcion="Puntaje global, resultados por dimensión y comentarios anónimos por período."
      ticket="TKT-040"
      requisitos="RF-42 y RF-43"
      figma="08 · Docente - Mis Resultados"
    />
  )
}
