import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utilidades'

export interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
}

/** Campo de texto con etiqueta y mensaje de error en línea (RNF-14). */
export function Campo({ etiqueta, error, ayuda, id, className, ...props }: CampoProps) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idMensaje = `${idCampo}-mensaje`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className="text-[13px] font-medium text-texto">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={cn(
          'h-[46px] rounded-control border bg-superficie-2 px-3.5 text-sm text-texto',
          'placeholder:text-texto-suave focus:border-primario focus:bg-superficie focus:outline-none',
          'focus:ring-4 focus:ring-primario/15',
          error ? 'border-peligro' : 'border-borde',
        )}
        {...props}
      />
      {error ? (
        <p id={idMensaje} className="text-xs text-peligro-texto" role="alert">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={idMensaje} className="text-xs text-texto-suave">
            {ayuda}
          </p>
        )
      )}
    </div>
  )
}
