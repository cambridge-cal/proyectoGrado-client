import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../ui'
import { CLASE_ENLACE_INICIO, MarcoSimple } from './MarcoSimple'

/** Se muestra cuando un rol intenta abrir una vista de otro rol (RF-07). */
export function SinPermiso() {
  return (
    <MarcoSimple>
      <EstadoVacio
        icono={ShieldAlert}
        titulo="No tienes permiso para ver esta página"
        descripcion="Tu rol no tiene acceso a esta sección del sistema."
        accion={
          <Link to="/" className={CLASE_ENLACE_INICIO}>
            Volver a mi inicio
          </Link>
        }
      />
    </MarcoSimple>
  )
}
