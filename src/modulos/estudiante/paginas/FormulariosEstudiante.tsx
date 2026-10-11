import { PenLine } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function FormulariosEstudiante() {
  return (
    <EnConstruccion
      icono={PenLine}
      titulo="Evaluar docente"
      descripcion="Responde el formulario por dimensiones. Tus respuestas son anónimas."
      ticket="TKT-036"
      requisitos="RF-34, RF-35, RF-36 y RNF-10"
      figma="10 · Estudiante - Formulario en curso"
    />
  )
}
