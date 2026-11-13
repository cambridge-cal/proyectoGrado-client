import type { DocenteConfig, Periodo } from '../compartido/tipos'
import type {
  Evaluacion,
  Formulario,
} from '../modulos/admin/servicios/evaluacion'

export const periodoDePrueba: Periodo = {
  id: 'p1',
  nombre: '2026-2',
  fechaInicio: '2026-08-03',
  fechaFin: '2026-12-05',
  activo: true,
}

export function formularioDePrueba(
  cambios: Partial<Formulario> = {},
): Formulario {
  return {
    id: 'f1',
    nombre: 'Evaluación docente 2026-2',
    activo: true,
    creadoEn: '2026-11-10T15:00:00.000Z',
    periodoAcademico: periodoDePrueba,
    dimensiones: [
      {
        id: 'd1',
        nombre: 'Metodología',
        orden: 1,
        peso: 60,
        preguntas: [
          { id: 'q1', texto: '¿Explica los temas con claridad?', orden: 1 },
          { id: 'q2', texto: '¿Resuelve las dudas del grupo?', orden: 2 },
        ],
      },
      {
        id: 'd2',
        nombre: 'Puntualidad',
        orden: 2,
        peso: 40,
        preguntas: [
          { id: 'q3', texto: '¿Inicia la clase a tiempo?', orden: 1 },
        ],
      },
    ],
    ...cambios,
  }
}

export function docenteDePrueba(
  id: string,
  nombre: string,
  activo = true,
): DocenteConfig {
  return {
    id,
    usuarioId: `u-${id}`,
    nombre,
    email: `${id}@cal.edu.co`,
    activo,
    especialidad: 'Inglés',
    cargaMaximaSemanal: 20,
    franjasDisponibles: 10,
  }
}

export function evaluacionDePrueba(
  id: string,
  docenteId: string,
  nombre: string,
  estado: Evaluacion['estado'] = 'PENDIENTE',
): Evaluacion {
  return {
    id,
    estado,
    creadoEn: '2026-11-11T15:00:00.000Z',
    formulario: { id: 'f1', nombre: 'Evaluación docente 2026-2' },
    docente: {
      id: docenteId,
      usuario: {
        id: `u-${docenteId}`,
        nombre,
        email: `${docenteId}@cal.edu.co`,
      },
    },
  }
}
