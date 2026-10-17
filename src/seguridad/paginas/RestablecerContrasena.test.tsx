import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../pruebas/errores'
import { renderizarRutas } from '../../pruebas/renderizar'
import { restablecerContrasena } from '../servicioAuth'
import { RestablecerContrasena } from './RestablecerContrasena'

vi.mock('../servicioAuth', async (original) => ({
  ...(await original<typeof import('../servicioAuth')>()),
  restablecerContrasena: vi.fn(),
}))
const restablecer = vi.mocked(restablecerContrasena)

const abrir = (ruta: string) =>
  renderizarRutas(
    [
      { path: '/restablecer-contrasena', element: <RestablecerContrasena /> },
      { path: '/recuperar-contrasena', element: <p>Pedir enlace</p> },
      { path: '/iniciar-sesion', element: <p>Login</p> },
    ],
    ruta,
  )

describe('RestablecerContrasena (RF-05)', () => {
  beforeEach(() => {
    restablecer.mockReset()
  })

  it('sin token muestra el aviso de enlace no válido', () => {
    abrir('/restablecer-contrasena')
    expect(screen.getByText('Enlace no válido')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Solicitar un enlace nuevo' }),
    ).toBeInTheDocument()
  })

  it('exige las reglas y que la confirmación coincida', async () => {
    const { usuario } = abrir('/restablecer-contrasena?token=abc')
    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'corta')
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'otra')
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar contraseña' }),
    )

    expect(
      screen.getByText('La contraseña no cumple las reglas.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument()
    expect(restablecer).not.toHaveBeenCalled()
  })

  it('marca las reglas a medida que se cumplen', async () => {
    const { usuario } = abrir('/restablecer-contrasena?token=abc')
    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'abc')
    expect(screen.getByText('Al menos una letra').textContent).toContain(
      '(cumple)',
    )
    expect(screen.getByText('Al menos un número').textContent).toContain(
      '(pendiente)',
    )
  })

  it('con datos válidos cambia la contraseña y ofrece iniciar sesión', async () => {
    restablecer.mockResolvedValue('Tu contraseña se actualizó.')
    const { usuario } = abrir('/restablecer-contrasena?token=abc')
    await usuario.type(
      screen.getByLabelText('Nueva contraseña'),
      'ClaveNueva2026',
    )
    await usuario.type(
      screen.getByLabelText('Confirmar contraseña'),
      'ClaveNueva2026',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar contraseña' }),
    )

    expect(
      await screen.findByText('Contraseña actualizada'),
    ).toBeInTheDocument()
    expect(restablecer).toHaveBeenCalledWith('abc', 'ClaveNueva2026')
    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
  })

  it('si el enlace venció, ofrece pedir uno nuevo', async () => {
    restablecer.mockRejectedValue(
      errorApi(
        400,
        'El enlace de restablecimiento no es válido o ya venció. Solicita uno nuevo.',
      ),
    )
    const { usuario } = abrir('/restablecer-contrasena?token=vencido')
    await usuario.type(
      screen.getByLabelText('Nueva contraseña'),
      'ClaveNueva2026',
    )
    await usuario.type(
      screen.getByLabelText('Confirmar contraseña'),
      'ClaveNueva2026',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar contraseña' }),
    )

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
  })
})
