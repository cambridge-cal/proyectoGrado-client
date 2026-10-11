import { BellRing } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Alertas() {
  return (
    <EnConstruccion
      icono={BellRing}
      titulo="Alertas"
      descripcion="Alertas generadas por el KDD con filtro por nivel y marcado como leídas."
      ticket="TKT-041"
      requisitos="RF-40 y RF-44"
      figma="19 · Admin - Alertas"
    />
  )
}
