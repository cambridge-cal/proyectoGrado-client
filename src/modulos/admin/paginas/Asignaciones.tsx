import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Trash2, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  Aviso,
  Boton,
  DialogoConfirmacion,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Selector,
  Tarjeta,
  type Tono,
} from '../../../compartido/ui'
import { PestanasEvaluacion } from '../componentes/PestanasEvaluacion'
import { docentes as servicioDocentes } from '../servicios/configuracion'
import {
  servicioEvaluaciones,
  servicioFormularios,
  type EstadoEvaluacion,
  type Evaluacion,
} from '../servicios/evaluacion'

const ESTADO: Record<EstadoEvaluacion, { texto: string; tono: Tono }> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'ambar' },
  EN_PROGRESO: { texto: 'En progreso', tono: 'azul' },
  COMPLETADA: { texto: 'Completada', tono: 'turquesa' },
  ANALIZADA: { texto: 'Analizada', tono: 'morado' },
  ALERTA: { texto: 'Alerta', tono: 'rojo' },
  CERRADA: { texto: 'Cerrada', tono: 'verde' },
  ARCHIVADA: { texto: 'Archivada', tono: 'gris' },
}
/** Un estado que el cliente todavía no conoce se muestra tal cual, sin romper la tabla. */
const estadoDe = (estado: string) =>
  ESTADO[estado as EstadoEvaluacion] ?? { texto: estado, tono: 'gris' as Tono }

