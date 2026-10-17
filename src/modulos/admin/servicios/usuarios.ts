import { api } from '../../../compartido/api'
import type { Pagina, Rol, UsuarioAdmin } from '../../../compartido/tipos'

export interface FiltrosUsuarios {
  page: number
  size: number
  rol?: Rol
  activo?: boolean
  busqueda?: string
}

export interface DatosUsuario {
  nombre: string
  email: string
  contrasena?: string
  rol?: Rol
  activo?: boolean
  codigo?: string
  especialidad?: string
  cargaMaximaSemanal?: number
}

/** Quita los filtros vacíos para no mandarlos en la URL. */
function limpiar<T extends object>(objeto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(objeto).filter(
      ([, valor]) => valor !== undefined && valor !== '',
    ),
  ) as Partial<T>
}

export const servicioUsuarios = {
  listar: async (filtros: FiltrosUsuarios) =>
    (
      await api.get<Pagina<UsuarioAdmin>>('/usuarios', {
        params: limpiar(filtros),
      })
    ).data,
  crear: async (datos: DatosUsuario) =>
    (await api.post<UsuarioAdmin>('/usuarios', limpiar(datos))).data,
  actualizar: async (id: string, datos: Partial<DatosUsuario>) =>
    (await api.patch<UsuarioAdmin>(`/usuarios/${id}`, limpiar(datos))).data,
  eliminar: async (id: string) =>
    (
      await api.delete<{ resultado: 'ELIMINADO' | 'ANONIMIZADO' }>(
        `/usuarios/${id}`,
      )
    ).data,
}
