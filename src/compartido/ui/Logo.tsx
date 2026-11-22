import { cn } from '../utilidades'

const ARCHIVOS = {
  color: '/escudo-cambridge.png',
  blanco: '/escudo-cambridge-blanco.png',
}

/**
 * Escudo de Cambridge Academy of Languages. Es decorativo: junto a él siempre aparece el
 * nombre de la academia en texto, así que se oculta a los lectores de pantalla.
 */
export function Logo({
  className,
  variante = 'color',
}: {
  className?: string
  /** "color" sobre fondos claros, "blanco" sobre el azul marino de la marca. */
  variante?: 'color' | 'blanco'
}) {
  return (
    <img
      src={ARCHIVOS[variante]}
      alt=""
      aria-hidden
      draggable={false}
      className={cn(
        'shrink-0 object-contain select-none',
        className ?? 'h-9 w-auto',
      )}
    />
  )
}
