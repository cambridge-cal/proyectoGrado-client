import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Inscripcion } from '../../../compartido/tipos'
import { errorApi } from '../../../pruebas/errores'
import { renderizar } from '../../../pruebas/renderizar'
import { servicioInscripciones } from '../servicios/inscripciones'
import { GruposEstudiante } from './GruposEstudiante'

vi.mock('../servicios/inscripciones', () => ({
  servicioInscripciones: {
    listar: vi.fn(),
    unirse: vi.fn(),
    darDeBaja: vi.fn(),
  },
}))

const inscripcion = (cambios: Partial<Inscripcion> = {}): Inscripcion => ({
  id: 'i1',
  activo: true,
  fechaInscripcion: '2026-08-03',
  fechaBaja: null,
  grupo: {
    id: 'g1',
    codigo: 'G01',
    jornada: 'MAÑANA',
    curso: 'Inglés A1',
    idioma: 'Inglés',
    nivel: 'ING-A1',
  },
  ...cambios,
})

describe('Mis grupos del estudiante (RF-26, RF-27)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lista los grupos activos y deja el historial plegado', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([
      inscripcion(),
      inscripcion({
        id: 'i2',
        activo: false,
        fechaBaja: '2026-09-01',
        grupo: { ...inscripcion().grupo, id: 'g2', codigo: 'G07' },
      }),
    ])
    const { usuario } = renderizar(<GruposEstudiante />)
    expect(await screen.findByText('G01 · Inglés A1')).toBeInTheDocument()
    expect(servicioInscripciones.listar).toHaveBeenCalledWith(true)
    expect(screen.queryByText('G07 · Inglés A1')).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Ver historial' }))
    expect(screen.getByText('G07 · Inglés A1')).toBeInTheDocument()
  })

  it('invita a inscribirse cuando no tiene grupos', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([])
    renderizar(<GruposEstudiante />)
    expect(
      await screen.findByText('Todavía no tienes grupos'),
    ).toBeInTheDocument()
  })

  it('se une con el código en mayúsculas y confirma el grupo', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([])
    vi.mocked(servicioInscripciones.unirse).mockResolvedValue(inscripcion())
    const { usuario } = renderizar(<GruposEstudiante />)
    await screen.findByText('Todavía no tienes grupos')
    await usuario.type(screen.getByLabelText('Código de acceso'), ' k7m2q9xa ')
    await usuario.click(screen.getByRole('button', { name: 'Unirme' }))
    expect(
      await screen.findByText('Te uniste al grupo G01 (Inglés A1).'),
    ).toBeInTheDocument()
    expect(vi.mocked(servicioInscripciones.unirse).mock.calls[0]![0]).toBe(
      'K7M2Q9XA',
    )
    expect(screen.getByLabelText('Código de acceso')).toHaveValue('')
  })

  it('valida la longitud del código sin llamar al servidor', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([])
    const { usuario } = renderizar(<GruposEstudiante />)
    await screen.findByText('Todavía no tienes grupos')
    await usuario.type(screen.getByLabelText('Código de acceso'), 'ab')
    await usuario.click(screen.getByRole('button', { name: 'Unirme' }))
    expect(
      screen.getByText('El código de acceso tiene entre 4 y 12 caracteres.'),
    ).toBeInTheDocument()
    expect(servicioInscripciones.unirse).not.toHaveBeenCalled()
  })

  it.each([
    [404, 'El código de acceso no corresponde a ningún grupo.'],
    [409, 'El grupo G01 no tiene cupo disponible.'],
    [
      409,
      'Ya estás inscrito en el grupo G02 de Inglés. Date de baja de ese grupo para cambiarte.',
    ],
  ])(
    'muestra el motivo cuando el servidor responde %i',
    async (estado, mensaje) => {
      vi.mocked(servicioInscripciones.listar).mockResolvedValue([])
      vi.mocked(servicioInscripciones.unirse).mockRejectedValue(
        errorApi(estado, mensaje),
      )
      const { usuario } = renderizar(<GruposEstudiante />)
      await screen.findByText('Todavía no tienes grupos')
      await usuario.type(screen.getByLabelText('Código de acceso'), 'ABCD1234')
      await usuario.click(screen.getByRole('button', { name: 'Unirme' }))
      expect(await screen.findByText(mensaje)).toBeInTheDocument()
    },
  )

  it('exige la confirmación escrita antes de la baja', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([inscripcion()])
    vi.mocked(servicioInscripciones.darDeBaja).mockResolvedValue(
      inscripcion({ activo: false, fechaBaja: '2026-11-12' }),
    )
    const { usuario } = renderizar(<GruposEstudiante />)
    await usuario.click(
      await screen.findByRole('button', {
        name: 'Darme de baja del grupo G01',
      }),
    )
    const dialogo = screen.getByRole('alertdialog')
    const confirmar = within(dialogo).getByRole('button', {
      name: 'Darme de baja',
    })
    expect(confirmar).toBeDisabled()
    const campo = within(dialogo).getByRole('textbox')
    await usuario.type(campo, 'confirmo')
    expect(confirmar).toBeDisabled()
    await usuario.clear(campo)
    await usuario.type(campo, 'Confirmo darme de baja')
    expect(confirmar).toBeEnabled()
    await usuario.click(confirmar)
    await waitFor(() =>
      expect(servicioInscripciones.darDeBaja).toHaveBeenCalledWith('g1'),
    )
    expect(
      await screen.findByText(/Te diste de baja del grupo G01/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('cancelar la baja no llama al servidor', async () => {
    vi.mocked(servicioInscripciones.listar).mockResolvedValue([inscripcion()])
    const { usuario } = renderizar(<GruposEstudiante />)
    await usuario.click(
      await screen.findByRole('button', {
        name: 'Darme de baja del grupo G01',
      }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(servicioInscripciones.darDeBaja).not.toHaveBeenCalled()
  })
})
