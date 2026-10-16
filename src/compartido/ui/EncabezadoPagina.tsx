import type { ReactNode } from 'react'

/** Encabezado blanco de cada vista: título, insignia de estado, descripción y acciones. */
export function EncabezadoPagina({
  titulo,
  descripcion,
  insignia,
  acciones,
}: {
  titulo: string
  descripcion?: string
  insignia?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <header className="border-b border-borde bg-superficie px-4 py-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-texto sm:text-xl">{titulo}</h1>
            {insignia}
          </div>
          {descripcion && <p className="mt-1.5 text-sm text-texto-suave">{descripcion}</p>}
        </div>
        {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </header>
  )
}
