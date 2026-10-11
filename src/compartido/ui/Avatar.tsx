import { cn, iniciales } from '../utilidades'

type Tamano = 'sm' | 'md' | 'lg'

const TAMANOS: Record<Tamano, string> = {
  sm: 'size-8 text-[11px]',
  md: 'size-[34px] text-[13px]',
  lg: 'size-10 text-sm',
}

export function Avatar({
  nombre,
  tamano = 'md',
  className,
}: {
  nombre: string
  tamano?: Tamano
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        TAMANOS[tamano],
        className ?? 'bg-primario text-white',
      )}
      aria-hidden
    >
      {iniciales(nombre)}
    </span>
  )
}
