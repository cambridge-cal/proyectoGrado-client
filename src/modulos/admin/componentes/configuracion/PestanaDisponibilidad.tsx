import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Save } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../../compartido/api'
import { GrillaDisponibilidad } from '../../../../compartido/disponibilidad/GrillaDisponibilidad'
import { Aviso, Boton, EstadoVacio, Selector } from '../../../../compartido/ui'
import { docentes, franjas } from '../../servicios/configuracion'
import { BarraPestana, type PropsPestana } from './comun'

/** El Administrador registra la disponibilidad de cualquier docente (RF-16). */
export function PestanaDisponibilidad({
  onAviso,
  docenteInicial,
}: PropsPestana & { docenteInicial?: string }) {
  const clienteConsultas = useQueryClient()
  const [docenteId, setDocenteId] = useState(docenteInicial ?? '')
  const [cambios, setCambios] = useState<{
    docenteId: string
    seleccion: Set<string>
  } | null>(null)

  const listaDocentes = useQuery({
    queryKey: ['docentes', 'todos'],
    queryFn: () => docentes.listar({ page: 1, size: 100 }),
  })
  const todasFranjas = useQuery({
    queryKey: ['franjas', 'todas'],
    queryFn: franjas.todas,
  })
  const disponibilidad = useQuery({
    queryKey: ['disponibilidad', docenteId],
    queryFn: () => docentes.disponibilidad(docenteId),
    enabled: Boolean(docenteId),
  })

  const guardadas = new Set((disponibilidad.data ?? []).map((f) => f.id))
  const seleccion =
    cambios?.docenteId === docenteId ? cambios.seleccion : guardadas
  const hayCambios = cambios?.docenteId === docenteId

  const guardar = useMutation({
    mutationFn: () => docentes.guardarDisponibilidad(docenteId, [...seleccion]),
    onSuccess: async () => {
      setCambios(null)
      await clienteConsultas.invalidateQueries({
        queryKey: ['disponibilidad', docenteId],
      })
      await clienteConsultas.invalidateQueries({ queryKey: ['docentes'] })
      onAviso({
        tipo: 'exito',
        texto: 'Se guardó la disponibilidad del docente.',
      })
    },
    onError: (error) =>
      onAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })

  return (
    <>
      <BarraPestana>
        <Selector
          etiqueta="Docente"
          value={docenteId}
          onChange={(e) => setDocenteId(e.target.value)}
          opciones={[
            { valor: '', texto: 'Elige un docente' },
            ...(listaDocentes.data?.datos ?? []).map((d) => ({
              valor: d.id,
              texto: `${d.nombre} · ${d.especialidad}`,
            })),
          ]}
          className="w-full sm:w-80"
        />
        {docenteId && (
          <Boton
            onClick={() => guardar.mutate()}
            disabled={!hayCambios}
            cargando={guardar.isPending}
          >
            <Save className="size-4" aria-hidden /> Guardar
          </Boton>
        )}
      </BarraPestana>
      <div className="p-4 sm:p-5">
        {!docenteId ? (
          <EstadoVacio
            icono={CalendarClock}
            titulo="Elige un docente"
            descripcion="Marca las franjas en las que puede ser asignado."
          />
        ) : todasFranjas.data?.length === 0 ? (
          <Aviso tipo="info">
            Primero crea las franjas horarias en la pestaña Franjas.
          </Aviso>
        ) : disponibilidad.isError ? (
          <Aviso tipo="error">{mensajeDeError(disponibilidad.error)}</Aviso>
        ) : (
          <>
            <p className="mb-3 text-sm text-texto-suave" role="status">
              {seleccion.size} franjas disponibles
              {hayCambios ? ' · cambios sin guardar' : ''}
            </p>
            <GrillaDisponibilidad
              franjas={todasFranjas.data ?? []}
              seleccionadas={seleccion}
              onCambiar={(nueva) => setCambios({ docenteId, seleccion: nueva })}
              deshabilitada={disponibilidad.isPending || guardar.isPending}
            />
          </>
        )}
      </div>
    </>
  )
}
