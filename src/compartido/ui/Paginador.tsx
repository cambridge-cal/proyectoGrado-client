import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Pie de las tablas paginadas (RNF-29). */
export function Paginador({
  page,
  size,
  total,
  onCambiar,
}: {
  page: number
  size: number
  total: number
  onCambiar: (page: number) => void
}) {
  const paginas = Math.max(1, Math.ceil(total / size))
  const desde = total === 0 ? 0 : (page - 1) * size + 1
  const hasta = Math.min(page * size, total)
  const boton =
    'flex size-8 items-center justify-center rounded-lg border border-borde text-texto hover:bg-superficie-2 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-borde px-4 py-3 text-xs text-texto-suave sm:px-5"
    >
      <p>
        {desde} a {hasta} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={boton}
          onClick={() => onCambiar(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span className="min-w-16 text-center">
          Página {page} de {paginas}
        </span>
        <button
          type="button"
          className={boton}
          onClick={() => onCambiar(page + 1)}
          disabled={page >= paginas}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
