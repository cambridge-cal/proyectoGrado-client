import { Sparkles } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function GenerarHorario() {
  return (
    <EnConstruccion
      icono={Sparkles}
      titulo="Generar horario"
      descripcion="Configura las restricciones voluntarias y ejecuta el motor de IA."
      ticket="TKT-024"
      requisitos="RF-17, RF-18, RF-19 y RNF-13"
      figma="04b · Admin - Generación con IA (ajustada)"
    />
  )
}
