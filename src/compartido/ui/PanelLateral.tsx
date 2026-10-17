import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Panel que entra por la derecha para crear o editar (Figma 14b).
 * Se cierra con Escape, con la X o haciendo clic fuera.
 */
export function PanelLateral({
  abierto,
  titulo,
  descripcion,
  onCerrar,
  children,
  pie,
}: {
  abierto: boolean
  titulo: string
  descripcion?: string
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
}) {
  const idTitulo = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      anterior?.focus()
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-marino-900/40"
        onClick={onCerrar}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-[440px] flex-col bg-superficie shadow-xl focus:outline-none"
      >
        <div className="flex items-start gap-3 border-b border-borde px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2 id={idTitulo} className="text-base font-bold text-texto">
              {titulo}
            </h2>
            {descripcion && (
              <p className="mt-1 text-xs text-texto-suave">{descripcion}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-texto-suave hover:bg-superficie-2 hover:text-texto"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {pie && (
          <div className="flex justify-end gap-2 border-t border-borde px-6 py-4">
            {pie}
          </div>
        )}
      </div>
    </div>
  )
}
