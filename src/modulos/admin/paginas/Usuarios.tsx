import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import { useDiferido } from '../../../compartido/hooks/useDiferido'
import {
  NOMBRE_ROL,
  type Rol,
  type UsuarioAdmin,
} from '../../../compartido/tipos'
import {
  Avatar,
  Aviso,
  Boton,
  DialogoConfirmacion,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Paginador,
  Selector,
  Tarjeta,
  type Tono,
} from '../../../compartido/ui'
import { useAuth } from '../../../seguridad/almacenAuth'
import { FormularioUsuario } from '../componentes/FormularioUsuario'
import { servicioUsuarios } from '../servicios/usuarios'

const TAMANO_PAGINA = 10
const TONO_ROL: Record<Rol, Tono> = {
  ADMIN: 'morado',
  DOCENTE: 'azul',
  ESTUDIANTE: 'turquesa',
}

function detallePerfil(usuario: UsuarioAdmin): string {
  if (usuario.rol === 'ESTUDIANTE') return usuario.codigo ?? ''
  if (usuario.rol === 'DOCENTE')
    return `${usuario.especialidad} · ${usuario.cargaMaximaSemanal} h/sem`
  return 'Acceso total'
}

/** Gestión de usuarios del Administrador (Figma 14 y 14b, RF-06, RF-07, RNF-32). */
export function Usuarios() {
  const miId = useAuth((estado) => estado.usuario?.id)
  const clienteConsultas = useQueryClient()
  const [page, setPage] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState('')
  const [estado, setEstado] = useState('')
  const [panel, setPanel] = useState<{ usuario: UsuarioAdmin | null } | null>(
    null,
  )
  const [porEliminar, setPorEliminar] = useState<UsuarioAdmin | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)
  const busquedaDiferida = useDiferido(busqueda.trim())

  const filtros = {
    page,
    size: TAMANO_PAGINA,
    busqueda: busquedaDiferida || undefined,
    rol: (rol || undefined) as Rol | undefined,
    activo: estado === '' ? undefined : estado === 'activo',
  }
  const consulta = useQuery({
    queryKey: ['usuarios', filtros],
    queryFn: () => servicioUsuarios.listar(filtros),
    placeholderData: keepPreviousData,
  })

  const refrescar = () =>
    clienteConsultas.invalidateQueries({ queryKey: ['usuarios'] })
  const alterarEstado = useMutation({
    mutationFn: (usuario: UsuarioAdmin) =>
      servicioUsuarios.actualizar(usuario.id, { activo: !usuario.activo }),
    onSuccess: async (usuario) => {
      await refrescar()
      setAviso({
        tipo: 'exito',
        texto: usuario.activo
          ? `${usuario.nombre} quedó activo.`
          : `${usuario.nombre} quedó inactivo y se cerraron sus sesiones.`,
      })
    },
    onError: (error) =>
      setAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })
  const eliminar = useMutation({
    mutationFn: (usuario: UsuarioAdmin) =>
      servicioUsuarios.eliminar(usuario.id),
    onSuccess: async ({ resultado }, usuario) => {
      setPorEliminar(null)
      await refrescar()
      setAviso({
        tipo: 'exito',
        texto:
          resultado === 'ELIMINADO'
            ? `Se eliminó la cuenta de ${usuario.nombre}.`
            : `La cuenta de ${usuario.nombre} tenía historial: se borraron sus datos personales y quedó desactivada.`,
      })
    },
    onError: (error) => {
      setPorEliminar(null)
      setAviso({ tipo: 'error', texto: mensajeDeError(error) })
    },
  })

  const conFiltro = (cambio: () => void) => {
    cambio()
    setPage(1)
  }
  const pagina = consulta.data
  const hayFiltros = Boolean(busquedaDiferida || rol || estado)

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Cuentas de Administrador, Docente y Estudiante."
        acciones={
          <Boton onClick={() => setPanel({ usuario: null })}>
            <Plus className="size-4" aria-hidden /> Nuevo usuario
          </Boton>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        <Tarjeta>
          <div className="grid gap-3 border-b border-borde p-4 sm:grid-cols-[1fr_180px_180px] sm:p-5">
            <div className="relative">
              <label htmlFor="buscar-usuario" className="sr-only">
                Buscar usuario
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave"
                aria-hidden
              />
              <input
                id="buscar-usuario"
                type="search"
                value={busqueda}
                onChange={(e) => conFiltro(() => setBusqueda(e.target.value))}
                placeholder="Buscar por nombre, correo o código"
                className="h-[42px] w-full rounded-control border border-borde bg-superficie-2 pr-3 pl-9 text-sm focus:border-primario focus:bg-superficie focus:ring-4 focus:ring-primario/15 focus:outline-none"
              />
            </div>
            <Selector
              etiqueta="Rol"
              etiquetaOculta
              value={rol}
              onChange={(e) => conFiltro(() => setRol(e.target.value))}
              opciones={[
                { valor: '', texto: 'Todos los roles' },
                ...(['ADMIN', 'DOCENTE', 'ESTUDIANTE'] as const).map((r) => ({
                  valor: r,
                  texto: NOMBRE_ROL[r],
                })),
              ]}
            />
            <Selector
              etiqueta="Estado"
              etiquetaOculta
              value={estado}
              onChange={(e) => conFiltro(() => setEstado(e.target.value))}
              opciones={[
                { valor: '', texto: 'Todos los estados' },
                { valor: 'activo', texto: 'Activos' },
                { valor: 'inactivo', texto: 'Inactivos' },
              ]}
            />
          </div>

          {consulta.isError ? (
            <div className="p-5">
              <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
            </div>
          ) : consulta.isPending ? (
            <p
              className="px-5 py-12 text-center text-sm text-texto-suave"
              role="status"
            >
              Cargando usuarios…
            </p>
          ) : pagina && pagina.datos.length === 0 ? (
            <EstadoVacio
              icono={hayFiltros ? Users : UserPlus}
              titulo={
                hayFiltros
                  ? 'Ningún usuario coincide con los filtros'
                  : 'Todavía no hay usuarios'
              }
              descripcion={
                hayFiltros
                  ? 'Prueba con otra búsqueda o quita los filtros.'
                  : 'Crea la primera cuenta con el botón Nuevo usuario.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-superficie-2 text-xs font-semibold text-texto-suave">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Usuario
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Rol
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Detalle
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Estado
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {pagina?.datos.map((usuario) => {
                    const soyYo = usuario.id === miId
                    return (
                      <tr
                        key={usuario.id}
                        className={
                          usuario.activo ? undefined : 'bg-superficie-2/60'
                        }
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              nombre={usuario.nombre}
                              tamano="sm"
                              className={
                                usuario.activo
                                  ? undefined
                                  : 'bg-borde text-texto-suave'
                              }
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-texto">
                                {usuario.nombre}
                                {soyYo && (
                                  <span className="ml-1.5 text-xs font-normal text-texto-suave">
                                    (tú)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-texto-suave">
                                {usuario.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Insignia tono={TONO_ROL[usuario.rol]}>
                            {NOMBRE_ROL[usuario.rol]}
                          </Insignia>
                        </td>
                        <td className="px-3 py-3 text-texto-suave">
                          {detallePerfil(usuario)}
                        </td>
                        <td className="px-3 py-3">
                          <Insignia tono={usuario.activo ? 'verde' : 'gris'}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Insignia>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setPanel({ usuario })}
                              className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto"
                              aria-label={`Editar a ${usuario.nombre}`}
                              title="Editar"
                            >
                              <Pencil className="size-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => alterarEstado.mutate(usuario)}
                              disabled={soyYo || alterarEstado.isPending}
                              className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} a ${usuario.nombre}`}
                              title={usuario.activo ? 'Desactivar' : 'Activar'}
                            >
                              <Power className="size-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPorEliminar(usuario)}
                              disabled={soyYo}
                              className="rounded-lg p-2 text-peligro-texto hover:bg-peligro/8 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Eliminar a ${usuario.nombre}`}
                              title="Eliminar"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pagina && pagina.total > 0 && (
            <Paginador
              page={pagina.page}
              size={pagina.size}
              total={pagina.total}
              onCambiar={setPage}
            />
          )}
        </Tarjeta>
      </div>

      {panel && (
        <FormularioUsuario
          key={panel.usuario?.id ?? 'nuevo'}
          abierto
          usuario={panel.usuario}
          onCerrar={() => setPanel(null)}
          onGuardado={(texto) => {
            setPanel(null)
            setAviso({ tipo: 'exito', texto })
          }}
        />
      )}

      <DialogoConfirmacion
        abierto={porEliminar !== null}
        titulo={`¿Eliminar a ${porEliminar?.nombre ?? ''}?`}
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => porEliminar && eliminar.mutate(porEliminar)}
      >
        Si la cuenta tiene historial (inicios de sesión, horarios o
        evaluaciones), no se borra: se eliminan sus datos personales y queda
        desactivada, para conservar el registro de auditoría (RNF-32 y RNF-33).
      </DialogoConfirmacion>
    </>
  )
}
