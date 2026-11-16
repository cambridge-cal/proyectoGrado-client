import { api } from '../api'
import type { Pagina } from '../tipos'
import type {
  Alerta,
  MisResultados,
  ResultadoDocente,
  ResumenKdd,
  TipoAlerta,
} from './tipos'

/** Pipeline KDD y sus resultados (RF-39 a RF-43). */
export const servicioKdd = {
  ejecutar: async (periodoId: string) =>
    (await api.post<ResumenKdd>('/kdd/ejecutar', { periodoId })).data,
  resultados: async (periodoId: string) =>
    (
      await api.get<ResultadoDocente[]>('/kdd/resultados', {
        params: { periodoId },
      })
    ).data,
  misPeriodos: async () =>
    (
      await api.get<Array<{ id: string; nombre: string; activo: boolean }>>(
        '/kdd/mis-periodos',
      )
    ).data,
  misResultados: async (periodoId?: string) =>
    (
      await api.get<MisResultados>('/kdd/mis-resultados', {
        params: periodoId ? { periodoId } : undefined,
      })
    ).data,
}

/** Alertas del KDD (RF-44). */
export const servicioAlertas = {
  listar: async (filtros: {
    page: number
    size: number
    periodoId?: string
    tipo?: TipoAlerta
    leida?: boolean
  }) =>
    (
      await api.get<Pagina<Alerta>>('/alertas', {
        params: Object.fromEntries(
          Object.entries(filtros).filter(([, valor]) => valor !== undefined),
        ),
      })
    ).data,
  marcarLeida: async (id: string) =>
    (await api.patch<Alerta>(`/alertas/${id}`, { leida: true })).data,
}
