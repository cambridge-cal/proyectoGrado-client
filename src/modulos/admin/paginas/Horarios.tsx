import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Archive, CalendarDays, History, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import { useFiltrosHorario } from '../../../compartido/horario/FiltrosHorario'
import {
  aptitudRelativa,
  duracion,
  fechaGeneracion,
  TEXTO_VALIDACION,
} from '../../../compartido/horario/formato'
import {
  GrillaHorario,
  LeyendaNiveles,
} from '../../../compartido/horario/GrillaHorario'
import { InsigniaValidacion } from '../../../compartido/horario/InsigniaValidacion'
import type { HorarioDetalle } from '../../../compartido/tipos'
import {
  Aviso,
  Boton,
  DialogoConfirmacion,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
  TituloTarjeta,
} from '../../../compartido/ui'
import { cn } from '../../../compartido/utilidades'
import { horarios } from '../servicios/horarios'

const ENLACE_BOTON =
  'inline-flex h-[34px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors'
const ENLACE_SECUNDARIO = cn(
  ENLACE_BOTON,
  'border border-borde bg-superficie text-texto hover:bg-superficie-2',
)
const ENLACE_PRIMARIO = cn(
  ENLACE_BOTON,
  'bg-primario text-white hover:bg-primario-oscuro',
)

const SEVERIDAD = { ALTA: 'rojo', MEDIA: 'ambar', BAJA: 'gris' } as const

/**
 * Horarios (Figma 03b, RF-21, RF-22, RF-24, RF-25): el horario activo más reciente, o el
 * indicado en la ruta, en la grilla semanal con filtros.
 */
