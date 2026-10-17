import { AlertTriangle } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { Boton } from './Boton'

/** Confirmación de acciones destructivas: botón rojo de borde (recomendación 7 de docs/diseno.md). */
export function DialogoConfirmacion({
  abierto,
  titulo,
  children,
  textoConfirmar,
  cargando,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  titulo: string
  children: ReactNode
  textoConfirmar: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const idTitulo = useId()

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !cargando) onCancelar()
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [abierto, cargando, onCancelar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-marino-900/40"
        onClick={cargando ? undefined : onCancelar}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="relative w-full max-w-[420px] rounded-tarjeta bg-superficie p-6 shadow-xl"
      >
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-peligro/10 text-peligro-texto">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={idTitulo} className="text-base font-bold text-texto">
              {titulo}
            </h2>
            <div className="mt-2 text-sm text-texto-suave">{children}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Boton
            variante="secundario"
            onClick={onCancelar}
            disabled={cargando}
            autoFocus
          >
            Cancelar
          </Boton>
          <Boton variante="peligro" onClick={onConfirmar} cargando={cargando}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  )
}
