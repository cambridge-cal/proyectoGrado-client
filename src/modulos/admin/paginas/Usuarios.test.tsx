import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UsuarioAdmin } from '../../../compartido/tipos'
import { errorApi } from '../../../pruebas/errores'
import { renderizar } from '../../../pruebas/renderizar'
import { useAuth } from '../../../seguridad/almacenAuth'
import { servicioUsuarios } from '../servicios/usuarios'
import { Usuarios } from './Usuarios'

vi.mock('../servicios/usuarios', () => ({
  servicioUsuarios: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}))
const servicio = vi.mocked(servicioUsuarios)

const admin: UsuarioAdmin = {
  id: 'a1',
  nombre: 'Administrador CAL',
  email: 'admin@cambridge.edu.co',
  rol: 'ADMIN',
  activo: true,
  codigo: null,
  especialidad: null,
  cargaMaximaSemanal: null,
}
const docente: UsuarioAdmin = {
  ...admin,
  id: 'd1',
  nombre: 'María García',
  email: 'maria@cambridge.edu.co',
  rol: 'DOCENTE',
  especialidad: 'Inglés',
  cargaMaximaSemanal: 20,
}

describe('Usuarios (RF-06)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    servicio.listar.mockResolvedValue({
      datos: [admin, docente],
      total: 2,
      page: 1,
      size: 10,
    })
    useAuth.getState().iniciarSesion({
      accessToken: 'a',
      refreshToken: 'r',
      usuario: {
        id: 'a1',
        nombre: admin.nombre,
        email: admin.email,
        rol: 'ADMIN',
      },
    })
  })

  it('lista los usuarios con rol, detalle y estado', async () => {
    renderizar(<Usuarios />)
    const fila = (await screen.findByText('María García')).closest('tr')!
    expect(within(fila).getByText('Docente')).toBeInTheDocument()
    expect(within(fila).getByText('Inglés · 20 h/sem')).toBeInTheDocument()
    expect(within(fila).getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('1 a 2 de 2')).toBeInTheDocument()
  })

  it('el administrador no puede eliminarse ni desactivarse a sí mismo', async () => {
    renderizar(<Usuarios />)
    await screen.findByText('María García')
    expect(
      screen.getByRole('button', { name: 'Eliminar a Administrador CAL' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Desactivar a Administrador CAL' }),
    ).toBeDisabled()
  })

  it('filtra por rol desde la primera página', async () => {
    const { usuario } = renderizar(<Usuarios />)
    await screen.findByText('María García')
    await usuario.selectOptions(screen.getByLabelText('Rol'), 'DOCENTE')
    await waitFor(() =>
      expect(servicio.listar).toHaveBeenLastCalledWith(
        expect.objectContaining({ rol: 'DOCENTE', page: 1 }),
      ),
    )
  })

  it('crea un estudiante validando el código en el cliente', async () => {
    servicio.crear.mockResolvedValue({
      ...admin,
      id: 'e1',
      nombre: 'Camila Rosero',
      rol: 'ESTUDIANTE',
      codigo: 'EST-1',
    })
    const { usuario } = renderizar(<Usuarios />)
    await screen.findByText('María García')
    await usuario.click(screen.getByRole('button', { name: /Nuevo usuario/ }))

    const panel = screen.getByRole('dialog', { name: 'Nuevo usuario' })
    await usuario.type(
      within(panel).getByLabelText('Nombre completo'),
      'Camila Rosero',
    )
    await usuario.type(
      within(panel).getByLabelText('Correo electrónico'),
      'camila@cambridge.edu.co',
    )
    await usuario.type(
      within(panel).getByLabelText('Contraseña'),
      'ClaveSegura1',
    )
    await usuario.click(
      within(panel).getByRole('button', { name: 'Crear usuario' }),
    )
    expect(
      within(panel).getByText('Escribe el código del estudiante.'),
    ).toBeInTheDocument()
    expect(servicio.crear).not.toHaveBeenCalled()

    await usuario.type(
      within(panel).getByLabelText('Código de estudiante'),
      'EST-1',
    )
    await usuario.click(
      within(panel).getByRole('button', { name: 'Crear usuario' }),
    )

    expect(
      await screen.findByText('Se creó la cuenta de Camila Rosero.'),
    ).toBeInTheDocument()
    expect(servicio.crear).toHaveBeenCalledWith({
      nombre: 'Camila Rosero',
      email: 'camila@cambridge.edu.co',
      contrasena: 'ClaveSegura1',
      rol: 'ESTUDIANTE',
      codigo: 'EST-1',
    })
  })

  it('muestra en el panel el error del servidor (email repetido)', async () => {
    servicio.crear.mockRejectedValue(
      errorApi(409, 'Ya existe una cuenta con ese email.'),
    )
    const { usuario } = renderizar(<Usuarios />)
    await screen.findByText('María García')
    await usuario.click(screen.getByRole('button', { name: /Nuevo usuario/ }))
    const panel = screen.getByRole('dialog', { name: 'Nuevo usuario' })
    await usuario.selectOptions(within(panel).getByLabelText('Rol'), 'ADMIN')
    await usuario.type(
      within(panel).getByLabelText('Nombre completo'),
      'Otra Persona',
    )
    await usuario.type(
      within(panel).getByLabelText('Correo electrónico'),
      'admin@cambridge.edu.co',
    )
    await usuario.type(
      within(panel).getByLabelText('Contraseña'),
      'ClaveSegura1',
    )
    await usuario.click(
      within(panel).getByRole('button', { name: 'Crear usuario' }),
    )
    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese email.',
    )
  })

  it('pide confirmación antes de eliminar e informa si se anonimizó', async () => {
    servicio.eliminar.mockResolvedValue({ resultado: 'ANONIMIZADO' })
    const { usuario } = renderizar(<Usuarios />)
    await screen.findByText('María García')
    await usuario.click(
      screen.getByRole('button', { name: 'Eliminar a María García' }),
    )

    const dialogo = screen.getByRole('alertdialog')
    expect(servicio.eliminar).not.toHaveBeenCalled()
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Eliminar' }),
    )

    expect(
      await screen.findByText(/se borraron sus datos personales/),
    ).toBeInTheDocument()
    expect(servicio.eliminar).toHaveBeenCalledWith('d1')
  })
})
