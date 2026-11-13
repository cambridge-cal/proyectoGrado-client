import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import { useDiferido } from '../../../compartido/hooks/useDiferido'
import {
  Aviso,
  Boton,
  Campo,
  DialogoConfirmacion,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Paginador,
  Tarjeta,
} from '../../../compartido/ui'
import { EditorFormulario } from '../componentes/EditorFormulario'
import { PestanasEvaluacion } from '../componentes/PestanasEvaluacion'
import { periodos as servicioPeriodos } from '../servicios/configuracion'
import {
  servicioFormularios,
  type DatosFormulario,
  type Formulario,
} from '../servicios/evaluacion'

const TAMANO = 10

const totalPreguntas = (formulario: Formulario) =>
  formulario.dimensiones.reduce(
    (total, dimension) => total + dimension.preguntas.length,
    0,
  )

/** Formularios de evaluación docente (RF-28 a RF-30): dimensiones con peso y sus preguntas. */
export function Formularios() {
  const consultas = useQueryClient()
  const [page, setPage] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const texto = useDiferido(busqueda)
  /** undefined = cerrado, null = nuevo, Formulario = edición. */
  const [editor, setEditor] = useState<Formulario | null | undefined>()
  const [porEliminar, setPorEliminar] = useState<Formulario | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const lista = useQuery({
    queryKey: ['formularios', page, texto],
    queryFn: () =>
      servicioFormularios.listar({ page, size: TAMANO, busqueda: texto }),
  })
  const periodos = useQuery({
    queryKey: ['periodos', 'todos'],
    queryFn: async () =>
      (await servicioPeriodos.listar({ page: 1, size: 100 })).datos,
  })

  const refrescar = () =>
    consultas.invalidateQueries({ queryKey: ['formularios'] })

  const guardar = useMutation({
    mutationFn: (datos: DatosFormulario) =>
      editor
        ? servicioFormularios.actualizar(editor.id, datos)
        : servicioFormularios.crear(datos),
    onSuccess: async (formulario) => {
      setAviso({
        tipo: 'exito',
        texto: editor
          ? `Se guardaron los cambios de "${formulario.nombre}".`
          : `Se creó el formulario "${formulario.nombre}". Ya puedes asignarlo a los docentes.`,
      })
      setEditor(undefined)
      await refrescar()
    },
  })

  const eliminar = useMutation({
    mutationFn: (formulario: Formulario) =>
      servicioFormularios.eliminar(formulario.id),
    onSuccess: async (_respuesta, formulario) => {
      setPorEliminar(null)
      setAviso({
        tipo: 'exito',
        texto: `Se eliminó el formulario "${formulario.nombre}".`,
      })
      await refrescar()
    },
    onError: (error) => {
      setPorEliminar(null)
      setAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })

  function abrirEditor(formulario: Formulario | null) {
    guardar.reset()
    setAviso(null)
    setEditor(formulario)
  }

  const formularios = lista.data?.datos ?? []

  return (
    <>
      <EncabezadoPagina
        titulo="Formularios de evaluación"
        descripcion="Define las dimensiones, sus pesos y las preguntas que responderán los estudiantes."
        acciones={
          <Boton
            onClick={() => abrirEditor(null)}
            disabled={!periodos.data || periodos.data.length === 0}
          >
            <Plus className="size-4" aria-hidden />
            Nuevo formulario
          </Boton>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <PestanasEvaluacion />
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
        {periodos.data?.length === 0 && (
          <Aviso tipo="advertencia">
            Crea primero un período académico en Configuración para poder
            definir formularios.
          </Aviso>
        )}
        <Campo
          etiqueta="Buscar formulario"
          className="max-w-sm"
          type="search"
          value={busqueda}
          placeholder="Nombre del formulario"
          onChange={(evento) => {
            setBusqueda(evento.target.value)
            setPage(1)
          }}
        />

        {lista.isPending ? (
          <Tarjeta
            className="h-48 animate-pulse"
            aria-label="Cargando formularios"
          />
        ) : lista.isError ? (
          <Aviso tipo="error">{mensajeDeError(lista.error)}</Aviso>
        ) : formularios.length === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={ClipboardList}
              titulo={
                texto
                  ? 'Ningún formulario coincide con la búsqueda'
                  : 'Todavía no hay formularios'
              }
              descripcion={
                texto
                  ? undefined
                  : 'Crea el primero con sus dimensiones, pesos y preguntas.'
              }
            />
          </Tarjeta>
        ) : (
          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-superficie-2 text-xs text-texto-suave">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Formulario</th>
                    <th className="px-4 py-3 font-semibold">Período</th>
                    <th className="px-4 py-3 font-semibold">Dimensiones</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {formularios.map((formulario) => (
                    <tr key={formulario.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-texto">
                          {formulario.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-texto-suave">
                          {totalPreguntas(formulario)}{' '}
                          {totalPreguntas(formulario) === 1
                            ? 'pregunta'
                            : 'preguntas'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-texto">
                        {formulario.periodoAcademico.nombre}
                      </td>
                      <td className="px-4 py-3 text-xs text-texto-suave">
                        {formulario.dimensiones
                          .map(
                            (dimension) =>
                              `${dimension.nombre} (${dimension.peso ?? 0}%)`,
                          )
                          .join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        <Insignia tono={formulario.activo ? 'verde' : 'gris'}>
                          {formulario.activo ? 'Activo' : 'Inactivo'}
                        </Insignia>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            to={`/admin/evaluacion/asignaciones?formulario=${formulario.id}`}
                            aria-label={`Asignar ${formulario.nombre}`}
                            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-primario hover:bg-primario-suave"
                          >
                            <Send className="size-3.5" aria-hidden />
                            Asignar
                          </Link>
                          <Boton
                            variante="secundario"
                            tamano="sm"
                            aria-label={`Editar ${formulario.nombre}`}
                            onClick={() => abrirEditor(formulario)}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                            Editar
                          </Boton>
                          <Boton
                            variante="peligro"
                            tamano="sm"
                            aria-label={`Eliminar ${formulario.nombre}`}
                            onClick={() => {
                              setAviso(null)
                              setPorEliminar(formulario)
                            }}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Boton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginador
              page={page}
              size={TAMANO}
              total={lista.data.total}
              onCambiar={setPage}
            />
          </Tarjeta>
        )}
      </div>

      {editor !== undefined && periodos.data && (
        <EditorFormulario
          key={editor?.id ?? 'nuevo'}
          formulario={editor}
          periodos={periodos.data}
          guardando={guardar.isPending}
          errorServidor={
            guardar.isError ? mensajeDeError(guardar.error) : undefined
          }
          onGuardar={(datos) => guardar.mutate(datos)}
          onCerrar={() => setEditor(undefined)}
        />
      )}

      <DialogoConfirmacion
        abierto={porEliminar !== null}
        titulo={`¿Eliminar "${porEliminar?.nombre ?? ''}"?`}
        textoConfirmar="Eliminar formulario"
        cargando={eliminar.isPending}
        onConfirmar={() => porEliminar && eliminar.mutate(porEliminar)}
        onCancelar={() => setPorEliminar(null)}
      >
        Se eliminarán también sus dimensiones, sus preguntas y las evaluaciones
        asignadas con este formulario. Esta acción no se puede deshacer.
      </DialogoConfirmacion>
    </>
  )
}
