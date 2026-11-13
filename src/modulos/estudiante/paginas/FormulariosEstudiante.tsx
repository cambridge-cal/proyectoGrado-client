import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, ClipboardX, ShieldCheck } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  Aviso,
  Boton,
  EncabezadoPagina,
  EstadoVacio,
  Tarjeta,
} from '../../../compartido/ui'
import { cn } from '../../../compartido/utilidades'
import { servicioEvaluacionesEstudiante } from '../servicios/evaluaciones'

const ESCALA = [1, 2, 3, 4, 5]
export const MINIMO_COMENTARIO = 30
const MAXIMO_COMENTARIO = 1000

const ENLACE_VOLVER =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-primario hover:underline'

function Pregunta({
  numero,
  texto,
  valor,
  falta,
  onCambiar,
}: {
  numero: string
  texto: string
  valor: number | undefined
  falta: boolean
  onCambiar: (valor: number) => void
}) {
  const nombre = useId()
  return (
    <fieldset className="py-4">
      <legend className="text-sm font-medium text-texto">
        {numero}. {texto}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {ESCALA.map((opcion) => (
          <label
            key={opcion}
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center rounded-control border text-sm font-semibold',
              'has-focus-visible:ring-4 has-focus-visible:ring-primario/25',
              valor === opcion
                ? 'border-primario bg-primario text-white'
                : 'border-borde bg-superficie-2 text-texto hover:border-primario',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={nombre}
              value={opcion}
              checked={valor === opcion}
              onChange={() => onCambiar(opcion)}
              aria-label={`${opcion} de 5`}
            />
            {opcion}
          </label>
        ))}
      </div>
      {falta && (
        <p className="mt-2 text-xs text-peligro-texto" role="alert">
          Falta responder esta pregunta.
        </p>
      )}
    </fieldset>
  )
}

