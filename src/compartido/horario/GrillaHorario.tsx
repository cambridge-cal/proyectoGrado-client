import { CalendarX2 } from 'lucide-react'
import type { AsignacionDetalle } from '../tipos'
import { EstadoVacio, Insignia } from '../ui'
import { cn } from '../utilidades'
import {
  grupoNivel,
  LEYENDA_NIVELES,
  nombreCorto,
  organizar,
  TONO_NIVEL,
} from './formato'

const BORDE_NIVEL = {
  A: 'border-t-naranja bg-naranja/5',
  B: 'border-t-primario bg-primario/5',
  C: 'border-t-morado bg-morado/5',
}

function TarjetaClase({
  asignacion,
  mostrarDocente,
}: {
  asignacion: AsignacionDetalle
  mostrarDocente: boolean
}) {
  const nivel = grupoNivel(asignacion.grupo?.nivel)
  const titulo = asignacion.grupo
    ? `${asignacion.grupo.curso} · ${asignacion.grupo.codigo}`
    : 'Grupo eliminado'
  return (
    <div
      className={cn(
        'rounded-md border border-borde border-t-[3px] px-2.5 py-2 text-left',
        nivel ? BORDE_NIVEL[nivel] : 'border-t-texto-suave bg-superficie-2',
      )}
    >
      <p className="text-[12px] leading-tight font-semibold text-texto">
        {titulo}
      </p>
      {mostrarDocente && (
        <p
          className="mt-0.5 text-[11px] text-texto-suave"
          title={asignacion.docente?.nombre}
        >
          {asignacion.docente
            ? nombreCorto(asignacion.docente.nombre)
            : 'Docente eliminado'}
        </p>
      )}
      <Insignia
        tono={nivel ? TONO_NIVEL[nivel] : 'gris'}
        className="mt-1.5 h-[22px] px-1.5 text-[11px]"
      >
        {asignacion.aula?.codigo ?? 'Sin aula'}
      </Insignia>
    </div>
  )
}

/**
 * Grilla semanal del horario (Figma 03b, RF-21, RF-25): columnas por día y filas por franja,
 * de la mañana a la noche. En celular se muestra como lista por día (RNF-12).
 */
export function GrillaHorario({
  asignaciones,
  mostrarDocente = true,
  vacio = 'No hay clases para mostrar con estos filtros.',
}: {
  asignaciones: AsignacionDetalle[]
  mostrarDocente?: boolean
  vacio?: string
}) {
  const { dias, filas } = organizar(asignaciones)
  if (!filas.length)
    return (
      <EstadoVacio icono={CalendarX2} titulo="Sin clases" descripcion={vacio} />
    )

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
          <caption className="sr-only">
            Horario semanal ordenado de la mañana a la noche
          </caption>
          <thead>
            <tr className="bg-superficie-2">
              <th
                scope="col"
                className="w-20 border-b border-borde px-3 py-2.5"
              >
                <span className="sr-only">Franja</span>
              </th>
              {dias.map((dia) => (
                <th
                  key={dia.valor}
                  scope="col"
                  className="border-b border-l border-borde px-2 py-2.5 text-[13px] font-semibold text-texto"
                >
                  {dia.texto}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={`${fila.inicio}-${fila.fin}`} className="align-top">
                <th
                  scope="row"
                  className="border-b border-borde px-3 py-3 text-left font-normal"
                >
                  <span className="block text-[13px] font-semibold text-texto">
                    {fila.inicio}
                  </span>
                  <span className="block text-[11px] text-texto-suave">
                    –{fila.fin}
                  </span>
                </th>
                {fila.celdas.map((celda) => (
                  <td
                    key={celda.dia.valor}
                    className="border-b border-l border-borde p-1.5"
                  >
                    <div className="flex flex-col gap-1.5">
                      {celda.asignaciones.map((a) => (
                        <TarjetaClase
                          key={a.posicion}
                          asignacion={a}
                          mostrarDocente={mostrarDocente}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol
        className="divide-y divide-borde md:hidden"
        aria-label="Horario por día"
      >
        {dias.map((dia) => {
          const clases = filas.flatMap((fila) =>
            fila.celdas
              .find((c) => c.dia.valor === dia.valor)!
              .asignaciones.map((a) => ({ fila, a })),
          )
          if (!clases.length) return null
          return (
            <li key={dia.valor} className="px-4 py-3">
              <h3 className="mb-2 text-sm font-semibold text-texto">
                {dia.texto}
              </h3>
              <ul className="space-y-2">
                {clases.map(({ fila, a }) => (
                  <li key={a.posicion} className="flex gap-3">
                    <span className="w-14 shrink-0 pt-2 text-xs text-texto-suave">
                      {fila.inicio}
                      <br />
                      {fila.fin}
                    </span>
                    <div className="min-w-0 flex-1">
                      <TarjetaClase
                        asignacion={a}
                        mostrarDocente={mostrarDocente}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Leyenda de colores por nivel (recomendación 3 de docs/diseno.md). */
export function LeyendaNiveles() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-texto-suave">
      <span className="font-semibold text-texto">Niveles:</span>
      {LEYENDA_NIVELES.map((n) => (
        <Insignia key={n.grupo} tono={TONO_NIVEL[n.grupo]}>
          {n.texto}
        </Insignia>
      ))}
      <span>Ordenado de la mañana a la noche (RF-25).</span>
    </div>
  )
}
