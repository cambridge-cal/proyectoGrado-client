import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { HorarioResumen } from '../tipos'
import { Insignia } from '../ui'
import { TEXTO_VALIDACION } from './formato'

/** Estado de la validación semántica con Gemini (RNF-18): atributo informativo, no un estado (Figura 6.16). */
export function InsigniaValidacion({
  horario,
  corta = false,
}: {
  horario: Pick<
    HorarioResumen,
    'validadoGemini' | 'estadoValidacion' | 'motivoValidacion'
  >
  corta?: boolean
}) {
  const titulo =
    horario.motivoValidacion ?? TEXTO_VALIDACION[horario.estadoValidacion]
  return horario.validadoGemini ? (
    <span title={titulo}>
      <Insignia tono="verde">
        <ShieldCheck className="size-3.5" aria-hidden />{' '}
        {corta ? 'Validado' : 'Validado por Gemini'}
      </Insignia>
    </span>
  ) : (
    <span title={titulo}>
      <Insignia tono="ambar">
        <ShieldAlert className="size-3.5" aria-hidden /> Sin validar
      </Insignia>
    </span>
  )
}
