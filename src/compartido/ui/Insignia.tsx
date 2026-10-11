import type { ReactNode } from 'react'
import { cn } from '../utilidades'

export type Tono = 'azul' | 'verde' | 'ambar' | 'rojo' | 'morado' | 'naranja' | 'turquesa' | 'gris'

/** Fondo y borde con el color del prototipo, texto oscurecido para cumplir contraste AA. */
const TONOS: Record<Tono, string> = {
  azul: 'border-primario bg-primario/10 text-primario',
  verde: 'border-exito bg-exito/12 text-exito-texto',
  ambar: 'border-advertencia bg-advertencia/12 text-advertencia-texto',
  rojo: 'border-peligro bg-peligro/12 text-peligro-texto',
  morado: 'border-morado bg-morado/12 text-morado-texto',
  naranja: 'border-naranja bg-naranja/12 text-naranja-texto',
  turquesa: 'border-turquesa bg-turquesa/12 text-turquesa-texto',
  gris: 'border-borde bg-superficie-2 text-texto-suave',
}

export function Insignia({
  tono = 'azul',
  className,
  children,
}: {
  tono?: Tono
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] shrink-0 items-center gap-1 rounded-insignia border px-2 text-xs font-medium whitespace-nowrap',
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}
