/** Validación del formulario de inicio de sesión en el cliente (RNF-14). */
export interface DatosLogin {
  email: string
  contrasena: string
}

export type ErroresLogin = Partial<Record<keyof DatosLogin, string>>

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarLogin({ email, contrasena }: DatosLogin): ErroresLogin {
  const errores: ErroresLogin = {}
  const errorEmail = validarEmail(email)
  if (errorEmail) errores.email = errorEmail

  if (!contrasena) errores.contrasena = 'Ingresa tu contraseña.'
  else if (contrasena.length > 72)
    errores.contrasena = 'La contraseña no puede superar 72 caracteres.'

  return errores
}

/** Reglas de una contraseña nueva, iguales a las del servidor (RF-05). */
export const REGLAS_CONTRASENA = [
  {
    id: 'largo',
    texto: 'Entre 8 y 72 caracteres',
    cumple: (c: string) => c.length >= 8 && c.length <= 72,
  },
  {
    id: 'letra',
    texto: 'Al menos una letra',
    cumple: (c: string) => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(c),
  },
  {
    id: 'numero',
    texto: 'Al menos un número',
    cumple: (c: string) => /\d/.test(c),
  },
] as const

export function contrasenaValida(contrasena: string): boolean {
  return REGLAS_CONTRASENA.every((regla) => regla.cumple(contrasena))
}

export function validarEmail(email: string): string | undefined {
  const correo = email.trim()
  if (!correo) return 'Ingresa tu correo electrónico.'
  if (!FORMATO_EMAIL.test(correo))
    return 'El correo no tiene un formato válido.'
  if (correo.length > 160) return 'El correo no puede superar 160 caracteres.'
  return undefined
}
