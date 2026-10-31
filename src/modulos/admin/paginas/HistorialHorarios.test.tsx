import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { horarioDePrueba } from '../../../pruebas/horario'
import { renderizar } from '../../../pruebas/renderizar'
import { horarios } from '../servicios/horarios'
import { HistorialHorarios } from './HistorialHorarios'

vi.mock('../servicios/horarios', () => ({
  horarios: {
    listar: vi.fn(),
    archivar: vi.fn(),
    eliminarArchivados: vi.fn(),
    eliminar: vi.fn(),
  },
}))

const activo = horarioDePrueba([], {
  id: 'h2',
  fitness: 35,
  totalAsignaciones: 4,
  tiempoEjecucionMs: 108_000,
})
const archivado = horarioDePrueba([], {
  id: 'h1',
  archivado: true,
  validadoGemini: false,
  estadoValidacion: 'RECHAZADO',
  totalAsignaciones: 4,
  fitness: 40,
})

describe('Historial de horarios (RF-20, RF-22, RF-23, RF-24)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(horarios.listar).mockImplementation(
      async ({ archivado: filtro, size }) => {
        const datos = [activo, archivado]
          .filter((h) => filtro === undefined || h.archivado === filtro)
          .slice(0, size)
        return { datos, total: datos.length, page: 1, size }
      },
    )
  })

  it('lista los horarios con aptitud, tiempo, validación y estado', async () => {
    renderizar(<HistorialHorarios />)
    const filas = (await screen.findAllByRole('row')).slice(1)
    expect(filas).toHaveLength(2)
    expect(within(filas[0]!).getByText('0.88')).toBeInTheDocument()
    expect(within(filas[0]!).getByText('1 min 48 s')).toBeInTheDocument()
    expect(within(filas[0]!).getByText('Validado')).toBeInTheDocument()
    expect(within(filas[0]!).getByText('Activo')).toBeInTheDocument()
    expect(within(filas[1]!).getByText('Sin validar')).toBeInTheDocument()
    expect(within(filas[1]!).getByText('Archivado')).toBeInTheDocument()
    expect(
      within(filas[0]!).getByRole('link', { name: /Ver el horario/ }),
    ).toHaveAttribute('href', '/admin/horarios/h2')
  })

  it('filtra por estado', async () => {
    const { usuario } = renderizar(<HistorialHorarios />)
    await screen.findAllByRole('row')
    await usuario.selectOptions(screen.getByLabelText('Estado'), 'archivados')
    expect(horarios.listar).toHaveBeenLastCalledWith({
      page: 1,
      size: 10,
      archivado: true,
    })
  })

  it('elimina el historial archivado con confirmación (RF-23)', async () => {
    vi.mocked(horarios.eliminarArchivados).mockResolvedValue({ eliminados: 1 })
    const { usuario } = renderizar(<HistorialHorarios />)
    await usuario.click(
      screen.getByRole('button', { name: /Eliminar historial/ }),
    )
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar historial',
      }),
    )
    expect(horarios.eliminarArchivados).toHaveBeenCalled()
    expect(
      await screen.findByText('Se eliminaron 1 horario archivado.'),
    ).toBeInTheDocument()
  })

  it('avisa si el horario activo más reciente no fue validado por Gemini', async () => {
    vi.mocked(horarios.listar).mockResolvedValue({
      datos: [
        {
          ...activo,
          validadoGemini: false,
          estadoValidacion: 'TIEMPO_AGOTADO',
          motivoValidacion: null,
        },
      ],
      total: 1,
      page: 1,
      size: 1,
    })
    renderizar(<HistorialHorarios />)
    expect(
      await screen.findByText(/Gemini no respondió a tiempo\./),
    ).toBeInTheDocument()
  })
})
