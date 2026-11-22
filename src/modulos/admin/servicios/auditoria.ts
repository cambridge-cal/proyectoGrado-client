import { api } from '../../../compartido/api'
import type { Pagina, RegistroAuditoria } from '../../../compartido/tipos'

export interface FiltrosAuditoria {
  page: number
  size: number
  modulo?: string
  accion?: string
  usuarioId?: string
  desde?: string
  hasta?: string
}

export const servicioAuditoria = {
  listar: async (filtros: FiltrosAuditoria) => {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''),
    )
    return (await api.get<Pagina<RegistroAuditoria>>('/audit-log', { params }))
      .data
  },
  opciones: async () =>
    (
      await api.get<{ modulos: string[]; acciones: string[] }>(
        '/audit-log/opciones',
      )
    ).data,
}

/** Nombres legibles de los campos que aparecen en el detalle de la auditoría. */
const ETIQUETAS: Record<string, string> = {
  codigo: 'código',
  nombre: 'nombre',
  fitness: 'aptitud',
  estadoValidacion: 'validación',
  version: 'versión',
  motivo: 'motivo',
  total: 'total',
}

/**
 * Convierte el detalle guardado en JSON a una línea legible. Omite los identificadores
 * internos (campos terminados en "Id"), que no le dicen nada al Administrador.
 */
export function detalleLegible(registro: RegistroAuditoria): string {
  if (!registro.detalle) return ''
  try {
    const datos = JSON.parse(registro.detalle) as Record<string, unknown>
    const partes: string[] = []
    if (Array.isArray(datos.campos))
      partes.push(`Campos: ${datos.campos.join(', ')}`)
    if (typeof datos.email === 'string') partes.push(datos.email)
    if (typeof datos.rol === 'string') partes.push(`rol ${datos.rol}`)
    if (typeof datos.resultado === 'string')
      partes.push(`resultado ${datos.resultado}`)
    if (typeof datos.validadoGemini === 'boolean')
      partes.push(
        datos.validadoGemini ? 'validado por Gemini' : 'sin validar por Gemini',
      )
    for (const [clave, etiqueta] of Object.entries(ETIQUETAS)) {
      const valor = datos[clave]
      if (typeof valor === 'string' || typeof valor === 'number')
        partes.push(`${etiqueta} ${valor}`)
    }
    if (partes.length > 0) return partes.join(' · ')
    const visibles = Object.keys(datos).filter((k) => !/Id$|^id$/.test(k))
    return visibles.length === 0 ? '' : registro.detalle
  } catch {
    return registro.detalle
  }
}
