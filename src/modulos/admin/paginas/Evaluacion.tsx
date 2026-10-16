import { ClipboardList } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Evaluacion() {
  return (
    <EnConstruccion
      icono={ClipboardList}
      titulo="Evaluación docente"
      descripcion="Resultados KDD por docente, participación y reejecución del pipeline."
      ticket="TKT-041"
      requisitos="RF-37, RF-39 y RF-41"
      figma="05b · Admin - Evaluación (ajustada)"
    />
  )
}
