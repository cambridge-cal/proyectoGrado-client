/** Une clases de CSS e ignora los valores vacíos. */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

/** Iniciales de un nombre para los avatares: "María García" -> "MG". */
export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join('')
}
