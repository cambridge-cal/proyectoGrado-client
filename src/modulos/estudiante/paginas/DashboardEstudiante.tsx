import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ClipboardCheck, PencilLine } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  Aviso,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
} from '../../../compartido/ui'
import {
  servicioEvaluacionesEstudiante,
  type EvaluacionEstudiante,
} from '../servicios/evaluaciones'

const ENLACE_PRIMARIO =
  'inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primario px-4 text-sm font-semibold text-white hover:bg-primario-oscuro'

function TarjetaEvaluacion({
  evaluacion,
}: {
  evaluacion: EvaluacionEstudiante
}) {
  const cursos = evaluacion.grupos
    .map((grupo) => `${grupo.curso} (${grupo.codigo})`)
    .join(', ')
  return (
    <Tarjeta className="flex flex-wrap items-center gap-x-4 gap-y-3 p-5">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-texto">
          {evaluacion.docente.nombre}
        </p>
        <p className="mt-0.5 text-sm text-texto-suave">{cursos}</p>
        <p className="mt-1 text-xs text-texto-suave">
          {evaluacion.formulario.nombre} · {evaluacion.totalPreguntas}{' '}
          {evaluacion.totalPreguntas === 1 ? 'pregunta' : 'preguntas'}
        </p>
      </div>
      {evaluacion.completada ? (
        <Insignia tono="verde">
          <CheckCircle2 className="size-3.5" aria-hidden />
          Respondida
        </Insignia>
      ) : evaluacion.abierta ? (
        <Link
          to={`/estudiante/evaluaciones/${evaluacion.id}`}
          className={ENLACE_PRIMARIO}
          aria-label={`Evaluar a ${evaluacion.docente.nombre}`}
        >
          <PencilLine className="size-4" aria-hidden />
          Evaluar
        </Link>
      ) : (
        <Insignia tono="gris">Cerrada</Insignia>
      )}
    </Tarjeta>
  )
}

/** Mis evaluaciones (Figma 09, RF-33): solo los docentes que le dictan clase al estudiante. */
export function DashboardEstudiante() {
  const ubicacion = useLocation()
  const enviada = (ubicacion.state as { enviada?: string } | null)?.enviada
  const consulta = useQuery({
    queryKey: ['mis-evaluaciones'],
    queryFn: servicioEvaluacionesEstudiante.listar,
  })
  const evaluaciones = consulta.data ?? []
  const pendientes = evaluaciones.filter((e) => !e.completada && e.abierta)
  const resto = evaluaciones.filter((e) => e.completada || !e.abierta)

  return (
    <>
      <EncabezadoPagina
        titulo="Mis evaluaciones"
        descripcion={
          pendientes.length > 0
            ? `Tienes ${pendientes.length} ${pendientes.length === 1 ? 'evaluación pendiente' : 'evaluaciones pendientes'}. Tus respuestas son anónimas.`
            : 'Evalúa a los docentes de tus grupos. Tus respuestas son anónimas.'
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {enviada && (
          <Aviso tipo="exito">
            Gracias. Tu evaluación de {enviada} se envió de forma anónima.
          </Aviso>
        )}
        {consulta.isPending ? (
          <Tarjeta
            className="h-40 animate-pulse"
            aria-label="Cargando evaluaciones"
          />
        ) : consulta.isError ? (
          <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
        ) : evaluaciones.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={ClipboardCheck}
              titulo="No tienes evaluaciones por ahora"
              descripcion="Aquí aparecen las evaluaciones de los docentes que te dictan clase. Si todavía no te has inscrito, únete primero a tu grupo."
              accion={
                <Link to="/estudiante/grupos" className={ENLACE_PRIMARIO}>
                  Ir a Mis grupos
                </Link>
              }
            />
          </Tarjeta>
        ) : (
          <>
            {pendientes.length > 0 && (
              <section
                aria-label="Evaluaciones pendientes"
                className="space-y-3"
              >
                <h2 className="text-sm font-bold text-texto">Pendientes</h2>
                {pendientes.map((evaluacion) => (
                  <TarjetaEvaluacion
                    key={evaluacion.id}
                    evaluacion={evaluacion}
                  />
                ))}
              </section>
            )}
            {resto.length > 0 && (
              <section
                aria-label="Evaluaciones respondidas"
                className="space-y-3"
              >
                <h2 className="text-sm font-bold text-texto">
                  Respondidas o cerradas
                </h2>
                {resto.map((evaluacion) => (
                  <TarjetaEvaluacion
                    key={evaluacion.id}
                    evaluacion={evaluacion}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
