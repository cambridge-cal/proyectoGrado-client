import { cn } from '../utilidades'

/** Barra de progreso accesible (RNF-13). */
export function BarraProgreso({
  valor,
  etiqueta,
  className,
  colorRelleno = 'bg-primario',
}: {
  valor: number
  etiqueta: string
  className?: string
  colorRelleno?: string
}) {
  const porcentaje = Math.min(100, Math.max(0, Math.round(valor)))
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={porcentaje}
      className={cn('h-2 overflow-hidden rounded-full bg-fondo', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', colorRelleno)}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  )
}
