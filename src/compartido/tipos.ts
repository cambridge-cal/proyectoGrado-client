/** Roles del sistema según la entidad USUARIO (Figura 6.8). */
export type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE'

export interface UsuarioSesion {
  id: string
  nombre: string
  email: string
  rol: Rol
}

/** Respuesta de POST /auth/login (RF-01). */
export interface RespuestaInicioSesion {
  accessToken: string
  refreshToken: string
  usuario: UsuarioSesion
}

/** Respuesta de POST /auth/refresh (RF-02). */
export interface RespuestaRenovacion {
  accessToken: string
  refreshToken: string
}

/** Respuesta paginada estándar (RNF-29). */
export interface Pagina<T> {
  datos: T[]
  total: number
  page: number
  size: number
}

export const NOMBRE_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
}

/** Cuenta de usuario tal como la devuelve GET /usuarios (RF-06). */
export interface UsuarioAdmin {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo: boolean
  codigo: string | null
  especialidad: string | null
  cargaMaximaSemanal: number | null
}

/** Registro del Audit Log (RF-08). */
export interface RegistroAuditoria {
  id: string
  fechaHora: string
  modulo: string
  accion: string
  detalle: string | null
  ip: string | null
  usuario: { id: string; nombre: string; email: string; rol: Rol }
}
