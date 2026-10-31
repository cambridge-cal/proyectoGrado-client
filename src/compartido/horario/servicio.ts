import { api } from '../api'
import type { HorarioDetalle } from '../tipos'

/** Consulta de horarios disponible para todos los roles (RF-20, RF-21, RF-25). */
export const consultaHorarios = {
  /** Horario activo del período en curso: el docente recibe sus clases y el estudiante las de sus grupos. */
  actual: async () => (await api.get<HorarioDetalle>('/horarios/actual')).data,
  obtener: async (id: string) =>
    (await api.get<HorarioDetalle>(`/horarios/${id}`)).data,
}
