import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { servicioKdd } from '../../../compartido/evaluacion/servicio'
import { resultadoPropioDePrueba } from '../../../pruebas/kdd'
import { renderizar } from '../../../pruebas/renderizar'
import { DashboardDocente } from './DashboardDocente'

vi.mock('../../../compartido/evaluacion/servicio', () => ({
  servicioKdd: { misPeriodos: vi.fn(), misResultados: vi.fn() },
}))

const PERIODOS = [
  { id: 'p2', nombre: '2026-2', activo: true },
  { id: 'p1', nombre: '2026-1', activo: false },
]

describe('Mis resultados del docente (RF-42, RF-43)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(servicioKdd.misPeriodos).mockResolvedValue(PERIODOS)
  })

  it('muestra el puntaje global, las dimensiones, la participación y los comentarios', async () => {
    vi.mocked(servicioKdd.misResultados).mockResolvedValue({
      periodo: { id: 'p2', nombre: '2026-2' },
      resultados: [resultadoPropioDePrueba()],
    })
    renderizar(<DashboardDocente />)
    expect(
      await screen.findByRole('img', {
        name: 'Puntaje global 2.67 de 5: Crítico',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Metodología: 2.50 de 5' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Puntualidad: sin respuestas' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/de 4 estudiantes respondieron/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Explica muy bien pero llega tarde a la clase.'),
    ).toBeInTheDocument()
    expect(servicioKdd.misResultados).toHaveBeenCalledWith('p2')
  })

  it('cambia de período con el selector', async () => {
    vi.mocked(servicioKdd.misResultados).mockResolvedValue({
      periodo: { id: 'p2', nombre: '2026-2' },
      resultados: [],
    })
    const { usuario } = renderizar(<DashboardDocente />)
    await screen.findByText('Todavía no hay resultados en este período')
    await usuario.selectOptions(screen.getByLabelText('Período'), 'p1')
    await waitFor(() =>
      expect(servicioKdd.misResultados).toHaveBeenLastCalledWith('p1'),
    )
  })

  it('avisa cuando nadie dejó comentarios', async () => {
    vi.mocked(servicioKdd.misResultados).mockResolvedValue({
      periodo: { id: 'p2', nombre: '2026-2' },
      resultados: [resultadoPropioDePrueba({ comentarios: [] })],
    })
    renderizar(<DashboardDocente />)
    expect(
      await screen.findByText('Nadie dejó comentarios en esta evaluación.'),
    ).toBeInTheDocument()
  })
})
