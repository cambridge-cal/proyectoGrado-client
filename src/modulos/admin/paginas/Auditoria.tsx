import { ScrollText } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Auditoria() {
  return (
    <EnConstruccion
      icono={ScrollText}
      titulo="Auditoría"
      descripcion="Historial de acciones críticas con usuario, módulo y fecha."
      ticket="TKT-012"
      requisitos="RF-08, RNF-11 y RNF-33"
    />
  )
}
