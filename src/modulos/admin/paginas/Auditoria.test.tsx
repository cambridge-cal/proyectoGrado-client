import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RegistroAuditoria } from '../../../compartido/tipos'
import { renderizar } from '../../../pruebas/renderizar'
import { detalleLegible, servicioAuditoria } from '../servicios/auditoria'
import { servicioUsuarios } from '../servicios/usuarios'
import { Auditoria } from './Auditoria'

vi.mock('../servicios/auditoria', async (original) => ({
  ...(await original<typeof import('../servicios/auditoria')>()),
  servicioAuditoria: { listar: vi.fn(), opciones: vi.fn() },
}))
vi.mock('../servicios/usuarios', () => ({
  servicioUsuarios: { listar: vi.fn() },
}))

const registro: RegistroAuditoria = {
  id: 'r1',
  fechaHora: '2026-10-16T19:30:00.000Z',
  modulo: 'USUARIOS',
  accion: 'ACTUALIZAR',
  detalle: '{"usuarioId":"d1","campos":["nombre","activo"]}',
  ip: '190.85.1.20',
  usuario: {
    id: 'a1',
    nombre: 'Administrador CAL',
    email: 'admin@cambridge.edu.co',
    rol: 'ADMIN',
  },
}

describe('Auditoria (RF-08)', () => {
  beforeEach(() => {
    vi.mocked(servicioAuditoria.listar).mockResolvedValue({
      datos: [registro],
      total: 1,
      page: 1,
      size: 15,
    })
    vi.mocked(servicioAuditoria.opciones).mockResolvedValue({
      modulos: ['SEGURIDAD', 'USUARIOS'],
      acciones: ['ACTUALIZAR', 'LOGIN'],
    })
    vi.mocked(servicioUsuarios.listar).mockResolvedValue({
      datos: [],
      total: 0,
      page: 1,
      size: 100,
    })
  })

  it('muestra los registros con fecha en hora de Colombia y detalle legible', async () => {
    renderizar(<Auditoria />)
    expect(
      await screen.findByText('Campos: nombre, activo'),
    ).toBeInTheDocument()
    expect(screen.getByText('190.85.1.20')).toBeInTheDocument()
    expect(screen.getByText(/2:30/)).toBeInTheDocument()
    expect(screen.getByText(/Solo lectura/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /eliminar|editar/i }),
    ).not.toBeInTheDocument()
  })

  it('filtra por módulo y vuelve a la primera página', async () => {
    const { usuario } = renderizar(<Auditoria />)
    await screen.findByText('Campos: nombre, activo')
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'SEGURIDAD')
    await waitFor(() =>
      expect(servicioAuditoria.listar).toHaveBeenLastCalledWith(
        expect.objectContaining({ modulo: 'SEGURIDAD', page: 1 }),
      ),
    )
  })
})

describe('detalleLegible', () => {
  it('resume el JSON del detalle', () => {
    expect(
      detalleLegible({
        ...registro,
        detalle: '{"email":"a@b.co","rol":"DOCENTE"}',
      }),
    ).toBe('a@b.co · rol DOCENTE')
    expect(
      detalleLegible({ ...registro, detalle: 'Contraseña incorrecta' }),
    ).toBe('Contraseña incorrecta')
    expect(detalleLegible({ ...registro, detalle: null })).toBe('')
  })
})
