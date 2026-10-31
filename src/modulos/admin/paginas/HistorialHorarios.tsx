import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Eye, History, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  aptitudRelativa,
  duracion,
  fechaHoraGeneracion,
  TEXTO_VALIDACION,
} from '../../../compartido/horario/formato'
import { InsigniaValidacion } from '../../../compartido/horario/InsigniaValidacion'
import type { HorarioResumen } from '../../../compartido/tipos'
import {
  Aviso,
  Boton,
  DialogoConfirmacion,
  EncabezadoPagina,
  Insignia,
  Selector,
  Tarjeta,
} from '../../../compartido/ui'
import {
  TablaRecurso,
  type AvisoConfiguracion,
} from '../componentes/TablaRecurso'
import { horarios } from '../servicios/horarios'

type Estado = '' | 'activos' | 'archivados'

/** Historial de horarios (Figma 17, RF-20, RF-22, RF-23, RF-24). */
export function HistorialHorarios() {
  const clienteConsultas = useQueryClient()
  const [estado, setEstado] = useState<Estado>('')
  const [aviso, setAviso] = useState<AvisoConfiguracion | null>(null)
  const [dialogo, setDialogo] = useState<'archivar' | 'historial' | null>(null)

  const reciente = useQuery({
    queryKey: ['horarios', 'reciente'],
    queryFn: async () =>
      (await horarios.listar({ page: 1, size: 1, archivado: false }))
        .datos[0] ?? null,
  })
  const refrescar = () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: ['horarios'] }),
      clienteConsultas.invalidateQueries({ queryKey: ['horario-actual'] }),
    ])
  const terminar = (texto: string) => async () => {
    setDialogo(null)
    setAviso({ tipo: 'exito', texto })
    await refrescar()
  }
  const fallar = (error: unknown) => {
    setDialogo(null)
    setAviso({ tipo: 'error', texto: mensajeDeError(error) })
  }

  const archivar = useMutation({
    mutationFn: () => horarios.archivar(),
    onSuccess: ({ archivados }) =>
      terminar(
        `Se archivaron ${archivados} ${archivados === 1 ? 'horario' : 'horarios'} del período activo.`,
      )(),
    onError: fallar,
  })
  const borrarHistorial = useMutation({
    mutationFn: () => horarios.eliminarArchivados(),
    onSuccess: ({ eliminados }) =>
      terminar(
        `Se eliminaron ${eliminados} ${eliminados === 1 ? 'horario archivado' : 'horarios archivados'}.`,
      )(),
    onError: fallar,
  })

  const archivado = estado === '' ? undefined : estado === 'archivados'
  const sinValidar =
    reciente.data && !reciente.data.validadoGemini ? reciente.data : null

  return (
    <>
      <EncabezadoPagina
        titulo="Horarios · Historial"
        descripcion="Consulta, archiva o elimina los horarios generados (RF-20 a RF-24)."
        acciones={
          <>
            <Boton
              variante="secundario"
              tamano="sm"
              onClick={() => setDialogo('archivar')}
            >
              <Archive className="size-4" aria-hidden /> Archivar activos
            </Boton>
            <Boton
              variante="peligro"
              tamano="sm"
              onClick={() => setDialogo('historial')}
            >
              <Trash2 className="size-4" aria-hidden /> Eliminar historial
            </Boton>
          </>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
        {sinValidar && (
          <Aviso tipo="advertencia">
            El horario activo más reciente no fue validado por Gemini:{' '}
            {sinValidar.motivoValidacion ??
              TEXTO_VALIDACION[sinValidar.estadoValidacion]}{' '}
            Se conservó el mejor resultado del AG + Búsqueda Tabú, que cumple
            todas las restricciones duras.
          </Aviso>
        )}
        <Selector
          etiqueta="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as Estado)}
          opciones={[
            { valor: '', texto: 'Todos' },
            { valor: 'activos', texto: 'Activos' },
            { valor: 'archivados', texto: 'Archivados' },
          ]}
          className="w-full sm:w-48"
        />
        <Tarjeta className="overflow-hidden">
          <TablaRecurso<HorarioResumen>
            clave={['horarios', 'historial', estado]}
            consultar={(page, size) =>
              horarios.listar({ page, size, archivado })
            }
            columnas={[
              {
                encabezado: 'Horario',
                celda: (h) => (
                  <span className="font-semibold">
                    Horario {h.periodo.nombre}
                  </span>
                ),
              },
              {
                encabezado: 'Generado',
                celda: (h) => fechaHoraGeneracion(h.creadoEn),
              },
              {
                encabezado: 'Aptitud',
                celda: (h) => aptitudRelativa(h),
                derecha: true,
              },
              {
                encabezado: 'Tiempo',
                celda: (h) => duracion(h.tiempoEjecucionMs),
                derecha: true,
              },
              {
                encabezado: 'Validación Gemini',
                celda: (h) => <InsigniaValidacion horario={h} corta />,
              },
              {
                encabezado: 'Estado',
                celda: (h) =>
                  h.archivado ? (
                    <Insignia tono="gris">Archivado</Insignia>
                  ) : (
                    <Insignia tono="azul">Activo</Insignia>
                  ),
              },
            ]}
            vacio={{
              icono: History,
              titulo: 'No hay horarios',
              descripcion:
                'Los horarios generados con el motor de IA aparecen aquí.',
            }}
            accionesExtra={(h) => (
              <Link
                to={`/admin/horarios/${h.id}`}
                className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto"
                aria-label={`Ver el horario ${h.periodo.nombre} del ${fechaHoraGeneracion(h.creadoEn)}`}
                title="Ver"
              >
                <Eye className="size-4" aria-hidden />
              </Link>
            )}
            eliminar={{
              ejecutar: (h) => horarios.eliminar(h.id),
              nombre: (h) =>
                `el horario ${h.periodo.nombre} del ${fechaHoraGeneracion(h.creadoEn)}`,
              advertencia:
                'Las inscripciones de los estudiantes en sus grupos no cambian (RF-24).',
            }}
            onAviso={(a) => {
              setAviso(a)
              void clienteConsultas.invalidateQueries({
                queryKey: ['horario-actual'],
              })
            }}
          />
          <p className="border-t border-borde px-5 py-3 text-xs text-texto-suave">
            Eliminar un horario no modifica las inscripciones de los estudiantes
            (RF-24).
          </p>
        </Tarjeta>
      </div>

      <DialogoConfirmacion
        abierto={dialogo === 'archivar'}
        titulo="¿Archivar los horarios activos?"
        textoConfirmar="Archivar"
        cargando={archivar.isPending}
        onCancelar={() => setDialogo(null)}
        onConfirmar={() => archivar.mutate()}
      >
        Se archivan todos los horarios activos del período activo. Quedan en el
        historial y no se borran (RF-22).
      </DialogoConfirmacion>
      <DialogoConfirmacion
        abierto={dialogo === 'historial'}
        titulo="¿Eliminar el historial de horarios?"
        textoConfirmar="Eliminar historial"
        cargando={borrarHistorial.isPending}
        onCancelar={() => setDialogo(null)}
        onConfirmar={() => borrarHistorial.mutate()}
      >
        Se borran de forma permanente todos los horarios archivados. Los
        horarios activos no se tocan (RF-23).
      </DialogoConfirmacion>
    </>
  )
}
