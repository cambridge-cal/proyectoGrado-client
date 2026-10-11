import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utilidades'

type Variante = 'primario' | 'secundario' | 'exito' | 'peligro' | 'fantasma'
type Tamano = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-primario text-white hover:bg-primario-oscuro',
  secundario: 'border border-borde bg-superficie text-texto hover:bg-superficie-2',
  exito: 'bg-exito-texto text-white hover:bg-[#065f46]',
  peligro: 'border border-peligro bg-peligro/8 text-peligro-texto hover:bg-peligro/15',
  fantasma: 'text-primario hover:bg-primario-suave',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-[34px] rounded-lg px-3 text-xs',
  md: 'h-11 rounded-control px-4 text-sm',
  lg: 'h-[50px] rounded-control px-5 text-[15px]',
}

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

export function Boton({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTES[variante],
        TAMANOS[tamano],
        className,
      )}
      {...props}
    >
      {cargando && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
}
