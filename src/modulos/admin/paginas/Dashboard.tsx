import { LayoutDashboard } from 'lucide-react'
import { EnConstruccion } from '../../../compartido/paginas/EnConstruccion'

export function Dashboard() {
  return (
    <EnConstruccion
      icono={LayoutDashboard}
      titulo="Dashboard"
      descripcion="Resumen del período activo: horarios, evaluaciones y alertas."
      ticket="TKT-041"
      requisitos="RF-39, RF-41 y RF-44"
      figma="13 · Admin - Dashboard"
    />
  )
}
