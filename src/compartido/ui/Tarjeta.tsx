import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utilidades'

export function Tarjeta({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-tarjeta border border-borde bg-superficie', className)}
      {...props}
    />
  )
}

export function TituloTarjeta({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold text-texto">{titulo}</h2>
        {descripcion && <p className="mt-1 text-xs text-texto-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  )
}
