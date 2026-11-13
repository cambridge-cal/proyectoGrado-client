import { api } from '../../../compartido/api'

/** Evaluación de un docente de sus grupos, tal como la ve el estudiante (RF-33). */
export interface EvaluacionEstudiante {
  id: string
  formulario: { id: string; nombre: string }
  docente: { id: string; nombre: string }
  grupos: Array<{ id: string; codigo: string; curso: string }>
  totalPreguntas: number
  /** true si este estudiante ya la respondió (RF-36). */
  completada: boolean
  /** true mientras la evaluación recibe respuestas. */
  abierta: boolean
}

export interface EvaluacionParaResponder extends EvaluacionEstudiante {
  dimensiones: Array<{
    id: string
    nombre: string
    orden: number
    preguntas: Array<{ id: string; texto: string; orden: number }>
  }>
}

export interface DatosRespuesta {
  respuestas: Array<{ preguntaId: string; valor: number }>
  comentario?: string
}

/** Evaluaciones del estudiante autenticado (RF-33 a RF-36). */
export const servicioEvaluacionesEstudiante = {
  listar: async () =>
    (await api.get<EvaluacionEstudiante[]>('/estudiantes/yo/evaluaciones'))
      .data,
  obtener: async (id: string) =>
    (
      await api.get<EvaluacionParaResponder>(
        `/estudiantes/yo/evaluaciones/${id}`,
      )
    ).data,
  responder: async (id: string, datos: DatosRespuesta) =>
    (
      await api.post<{ id: string; completada: true }>(
        `/estudiantes/yo/evaluaciones/${id}/respuestas`,
        datos,
      )
    ).data,
}
