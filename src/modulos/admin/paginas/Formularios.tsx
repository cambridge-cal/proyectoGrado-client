import { FileText } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Formularios() {
  return (
    <EnConstruccion
      icono={FileText}
      titulo="Formularios de evaluación"
      descripcion="Formularios, dimensiones con peso y preguntas de escala."
      ticket="TKT-031"
      requisitos="RF-28 a RF-30"
      figma="06b · Admin - Formularios (ajustada)"
    />
  )
}
