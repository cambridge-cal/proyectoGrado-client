import { useQuery } from '@tanstack/react-query'
import { BellRing, CalendarDays, ClipboardList } from 'lucide-react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  puntaje,
  TIPO_ALERTA,
  tonoPuntaje,
} from '../../../compartido/evaluacion/formato'
import {
  servicioAlertas,
  servicioKdd,
} from '../../../compartido/evaluacion/servicio'
import {
  fechaGeneracion,
  TEXTO_VALIDACION,
} from '../../../compartido/horario/formato'
import {
  Aviso,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
  TarjetaEstadistica,
  TituloTarjeta,
} from '../../../compartido/ui'
import { usePeriodoEvaluacion } from '../componentes/usePeriodoEvaluacion'
import { horarios } from '../servicios/horarios'

const ENLACE = 'text-sm font-semibold text-primario hover:underline'

/** Dashboard del Administrador (Figma 13, RF-39, RF-41, RF-44): resumen del período activo. */
export function Dashboard() {
  const { consulta: periodos, periodo } = usePeriodoEvaluacion()
  const periodoId = periodo?.id
  const resultados = useQuery({
    queryKey: ['kdd', 'resultados', periodoId],
    queryFn: () => servicioKdd.resultados(periodoId!),
    enabled: periodoId !== undefined,
  })
  const alertas = useQuery({
    queryKey: ['alertas', periodoId, 'resumen'],
    queryFn: () =>
      servicioAlertas.listar({ page: 1, size: 5, periodoId, leida: false }),
    enabled: periodoId !== undefined,
  })
  const horario = useQuery({
    queryKey: ['horarios', 'reciente', periodoId],
    queryFn: async () =>
      (
        await horarios.listar({
          page: 1,
          size: 1,
          archivado: false,
          periodoId,
        })
      ).datos[0] ?? null,
    enabled: periodoId !== undefined,
  })

  const filas = resultados.data ?? []
  const promedio =
    filas.length > 0
      ? filas.reduce((total, fila) => total + fila.puntajeGlobal, 0) /
        filas.length
      : null
  const error =
    periodos.error ?? resultados.error ?? alertas.error ?? horario.error
  const cargando =
    periodos.isPending ||
    (periodoId !== undefined &&
      (resultados.isPending || alertas.isPending || horario.isPending))

  return (
    <>
      <EncabezadoPagina
        titulo="Dashboard"
        descripcion={
          periodo
            ? `Resumen del período ${periodo.nombre}: horario, evaluación docente y alertas.`
            : 'Resumen del período: horario, evaluación docente y alertas.'
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {cargando ? (
          <Tarjeta
            className="h-48 animate-pulse"
            aria-label="Cargando resumen"
          />
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : !periodo ? (
          <Aviso tipo="advertencia">
            Todavía no hay períodos académicos. Crea el primero en
            Configuración.
          </Aviso>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaEstadistica
                valor={String(filas.length)}
                etiqueta="Evaluaciones con resultado"
                ayuda="Analizadas por el pipeline KDD"
              />
              <TarjetaEstadistica
                valor={promedio === null ? 'Sin datos' : puntaje(promedio)}
                etiqueta="Promedio global"
                ayuda="Escala de 1 a 5"
                acento="verde"
              />
              <TarjetaEstadistica
                valor={String(alertas.data?.total ?? 0)}
                etiqueta="Alertas sin leer"
                ayuda="Puntajes bajos y docentes sin evaluar"
                acento="rojo"
              />
              <TarjetaEstadistica
                valor={
                  horario.data ? String(horario.data.totalAsignaciones) : '0'
                }
                etiqueta="Clases en el horario"
                ayuda={
                  horario.data
                    ? `Generado el ${fechaGeneracion(horario.data.creadoEn)}`
                    : 'Todavía no se ha generado'
                }
                acento="morado"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo="Docentes con menor puntaje"
                  acciones={
                    <Link to="/admin/evaluacion" className={ENLACE}>
                      Ver resultados
                    </Link>
                  }
                />
                {filas.length === 0 ? (
                  <EstadoVacio
                    icono={ClipboardList}
                    titulo="Sin resultados todavía"
                    descripcion="Aparecen cuando los estudiantes responden y se ejecuta el KDD."
                  />
                ) : (
                  <ul className="mt-4 divide-y divide-borde">
                    {filas.slice(0, 5).map((fila) => (
                      <li
                        key={fila.evaluacionId}
                        className="flex items-center gap-3 py-2.5"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-texto">
                          {fila.docente.nombre}
                        </span>
                        <span className="text-sm font-bold text-texto">
                          {puntaje(fila.puntajeGlobal)}
                        </span>
                        <Insignia tono={tonoPuntaje(fila.puntajeGlobal)}>
                          {fila.etiqueta}
                        </Insignia>
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>

              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo="Alertas sin leer"
                  acciones={
                    <Link to="/admin/evaluacion/alertas" className={ENLACE}>
                      Ver alertas
                    </Link>
                  }
                />
                {(alertas.data?.datos ?? []).length === 0 ? (
                  <EstadoVacio
                    icono={BellRing}
                    titulo="No hay alertas sin leer"
                  />
                ) : (
                  <ul className="mt-4 divide-y divide-borde">
                    {alertas.data!.datos.map((alerta) => (
                      <li
                        key={alerta.id}
                        className="flex items-start gap-3 py-2.5"
                      >
                        <Insignia tono={TIPO_ALERTA[alerta.tipo].tono}>
                          {TIPO_ALERTA[alerta.tipo].texto}
                        </Insignia>
                        <span className="min-w-0 flex-1 text-sm text-texto">
                          {alerta.mensaje}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>
            </div>

            <Tarjeta className="flex flex-wrap items-center gap-3 p-5">
              <CalendarDays
                className="size-5 shrink-0 text-primario"
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-sm text-texto">
                {horario.data
                  ? `Horario activo. ${TEXTO_VALIDACION[horario.data.estadoValidacion]}`
                  : 'Este período todavía no tiene un horario generado.'}
              </p>
              <Link
                to={
                  horario.data ? '/admin/horarios' : '/admin/horarios/generar'
                }
                className={ENLACE}
              >
                {horario.data ? 'Ver horario' : 'Generar horario'}
              </Link>
            </Tarjeta>
          </>
        )}
      </div>
    </>
  )
}
