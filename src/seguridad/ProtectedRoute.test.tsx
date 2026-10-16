import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Rol } from '../compartido/tipos'
import { useAuth } from './almacenAuth'
import { ProtectedRoute } from './ProtectedRoute'

function renderizarEn(ruta: string) {
  const enrutador = createMemoryRouter(
    [
      { path: '/iniciar-sesion', element: <p>Pantalla de login</p> },
      { path: '/sin-permiso', element: <p>Sin permiso</p> },
      {
        path: '/admin',
        element: <ProtectedRoute roles={['ADMIN']} />,
        children: [{ index: true, element: <p>Vista del administrador</p> }],
      },
    ],
    { initialEntries: [ruta] },
  )
  render(<RouterProvider router={enrutador} />)
}

function sesionCon(rol: Rol) {
  useAuth.getState().iniciarSesion({
    accessToken: 'a',
    refreshToken: 'r',
    usuario: { id: '1', nombre: 'Prueba', email: 'p@cambridge.edu.co', rol },
  })
}

describe('ProtectedRoute', () => {
  beforeEach(() => useAuth.getState().cerrarSesion())

  it('envía al login cuando no hay sesión', () => {
    renderizarEn('/admin')
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })

  it('bloquea la vista cuando el rol no tiene permiso', () => {
    sesionCon('ESTUDIANTE')
    renderizarEn('/admin')
    expect(screen.getByText('Sin permiso')).toBeInTheDocument()
  })

  it('muestra la vista cuando el rol tiene permiso', () => {
    sesionCon('ADMIN')
    renderizarEn('/admin')
    expect(screen.getByText('Vista del administrador')).toBeInTheDocument()
  })
})
