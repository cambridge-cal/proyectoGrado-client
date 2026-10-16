import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RespuestaInicioSesion } from '../../compartido/tipos'
import { useAuth } from '../almacenAuth'
import { ProtectedRoute } from '../ProtectedRoute'
import { solicitarInicioSesion } from '../servicioAuth'
import { IniciarSesion } from './IniciarSesion'

vi.mock('../servicioAuth', async (original) => ({
  ...(await original<typeof import('../servicioAuth')>()),
  solicitarInicioSesion: vi.fn(),
}))
const solicitar = vi.mocked(solicitarInicioSesion)

const respuestaDocente: RespuestaInicioSesion = {
  accessToken: 'access',
  refreshToken: 'refresh',
  usuario: {
    id: 'd1',
    nombre: 'María García',
    email: 'docente@cambridge.edu.co',
    rol: 'DOCENTE',
  },
}

function error401() {
  const config = { headers: {} } as InternalAxiosRequestConfig
  return new AxiosError('401', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
    data: { message: 'Email o contraseña incorrectos.' },
  })
}

function renderizar(
  rutaInicial:
    string | { pathname: string; state: unknown } = '/iniciar-sesion',
) {
  const enrutador = createMemoryRouter(
    [
      { path: '/iniciar-sesion', element: <IniciarSesion /> },
      { path: '/recuperar-contrasena', element: <p>Recuperar</p> },
      {
        path: '/docente',
        element: <ProtectedRoute roles={['DOCENTE']} />,
        children: [
          { index: true, element: <p>Inicio docente</p> },
          { path: 'horario', element: <p>Horario docente</p> },
        ],
      },
      { path: '/admin', element: <p>Inicio admin</p> },
    ],
    { initialEntries: [rutaInicial] },
  )
  const consultas = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={consultas}>
      <RouterProvider router={enrutador} />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

describe('IniciarSesion (RF-01, RNF-14)', () => {
  beforeEach(() => {
    useAuth.getState().cerrarSesion()
    solicitar.mockReset()
  })

  it('muestra los errores en línea y no llama al servidor si faltan datos', async () => {
    const usuario = renderizar()
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      screen.getByText('Ingresa tu correo electrónico.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(solicitar).not.toHaveBeenCalled()
  })

  it('valida el formato del correo', async () => {
    const usuario = renderizar()
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'docente@')
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      screen.getByText('El correo no tiene un formato válido.'),
    ).toBeInTheDocument()
    expect(solicitar).not.toHaveBeenCalled()
  })

  it('con credenciales válidas guarda la sesión y lleva al inicio del rol', async () => {
    solicitar.mockResolvedValue(respuestaDocente)
    const usuario = renderizar()
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      '  docente@cambridge.edu.co ',
    )
    await usuario.type(screen.getByLabelText('Contraseña'), 'ClaveSegura2026')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Inicio docente')).toBeInTheDocument()
    expect(solicitar).toHaveBeenCalledWith(
      'docente@cambridge.edu.co',
      'ClaveSegura2026',
    )
    expect(useAuth.getState()).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
  })

  it('vuelve a la página que el usuario intentaba abrir si es de su rol', async () => {
    solicitar.mockResolvedValue(respuestaDocente)
    const usuario = renderizar({
      pathname: '/iniciar-sesion',
      state: { desde: '/docente/horario' },
    })
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'docente@cambridge.edu.co',
    )
    await usuario.type(screen.getByLabelText('Contraseña'), 'ClaveSegura2026')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Horario docente')).toBeInTheDocument()
  })

  it('no lleva a una página de otro rol aunque viniera de ella', async () => {
    solicitar.mockResolvedValue(respuestaDocente)
    const usuario = renderizar({
      pathname: '/iniciar-sesion',
      state: { desde: '/admin' },
    })
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'docente@cambridge.edu.co',
    )
    await usuario.type(screen.getByLabelText('Contraseña'), 'ClaveSegura2026')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Inicio docente')).toBeInTheDocument()
  })

  it('muestra el mensaje del servidor cuando responde 401', async () => {
    solicitar.mockRejectedValue(error401())
    const usuario = renderizar()
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'docente@cambridge.edu.co',
    )
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email o contraseña incorrectos.',
    )
    expect(useAuth.getState().usuario).toBeNull()
  })

  it('permite mostrar y ocultar la contraseña', async () => {
    const usuario = renderizar()
    const campo = screen.getByLabelText('Contraseña')
    expect(campo).toHaveAttribute('type', 'password')
    await usuario.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' }),
    )
    expect(campo).toHaveAttribute('type', 'text')
  })

  it('si ya hay sesión, redirige al inicio del rol', () => {
    useAuth.getState().iniciarSesion(respuestaDocente)
    renderizar()
    expect(screen.getByText('Inicio docente')).toBeInTheDocument()
  })
})
