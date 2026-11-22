import type { ReactNode } from 'react'
import { Logo } from '../ui'

/** Marco de las páginas sueltas (404, sin permiso): logo de la academia y una tarjeta centrada. */
export function MarcoSimple({ children }: { children: ReactNode }) {
  return (
    <main
      id="contenido"
      className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-fondo p-6"
    >
      <Logo className="h-16 w-auto" />
      <div className="w-full max-w-md rounded-tarjeta border border-borde bg-superficie px-6 py-10 shadow-tarjeta">
        {children}
      </div>
    </main>
  )
}

/** Enlace con aspecto de botón primario para volver al inicio. */
export const CLASE_ENLACE_INICIO =
  'inline-flex h-10 items-center rounded-control bg-primario px-4 text-sm font-semibold text-white transition-colors hover:bg-primario-oscuro'
