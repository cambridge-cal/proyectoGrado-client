import { api } from '../../../compartido/api'
import type { Inscripcion } from '../../../compartido/tipos'

/** Inscripción y baja del estudiante autenticado (RF-26, RF-27, Figura 6.17). */
export const servicioInscripciones = {
  /** Grupos del estudiante; con historial incluye también las bajas. */
  listar: async (historial = false) =>
    (
      await api.get<Inscripcion[]>('/estudiantes/yo/grupos', {
        params: historial ? { historial: true } : undefined,
      })
    ).data,
  unirse: async (codigoAcceso: string) =>
    (await api.post<Inscripcion>('/estudiantes/yo/unirse', { codigoAcceso }))
      .data,
  darDeBaja: async (grupoId: string) =>
    (
      await api.patch<Inscripcion>(`/estudiantes/yo/grupos/${grupoId}`, {
        activo: false,
      })
    ).data,
}
