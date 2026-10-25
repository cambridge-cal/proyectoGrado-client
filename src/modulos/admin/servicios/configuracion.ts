import { api } from '../../../compartido/api'
import type {
  Aula,
  Curso,
  DiaSemana,
  DocenteConfig,
  Franja,
  Grupo,
  Nivel,
  Pagina,
  Periodo,
} from '../../../compartido/tipos'

export type Parametros = Record<string, string | number | boolean | undefined>

const sinVacios = (parametros: Parametros) =>
  Object.fromEntries(
    Object.entries(parametros).filter(([, v]) => v !== undefined && v !== ''),
  )

/** Operaciones CRUD de un recurso de la API (RF-09 a RF-15). */
export interface Recurso<T> {
  listar: (parametros: Parametros) => Promise<Pagina<T>>
  crear: (datos: object) => Promise<T>
  actualizar: (id: string, datos: object) => Promise<T>
  eliminar: (id: string) => Promise<unknown>
}

function recurso<T>(ruta: string): Recurso<T> {
  return {
    listar: async (parametros) =>
      (await api.get<Pagina<T>>(ruta, { params: sinVacios(parametros) })).data,
    crear: async (datos) => (await api.post<T>(ruta, datos)).data,
    actualizar: async (id, datos) =>
      (await api.patch<T>(`${ruta}/${id}`, datos)).data,
    eliminar: async (id) => (await api.delete(`${ruta}/${id}`)).data,
  }
}

export const periodos = recurso<Periodo>('/periodos')
export const niveles = recurso<Nivel>('/niveles')
export const cursos = recurso<Curso>('/cursos')
export const aulas = recurso<Aula>('/aulas')
export const grupos = {
  ...recurso<Grupo>('/grupos'),
  regenerarCodigo: async (id: string) =>
    (await api.post<Grupo>(`/grupos/${id}/regenerar-codigo`)).data,
}
export const franjas = {
  ...recurso<Franja>('/franjas-horarias'),
  crearLote: async (datos: {
    dias: DiaSemana[]
    desde: string
    hasta: string
    duracionMinutos: number
    bloqueInicial?: number
  }) => (await api.post<Franja[]>('/franjas-horarias/lote', datos)).data,
  /** Todas las franjas, para la grilla de disponibilidad. */
  todas: async () =>
    (
      await api.get<Pagina<Franja>>('/franjas-horarias', {
        params: { size: 100 },
      })
    ).data.datos,
}
export const docentes = {
  ...recurso<DocenteConfig>('/docentes'),
  disponibilidad: async (id: string) =>
    (await api.get<Franja[]>(`/docentes/${id}/disponibilidad`)).data,
  guardarDisponibilidad: async (id: string, franjaIds: string[]) =>
    (await api.put<Franja[]>(`/docentes/${id}/disponibilidad`, { franjaIds }))
      .data,
}
