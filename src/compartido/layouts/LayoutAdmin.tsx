import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../../seguridad/almacenAuth'
import { cerrarSesion } from '../../seguridad/sesion'
import { NAVEGACION } from '../navegacion'
import { NOMBRE_ROL } from '../tipos'
import { Avatar, Logo } from '../ui'
import { cn } from '../utilidades'

/** Estructura del Administrador: barra lateral oscura y contenido (Figma 03 a 06). */
export function LayoutAdmin() {
  const usuario = useAuth((estado) => estado.usuario)
  const [menuAbierto, setMenuAbierto] = useState(false)
  return (
    <div className="min-h-dvh lg:pl-60">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>

      {/* Barra superior solo en pantallas pequeñas (RNF-12) */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-marino-900 px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <Logo className="size-8 text-[15px]" />
        <span className="text-sm font-semibold">Cambridge Academy</span>
      </div>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-marino-900/50 lg:hidden"
          onClick={() => setMenuAbierto(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-linear-to-b from-marino-900 to-marino-800 text-white transition-transform',
          menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Menú principal"
      >
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <Logo />
          <div className="leading-tight">
            <p className="text-[13px] font-bold">Cambridge</p>
            <p className="text-[11px] text-white/50">Academy</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            className="ml-auto rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-5 h-px bg-white/10" />

        <nav className="flex-1 space-y-2 overflow-y-auto px-2.5 py-5">
          {NAVEGACION.ADMIN.map(({ ruta, etiqueta, icono: Icono, exacta }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={exacta}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                cn(
                  'relative flex h-[42px] items-center gap-3 rounded-lg px-3.5 text-[13px] transition-colors',
                  isActive
                    ? 'bg-white/12 font-semibold text-white'
                    : 'text-white/65 hover:bg-white/6 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-2 left-px h-[26px] w-[3px] rounded-sm bg-primario" aria-hidden />
                  )}
                  <Icono className="size-[18px]" aria-hidden />
                  {etiqueta}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-5 h-px bg-white/10" />
        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar nombre={usuario?.nombre ?? '?'} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold">{usuario?.nombre}</p>
            <p className="text-[11px] text-white/50">{usuario && NOMBRE_ROL[usuario.rol]}</p>
          </div>
          <button
            type="button"
            onClick={() => void cerrarSesion()}
            className="rounded-lg p-2 text-white/65 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <main id="contenido" className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
