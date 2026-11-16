import type {
  Alerta,
  ResultadoDocente,
  ResultadoPropio,
} from '../compartido/evaluacion/tipos'

const BASE = {
  evaluacionId: 'e1',
  estado: 'ALERTA' as const,
  formulario: { id: 'f1', nombre: 'Evaluación docente 2026-2' },
  puntajeGlobal: 2.67,
  etiqueta: 'Crítico',
  puntajesPorDimension: [
    {
      dimensionId: 'd1',
      nombre: 'Metodología',
      peso: 60,
      promedio: 2.5,
      respuestas: 6,
    },
    {
      dimensionId: 'd2',
      nombre: 'Puntualidad',
      peso: 40,
      promedio: null,
      respuestas: 0,
    },
  ],
  participantes: 3,
  elegibles: 4,
  parcial: false,
  calculadoEn: '2026-11-12T15:00:00.000Z',
}

export function resultadoDocenteDePrueba(
  cambios: Partial<ResultadoDocente> = {},
): ResultadoDocente {
  return { ...BASE, docente: { id: 'd1', nombre: 'María García' }, ...cambios }
}

export function resultadoPropioDePrueba(
  cambios: Partial<ResultadoPropio> = {},
): ResultadoPropio {
  return {
    ...BASE,
    comentarios: ['Explica muy bien pero llega tarde a la clase.'],
    ...cambios,
  }
}

export function alertaDePrueba(cambios: Partial<Alerta> = {}): Alerta {
  return {
    id: 'a1',
    tipo: 'CRITICO',
    mensaje:
      'María García obtuvo 2.67 en "Evaluación docente 2026-2", por debajo de 3.0.',
    leida: false,
    creadaEn: '2026-11-12T15:00:00.000Z',
    docente: { id: 'd1', nombre: 'María García' },
    periodo: { id: 'p1', nombre: '2026-2' },
    puntajeGlobal: 2.67,
    evaluacionId: 'e1',
    ...cambios,
  }
}
