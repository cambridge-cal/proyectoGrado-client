import { LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../../seguridad/almacenAuth'
import { cerrarSesion } from '../../seguridad/sesion'
import { NAVEGACION } from '../navegacion'
import { NOMBRE_ROL } from '../tipos'
import { Avatar, Insignia, Logo } from '../ui'
import { cn } from '../utilidades'

/** Estructura del Docente y del Estudiante: barra superior con pestañas (Figma 07 a 10). */
export function LayoutPortal({ rol }: { rol: 'DOCENTE' | 'ESTUDIANTE' }) {
  const usuario = useAuth((estado) => estado.usuario)
  const esDocente = rol === 'DOCENTE'

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-borde bg-superficie">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Logo className="size-8 bg-linear-to-br from-marino-900 to-azul-700 text-[15px]" />
          <p className="truncate text-sm font-semibold text-texto">
            Cambridge Academy<span className="hidden sm:inline"> · Sistema de Gestión</span>
          </p>

          <nav className="ml-6 hidden h-16 items-stretch gap-1 md:flex" aria-label="Secciones">
            {NAVEGACION[rol].map(({ ruta, etiqueta, icono: Icono, exacta }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={exacta}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 border-b-2 px-3 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'border-primario text-primario'
                      : 'border-transparent text-texto-suave hover:text-texto',
                  )
                }
              >
                <Icono className="size-4" aria-hidden />
                {etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block">
              <Insignia tono={esDocente ? 'verde' : 'ambar'}>{NOMBRE_ROL[rol]}</Insignia>
            </span>
            <Avatar
              nombre={usuario?.nombre ?? '?'}
              className={
                esDocente
                  ? 'bg-exito/15 text-exito-texto'
                  : 'bg-advertencia/15 text-advertencia-texto'
              }
            />
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              className="rounded-lg p-2 text-texto-suave hover:bg-fondo hover:text-texto"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Pestañas en pantallas pequeñas (RNF-12) */}
        <nav className="flex gap-1 overflow-x-auto border-t border-borde px-2 md:hidden" aria-label="Secciones">
          {NAVEGACION[rol].map(({ ruta, etiqueta, icono: Icono, exacta }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={exacta}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium',
                  isActive ? 'border-primario text-primario' : 'border-transparent text-texto-suave',
                )
              }
            >
              <Icono className="size-4" aria-hidden />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="contenido" className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
