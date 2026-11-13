import { api } from '../../../compartido/api'
import type { Pagina, Periodo } from '../../../compartido/tipos'

/** Formularios de evaluación docente (RF-28 a RF-30). */
export interface Pregunta {
  id: string
  texto: string
  orden: number
}

export interface Dimension {
  id: string
  nombre: string
  orden: number
  /** Peso porcentual en el puntaje global; los de un formulario suman 100 (RF-29). */
  peso: number
  preguntas: Pregunta[]
}

export interface Formulario {
  id: string
  nombre: string
  activo: boolean
  creadoEn: string
  periodoAcademico: Periodo
  dimensiones: Dimension[]
}

export interface DatosFormulario {
  nombre: string
  periodoAcademicoId: string
  dimensiones: Array<{
    nombre: string
    orden: number
    peso: number
    preguntas: Array<{ texto: string; orden: number }>
  }>
}

/** Evaluación: un formulario asignado a un docente (RF-31, RF-32). Estados de la Figura 6.15. */
export type EstadoEvaluacion =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'COMPLETADA'
  | 'ANALIZADA'
  | 'ALERTA'
  | 'CERRADA'
  | 'ARCHIVADA'

export interface Evaluacion {
  id: string
  estado: EstadoEvaluacion
  creadoEn: string
  formulario: { id: string; nombre: string }
  docente: {
    id: string
    usuario: { id: string; nombre: string; email: string }
  }
}

type Parametros = Record<string, string | number | undefined>

const sinVacios = (parametros: Parametros) =>
  Object.fromEntries(
    Object.entries(parametros).filter(([, v]) => v !== undefined && v !== ''),
  )

export const servicioFormularios = {
  listar: async (parametros: Parametros) =>
    (
      await api.get<Pagina<Formulario>>('/formularios', {
        params: sinVacios(parametros),
      })
    ).data,
  crear: async (datos: DatosFormulario) =>
    (await api.post<Formulario>('/formularios', datos)).data,
  actualizar: async (
    id: string,
    datos: Partial<DatosFormulario> & { activo?: boolean },
  ) => (await api.patch<Formulario>(`/formularios/${id}`, datos)).data,
  eliminar: async (id: string) => {
    await api.delete(`/formularios/${id}`)
  },
}

export const servicioEvaluaciones = {
  listar: async (parametros: Parametros) =>
    (
      await api.get<Pagina<Evaluacion>>('/evaluaciones', {
        params: sinVacios(parametros),
      })
    ).data,
  asignar: async (formularioId: string, docenteId: string) =>
    (await api.post<Evaluacion>('/evaluaciones', { formularioId, docenteId }))
      .data,
  asignarMasivo: async (formularioId: string, docenteIds: string[]) =>
    (
      await api.post<{ creadas: number; omitidas: number }>(
        '/evaluaciones/masiva',
        { formularioId, docenteIds },
      )
    ).data,
  eliminar: async (id: string) => {
    await api.delete(`/evaluaciones/${id}`)
  },
}
