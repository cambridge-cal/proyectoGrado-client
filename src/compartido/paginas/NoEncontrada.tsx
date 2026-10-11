import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../ui'

export function NoEncontrada() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <EstadoVacio
        icono={Compass}
        titulo="No encontramos esta página"
        descripcion="Revisa la dirección o vuelve al inicio."
        accion={
          <Link to="/" className="text-sm font-semibold text-primario hover:underline">
            Ir al inicio
          </Link>
        }
      />
    </main>
  )
}
