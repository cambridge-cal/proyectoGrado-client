import { BarChart3, CalendarCheck2, ClipboardCheck } from 'lucide-react'
import { Outlet } from 'react-router'
import { Logo } from '../ui'

const ANIO = new Date().getFullYear()

const MODULOS = [
  {
    icono: CalendarCheck2,
    titulo: 'Horarios con IA',
    texto: 'Algoritmo genético, búsqueda tabú y Gemini',
  },
  {
    icono: ClipboardCheck,
    titulo: 'Evaluación docente',
    texto: 'Formularios ponderados y respuestas anónimas',
  },
  {
    icono: BarChart3,
    titulo: 'Analítica KDD',
    texto: 'Puntajes por dimensión y alertas tempranas',
  },
]

/**
 * Pantallas públicas (Figma 01 y 02): una tarjeta flotante con el panel de marca a la
 * izquierda y el formulario a la derecha. En celular y tablet solo se ve el formulario,
 * con el logo arriba (RNF-12).
 */
export function LayoutAutenticacion() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-fondo p-0 sm:p-6 lg:p-10">
      {/* Fondo: manchas suaves de los colores de la marca */}
      <span
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-primario/10 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-32 -bottom-40 size-[460px] rounded-full bg-morado/10 blur-3xl"
        aria-hidden
      />

      <div className="relative grid w-full max-w-[1120px] animate-escalar overflow-hidden bg-superficie sm:rounded-[28px] sm:shadow-elevada lg:min-h-[660px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:p-3">
        {/* Panel de marca */}
        <aside className="relative hidden animate-degradado flex-col overflow-hidden rounded-[22px] bg-linear-to-br from-marino-900 via-marino-800 to-azul-700 bg-[length:200%_200%] p-10 text-white lg:flex">
          <span
            className="pointer-events-none absolute -top-24 -right-24 size-80 animate-orbitar rounded-full border border-dashed border-white/12"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full border border-white/8"
            aria-hidden
          />
          <Logo
            variante="blanco"
            className="pointer-events-none absolute -right-10 bottom-20 h-[360px] w-auto opacity-[0.05]"
          />

          <div className="relative flex animate-entrar items-center gap-4">
            <Logo variante="blanco" className="h-16 w-auto animate-flotar" />
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-wide">CAMBRIDGE</p>
              <p className="text-sm text-white/60">Academy of Languages</p>
            </div>
          </div>

          <div className="relative mt-auto pt-10">
            <h1
              className="animate-entrar text-[34px] leading-[1.2] font-bold"
              style={{ animationDelay: '120ms' }}
            >
              Gestión académica
              <br />
              inteligente
            </h1>
            <p
              className="mt-3 max-w-sm animate-entrar text-sm text-white/70"
              style={{ animationDelay: '180ms' }}
            >
              Horarios, evaluación docente y analítica de Cambridge Academy of
              Languages en un solo lugar.
            </p>

            <ul className="escalonado mt-8 grid gap-2.5">
              {MODULOS.map(({ icono: Icono, titulo, texto }) => (
                <li
                  key={titulo}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12">
                    <Icono className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {titulo}
                    </span>
                    <span className="block text-xs text-white/60">{texto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[11px] text-white/40">
              Cambridge Academy of Languages · {ANIO}
            </p>
          </div>
        </aside>

        {/* Formulario */}
        <div className="flex min-h-dvh flex-col sm:min-h-0">
          <div className="flex items-center justify-between gap-3 px-6 pt-6 sm:px-10">
            <div className="flex items-center gap-2.5">
              <p className="text-sm font-semibold text-texto">
                Sistema de Gestión Académica
              </p>
            </div>
            <span className="hidden rounded-full border border-borde px-3 py-1 text-xs font-medium text-texto-suave sm:inline">
              Sede Pasto
            </span>
          </div>
          <main
            id="contenido"
            className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10"
          >
            <div className="w-full max-w-[380px] animate-entrar">
              {/* En celular y tablet no se ve el panel de marca: el logo va sobre el formulario */}
              <Logo className="mx-auto mb-6 h-16 w-auto lg:hidden" />
              <Outlet />
            </div>
          </main>
          <p className="px-6 pb-6 text-center text-[11px] text-texto-suave/70 lg:hidden">
            Cambridge Academy of Languages · {ANIO}
          </p>
        </div>
      </div>
    </div>
  )
}
