/** Estados de una evaluación (Figura 6.15). */
export type EstadoEvaluacion =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'COMPLETADA'
  | 'ANALIZADA'
  | 'ALERTA'
  | 'CERRADA'
  | 'ARCHIVADA'

/** Resultados del pipeline KDD (RF-39 a RF-43). */
export interface PuntajeDimension {
  dimensionId: string
  nombre: string
  peso: number
  promedio: number | null
  respuestas: number
}

export interface ResultadoKdd {
  evaluacionId: string
  estado: EstadoEvaluacion
  formulario: { id: string; nombre: string }
  puntajeGlobal: number
  etiqueta: string
  puntajesPorDimension: PuntajeDimension[]
  participantes: number
  elegibles: number
  parcial: boolean
  calculadoEn: string
}

export interface ResultadoDocente extends ResultadoKdd {
  docente: { id: string; nombre: string }
}

export interface ResultadoPropio extends ResultadoKdd {
  comentarios: string[]
}

export interface MisResultados {
  periodo: { id: string; nombre: string } | null
  resultados: ResultadoPropio[]
}

export type TipoAlerta = 'CRITICO' | 'ADVERTENCIA' | 'INFO'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  mensaje: string
  leida: boolean
  creadaEn: string
  docente: { id: string; nombre: string }
  periodo: { id: string; nombre: string }
  puntajeGlobal: number | null
  evaluacionId: string | null
}

export interface ResumenKdd {
  periodo: { id: string; nombre: string }
  evaluacionesProcesadas: number
  sinRespuestas: number
  alertas: Record<TipoAlerta, number>
  tiempoMs: number
}
