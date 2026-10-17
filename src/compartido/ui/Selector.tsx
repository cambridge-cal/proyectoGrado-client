import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../utilidades'

export interface SelectorProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string
  error?: string
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  etiquetaOculta?: boolean
  opciones: Array<{ valor: string; texto: string }>
}

/** Lista desplegable con el mismo estilo de Campo (RNF-16). */
export function Selector({
  etiqueta,
  error,
  etiquetaOculta,
  opciones,
  id,
  className,
  ...props
}: SelectorProps) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={idCampo}
        className={cn(
          'text-[13px] font-medium text-texto',
          etiquetaOculta && 'sr-only',
        )}
      >
        {etiqueta}
      </label>
      <div className="relative">
        <select
          id={idCampo}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-[42px] w-full appearance-none rounded-control border bg-superficie-2 pr-9 pl-3.5 text-sm text-texto',
            'focus:border-primario focus:bg-superficie focus:ring-4 focus:ring-primario/15 focus:outline-none',
            error ? 'border-peligro' : 'border-borde',
          )}
          {...props}
        >
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-suave"
          aria-hidden
        />
      </div>
      {error && (
        <p className="text-xs text-peligro-texto" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
