import { Sparkles } from 'lucide-react'
import { Outlet } from 'react-router'
import { Logo } from '../ui'

const ANIO = new Date().getFullYear()

const BENEFICIOS = [
  'Horarios automáticos con IA',
  'Evaluación docente en línea',
  'Analítica en tiempo real',
]

/** Pantallas públicas: panel de marca a la izquierda y formulario a la derecha (Figma 01 y 02). */
export function LayoutAutenticacion() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,640px)_1fr]">
      <aside className="relative hidden overflow-hidden bg-linear-to-r from-marino-900 to-azul-700 px-[72px] py-[72px] text-white lg:flex lg:flex-col">
        <span className="absolute -top-[100px] -left-[100px] size-80 rounded-full bg-white/8" aria-hidden />
        <span className="absolute top-40 left-[380px] size-[130px] rounded-full bg-white/8" aria-hidden />
        <span className="absolute bottom-0 left-[460px] size-[220px] rounded-full bg-white/8" aria-hidden />

        <Logo className="relative size-[52px] rounded-[14px] bg-white/18 text-[26px]" />
        <div className="relative mt-auto mb-auto">
          <p className="text-xl font-bold">Cambridge Academy</p>
          <p className="text-[15px] text-white/60">of Languages</p>
          <h1 className="mt-10 text-4xl leading-[1.4] font-bold">
            Gestión Académica
            <br />
            Inteligente
          </h1>
          <ul className="mt-8 space-y-1.5 text-sm text-white/80">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-center gap-2.5">
                <Sparkles className="size-3.5" aria-hidden />
                {beneficio}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[11px] text-white/40">
          Cambridge Academy of Languages · {ANIO}
        </p>
      </aside>

      <div className="flex flex-col bg-superficie">
        <div className="flex h-[70px] items-center gap-3 border-b border-borde px-6 sm:px-12">
          <Logo className="size-8 bg-linear-to-br from-marino-900 to-azul-700 text-[15px] lg:hidden" />
          <p className="text-sm font-semibold text-texto">Sistema de Gestión Académica</p>
        </div>
        <main id="contenido" className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
