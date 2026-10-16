import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: {
  icono: LucideIcon
  titulo: string
  descripcion?: string
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primario/10 text-primario">
        <Icono className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-texto">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-md text-sm text-texto-suave">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
