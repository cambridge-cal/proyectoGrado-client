import { NavLink } from 'react-router'
import { cn } from '../../../compartido/utilidades'

const PESTANAS = [
  { ruta: '/admin/evaluacion', texto: 'Resultados', exacta: true },
  { ruta: '/admin/evaluacion/formularios', texto: 'Formularios' },
  { ruta: '/admin/evaluacion/asignaciones', texto: 'Asignaciones' },
  { ruta: '/admin/evaluacion/alertas', texto: 'Alertas' },
]

/** Navegación entre las vistas del módulo de evaluación docente. */
export function PestanasEvaluacion() {
  return (
    <nav
      aria-label="Secciones de evaluación"
      className="flex gap-1 overflow-x-auto border-b border-borde"
    >
      {PESTANAS.map((pestana) => (
        <NavLink
          key={pestana.ruta}
          to={pestana.ruta}
          end={pestana.exacta}
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap',
              isActive
                ? 'border-primario text-primario'
                : 'border-transparent text-texto-suave hover:text-texto',
            )
          }
        >
          {pestana.texto}
        </NavLink>
      ))}
    </nav>
  )
}
