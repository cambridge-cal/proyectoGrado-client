import { api } from '../compartido/api'
import type { RespuestaInicioSesion, Rol } from '../compartido/tipos'
import { INICIO_POR_ROL } from './almacenAuth'

/** POST /auth/login (RF-01, Figura 6.3). */
export async function solicitarInicioSesion(
  email: string,
  contrasena: string,
): Promise<RespuestaInicioSesion> {
  const { data } = await api.post<RespuestaInicioSesion>('/auth/login', {
    email,
    contrasena,
  })
  return data
}

/**
 * Página a la que se va después del login: la que el usuario intentaba abrir
 * si pertenece a su rol, o la página de inicio de su rol (RNF-15).
 */
export function destinoTrasIniciarSesion(
  rol: Rol,
  desde?: string | null,
): string {
  const inicio = INICIO_POR_ROL[rol]
  if (desde && (desde === inicio || desde.startsWith(`${inicio}/`)))
    return desde
  return inicio
}

/** POST /auth/recuperar-contrasena (RF-04). */
export async function solicitarRecuperacion(email: string): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>(
    '/auth/recuperar-contrasena',
    { email },
  )
  return data.mensaje
}

/** POST /auth/restablecer-contrasena (RF-05). */
export async function restablecerContrasena(
  token: string,
  nuevaContrasena: string,
): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>(
    '/auth/restablecer-contrasena',
    {
      token,
      nuevaContrasena,
    },
  )
  return data.mensaje
}
