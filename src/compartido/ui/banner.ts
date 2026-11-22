/** Primer nombre del usuario para el saludo ("Hola, Ana"). */
export function primerNombre(nombre: string | undefined): string {
  return nombre?.trim().split(/\s+/)[0] ?? ''
}

/** Enlace en forma de píldora blanca para la acción principal del banner de saludo. */
export const CLASE_ACCION_BANNER =
  'inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-xs font-bold tracking-wide text-marino-900 uppercase transition hover:bg-white/90 active:scale-[0.98]'