const plural = (cantidad: number, uno: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? uno : varios}`

/** Asignación de un formulario a un docente o a todos (RF-31, RF-32). */
export function Asignaciones() {
  const consultas = useQueryClient()
  const [parametros, setParametros] = useSearchParams()
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [porQuitar, setPorQuitar] = useState<Evaluacion | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const formularios = useQuery({
    queryKey: ['formularios', 'todos'],
    queryFn: async () =>
      (await servicioFormularios.listar({ page: 1, size: 100 })).datos,
  })
  const docentes = useQuery({
    queryKey: ['docentes', 'todos'],
    queryFn: async () =>
      (await servicioDocentes.listar({ page: 1, size: 100 })).datos,
  })

  const formularioId =
    parametros.get('formulario') ?? formularios.data?.[0]?.id ?? ''
  const listaFormularios = formularios.data ?? []
  const formulario = listaFormularios.find((f) => f.id === formularioId)

  const evaluaciones = useQuery({
    queryKey: ['evaluaciones', formularioId],
    queryFn: async () =>
      (await servicioEvaluaciones.listar({ formularioId, page: 1, size: 100 }))
        .datos,
    enabled: formularioId !== '',
  })
  const porDocente = new Map(
    (evaluaciones.data ?? []).map((evaluacion) => [
      evaluacion.docente.id,
      evaluacion,
    ]),
  )
  const activos = (docentes.data ?? []).filter((docente) => docente.activo)
  const sinAsignar = activos.filter((docente) => !porDocente.has(docente.id))
  const elegidos = sinAsignar.filter((docente) => seleccion.has(docente.id))

  const refrescar = () =>
    consultas.invalidateQueries({ queryKey: ['evaluaciones'] })

  const asignar = useMutation({
    mutationFn: async (ids: string[]) =>
      ids.length === 1
        ? (await servicioEvaluaciones.asignar(formularioId, ids[0]!),
          { creadas: 1, omitidas: 0 })
        : servicioEvaluaciones.asignarMasivo(formularioId, ids),
    onSuccess: async ({ creadas, omitidas }) => {
      setSeleccion(new Set())
      setAviso({
        tipo: 'exito',
        texto:
          `Se asignó el formulario a ${plural(creadas, 'docente', 'docentes')}.` +
          (omitidas > 0
            ? ` ${plural(omitidas, 'ya lo tenía', 'ya lo tenían')} asignado.`
            : ''),
      })
      await refrescar()
    },
    onError: (error) =>
      setAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })

  const quitar = useMutation({
    mutationFn: (evaluacion: Evaluacion) =>
      servicioEvaluaciones.eliminar(evaluacion.id),
    onSuccess: async (_respuesta, evaluacion) => {
      setPorQuitar(null)
      setAviso({
        tipo: 'exito',
        texto: `Se eliminó la evaluación de ${evaluacion.docente.usuario.nombre}.`,
      })
      await refrescar()
    },
    onError: (error) => {
      setPorQuitar(null)
      setAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })

  function alternar(id: string) {
    setSeleccion((actual) => {
      const nueva = new Set(actual)
      if (nueva.has(id)) nueva.delete(id)
      else nueva.add(id)
      return nueva
    })
  }

  const todosElegidos =
    sinAsignar.length > 0 && elegidos.length === sinAsignar.length
  const cargando =
    formularios.isPending ||
    docentes.isPending ||
    (formularioId !== '' && evaluaciones.isPending)
  const error = formularios.error ?? docentes.error ?? evaluaciones.error

  return (
    <>
      <EncabezadoPagina
        titulo="Asignación de evaluaciones"
        descripcion="Asigna un formulario a un docente o a todos. Cada asignación crea una evaluación que responden sus estudiantes."
      />
      <div className="space-y-4 p-4 sm:p-8">
        <PestanasEvaluacion />
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        {cargando ? (
          <Tarjeta
            className="h-48 animate-pulse"
            aria-label="Cargando asignaciones"
          />
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : listaFormularios.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={Send}
              titulo="Primero crea un formulario"
              descripcion="Las evaluaciones se asignan a partir de un formulario con sus dimensiones y preguntas."
              accion={
                <Link
                  to="/admin/evaluacion/formularios"
                  className="inline-flex h-11 items-center rounded-control bg-primario px-4 text-sm font-semibold text-white hover:bg-primario-oscuro"
                >
                  Ir a Formularios
                </Link>
              }
            />
          </Tarjeta>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Selector
                etiqueta="Formulario"
                className="w-full max-w-sm"
                value={formularioId}
                onChange={(evento) => {
                  setSeleccion(new Set())
                  setAviso(null)
                  setParametros({ formulario: evento.target.value })
                }}
                opciones={listaFormularios.map((f) => ({
                  valor: f.id,
                  texto: `${f.nombre} · ${f.periodoAcademico.nombre}`,
                }))}
              />
              <Boton
                onClick={() => asignar.mutate(elegidos.map((d) => d.id))}
                disabled={elegidos.length === 0}
                cargando={asignar.isPending}
              >
                <Send className="size-4" aria-hidden />
                {elegidos.length === 0
                  ? 'Asignar'
                  : `Asignar a ${plural(elegidos.length, 'docente', 'docentes')}`}
              </Boton>
            </div>
            {formulario && !formulario.activo && (
              <Aviso tipo="advertencia">
                Este formulario está inactivo. Actívalo desde Formularios antes
                de asignarlo.
              </Aviso>
            )}

            {activos.length === 0 ? (
              <Tarjeta>
                <EstadoVacio
                  icono={UserRoundCheck}
                  titulo="No hay docentes activos"
                  descripcion="Crea los docentes en Usuarios para poder asignarles evaluaciones."
                />
              </Tarjeta>
            ) : (
              <Tarjeta className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-superficie-2 text-xs text-texto-suave">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            className="size-4 accent-primario"
                            aria-label="Seleccionar todos los docentes sin asignar"
                            checked={todosElegidos}
                            disabled={sinAsignar.length === 0}
                            onChange={() =>
                              setSeleccion(
                                todosElegidos
                                  ? new Set()
                                  : new Set(sinAsignar.map((d) => d.id)),
                              )
                            }
                          />
                        </th>
                        <th className="px-4 py-3 font-semibold">Docente</th>
                        <th className="px-4 py-3 font-semibold">
                          Especialidad
                        </th>
                        <th className="px-4 py-3 font-semibold">Evaluación</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borde">
                      {activos.map((docente) => {
                        const evaluacion = porDocente.get(docente.id)
                        return (
                          <tr key={docente.id}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className="size-4 accent-primario"
                                aria-label={`Seleccionar a ${docente.nombre}`}
                                checked={
                                  evaluacion !== undefined ||
                                  seleccion.has(docente.id)
                                }
                                disabled={evaluacion !== undefined}
                                onChange={() => alternar(docente.id)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-texto">
                                {docente.nombre}
                              </p>
                              <p className="mt-0.5 text-xs text-texto-suave">
                                {docente.email}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-texto">
                              {docente.especialidad}
                            </td>
                            <td className="px-4 py-3">
                              {evaluacion ? (
                                <Insignia
                                  tono={estadoDe(evaluacion.estado).tono}
                                >
                                  {estadoDe(evaluacion.estado).texto}
                                </Insignia>
                              ) : (
                                <Insignia tono="gris">Sin asignar</Insignia>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {evaluacion && (
                                <Boton
                                  variante="peligro"
                                  tamano="sm"
                                  aria-label={`Eliminar la evaluación de ${docente.nombre}`}
                                  onClick={() => {
                                    setAviso(null)
                                    setPorQuitar(evaluacion)
                                  }}
                                >
                                  <Trash2 className="size-3.5" aria-hidden />
                                  Eliminar
                                </Boton>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-borde px-4 py-3 text-xs text-texto-suave">
                  {plural(
                    porDocente.size,
                    'docente asignado',
                    'docentes asignados',
                  )}{' '}
                  de {activos.length}.
                </p>
              </Tarjeta>
            )}
          </>
        )}
      </div>

      <DialogoConfirmacion
        abierto={porQuitar !== null}
        titulo={`¿Eliminar la evaluación de ${porQuitar?.docente.usuario.nombre ?? ''}?`}
        textoConfirmar="Eliminar evaluación"
        cargando={quitar.isPending}
        onConfirmar={() => porQuitar && quitar.mutate(porQuitar)}
        onCancelar={() => setPorQuitar(null)}
      >
        Se eliminarán también las respuestas que los estudiantes ya hayan
        enviado para este docente. Esta acción no se puede deshacer.
      </DialogoConfirmacion>
    </>
  )
}
