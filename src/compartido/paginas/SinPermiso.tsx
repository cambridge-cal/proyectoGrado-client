import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../ui'

/** Se muestra cuando un rol intenta abrir una vista de otro rol (RF-07). */
export function SinPermiso() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <EstadoVacio
        icono={ShieldAlert}
        titulo="No tienes permiso para ver esta página"
        descripcion="Tu rol no tiene acceso a esta sección del sistema."
        accion={
          <Link to="/" className="text-sm font-semibold text-primario hover:underline">
            Volver a mi inicio
          </Link>
        }
      />
    </main>
  )
}
