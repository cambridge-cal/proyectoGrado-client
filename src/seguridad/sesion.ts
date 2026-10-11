import { api } from '../compartido/api'
import { useAuth } from './almacenAuth'

/**
 * Cierra la sesión (RF-03): pide al servidor invalidar el Refresh Token y
 * limpia el estado local aunque el servidor no responda.
 */
export async function cerrarSesion(): Promise<void> {
  const { refreshToken, cerrarSesion: limpiar } = useAuth.getState()
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken })
  } catch {
    // El estado local se limpia de todas formas.
  } finally {
    limpiar()
  }
}
