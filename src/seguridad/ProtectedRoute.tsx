import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../compartido/tipos'
import { INICIO_POR_ROL, useAuth } from './almacenAuth'

/**
 * Protege un grupo de rutas (Figura 6.13, RNF-15):
 * sin sesión envía al login y con un rol distinto envía a "sin permiso".
 */
export function ProtectedRoute({ roles }: { roles: Rol[] }) {
  const usuario = useAuth((estado) => estado.usuario)
  const accessToken = useAuth((estado) => estado.accessToken)
  const ubicacion = useLocation()

  if (!usuario || !accessToken) {
    return <Navigate to="/iniciar-sesion" replace state={{ desde: ubicacion.pathname }} />
  }
  if (!roles.includes(usuario.rol)) {
    return <Navigate to="/sin-permiso" replace />
  }
  return <Outlet />
}

/** Ruta raíz: lleva a cada usuario a la página de inicio de su rol. */
export function RedireccionInicio() {
  const usuario = useAuth((estado) => estado.usuario)
  return <Navigate to={usuario ? INICIO_POR_ROL[usuario.rol] : '/iniciar-sesion'} replace />
}
