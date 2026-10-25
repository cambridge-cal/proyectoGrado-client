import { api } from '../../../compartido/api'
import type { Franja } from '../../../compartido/tipos'

/** El docente consulta y registra su propia disponibilidad (RF-16). */
export const miDisponibilidad = {
  obtener: async () =>
    (await api.get<Franja[]>('/docentes/yo/disponibilidad')).data,
  guardar: async (franjaIds: string[]) =>
    (await api.put<Franja[]>('/docentes/yo/disponibilidad', { franjaIds }))
      .data,
}
