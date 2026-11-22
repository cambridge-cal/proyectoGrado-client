import type { ReactNode } from 'react'
import { useAuth } from '../../seguridad/almacenAuth'
import { cn } from '../utilidades'
import { primerNombre } from './banner'
import { Logo } from './Logo'

/**
 * Banner de bienvenida en azul marino (inspirado en el Figma 13): saludo, un resumen
 * en una frase, una acción y, a la derecha, contenido propio de cada rol.
 */
export function BannerSaludo({
  titulo,
  descripcion,
  accion,
  children,
  className,
}: {
  titulo: ReactNode
  descripcion?: ReactNode
  accion?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const usuario = useAuth((estado) => estado.usuario)
  const nombre = primerNombre(usuario?.nombre)
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[20px] bg-linear-to-br from-marino-900 via-marino-800 to-azul-700 bg-[length:200%_200%] p-6 text-white shadow-elevada sm:p-8',
        'motion-safe:animate-degradado',
        className,
      )}
    >
      <Logo
        variante="blanco"
        className="pointer-events-none absolute -right-6 -bottom-10 h-56 w-auto opacity-[0.06]"
      />
      <div
        className={cn(
          'relative grid gap-6',
          Boolean(children) &&
            'xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] xl:items-center',
        )}
      >
        <div className="min-w-0">
          {nombre && <p className="text-sm text-white/70">Hola, {nombre}</p>}
          <h2 className="mt-2 text-2xl leading-snug font-bold sm:text-[28px]">
            {titulo}
          </h2>
          {descripcion && (
            <p className="mt-2 text-sm text-white/70">{descripcion}</p>
          )}
          {accion && <div className="mt-5">{accion}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}
