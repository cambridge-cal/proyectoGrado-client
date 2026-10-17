import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../utilidades'

type TipoAviso = 'exito' | 'error' | 'info'

const ESTILOS: Record<TipoAviso, string> = {
  exito: 'border-exito/40 bg-exito/8 text-exito-texto',
  error: 'border-peligro/40 bg-peligro/8 text-peligro-texto',
  info: 'border-primario/30 bg-primario-suave text-primario-oscuro',
}
const ICONOS = { exito: CheckCircle2, error: AlertCircle, info: Info }

/** Mensaje en línea de éxito, error o información (RNF-13). */
export function Aviso({
  tipo = 'info',
  className,
  children,
}: {
  tipo?: TipoAviso
  className?: string
  children: ReactNode
}) {
  const Icono = ICONOS[tipo]
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-control border px-3.5 py-3 text-sm',
        ESTILOS[tipo],
        className,
      )}
    >
      <Icono className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
