import { createBrowserRouter, type RouteObject } from 'react-router'
import { LayoutAdmin } from './compartido/layouts/LayoutAdmin'
import { LayoutAutenticacion } from './compartido/layouts/LayoutAutenticacion'
import { LayoutPortal } from './compartido/layouts/LayoutPortal'
import { NoEncontrada } from './compartido/paginas/NoEncontrada'
import { SinPermiso } from './compartido/paginas/SinPermiso'
import { Alertas } from './modulos/admin/paginas/Alertas'
import { Asignaciones } from './modulos/admin/paginas/Asignaciones'
import { Auditoria } from './modulos/admin/paginas/Auditoria'
import { Configuracion } from './modulos/admin/paginas/Configuracion'
import { Dashboard } from './modulos/admin/paginas/Dashboard'
import { Evaluacion } from './modulos/admin/paginas/Evaluacion'
import { Formularios } from './modulos/admin/paginas/Formularios'
import { GenerarHorario } from './modulos/admin/paginas/GenerarHorario'
import { HistorialHorarios } from './modulos/admin/paginas/HistorialHorarios'
import { Horarios } from './modulos/admin/paginas/Horarios'
import { Usuarios } from './modulos/admin/paginas/Usuarios'
import { DashboardDocente } from './modulos/docente/paginas/DashboardDocente'
import { DisponibilidadDocente } from './modulos/docente/paginas/DisponibilidadDocente'
import { HorarioDocente } from './modulos/docente/paginas/HorarioDocente'
import { DashboardEstudiante } from './modulos/estudiante/paginas/DashboardEstudiante'
import { FormulariosEstudiante } from './modulos/estudiante/paginas/FormulariosEstudiante'
import { GruposEstudiante } from './modulos/estudiante/paginas/GruposEstudiante'
import { HorarioEstudiante } from './modulos/estudiante/paginas/HorarioEstudiante'
import { ProtectedRoute, RedireccionInicio } from './seguridad/ProtectedRoute'
import { IniciarSesion } from './seguridad/paginas/IniciarSesion'
import { RecuperarContrasena } from './seguridad/paginas/RecuperarContrasena'
import { RestablecerContrasena } from './seguridad/paginas/RestablecerContrasena'

/** Mapa de rutas del cliente (Figura 6.13). Cada rol solo entra a su módulo (RF-07). */
export const rutas: RouteObject[] = [
  { path: '/', element: <RedireccionInicio /> },
  {
    element: <LayoutAutenticacion />,
    children: [
      { path: '/iniciar-sesion', element: <IniciarSesion /> },
      { path: '/recuperar-contrasena', element: <RecuperarContrasena /> },
      { path: '/restablecer-contrasena', element: <RestablecerContrasena /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'horarios', element: <Horarios /> },
          { path: 'horarios/generar', element: <GenerarHorario /> },
          { path: 'horarios/historial', element: <HistorialHorarios /> },
          { path: 'horarios/:horarioId', element: <Horarios /> },
          { path: 'evaluacion', element: <Evaluacion /> },
          { path: 'evaluacion/formularios', element: <Formularios /> },
          { path: 'evaluacion/asignaciones', element: <Asignaciones /> },
          { path: 'evaluacion/alertas', element: <Alertas /> },
          { path: 'usuarios', element: <Usuarios /> },
          { path: 'configuracion', element: <Configuracion /> },
          { path: 'auditoria', element: <Auditoria /> },
        ],
      },
    ],
  },
  {
    path: '/docente',
    element: <ProtectedRoute roles={['DOCENTE']} />,
    children: [
      {
        element: <LayoutPortal rol="DOCENTE" />,
        children: [
          { index: true, element: <HorarioDocente /> },
          { path: 'resultados', element: <DashboardDocente /> },
          { path: 'disponibilidad', element: <DisponibilidadDocente /> },
        ],
      },
    ],
  },
  {
    path: '/estudiante',
    element: <ProtectedRoute roles={['ESTUDIANTE']} />,
    children: [
      {
        element: <LayoutPortal rol="ESTUDIANTE" />,
        children: [
          { index: true, element: <DashboardEstudiante /> },
          {
            path: 'evaluaciones/:evaluacionId',
            element: <FormulariosEstudiante />,
          },
          { path: 'horario', element: <HorarioEstudiante /> },
          { path: 'grupos', element: <GruposEstudiante /> },
        ],
      },
    ],
  },
  { path: '/sin-permiso', element: <SinPermiso /> },
  { path: '*', element: <NoEncontrada /> },
]

export const enrutador = createBrowserRouter(rutas)
