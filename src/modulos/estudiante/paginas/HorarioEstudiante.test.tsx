import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consultaHorarios } from '../../../compartido/horario/servicio'
import { errorApi } from '../../../pruebas/errores'
import { clase, horarioDePrueba } from '../../../pruebas/horario'
import { renderizar } from '../../../pruebas/renderizar'
import { HorarioEstudiante } from './HorarioEstudiante'

vi.mock('../../../compartido/horario/servicio', () => ({
  consultaHorarios: { actual: vi.fn(), obtener: vi.fn() },
}))

describe('Mi horario del estudiante (RF-25)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra las clases de sus grupos de la mañana a la noche', async () => {
    vi.mocked(consultaHorarios.actual).mockResolvedValue(
      horarioDePrueba([
        clase('MAR', '18:00', '20:00', 'G03', 'ING-B1'),
        clase('LUN', '07:00', '09:00', 'G01'),
      ]),
    )
    renderizar(<HorarioEstudiante />)
    expect(
      await screen.findByRole('heading', {
        name: 'Mi horario · Período 2026-2',
      }),
    ).toBeInTheDocument()
    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(within(filas[0]!).getByText('07:00')).toBeInTheDocument()
    expect(within(filas[1]!).getByText('18:00')).toBeInTheDocument()
  })

  it('explica cuando todavía no hay horario', async () => {
    vi.mocked(consultaHorarios.actual).mockRejectedValue(
      errorApi(404, 'Todavía no hay un horario activo.'),
    )
    renderizar(<HorarioEstudiante />)
    expect(
      await screen.findByText('Todavía no hay horario'),
    ).toBeInTheDocument()
  })

  it('lleva a Mis grupos cuando no tiene clases', async () => {
    vi.mocked(consultaHorarios.actual).mockResolvedValue(horarioDePrueba([]))
    renderizar(<HorarioEstudiante />)
    expect(
      await screen.findByRole('link', { name: 'Ir a Mis grupos' }),
    ).toHaveAttribute('href', '/estudiante/grupos')
  })
})
