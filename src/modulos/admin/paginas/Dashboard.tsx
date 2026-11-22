import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  BellRing,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
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
import { ProximasClases } from '../../../compartido/horario/ProximasClases'
import {
  Aviso,
  BannerSaludo,
  CLASE_ACCION_BANNER,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
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

  const detalle = useQuery({
    queryKey: ['horarios', 'detalle', horario.data?.id],
    queryFn: () => horarios.obtener(horario.data!.id),
    enabled: Boolean(horario.data?.id),
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
          <div className="space-y-4" aria-label="Cargando resumen">
            <div className="esqueleto h-56 rounded-[20px]" />
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((k) => (
                <div key={k} className="esqueleto h-48 rounded-tarjeta" />
              ))}
            </div>
          </div>
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : !periodo ? (
          <Aviso tipo="advertencia">
            Todavía no hay períodos académicos. Crea el primero en
            Configuración.
          </Aviso>
        ) : (
          <>
            <BannerSaludo
              titulo={
                horario.data
                  ? `${horario.data.totalAsignaciones} clases programadas en el período ${periodo.nombre}`
                  : `El período ${periodo.nombre} todavía no tiene horario`
              }
              descripcion={
                horario.data
                  ? `Generado el ${fechaGeneracion(horario.data.creadoEn)}. ${TEXTO_VALIDACION[horario.data.estadoValidacion]}`
                  : 'Genera el horario con el motor de IA cuando la configuración académica esté lista.'
              }
              accion={
                <Link
                  to={
                    horario.data ? '/admin/horarios' : '/admin/horarios/generar'
                  }
                  className={CLASE_ACCION_BANNER}
                >
                  {horario.data ? 'Ver horario' : 'Generar horario'}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              }
            >
              <ul className="escalonado grid grid-cols-3 gap-2 sm:gap-3">
                <TarjetaModulo
                  numero="01"
                  icono={CalendarDays}
                  titulo="Horarios"
                  valor={
                    horario.data ? String(horario.data.totalAsignaciones) : '0'
                  }
                  detalle={
                    horario.data
                      ? horario.data.validadoGemini
                        ? 'clases · validado por Gemini'
                        : 'clases · sin validar por Gemini'
                      : 'sin horario generado'
                  }
                  fondo="bg-azul-suave"
                  ruta="/admin/horarios"
                />
                <TarjetaModulo
                  numero="02"
                  icono={ClipboardList}
                  titulo="Evaluación"
                  valor={promedio === null ? '—' : puntaje(promedio)}
                  detalle={
                    promedio === null
                      ? 'promedio global · sin resultados'
                      : `promedio global de ${filas.length} ${filas.length === 1 ? 'evaluación' : 'evaluaciones'}`
                  }
                  progreso={promedio === null ? undefined : promedio / 5}
                  fondo="bg-morado-suave"
                  ruta="/admin/evaluacion"
                />
                <TarjetaModulo
                  numero="03"
                  icono={BellRing}
                  titulo="Alertas"
                  valor={String(alertas.data?.total ?? 0)}
                  detalle="sin leer · puntajes bajos y docentes sin evaluar"
                  fondo="bg-naranja-suave"
                  ruta="/admin/evaluacion/alertas"
                />
              </ul>
            </BannerSaludo>

            <div className="escalonado grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo="Próximas clases"
                  acciones={
                    <Link to="/admin/horarios" className={ENLACE}>
                      Ver grilla
                    </Link>
                  }
                />
                <div className="mt-4">
                  {detalle.isPending && horario.data ? (
                    <div className="space-y-2" aria-label="Cargando clases">
                      {[0, 1, 2].map((k) => (
                        <div key={k} className="esqueleto h-16 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <ProximasClases
                      asignaciones={detalle.data?.asignaciones ?? []}
                    />
                  )}
                </div>
              </Tarjeta>
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
          </>
        )}
      </div>
    </>
  )
}

/** Tarjeta de color dentro del banner, con enlace al módulo (inspirada en el Figma 13). */
function TarjetaModulo({
  numero,
  icono: Icono,
  titulo,
  valor,
  detalle,
  progreso,
  fondo,
  ruta,
}: {
  numero: string
  icono: LucideIcon
  titulo: string
  valor: string
  detalle: string
  progreso?: number
  fondo: string
  ruta: string
}) {
  return (
    <li>
      <Link
        to={ruta}
        className={`elevable group flex h-full flex-col rounded-2xl p-3 text-marino-900 focus-visible:outline-white sm:p-4 ${fondo}`}
      >
        <span className="flex items-center justify-between text-xs font-semibold text-marino-900/60">
          {numero}
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
        <Icono className="mt-2 size-5 sm:mt-4 sm:size-6" aria-hidden />
        <span className="mt-2 text-[13px] font-bold sm:mt-3 sm:text-[15px]">
          {titulo}
        </span>
        <span className="mt-1 text-xl leading-none font-bold sm:text-[26px]">
          {valor}
        </span>
        <span className="mt-1.5 hidden text-[11px] leading-snug text-marino-900/70 sm:block">
          {detalle}
        </span>
        {progreso !== undefined && (
          <span className="mt-3 h-1.5 overflow-hidden rounded-full bg-marino-900/10">
            <span
              className="block h-full rounded-full bg-marino-900 transition-[width] duration-700"
              style={{
                width: `${Math.round(Math.min(1, Math.max(0, progreso)) * 100)}%`,
              }}
            />
          </span>
        )}
      </Link>
    </li>
  )
}
