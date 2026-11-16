import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Play } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import {
  ESTADO_EVALUACION,
  fechaHora,
  puntaje,
  tonoPuntaje,
} from '../../../compartido/evaluacion/formato'
import { servicioKdd } from '../../../compartido/evaluacion/servicio'
import type { ResumenKdd } from '../../../compartido/evaluacion/tipos'
import {
  Aviso,
  Boton,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Selector,
  Tarjeta,
} from '../../../compartido/ui'
import { PestanasEvaluacion } from '../componentes/PestanasEvaluacion'
import { usePeriodoEvaluacion } from '../componentes/usePeriodoEvaluacion'

const plural = (cantidad: number, uno: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? uno : varios}`

function textoResumen(resumen: ResumenKdd): string {
  const { CRITICO, ADVERTENCIA, INFO } = resumen.alertas
  const partes = [
    `Se ${resumen.evaluacionesProcesadas === 1 ? 'analizó' : 'analizaron'} ${plural(resumen.evaluacionesProcesadas, 'evaluación', 'evaluaciones')} del período ${resumen.periodo.nombre}.`,
  ]
  if (resumen.sinRespuestas > 0)
    partes.push(
      `${plural(resumen.sinRespuestas, 'evaluación sigue', 'evaluaciones siguen')} sin respuestas.`,
    )
  partes.push(
    CRITICO + ADVERTENCIA + INFO === 0
      ? 'No se generaron alertas.'
      : `Alertas: ${plural(CRITICO, 'crítica', 'críticas')}, ${plural(ADVERTENCIA, 'advertencia', 'advertencias')} y ${plural(INFO, 'docente', 'docentes')} sin evaluaciones.`,
  )
  return partes.join(' ')
}

/** Resultados KDD por docente y reejecución del pipeline (Figma 05b, RF-39, RF-41). */
export function Evaluacion() {
  const consultas = useQueryClient()
  const {
    consulta: periodos,
    periodo,
    elegir,
    opciones,
  } = usePeriodoEvaluacion()
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const resultados = useQuery({
    queryKey: ['kdd', 'resultados', periodo?.id],
    queryFn: () => servicioKdd.resultados(periodo!.id),
    enabled: periodo !== undefined,
  })
  const ejecutar = useMutation({
    mutationFn: () => servicioKdd.ejecutar(periodo!.id),
    onSuccess: async (resumen) => {
      setAviso({ tipo: 'exito', texto: textoResumen(resumen) })
      await Promise.all([
        consultas.invalidateQueries({ queryKey: ['kdd'] }),
        consultas.invalidateQueries({ queryKey: ['alertas'] }),
        consultas.invalidateQueries({ queryKey: ['evaluaciones'] }),
      ])
    },
    onError: (error) =>
      setAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })
  const filas = resultados.data ?? []
  const error = periodos.error ?? resultados.error

  return (
    <>
      <EncabezadoPagina
        titulo="Evaluación docente"
        descripcion="Puntaje global y por dimensión de cada docente, calculado por el pipeline KDD."
        acciones={
          <>
            {opciones.length > 0 && (
              <Selector
                etiqueta="Período"
                etiquetaOculta
                className="w-48"
                value={periodo?.id ?? ''}
                onChange={(evento) => {
                  setAviso(null)
                  elegir(evento.target.value)
                }}
                opciones={opciones}
              />
            )}
            <Boton
              onClick={() => ejecutar.mutate()}
              disabled={!periodo}
              cargando={ejecutar.isPending}
            >
              <Play className="size-4" aria-hidden />
              Ejecutar KDD
            </Boton>
          </>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <PestanasEvaluacion />
        {ejecutar.isPending && (
          <Aviso tipo="info">
            Analizando las respuestas del período. Puede tardar unos segundos.
          </Aviso>
        )}
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        {periodos.isPending || (periodo && resultados.isPending) ? (
          <Tarjeta
            className="h-48 animate-pulse"
            aria-label="Cargando resultados"
          />
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : !periodo ? (
          <Aviso tipo="advertencia">
            Crea primero un período académico en Configuración.
          </Aviso>
        ) : filas.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={ClipboardList}
              titulo="Todavía no hay resultados en este período"
              descripcion="Aparecen cuando un grupo termina de responder una evaluación, o al ejecutar el KDD con las respuestas recibidas hasta ahora."
            />
          </Tarjeta>
        ) : (
          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-superficie-2 text-xs text-texto-suave">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Docente</th>
                    <th className="px-4 py-3 font-semibold">Puntaje global</th>
                    <th className="px-4 py-3 font-semibold">Por dimensión</th>
                    <th className="px-4 py-3 font-semibold">Participación</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {filas.map((fila) => (
                    <tr key={fila.evaluacionId}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-texto">
                          {fila.docente.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-texto-suave">
                          {fila.formulario.nombre}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-texto">
                            {puntaje(fila.puntajeGlobal)}
                          </span>
                          <Insignia tono={tonoPuntaje(fila.puntajeGlobal)}>
                            {fila.etiqueta}
                          </Insignia>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-texto-suave">
                        <ul className="space-y-0.5">
                          {fila.puntajesPorDimension.map((dimension) => (
                            <li key={dimension.dimensionId}>
                              {dimension.nombre}:{' '}
                              <span className="font-semibold text-texto">
                                {dimension.promedio === null
                                  ? 'sin respuestas'
                                  : puntaje(dimension.promedio)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-texto">
                        {fila.participantes} de {fila.elegibles}
                        <p className="mt-0.5 text-xs text-texto-suave">
                          {fechaHora(fila.calculadoEn)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Insignia tono={ESTADO_EVALUACION[fila.estado].tono}>
                            {ESTADO_EVALUACION[fila.estado].texto}
                          </Insignia>
                          {fila.parcial && (
                            <Insignia tono="gris">Parcial</Insignia>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        )}
      </div>
    </>
  )
}