/** Evaluar docente (Figma 10, RF-34 a RF-36, RNF-10): escala de 1 a 5 y comentario anónimo opcional. */
export function FormulariosEstudiante() {
  const { evaluacionId = '' } = useParams()
  const navegar = useNavigate()
  const consultas = useQueryClient()
  const idComentario = useId()
  const [valores, setValores] = useState<Record<string, number>>({})
  const [comentario, setComentario] = useState('')
  const [intentado, setIntentado] = useState(false)

  const consulta = useQuery({
    queryKey: ['mis-evaluaciones', evaluacionId],
    queryFn: () => servicioEvaluacionesEstudiante.obtener(evaluacionId),
    retry: false,
  })
  const evaluacion = consulta.data
  const preguntas = (evaluacion?.dimensiones ?? []).flatMap(
    (dimension) => dimension.preguntas,
  )
  const respondidas = preguntas.filter(
    (pregunta) => valores[pregunta.id] !== undefined,
  ).length
  const limpio = comentario.trim()
  const comentarioCorto = limpio.length > 0 && limpio.length < MINIMO_COMENTARIO

  const enviar = useMutation({
    mutationFn: () =>
      servicioEvaluacionesEstudiante.responder(evaluacionId, {
        respuestas: preguntas.map((pregunta) => ({
          preguntaId: pregunta.id,
          valor: valores[pregunta.id]!,
        })),
        ...(limpio ? { comentario: limpio } : {}),
      }),
    onSuccess: async () => {
      await consultas.invalidateQueries({ queryKey: ['mis-evaluaciones'] })
      await navegar('/estudiante', {
        state: { enviada: evaluacion?.docente.nombre },
      })
    },
  })

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    setIntentado(true)
    if (respondidas < preguntas.length || comentarioCorto) return
    enviar.mutate()
  }

  const volver = (
    <Link to="/estudiante" className={ENLACE_VOLVER}>
      <ArrowLeft className="size-4" aria-hidden />
      Volver a Mis evaluaciones
    </Link>
  )

  if (consulta.isPending) {
    return (
      <div className="p-4 sm:p-8">
        <Tarjeta
          className="h-64 animate-pulse"
          aria-label="Cargando evaluación"
        />
      </div>
    )
  }
  if (consulta.isError || !evaluacion) {
    const noExiste =
      axios.isAxiosError(consulta.error) &&
      consulta.error.response?.status === 404
    return (
      <>
        <EncabezadoPagina titulo="Evaluar docente" />
        <div className="space-y-4 p-4 sm:p-8">
          {noExiste ? (
            <Tarjeta>
              <EstadoVacio
                icono={ClipboardX}
                titulo="Esta evaluación no está disponible"
                descripcion="Solo puedes evaluar a los docentes que te dictan clase en el horario activo."
                accion={volver}
              />
            </Tarjeta>
          ) : (
            <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
          )}
        </div>
      </>
    )
  }

  const cerrada = evaluacion.completada || !evaluacion.abierta
  const numeroDe = new Map(
    preguntas.map((pregunta, indice) => [pregunta.id, indice + 1]),
  )

  return (
    <>
      <EncabezadoPagina
        titulo={`Evaluar a ${evaluacion.docente.nombre}`}
        descripcion={`${evaluacion.formulario.nombre} · ${evaluacion.grupos.map((grupo) => grupo.curso).join(', ')}`}
      />
      <div className="space-y-4 p-4 sm:p-8">
        {volver}
        {cerrada ? (
          <Aviso tipo={evaluacion.completada ? 'exito' : 'info'}>
            {evaluacion.completada
              ? 'Ya respondiste esta evaluación. Gracias por tu opinión.'
              : 'Esta evaluación ya no recibe respuestas.'}
          </Aviso>
        ) : (
          <form onSubmit={alEnviar} noValidate className="space-y-4">
            <Aviso tipo="info">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="size-4" aria-hidden />
                Tus respuestas son anónimas.
              </span>{' '}
              El docente no puede saber quién respondió. Califica de 1 (muy
              bajo) a 5 (excelente).
            </Aviso>

            {evaluacion.dimensiones.map((dimension) => (
              <Tarjeta key={dimension.id} className="px-5 pt-5 pb-1">
                <h2 className="text-[15px] font-bold text-texto">
                  {dimension.nombre}
                </h2>
                <div className="divide-y divide-borde">
                  {dimension.preguntas.map((pregunta) => (
                    <Pregunta
                      key={pregunta.id}
                      numero={String(numeroDe.get(pregunta.id))}
                      texto={pregunta.texto}
                      valor={valores[pregunta.id]}
                      falta={intentado && valores[pregunta.id] === undefined}
                      onCambiar={(valor) =>
                        setValores((actual) => ({
                          ...actual,
                          [pregunta.id]: valor,
                        }))
                      }
                    />
                  ))}
                </div>
              </Tarjeta>
            ))}

            <Tarjeta className="p-5">
              <label
                htmlFor={idComentario}
                className="text-[15px] font-bold text-texto"
              >
                Comentario anónimo (opcional)
              </label>
              <textarea
                id={idComentario}
                rows={4}
                maxLength={MAXIMO_COMENTARIO}
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value)}
                aria-invalid={intentado && comentarioCorto ? true : undefined}
                aria-describedby={`${idComentario}-ayuda`}
                placeholder="¿Qué destacas de este docente o qué podría mejorar?"
                className={cn(
                  'mt-3 w-full rounded-control border bg-superficie-2 px-3.5 py-3 text-sm text-texto',
                  'placeholder:text-texto-suave focus:border-primario focus:bg-superficie focus:ring-4 focus:ring-primario/15 focus:outline-none',
                  intentado && comentarioCorto
                    ? 'border-peligro'
                    : 'border-borde',
                )}
              />
              <p
                id={`${idComentario}-ayuda`}
                className={cn(
                  'mt-1.5 text-xs',
                  intentado && comentarioCorto
                    ? 'text-peligro-texto'
                    : 'text-texto-suave',
                )}
                role={intentado && comentarioCorto ? 'alert' : undefined}
              >
                {comentarioCorto
                  ? `Si escribes un comentario, debe tener al menos ${MINIMO_COMENTARIO} caracteres (llevas ${limpio.length}).`
                  : `Si lo escribes, mínimo ${MINIMO_COMENTARIO} caracteres. No incluyas datos que te identifiquen.`}
              </p>
            </Tarjeta>

            {enviar.isError && (
              <Aviso tipo="error">{mensajeDeError(enviar.error)}</Aviso>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-texto-suave" aria-live="polite">
                {respondidas} de {preguntas.length} preguntas respondidas
              </p>
              <Boton type="submit" tamano="lg" cargando={enviar.isPending}>
                Enviar evaluación
              </Boton>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
