import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Campo, type CampoProps } from './Campo'

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export function CampoContrasena({
  className,
  ...props
}: Omit<CampoProps, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className={className ? `relative ${className}` : 'relative'}>
      <Campo
        {...props}
        type={visible ? 'text' : 'password'}
        className="[&_input]:pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute top-[29px] right-1.5 flex size-9 items-center justify-center rounded-lg text-texto-suave hover:bg-superficie-2 hover:text-texto focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  )
}
