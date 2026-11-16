import { cn } from '../utilidades'
import { puntaje, tonoPuntaje } from './formato'
import type { PuntajeDimension } from './tipos'

const TRAZO = {
  rojo: 'stroke-peligro',
  ambar: 'stroke-advertencia',
  verde: 'stroke-exito',
}
const RELLENO = {
  rojo: 'bg-peligro',
  ambar: 'bg-advertencia',
  verde: 'bg-exito',
}
type Semaforo = keyof typeof TRAZO

/** Gráfico circular con el puntaje global en escala de 1 a 5 (RF-42). */
export function MedidorPuntaje({
  valor,
  etiqueta,
}: {
  valor: number
  etiqueta: string
}) {
  const radio = 52
  const perimetro = 2 * Math.PI * radio
  const fraccion = Math.min(1, Math.max(0, valor / 5))
  const tono = tonoPuntaje(valor) as Semaforo
  return (
    <div
      role="img"
      aria-label={`Puntaje global ${puntaje(valor)} de 5: ${etiqueta}`}
      className="relative size-36 shrink-0"
    >
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          strokeWidth="10"
          className="stroke-fondo"
        />
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${perimetro * fraccion} ${perimetro}`}
          className={TRAZO[tono]}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] leading-none font-bold text-texto">
          {puntaje(valor)}
        </span>
        <span className="mt-1 text-[11px] text-texto-suave">de 5.00</span>
      </div>
    </div>
  )
}

/** Barras horizontales con el promedio de cada dimensión (RF-42). */
export function BarrasDimensiones({
  dimensiones,
}: {
  dimensiones: PuntajeDimension[]
}) {
  return (
    <ul className="space-y-3">
      {dimensiones.map((dimension) => {
        const promedio = dimension.promedio
        return (
          <li key={dimension.dimensionId}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-texto">
                {dimension.nombre}
                <span className="ml-1.5 text-xs font-normal text-texto-suave">
                  peso {dimension.peso}%
                </span>
              </span>
              <span className="font-semibold text-texto">
                {promedio === null ? 'Sin respuestas' : puntaje(promedio)}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${dimension.nombre}: ${promedio === null ? 'sin respuestas' : `${puntaje(promedio)} de 5`}`}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={promedio ?? 0}
              className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fondo"
            >
              {promedio !== null && (
                <div
                  className={cn(
                    'h-full rounded-full',
                    RELLENO[tonoPuntaje(promedio) as Semaforo],
                  )}
                  style={{ width: `${(promedio / 5) * 100}%` }}
                />
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
