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

/** Convierte el detalle guardado en JSON a una línea legible. */
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
    return partes.join(' · ') || registro.detalle
  } catch {
    return registro.detalle
  }
}
