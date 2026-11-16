import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../pruebas/errores'
import { renderizar } from '../../pruebas/renderizar'
import { useAuth } from '../almacenAuth'
import { autorizarTratamientoDatos } from '../servicioAuth'
import { AutorizacionDatos, PaginaAvisoPrivacidad } from './AutorizacionDatos'

vi.mock('../servicioAuth', async (original) => ({
  ...(await original<typeof import('../servicioAuth')>()),
  autorizarTratamientoDatos: vi.fn(),
}))

function sesion(autorizoDatos: boolean) {
  useAuth.getState().iniciarSesion({
    accessToken: 'a',
    refreshToken: 'r',
    usuario: {
      id: 'e1',
      nombre: 'Laura Gómez',
      email: 'laura@cambridge.edu.co',
      rol: 'ESTUDIANTE',
      autorizoDatos,
    },
  })
}

describe('Autorización de tratamiento de datos (RNF-31, Ley 1581 de 2012)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useAuth.getState().cerrarSesion()
  })

  it('muestra el aviso y no deja continuar sin marcar la autorización', async () => {
    sesion(false)
    vi.mocked(autorizarTratamientoDatos).mockResolvedValue()
    const { usuario } = renderizar(<AutorizacionDatos />)
    expect(
      screen.getByRole('region', { name: 'Aviso de privacidad' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tus derechos')).toBeInTheDocument()
    const continuar = screen.getByRole('button', {
      name: 'Autorizar y continuar',
    })
    expect(continuar).toBeDisabled()
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(continuar)
    await waitFor(() =>
      expect(useAuth.getState().usuario?.autorizoDatos).toBe(true),
    )
    expect(autorizarTratamientoDatos).toHaveBeenCalledTimes(1)
  })

  it('si no autoriza, cierra la sesión', async () => {
    sesion(false)
    const { usuario } = renderizar(<AutorizacionDatos />)
    await usuario.click(
      screen.getByRole('button', { name: 'No autorizo, cerrar sesión' }),
    )
    expect(useAuth.getState().usuario).toBeNull()
    expect(autorizarTratamientoDatos).not.toHaveBeenCalled()
  })

  it('muestra el error si el servidor no pudo registrarla', async () => {
    sesion(false)
    vi.mocked(autorizarTratamientoDatos).mockRejectedValue(
      errorApi(500, 'No se pudo registrar la autorización.'),
    )
    const { usuario } = renderizar(<AutorizacionDatos />)
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(
      screen.getByRole('button', { name: 'Autorizar y continuar' }),
    )
    expect(
      await screen.findByText('No se pudo registrar la autorización.'),
    ).toBeInTheDocument()
    expect(useAuth.getState().usuario?.autorizoDatos).toBe(false)
  })

  it('el aviso se puede leer sin iniciar sesión', () => {
    renderizar(<PaginaAvisoPrivacidad />)
    expect(
      screen.getByRole('heading', { name: 'Aviso de privacidad' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Cómo ejercerlos')).toBeInTheDocument()
  })
})
