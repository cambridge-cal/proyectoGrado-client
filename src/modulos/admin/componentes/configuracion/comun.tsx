import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Boton } from '../../../../compartido/ui'
import type { AvisoConfiguracion } from '../TablaRecurso'

export interface PropsPestana {
  onAviso: (aviso: AvisoConfiguracion) => void
}

/** Barra superior de cada pestaña: filtros a la izquierda y botón Nuevo a la derecha. */
export function BarraPestana({
  children,
  onNuevo,
  textoNuevo,
}: {
  children?: ReactNode
  onNuevo?: () => void
  textoNuevo?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-borde p-4 sm:p-5">
      <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div>
      {onNuevo && (
        <Boton onClick={onNuevo}>
          <Plus className="size-4" aria-hidden /> {textoNuevo ?? 'Nuevo'}
        </Boton>
      )}
    </div>
  )
}
