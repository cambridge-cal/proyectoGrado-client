import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock,
  LayoutDashboard,
  ScrollText,
  Settings,
  TrendingUp,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { Rol } from './tipos'

export interface ElementoNavegacion {
  ruta: string
  etiqueta: string
  icono: LucideIcon
  /** true si solo debe marcarse activo en la ruta exacta. */
  exacta?: boolean
}

/** Menú de cada rol (RF-07, RNF-15). */
export const NAVEGACION: Record<Rol, ElementoNavegacion[]> = {
  ADMIN: [
    { ruta: '/admin', etiqueta: 'Dashboard', icono: LayoutDashboard, exacta: true },
    { ruta: '/admin/horarios', etiqueta: 'Horarios', icono: CalendarDays },
    { ruta: '/admin/evaluacion', etiqueta: 'Evaluación', icono: ClipboardList },
    { ruta: '/admin/usuarios', etiqueta: 'Usuarios', icono: Users },
    { ruta: '/admin/configuracion', etiqueta: 'Configuración', icono: Settings },
    { ruta: '/admin/auditoria', etiqueta: 'Auditoría', icono: ScrollText },
  ],
  DOCENTE: [
    { ruta: '/docente', etiqueta: 'Mi horario', icono: CalendarDays, exacta: true },
    { ruta: '/docente/resultados', etiqueta: 'Mis resultados', icono: TrendingUp },
    { ruta: '/docente/disponibilidad', etiqueta: 'Mi disponibilidad', icono: Clock },
  ],
  ESTUDIANTE: [
    { ruta: '/estudiante', etiqueta: 'Mis evaluaciones', icono: ClipboardCheck, exacta: true },
    { ruta: '/estudiante/horario', etiqueta: 'Mi horario', icono: CalendarDays },
    { ruta: '/estudiante/grupos', etiqueta: 'Mis grupos', icono: UsersRound },
  ],
}
