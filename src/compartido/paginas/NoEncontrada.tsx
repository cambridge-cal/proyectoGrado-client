import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../ui'
import { CLASE_ENLACE_INICIO, MarcoSimple } from './MarcoSimple'

export function NoEncontrada() {
  return (
    <MarcoSimple>
      <EstadoVacio
        icono={Compass}
        titulo="No encontramos esta página"
        descripcion="Revisa la dirección o vuelve al inicio."
        accion={
          <Link to="/" className={CLASE_ENLACE_INICIO}>
            Ir al inicio
          </Link>
        }
      />
    </MarcoSimple>
  )
}