export function Horarios() {
  const { horarioId } = useParams()
  const navegar = useNavigate()
  const clienteConsultas = useQueryClient()
  const [dialogo, setDialogo] = useState<'archivar' | 'eliminar' | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const consulta = useQuery({
    queryKey: horarioId ? ['horario', horarioId] : ['horario-actual'],
    queryFn: () =>
      horarioId ? horarios.obtener(horarioId) : horarios.actual(),
    retry: false,
  })
  const horario = consulta.data
  const { controles, filtradas } = useFiltrosHorario(
    horario?.asignaciones ?? [],
  )

  const refrescar = () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: ['horario-actual'] }),
      clienteConsultas.invalidateQueries({ queryKey: ['horario'] }),
      clienteConsultas.invalidateQueries({ queryKey: ['horarios'] }),
    ])

  const archivar = useMutation({
    mutationFn: (h: HorarioDetalle) => horarios.archivar(h.periodo.id),
    onSuccess: async ({ archivados }) => {
      setDialogo(null)
      setAviso({
        tipo: 'exito',
        texto: `Se archivaron ${archivados} ${archivados === 1 ? 'horario' : 'horarios'}. Siguen disponibles en el historial.`,
      })
      await refrescar()
    },
    onError: (error) => {
      setDialogo(null)
      setAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })
  const eliminar = useMutation({
    mutationFn: (h: HorarioDetalle) => horarios.eliminar(h.id),
    onSuccess: async () => {
      setDialogo(null)
      await refrescar()
      if (horarioId)
        await navegar('/admin/horarios/historial', { replace: true })
      else setAviso({ tipo: 'exito', texto: 'Se eliminó el horario.' })
    },
    onError: (error) => {
      setDialogo(null)
      setAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })

  const noHay =
    consulta.isError &&
    axios.isAxiosError(consulta.error) &&
    consulta.error.response?.status === 404

  return (
    <>
      <EncabezadoPagina
        titulo={
          horario ? `Horarios · Período ${horario.periodo.nombre}` : 'Horarios'
        }
        insignia={
          horario && (
            <span className="flex items-center gap-2">
              <InsigniaValidacion horario={horario} />
              {horario.archivado && <Insignia tono="gris">Archivado</Insignia>}
            </span>
          )
        }
        descripcion={
          horario
            ? `Generado el ${fechaGeneracion(horario.creadoEn)} · Aptitud ${aptitudRelativa(horario)} · ${duracion(horario.tiempoEjecucionMs)}`
            : 'Horario semanal generado por el motor de IA.'
        }
        acciones={
          <>
            <Link to="/admin/horarios/historial" className={ENLACE_SECUNDARIO}>
              <History className="size-4" aria-hidden /> Historial
            </Link>
            {horario && !horario.archivado && (
              <Boton
                variante="secundario"
                tamano="sm"
                onClick={() => setDialogo('archivar')}
              >
                <Archive className="size-4" aria-hidden /> Archivar
              </Boton>
            )}
            {horario && (
              <Boton
                variante="peligro"
                tamano="sm"
                onClick={() => setDialogo('eliminar')}
              >
                <Trash2 className="size-4" aria-hidden /> Eliminar
              </Boton>
            )}
            <Link to="/admin/horarios/generar" className={ENLACE_PRIMARIO}>
              <Sparkles className="size-4" aria-hidden /> Generar con IA
            </Link>
          </>
        }
      />

      <div className="space-y-4 p-4 sm:p-8">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        {consulta.isPending ? (
          <Tarjeta
            className="h-72 animate-pulse"
            aria-label="Cargando horario"
          />
        ) : noHay ? (
          <Tarjeta>
            <EstadoVacio
              icono={CalendarDays}
              titulo="Todavía no hay un horario activo"
              descripcion="Genera el horario del período con el motor de IA. Tarda menos de 3 minutos (RNF-02)."
            />
            <div className="flex justify-center pb-8">
              <Link to="/admin/horarios/generar" className={ENLACE_PRIMARIO}>
                <Sparkles className="size-4" aria-hidden /> Generar con IA
              </Link>
            </div>
          </Tarjeta>
        ) : consulta.isError ? (
          <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
        ) : (
          horario && (
            <>
              {!horario.validadoGemini && (
                <Aviso tipo="advertencia">
                  {horario.motivoValidacion ??
                    TEXTO_VALIDACION[horario.estadoValidacion]}{' '}
                  Se conservó el mejor resultado del AG + Búsqueda Tabú, que
                  cumple todas las restricciones duras (RNF-18).
                </Aviso>
              )}
              {controles}
              <Tarjeta className="overflow-hidden">
                <GrillaHorario asignaciones={filtradas} />
              </Tarjeta>
              <LeyendaNiveles />
              {horario.validacion.observaciones.length > 0 && (
                <Tarjeta className="p-5">
                  <TituloTarjeta
                    titulo="Observaciones de Gemini"
                    descripcion={`Validación semántica con ${horario.validacion.modelo} (RF-17).`}
                  />
                  <ul className="mt-3 space-y-2 text-sm">
                    {horario.validacion.observaciones.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Insignia tono={SEVERIDAD[o.severidad]}>
                          {o.severidad}
                        </Insignia>
                        <span className="text-texto">{o.descripcion}</span>
                      </li>
                    ))}
                  </ul>
                  {horario.validacion.ajustesAplicados.length > 0 && (
                    <p className="mt-3 text-xs text-texto-suave">
                      Se aplicaron {horario.validacion.ajustesAplicados.length}{' '}
                      ajustes propuestos por Gemini después de verificar que
                      siguen cumpliendo las restricciones duras.
                    </p>
                  )}
                </Tarjeta>
              )}
            </>
          )
        )}
      </div>

      {horario && (
        <>
          <DialogoConfirmacion
            abierto={dialogo === 'archivar'}
            titulo="¿Archivar los horarios activos?"
            textoConfirmar="Archivar"
            cargando={archivar.isPending}
            onCancelar={() => setDialogo(null)}
            onConfirmar={() => archivar.mutate(horario)}
          >
            Se archivan todos los horarios activos del período{' '}
            {horario.periodo.nombre}. Quedan en el historial y no se borran
            (RF-22).
          </DialogoConfirmacion>
          <DialogoConfirmacion
            abierto={dialogo === 'eliminar'}
            titulo="¿Eliminar este horario?"
            textoConfirmar="Eliminar"
            cargando={eliminar.isPending}
            onCancelar={() => setDialogo(null)}
            onConfirmar={() => eliminar.mutate(horario)}
          >
            El horario se borra de forma permanente. Las inscripciones de los
            estudiantes en sus grupos no cambian (RF-24).
          </DialogoConfirmacion>
        </>
      )}
    </>
  )
}
