/** Validación del formulario de inicio de sesión en el cliente (RNF-14). */
export interface DatosLogin {
  email: string
  contrasena: string
}

export type ErroresLogin = Partial<Record<keyof DatosLogin, string>>

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarLogin({ email, contrasena }: DatosLogin): ErroresLogin {
  const errores: ErroresLogin = {}
  const correo = email.trim()

  if (!correo) errores.email = 'Ingresa tu correo electrónico.'
  else if (!FORMATO_EMAIL.test(correo))
    errores.email = 'El correo no tiene un formato válido.'
  else if (correo.length > 160)
    errores.email = 'El correo no puede superar 160 caracteres.'

  if (!contrasena) errores.contrasena = 'Ingresa tu contraseña.'
  else if (contrasena.length > 72)
    errores.contrasena = 'La contraseña no puede superar 72 caracteres.'

  return errores
}
