import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing, Check } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import { fechaHora, TIPO_ALERTA } from '../../../compartido/evaluacion/formato'
import { servicioAlertas } from '../../../compartido/evaluacion/servicio'
import type { TipoAlerta } from '../../../compartido/evaluacion/tipos'
import {
  Aviso,
  Boton,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Paginador,
  Selector,
  Tarjeta,
} from '../../../compartido/ui'
import { cn } from '../../../compartido/utilidades'
import { PestanasEvaluacion } from '../componentes/PestanasEvaluacion'
import { usePeriodoEvaluacion } from '../componentes/usePeriodoEvaluacion'

const TAMANO = 10
type Lectura = '' | 'pendientes' | 'leidas'

/** Alertas del KDD (Figma 19, RF-40, RF-44): filtro por nivel y marcado como leídas. */
export function Alertas() {
  const consultas = useQueryClient()
  const {
    consulta: periodos,
    periodo,
    elegir,
    opciones,
  } = usePeriodoEvaluacion()
  const [tipo, setTipo] = useState<TipoAlerta | ''>('')
  const [lectura, setLectura] = useState<Lectura>('pendientes')
  const [page, setPage] = useState(1)

  const lista = useQuery({
    queryKey: ['alertas', periodo?.id, tipo, lectura, page],
    queryFn: () =>
      servicioAlertas.listar({
        page,
        size: TAMANO,
        periodoId: periodo!.id,
        tipo: tipo || undefined,
        leida: lectura === '' ? undefined : lectura === 'leidas',
      }),
    enabled: periodo !== undefined,
  })
  const marcar = useMutation({
    mutationFn: servicioAlertas.marcarLeida,
    onSuccess: () =>
      Promise.all([
        consultas.invalidateQueries({ queryKey: ['alertas'] }),
        consultas.invalidateQueries({ queryKey: ['kdd'] }),
      ]),
  })
  const alertas = lista.data?.datos ?? []
  const error = periodos.error ?? lista.error
  const cambiar =
    <T,>(fijar: (valor: T) => void) =>
    (valor: T) => {
      fijar(valor)
      setPage(1)
    }

  return (
    <>
      <EncabezadoPagina
        titulo="Alertas"
        descripcion="Avisos del pipeline KDD: puntajes bajo el umbral y docentes sin evaluaciones."
      />
      <div className="space-y-4 p-4 sm:p-8">
        <PestanasEvaluacion />
        <div className="flex flex-wrap gap-3">
          {opciones.length > 0 && (
            <Selector
              etiqueta="Período"
              className="w-48"
              value={periodo?.id ?? ''}
              onChange={(evento) => cambiar(elegir)(evento.target.value)}
              opciones={opciones}
            />
          )}
          <Selector
            etiqueta="Nivel"
            className="w-44"
            value={tipo}
            onChange={(evento) =>
              cambiar(setTipo)(evento.target.value as TipoAlerta | '')
            }
            opciones={[
              { valor: '', texto: 'Todos los niveles' },
              { valor: 'CRITICO', texto: 'Crítico' },
              { valor: 'ADVERTENCIA', texto: 'Advertencia' },
              { valor: 'INFO', texto: 'Información' },
            ]}
          />
          <Selector
            etiqueta="Lectura"
            className="w-44"
            value={lectura}
            onChange={(evento) =>
              cambiar(setLectura)(evento.target.value as Lectura)
            }
            opciones={[
              { valor: 'pendientes', texto: 'Sin leer' },
              { valor: 'leidas', texto: 'Leídas' },
              { valor: '', texto: 'Todas' },
            ]}
          />
        </div>
        {marcar.isError && (
          <Aviso tipo="error">{mensajeDeError(marcar.error)}</Aviso>
        )}

        {periodos.isPending || (periodo && lista.isPending) ? (
          <Tarjeta
            className="h-48 animate-pulse"
            aria-label="Cargando alertas"
          />
        ) : error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : !periodo ? (
          <Aviso tipo="advertencia">
            Crea primero un período académico en Configuración.
          </Aviso>
        ) : alertas.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={BellRing}
              titulo={
                lectura === 'pendientes'
                  ? 'No hay alertas sin leer'
                  : 'No hay alertas con estos filtros'
              }
              descripcion="Las alertas se generan al ejecutar el pipeline KDD desde Resultados."
            />
          </Tarjeta>
        ) : (
          <Tarjeta className="overflow-hidden">
            <ul className="divide-y divide-borde">
              {alertas.map((alerta) => (
                <li
                  key={alerta.id}
                  className={cn(
                    'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5',
                    alerta.leida && 'bg-superficie-2',
                  )}
                >
                  <Insignia tono={TIPO_ALERTA[alerta.tipo].tono}>
                    {TIPO_ALERTA[alerta.tipo].texto}
                  </Insignia>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm text-texto',
                        !alerta.leida && 'font-semibold',
                      )}
                    >
                      {alerta.mensaje}
                    </p>
                    <p className="mt-0.5 text-xs text-texto-suave">
                      {fechaHora(alerta.creadaEn)}
                    </p>
                  </div>
                  {alerta.leida ? (
                    <Insignia tono="gris">Leída</Insignia>
                  ) : (
                    <Boton
                      variante="secundario"
                      tamano="sm"
                      aria-label={`Marcar como leída la alerta de ${alerta.docente.nombre}`}
                      disabled={marcar.isPending}
                      onClick={() => marcar.mutate(alerta.id)}
                    >
                      <Check className="size-3.5" aria-hidden />
                      Marcar como leída
                    </Boton>
                  )}
                </li>
              ))}
            </ul>
            <Paginador
              page={page}
              size={TAMANO}
              total={lista.data?.total ?? 0}
              onCambiar={setPage}
            />
          </Tarjeta>
        )}
      </div>
    </>
  )
}
