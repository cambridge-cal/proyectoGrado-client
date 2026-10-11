import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { RespuestaInicioSesion, Rol, UsuarioSesion } from '../compartido/tipos'

interface EstadoAuth {
  accessToken: string | null
  refreshToken: string | null
  usuario: UsuarioSesion | null
  iniciarSesion: (respuesta: RespuestaInicioSesion) => void
  actualizarTokens: (accessToken: string, refreshToken: string) => void
  cerrarSesion: () => void
}

/**
 * Estado global de autenticación (Zustand, Figura 6.13).
 * Se conserva en localStorage para que la sesión sobreviva a una recarga;
 * el Refresh Token se invalida en el servidor al cerrar sesión (RF-03).
 */
export const useAuth = create<EstadoAuth>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      iniciarSesion: ({ accessToken, refreshToken, usuario }) =>
        set({ accessToken, refreshToken, usuario }),
      actualizarTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      cerrarSesion: () => set({ accessToken: null, refreshToken: null, usuario: null }),
    }),
    {
      name: 'sistema-cal-sesion',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

/** Página de inicio de cada rol después de iniciar sesión. */
export const INICIO_POR_ROL: Record<Rol, string> = {
  ADMIN: '/admin',
  DOCENTE: '/docente',
  ESTUDIANTE: '/estudiante',
}
