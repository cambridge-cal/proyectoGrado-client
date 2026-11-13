import { useQuery } from '@tanstack/react-query'
import { MessageSquareText, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import { fechaHora, tonoPuntaje } from '../../../compartido/evaluacion/formato'
import {
  BarrasDimensiones,
  MedidorPuntaje,
} from '../../../compartido/evaluacion/GraficosResultado'
import { servicioKdd } from '../../../compartido/evaluacion/servicio'
import {
  Aviso,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Selector,
  Tarjeta,
  TituloTarjeta,
} from '../../../compartido/ui'

/** Mis resultados (Figma 08, RF-42, RF-43): puntaje global, dimensiones y comentarios por período. */
export function DashboardDocente() {
  const [elegido, setElegido] = useState<string>()
  const periodos = useQuery({
    queryKey: ['kdd', 'mis-periodos'],
    queryFn: servicioKdd.misPeriodos,
  })
  const periodoId =
    elegido ??
    (periodos.data?.find((periodo) => periodo.activo) ?? periodos.data?.[0])?.id
  const consulta = useQuery({
    queryKey: ['kdd', 'mis-resultados', periodoId ?? 'activo'],
    queryFn: () => servicioKdd.misResultados(periodoId),
    enabled: periodos.isSuccess,
  })
  const resultados = consulta.data?.resultados ?? []
  const error = periodos.error ?? consulta.error

  return (
    <>
      <EncabezadoPagina
        titulo="Mis resultados de evaluación"
        descripcion="Lo que respondieron tus estudiantes, de forma anónima, en cada período."
        acciones={
          periodos.data &&
          periodos.data.length > 0 && (
            <Selector
              etiqueta="Período"
              etiquetaOculta
              className="w-48"
              value={periodoId ?? ''}
              onChange={(evento) => setElegido(evento.target.value)}
              opciones={periodos.data.map((periodo) => ({
                valor: periodo.id,
                texto: periodo.activo
                  ? `${periodo.nombre} (activo)`
                  : periodo.nombre,
              }))}
            />
          )
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {periodos.isPending || (consulta.isPending && periodos.isSuccess) ? (
          <Tarjeta
            className="h-64 animate-pulse"
            aria-label="Cargando resultados"
          />
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : resultados.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={TrendingUp}
              titulo="Todavía no hay resultados en este período"
              descripcion="Aparecen cuando tus estudiantes terminan de responder la evaluación y el sistema la analiza."
            />
          </Tarjeta>
        ) : (
          resultados.map((resultado) => (
            <section
              key={resultado.evaluacionId}
              aria-label={resultado.formulario.nombre}
              className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
            >
              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo={resultado.formulario.nombre}
                  descripcion={`Calculado el ${fechaHora(resultado.calculadoEn)}`}
                />
                <div className="mt-5 flex flex-wrap items-center gap-5">
                  <MedidorPuntaje
                    valor={resultado.puntajeGlobal}
                    etiqueta={resultado.etiqueta}
                  />
                  <div className="space-y-2">
                    <Insignia tono={tonoPuntaje(resultado.puntajeGlobal)}>
                      {resultado.etiqueta}
                    </Insignia>
                    <p className="text-sm text-texto">
                      <span className="font-bold">
                        {resultado.participantes}
                      </span>{' '}
                      de {resultado.elegibles}{' '}
                      {resultado.elegibles === 1
                        ? 'estudiante respondió'
                        : 'estudiantes respondieron'}
                    </p>
                  </div>
                </div>
              </Tarjeta>
              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo="Resultado por dimensión"
                  descripcion="Promedio de 1 a 5 y peso de cada dimensión en el puntaje global."
                />
                <div className="mt-5">
                  <BarrasDimensiones
                    dimensiones={resultado.puntajesPorDimension}
                  />
                </div>
              </Tarjeta>
              <Tarjeta className="p-5 lg:col-span-2">
                <TituloTarjeta
                  titulo="Comentarios anónimos"
                  descripcion="No se guarda quién escribió cada comentario."
                />
                {resultado.comentarios.length === 0 ? (
                  <p className="mt-4 text-sm text-texto-suave">
                    Nadie dejó comentarios en esta evaluación.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {resultado.comentarios.map((comentario, indice) => (
                      <li
                        key={indice}
                        className="flex gap-2.5 rounded-control bg-superficie-2 px-3.5 py-3 text-sm text-texto"
                      >
                        <MessageSquareText
                          className="mt-0.5 size-4 shrink-0 text-texto-suave"
                          aria-hidden
                        />
                        {comentario}
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>
            </section>
          ))
        )}
      </div>
    </>
  )
}
