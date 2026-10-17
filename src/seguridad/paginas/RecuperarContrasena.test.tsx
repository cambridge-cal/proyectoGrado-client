import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../pruebas/errores'
import { renderizar } from '../../pruebas/renderizar'
import { solicitarRecuperacion } from '../servicioAuth'
import { RecuperarContrasena } from './RecuperarContrasena'

vi.mock('../servicioAuth', async (original) => ({
  ...(await original<typeof import('../servicioAuth')>()),
  solicitarRecuperacion: vi.fn(),
}))
const solicitar = vi.mocked(solicitarRecuperacion)

describe('RecuperarContrasena (RF-04)', () => {
  beforeEach(() => {
    solicitar.mockReset()
  })

  it('valida el correo antes de enviar', async () => {
    const { usuario } = renderizar(<RecuperarContrasena />)
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))
    expect(
      screen.getByText('Ingresa tu correo electrónico.'),
    ).toBeInTheDocument()
    expect(solicitar).not.toHaveBeenCalled()
  })

  it('muestra la confirmación con el mensaje del servidor', async () => {
    solicitar.mockResolvedValue(
      'Si el correo está registrado, recibirás un enlace.',
    )
    const { usuario } = renderizar(<RecuperarContrasena />)
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      ' docente@cambridge.edu.co ',
    )
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    expect(await screen.findByText('Revisa tu correo')).toBeInTheDocument()
    expect(
      screen.getByText('Si el correo está registrado, recibirás un enlace.'),
    ).toBeInTheDocument()
    expect(solicitar).toHaveBeenCalledWith('docente@cambridge.edu.co')
  })

  it('muestra el error si se superan los intentos', async () => {
    solicitar.mockRejectedValue(errorApi(429, 'ThrottlerException'))
    const { usuario } = renderizar(<RecuperarContrasena />)
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'docente@cambridge.edu.co',
    )
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Demasiadas peticiones',
    )
  })
})
