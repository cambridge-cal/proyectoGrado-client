import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Pencil, Trash2, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import type { Pagina } from '../../../compartido/tipos'
import {
  Aviso,
  DialogoConfirmacion,
  EstadoVacio,
  Paginador,
} from '../../../compartido/ui'

export interface Columna<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
  /** Alinea a la derecha (números). */
  derecha?: boolean
}

export interface AvisoConfiguracion {
  tipo: 'exito' | 'error'
  texto: string
}

/**
 * Tabla paginada de un recurso de configuración con acciones de editar y eliminar
 * (Figma 14 y docs/diseno.md, "Configuración académica").
 */
export function TablaRecurso<T extends { id: string }>({
  clave,
  consultar,
  columnas,
  tamano = 10,
  vacio,
  onEditar,
  eliminar,
  accionesExtra,
  onAviso,
}: {
  /** Clave de TanStack Query; cuando cambia (por ejemplo, un filtro), vuelve a la página 1. */
  clave: unknown[]
  consultar: (page: number, size: number) => Promise<Pagina<T>>
  columnas: Columna<T>[]
  tamano?: number
  vacio: { icono: LucideIcon; titulo: string; descripcion?: string }
  onEditar?: (fila: T) => void
  eliminar?: {
    ejecutar: (fila: T) => Promise<unknown>
    nombre: (fila: T) => string
    advertencia?: string
  }
  accionesExtra?: (fila: T) => ReactNode
  onAviso: (aviso: AvisoConfiguracion) => void
}) {
  const clienteConsultas = useQueryClient()
  const [pagina, setPagina] = useState({
    clave: JSON.stringify(clave),
    page: 1,
  })
  const page = pagina.clave === JSON.stringify(clave) ? pagina.page : 1
  const [porEliminar, setPorEliminar] = useState<T | null>(null)

  const consulta = useQuery({
    queryKey: [...clave, page, tamano],
    queryFn: () => consultar(page, tamano),
    placeholderData: keepPreviousData,
  })
  const borrar = useMutation({
    mutationFn: (fila: T) => eliminar!.ejecutar(fila),
    onSuccess: async (_r, fila) => {
      setPorEliminar(null)
      await clienteConsultas.invalidateQueries({ queryKey: [clave[0]] })
      onAviso({ tipo: 'exito', texto: `Se eliminó ${eliminar!.nombre(fila)}.` })
    },
    onError: (error) => {
      setPorEliminar(null)
      onAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })

  const datos = consulta.data
  const conAcciones = Boolean(onEditar || eliminar || accionesExtra)

  if (consulta.isError) {
    return (
      <div className="p-5">
        <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
      </div>
    )
  }
  if (consulta.isPending) {
    return (
      <p
        className="px-5 py-12 text-center text-sm text-texto-suave"
        role="status"
      >
        Cargando…
      </p>
    )
  }
  if (!datos || datos.datos.length === 0) {
    return (
      <EstadoVacio
        icono={vacio.icono}
        titulo={vacio.titulo}
        descripcion={vacio.descripcion}
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-superficie-2 text-xs font-semibold text-texto-suave">
            <tr>
              {columnas.map((c) => (
                <th
                  key={c.encabezado}
                  scope="col"
                  className={`px-5 py-3 ${c.derecha ? 'text-right' : ''}`}
                >
                  {c.encabezado}
                </th>
              ))}
              {conAcciones && (
                <th scope="col" className="px-5 py-3 text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {datos.datos.map((fila) => (
              <tr key={fila.id}>
                {columnas.map((c) => (
                  <td
                    key={c.encabezado}
                    className={`px-5 py-3 text-texto ${c.derecha ? 'text-right' : ''}`}
                  >
                    {c.celda(fila)}
                  </td>
                ))}
                {conAcciones && (
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      {accionesExtra?.(fila)}
                      {onEditar && (
                        <button
                          type="button"
                          onClick={() => onEditar(fila)}
                          className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto"
                          aria-label={`Editar ${eliminar?.nombre(fila) ?? ''}`.trim()}
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                      )}
                      {eliminar && (
                        <button
                          type="button"
                          onClick={() => setPorEliminar(fila)}
                          className="rounded-lg p-2 text-peligro-texto hover:bg-peligro/8"
                          aria-label={`Eliminar ${eliminar.nombre(fila)}`}
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginador
        page={datos.page}
        size={datos.size}
        total={datos.total}
        onCambiar={(nueva) =>
          setPagina({ clave: JSON.stringify(clave), page: nueva })
        }
      />
      {eliminar && (
        <DialogoConfirmacion
          abierto={porEliminar !== null}
          titulo={`¿Eliminar ${porEliminar ? eliminar.nombre(porEliminar) : ''}?`}
          textoConfirmar="Eliminar"
          cargando={borrar.isPending}
          onCancelar={() => setPorEliminar(null)}
          onConfirmar={() => porEliminar && borrar.mutate(porEliminar)}
        >
          {eliminar.advertencia ??
            'Si tiene datos asociados, el sistema no lo eliminará para conservar la integridad de la información (RNF-19).'}
        </DialogoConfirmacion>
      )}
    </>
  )
}
