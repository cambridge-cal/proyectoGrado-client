import type { Tono } from '../ui'
import type { EstadoEvaluacion, TipoAlerta } from './tipos'

export const ESTADO_EVALUACION: Record<
  EstadoEvaluacion,
  { texto: string; tono: Tono }
> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'ambar' },
  EN_PROGRESO: { texto: 'En progreso', tono: 'azul' },
  COMPLETADA: { texto: 'Completada', tono: 'turquesa' },
  ANALIZADA: { texto: 'Analizada', tono: 'morado' },
  ALERTA: { texto: 'Alerta', tono: 'rojo' },
  CERRADA: { texto: 'Cerrada', tono: 'verde' },
  ARCHIVADA: { texto: 'Archivada', tono: 'gris' },
}

export const TIPO_ALERTA: Record<TipoAlerta, { texto: string; tono: Tono }> = {
  CRITICO: { texto: 'Crítico', tono: 'rojo' },
  ADVERTENCIA: { texto: 'Advertencia', tono: 'ambar' },
  INFO: { texto: 'Información', tono: 'azul' },
}

/** Umbrales de RF-40: rojo bajo 3.0, ámbar bajo 3.5 y verde desde ahí. */
export function tonoPuntaje(puntaje: number): Tono {
  if (puntaje < 3) return 'rojo'
  if (puntaje < 3.5) return 'ambar'
  return 'verde'
}

export const puntaje = (valor: number) => valor.toFixed(2)

const FECHA_HORA = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
export const fechaHora = (iso: string) => FECHA_HORA.format(new Date(iso))
