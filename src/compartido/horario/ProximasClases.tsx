import { CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { DIAS, type AsignacionDetalle, type DiaSemana } from '../tipos'
import { EstadoVacio } from '../ui'
import { grupoNivel, nombreCorto } from './formato'

const ACENTO_NIVEL = {
  A: 'bg-naranja',
  B: 'bg-primario',
  C: 'bg-morado',
}

/** Día de hoy en Colombia como DiaSemana, o null si es domingo. */
function hoyEnColombia(ahora: Date): DiaSemana | null {
  const corto = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/Bogota',
  }).format(ahora)
  const mapa: Record<string, DiaSemana> = {
    Mon: 'LUN',
    Tue: 'MAR',
    Wed: 'MIE',
    Thu: 'JUE',
    Fri: 'VIE',
    Sat: 'SAB',
  }
  return mapa[corto] ?? null
}

/**
 * Las clases del día (o del siguiente día con clases), ordenadas por hora. Sirve para
 * ver de un vistazo qué sigue sin abrir la grilla completa.
 */
export function ProximasClases({
  asignaciones,
  mostrarDocente = true,
  limite = 5,
  ahora: ahoraFijo,
}: {
  asignaciones: AsignacionDetalle[]
  mostrarDocente?: boolean
  limite?: number
  ahora?: Date
}) {
  // La fecha se toma una sola vez al montar, para que el render sea estable.
  const [ahoraInicial] = useState(() => new Date())
  const hoy = hoyEnColombia(ahoraFijo ?? ahoraInicial)
  const inicio = hoy ? DIAS.findIndex((d) => d.valor === hoy) : 0
  // Busca desde hoy el primer día de la semana que tenga clases.
  for (let k = 0; k < DIAS.length; k++) {
    const dia = DIAS[(inicio + k) % DIAS.length]!
    const clases = asignaciones
      .filter((a) => a.franja?.dias.includes(dia.valor))
      .sort((a, b) =>
        (a.franja?.horaInicio ?? '').localeCompare(b.franja?.horaInicio ?? ''),
      )
    if (!clases.length) continue
    const etiqueta = k === 0 && hoy ? 'Hoy' : dia.texto
    return (
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-texto-suave uppercase">
          {etiqueta} · {clases.length}{' '}
          {clases.length === 1 ? 'clase' : 'clases'}
        </p>
        <ul className="escalonado space-y-2">
          {clases.slice(0, limite).map((a) => {
            const nivel = grupoNivel(a.grupo?.nivel)
            return (
              <li
                key={a.posicion}
                className="flex items-center gap-3 rounded-xl border border-borde bg-superficie p-3 transition-colors hover:bg-superficie-2"
              >
                <span
                  className={`h-10 w-1 shrink-0 rounded-full ${nivel ? ACENTO_NIVEL[nivel] : 'bg-texto-suave'}`}
                  aria-hidden
                />
                <span className="w-[68px] shrink-0 text-xs leading-tight text-texto-suave">
                  <span className="block font-semibold text-texto">
                    {a.franja?.horaInicio}
                  </span>
                  {a.franja?.horaFin}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-texto">
                    {a.grupo?.curso ?? 'Grupo eliminado'}
                  </span>
                  <span className="block truncate text-xs text-texto-suave">
                    {[
                      a.aula?.codigo,
                      mostrarDocente && a.docente
                        ? nombreCorto(a.docente.nombre)
                        : null,
                      a.grupo?.codigo,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
        {clases.length > limite && (
          <p className="mt-2 text-xs text-texto-suave">
            y {clases.length - limite} más en la grilla.
          </p>
        )}
      </div>
    )
  }
  return (
    <EstadoVacio
      icono={CalendarClock}
      titulo="Sin clases esta semana"
      descripcion="Cuando haya un horario activo, aquí verás las próximas clases."
    />
  )
}
