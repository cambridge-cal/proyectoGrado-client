import { api } from '../../../compartido/api'
import { consultaHorarios } from '../../../compartido/horario/servicio'
import type {
  HorarioDetalle,
  HorarioResumen,
  Pagina,
  TipoAula,
} from '../../../compartido/tipos'

/** Tiempo máximo de la petición de generación: motor de IA más Gemini (RNF-02: menos de 3 minutos). */
export const TIEMPO_MAXIMO_GENERACION_MS = 240_000

export interface RestriccionNoSatisfecha {
  tipo: string
  descripcion: string
  cantidad: number
}

/** Administración de horarios (RF-17 a RF-24). */
export const horarios = {
  ...consultaHorarios,
  generar: async (datos: {
    periodoId?: string
    tiposAulaExcluidos: TipoAula[]
  }) =>
    (
      await api.post<HorarioDetalle>('/horarios/generar', datos, {
        timeout: TIEMPO_MAXIMO_GENERACION_MS,
      })
    ).data,
  listar: async (parametros: {
    page: number
    size: number
    archivado?: boolean
    periodoId?: string
  }) =>
    (await api.get<Pagina<HorarioResumen>>('/horarios', { params: parametros }))
      .data,
  archivar: async (periodoId?: string) =>
    (
      await api.post<{ archivados: number }>(
        '/horarios/archivar',
        periodoId ? { periodoId } : {},
      )
    ).data,
  eliminarArchivados: async (periodoId?: string) =>
    (
      await api.delete<{ eliminados: number }>('/horarios/archivados', {
        params: periodoId ? { periodoId } : {},
      })
    ).data,
  eliminar: async (id: string) => {
    await api.delete(`/horarios/${id}`)
  },
}
