import { History } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function HistorialHorarios() {
  return (
    <EnConstruccion
      icono={History}
      titulo="Historial de horarios"
      descripcion="Horarios archivados del período y eliminación del historial."
      ticket="TKT-024"
      requisitos="RF-20, RF-22 y RF-23"
      figma="17 · Admin - Historial de horarios"
    />
  )
}
