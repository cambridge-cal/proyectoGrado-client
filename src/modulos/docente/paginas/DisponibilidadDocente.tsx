import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import { GrillaDisponibilidad } from '../../../compartido/disponibilidad/GrillaDisponibilidad'
import { Aviso, Boton, EncabezadoPagina, Tarjeta } from '../../../compartido/ui'
import { franjas } from '../../admin/servicios/configuracion'
import { miDisponibilidad } from '../servicios/disponibilidad'

/** El docente registra las franjas en las que puede dictar clase (RF-16). */
export function DisponibilidadDocente() {
  const clienteConsultas = useQueryClient()
  const [seleccion, setSeleccion] = useState<Set<string> | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const todas = useQuery({
    queryKey: ['franjas', 'todas'],
    queryFn: franjas.todas,
  })
  const mia = useQuery({
    queryKey: ['mi-disponibilidad'],
    queryFn: miDisponibilidad.obtener,
  })
  const actual = seleccion ?? new Set((mia.data ?? []).map((f) => f.id))

  const guardar = useMutation({
    mutationFn: () => miDisponibilidad.guardar([...actual]),
    onSuccess: async () => {
      setSeleccion(null)
      await clienteConsultas.invalidateQueries({
        queryKey: ['mi-disponibilidad'],
      })
      setAviso({
        tipo: 'exito',
        texto:
          'Se guardó tu disponibilidad. El próximo horario la tendrá en cuenta.',
      })
    },
    onError: (error) =>
      setAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })

  const error = todas.error ?? mia.error

  return (
    <>
      <EncabezadoPagina
        titulo="Mi disponibilidad"
        descripcion="Marca las franjas en las que puedes dictar clase. El motor de horarios solo te asigna en ellas."
        acciones={
          <Boton
            onClick={() => guardar.mutate()}
            disabled={seleccion === null}
            cargando={guardar.isPending}
          >
            <Save className="size-4" aria-hidden /> Guardar
          </Boton>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
        {error ? (
          <Aviso tipo="error">{mensajeDeError(error)}</Aviso>
        ) : (
          <Tarjeta className="p-4 sm:p-5">
            {todas.data?.length === 0 ? (
              <Aviso tipo="info">
                El Administrador todavía no ha creado las franjas horarias.
              </Aviso>
            ) : (
              <>
                <p className="mb-3 text-sm text-texto-suave" role="status">
                  {actual.size} franjas disponibles
                  {seleccion ? ' · cambios sin guardar' : ''}
                </p>
                <GrillaDisponibilidad
                  franjas={todas.data ?? []}
                  seleccionadas={actual}
                  onCambiar={(nueva) => {
                    setAviso(null)
                    setSeleccion(nueva)
                  }}
                  deshabilitada={
                    todas.isPending || mia.isPending || guardar.isPending
                  }
                />
              </>
            )}
          </Tarjeta>
        )}
      </div>
    </>
  )
}
