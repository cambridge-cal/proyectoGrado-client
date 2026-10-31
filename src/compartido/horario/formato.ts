import type { Tono } from '../ui'
import {
  DIAS,
  type AsignacionDetalle,
  type EstadoValidacion,
  type HorarioResumen,
  type Jornada,
} from '../tipos'

/** Color por nivel en la grilla (recomendación 3 de docs/diseno.md): A naranja, B azul, C morado. */
export function grupoNivel(nivel: string | undefined): 'A' | 'B' | 'C' | null {
  const coincidencia = /([ABC])[12]/i.exec(nivel ?? '')
  return coincidencia
    ? (coincidencia[1]!.toUpperCase() as 'A' | 'B' | 'C')
    : null
}

export const TONO_NIVEL: Record<'A' | 'B' | 'C', Tono> = {
  A: 'naranja',
  B: 'azul',
  C: 'morado',
}
export const LEYENDA_NIVELES: Array<{ grupo: 'A' | 'B' | 'C'; texto: string }> =
  [
    { grupo: 'A', texto: 'A1 · A2' },
    { grupo: 'B', texto: 'B1 · B2' },
    { grupo: 'C', texto: 'C1 · C2' },
  ]

export const NOMBRE_JORNADA: Record<Jornada, string> = {
  MAÑANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
}

/** "María Fernanda García López" -> "M. García" (Figma 03b). */
export function nombreCorto(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  if (partes.length < 2) return nombre
  const apellido =
    partes.length >= 4 ? partes[partes.length - 2] : partes[partes.length - 1]
  return `${partes[0]![0]}. ${apellido}`
}

/**
 * Aptitud relativa entre 0 y 1: la aptitud obtenida sobre la máxima posible
 * (10 puntos por asignación válida, sección 6.3.1).
 */
export function aptitudRelativa(
  horario: Pick<HorarioResumen, 'fitness' | 'totalAsignaciones'>,
): string {
  if (!horario.totalAsignaciones) return '0.00'
  const valor = Math.max(
    0,
    Math.min(1, horario.fitness / (10 * horario.totalAsignaciones)),
  )
  return valor.toFixed(2)
}

/** 108_000 -> "1 min 48 s"; 2_300 -> "2,3 s"; 450 -> "450 ms". */
export function duracion(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000)
    return `${(ms / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} s`
  const segundos = Math.round(ms / 1000)
  return `${Math.floor(segundos / 60)} min ${segundos % 60} s`
}

const FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const FECHA_HORA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
export const fechaGeneracion = (iso: string) => FECHA.format(new Date(iso))
export const fechaHoraGeneracion = (iso: string) =>
  FECHA_HORA.format(new Date(iso))

/** Texto de cada resultado de la validación con Gemini (RNF-18). */
export const TEXTO_VALIDACION: Record<EstadoValidacion, string> = {
  APROBADO: 'Gemini aprobó el horario sin cambios.',
  APROBADO_CON_AJUSTES: 'Gemini aprobó el horario y se aplicaron sus ajustes.',
  RECHAZADO: 'Gemini rechazó la propuesta.',
  RESPUESTA_INVALIDA: 'La respuesta de Gemini no tenía el formato esperado.',
  AJUSTES_INVALIDOS:
    'Los ajustes de Gemini rompían alguna restricción y no se aplicaron.',
  TIEMPO_AGOTADO: 'Gemini no respondió a tiempo.',
  CUOTA_AGOTADA: 'Se agotó la cuota de la API de Gemini.',
  ERROR: 'La API de Gemini devolvió un error.',
  SIN_CONFIGURAR:
    'La validación con Gemini no está configurada en el servidor.',
}

export interface CeldaHorario {
  dia: (typeof DIAS)[number]
  asignaciones: AsignacionDetalle[]
}
export interface FilaHorario {
  inicio: string
  fin: string
  celdas: CeldaHorario[]
}

/**
 * Organiza las asignaciones en filas por franja y columnas por día, de la mañana a la noche
 * (RF-25). De lunes a viernes siempre aparecen; el sábado solo si tiene clases.
 */
export function organizar(asignaciones: AsignacionDetalle[]): {
  dias: (typeof DIAS)[number][]
  filas: FilaHorario[]
} {
  const conFranja = asignaciones.filter((a) => a.franja)
  const dias = DIAS.filter(
    (d) =>
      d.valor !== 'SAB' || conFranja.some((a) => a.franja!.diaSemana === 'SAB'),
  )
  const rangos = [
    ...new Set(
      conFranja.map((a) => `${a.franja!.horaInicio}-${a.franja!.horaFin}`),
    ),
  ].sort()
  const filas = rangos.map((rango) => {
    const [inicio, fin] = rango.split('-') as [string, string]
    return {
      inicio,
      fin,
      celdas: dias.map((dia) => ({
        dia,
        asignaciones: conFranja
          .filter(
            (a) =>
              a.franja!.diaSemana === dia.valor &&
              a.franja!.horaInicio === inicio &&
              a.franja!.horaFin === fin,
          )
          .sort((x, y) =>
            (x.grupo?.codigo ?? '').localeCompare(y.grupo?.codigo ?? ''),
          ),
      })),
    }
  })
  return { dias, filas }
}
