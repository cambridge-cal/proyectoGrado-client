import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuth } from '../seguridad/almacenAuth'
import { URL_API } from './entorno'
import type { RespuestaRenovacion } from './tipos'

/**
 * Cliente HTTP centralizado (Figura 6.13). Todos los módulos lo usan para
 * hablar con proyectoGrado-server.
 *
 * - Agrega el Access Token en la cabecera Authorization.
 * - Si la API responde 401, renueva el Access Token con el Refresh Token
 *   (POST /auth/refresh, RF-02) y repite la petición una sola vez.
 * - Si la renovación falla, cierra la sesión y ProtectedRoute envía al login.
 */
export const api = axios.create({
  baseURL: URL_API,
  timeout: 30_000,
})

const RUTAS_SIN_RENOVACION = ['/auth/login', '/auth/refresh', '/auth/logout']

type ConfiguracionReintento = InternalAxiosRequestConfig & { _reintento?: boolean }

let renovacionEnCurso: Promise<string> | null = null

async function renovarAccessToken(): Promise<string> {
  const { refreshToken, actualizarTokens } = useAuth.getState()
  if (!refreshToken) throw new Error('No hay Refresh Token')

  const { data } = await axios.post<RespuestaRenovacion>(`${URL_API}/auth/refresh`, {
    refreshToken,
  })
  actualizarTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

api.interceptors.request.use((config) => {
  const { accessToken } = useAuth.getState()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const original = error.config as ConfiguracionReintento | undefined
    const esRutaAuth = RUTAS_SIN_RENOVACION.some((ruta) => original?.url?.includes(ruta))

    if (error.response?.status !== 401 || !original || original._reintento || esRutaAuth) {
      throw error
    }

    original._reintento = true
    try {
      // Si varias peticiones fallan a la vez, todas esperan la misma renovación.
      renovacionEnCurso ??= renovarAccessToken().finally(() => {
        renovacionEnCurso = null
      })
      const nuevoToken = await renovacionEnCurso
      original.headers.Authorization = `Bearer ${nuevoToken}`
      return api(original)
    } catch {
      useAuth.getState().cerrarSesion()
      throw error
    }
  },
)

/** Extrae un mensaje legible de un error de la API para mostrarlo en pantalla. */
export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) return 'No fue posible conectar con el servidor. Revisa tu conexión.'
    if (error.response.status === 429) return 'Demasiadas peticiones. Espera un momento e intenta de nuevo.'
    const mensaje = error.response.data?.message
    if (Array.isArray(mensaje)) return mensaje.join('. ')
    if (mensaje) return mensaje
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
