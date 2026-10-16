import { cn } from '../utilidades'

type Acento = 'azul' | 'verde' | 'morado' | 'rojo' | 'naranja'

const ACENTOS: Record<Acento, string> = {
  azul: 'bg-primario/80',
  verde: 'bg-exito/80',
  morado: 'bg-morado/80',
  rojo: 'bg-peligro/80',
  naranja: 'bg-naranja/80',
}

/** Indicador numérico con barra de color inferior (Figma 05 y 07). */
export function TarjetaEstadistica({
  valor,
  etiqueta,
  ayuda,
  acento = 'azul',
}: {
  valor: string
  etiqueta: string
  ayuda?: string
  acento?: Acento
}) {
  return (
    <div className="relative overflow-hidden rounded-tarjeta border border-borde bg-superficie px-5 pt-4 pb-5">
      <p className="text-[28px] leading-tight font-bold text-texto">{valor}</p>
      <p className="mt-1 text-[13px] font-semibold text-texto">{etiqueta}</p>
      {ayuda && <p className="mt-0.5 text-[11px] text-texto-suave">{ayuda}</p>}
      <span className={cn('absolute inset-x-0 bottom-0 h-1', ACENTOS[acento])} aria-hidden />
    </div>
  )
}
