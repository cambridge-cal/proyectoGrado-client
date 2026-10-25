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

/** Configuración académica (RF-09 a RF-16). */
export type DiaSemana = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB'
export type Jornada = 'MAÑANA' | 'TARDE' | 'NOCHE'
export type TipoAula = 'SALON' | 'LAB' | 'VIRTUAL'

export const DIAS: Array<{ valor: DiaSemana; texto: string; corto: string }> = [
  { valor: 'LUN', texto: 'Lunes', corto: 'Lun' },
  { valor: 'MAR', texto: 'Martes', corto: 'Mar' },
  { valor: 'MIE', texto: 'Miércoles', corto: 'Mié' },
  { valor: 'JUE', texto: 'Jueves', corto: 'Jue' },
  { valor: 'VIE', texto: 'Viernes', corto: 'Vie' },
  { valor: 'SAB', texto: 'Sábado', corto: 'Sáb' },
]

export interface Periodo {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
  activo: boolean
}

export interface Nivel {
  id: string
  codigo: string
  nombre: string
  idioma: string
}

export interface Curso {
  id: string
  nombre: string
  intensidadHoraria: number
  nivelIdioma: Nivel
}

export interface Grupo {
  id: string
  codigo: string
  cupoMaximo: number
  jornada: Jornada
  codigoAcceso: string
  curso: Curso
}

export interface Aula {
  id: string
  codigo: string
  capacidad: number
  tipo: TipoAula
  activa: boolean
}

export interface Franja {
  id: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  bloque: number
}

export interface DocenteConfig {
  id: string
  usuarioId: string
  nombre: string
  email: string
  activo: boolean
  especialidad: string
  cargaMaximaSemanal: number
  franjasDisponibles: number
}
