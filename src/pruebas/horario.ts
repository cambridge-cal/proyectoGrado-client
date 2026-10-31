import type {
  AsignacionDetalle,
  DiaSemana,
  HorarioDetalle,
} from '../compartido/tipos'

/** Asignación de prueba para la grilla del horario. */
let posicion = 0
export function clase(
  dia: DiaSemana,
  inicio: string,
  fin: string,
  codigo = 'G01',
  nivel = 'ING-A1',
): AsignacionDetalle {
  return {
    posicion: posicion++,
    grupo: {
      id: codigo,
      codigo,
      curso: 'Inglés A1',
      idioma: 'Inglés',
      nivel,
      jornada: 'MAÑANA',
    },
    docente: { id: 'd1', nombre: 'María García' },
    aula: { id: 'a1', codigo: 'A-01', tipo: 'SALON' },
    franja: {
      id: `${dia}${inicio}`,
      diaSemana: dia,
      horaInicio: inicio,
      horaFin: fin,
      bloque: 1,
    },
  }
}

/** Horario de prueba con las asignaciones indicadas. */
export function horarioDePrueba(
  asignaciones: AsignacionDetalle[],
  cambios: Partial<HorarioDetalle> = {},
): HorarioDetalle {
  return {
    id: 'h1',
    periodo: { id: 'p1', nombre: '2026-2' },
    fitness: 10 * asignaciones.length,
    generaciones: 40,
    tiempoEjecucionMs: 1200,
    intentos: 1,
    validadoGemini: true,
    estadoValidacion: 'APROBADO',
    motivoValidacion: null,
    archivado: false,
    tiposAulaExcluidos: [],
    totalAsignaciones: asignaciones.length,
    creadoEn: '2026-10-30T15:00:00Z',
    validacion: {
      estado: 'APROBADO',
      modelo: 'gemini-2.5-flash',
      tiempoMs: 800,
      detalle: null,
      observaciones: [],
      ajustesAplicados: [],
    },
    asignaciones,
    ...cambios,
  }
}
