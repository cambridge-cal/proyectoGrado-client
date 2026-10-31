import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consultaHorarios } from '../../../compartido/horario/servicio'
import type { HorarioDetalle } from '../../../compartido/tipos'
import { errorApi } from '../../../pruebas/errores'
import { clase, horarioDePrueba } from '../../../pruebas/horario'
import { renderizar } from '../../../pruebas/renderizar'
import { HorarioDocente } from './HorarioDocente'

vi.mock('../../../compartido/horario/servicio', () => ({
  consultaHorarios: { actual: vi.fn(), obtener: vi.fn() },
}))

const horario = (asignaciones: HorarioDetalle['asignaciones']) =>
  horarioDePrueba(asignaciones)

describe('Mi horario del docente (RF-21, RF-25)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra sus clases ordenadas de la mañana a la noche', async () => {
    vi.mocked(consultaHorarios.actual).mockResolvedValue(
      horario([
        clase('MAR', '18:00', '20:00', 'G03', 'ING-B1'),
        clase('LUN', '07:00', '09:00', 'G01'),
      ]),
    )
    renderizar(<HorarioDocente />)
    expect(
      await screen.findByRole('heading', {
        name: 'Mi horario · Período 2026-2',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('2 clases por semana, de la mañana a la noche.'),
    ).toBeInTheDocument()
    const tabla = screen.getByRole('table')
    const filas = within(tabla).getAllByRole('row').slice(1)
    expect(within(filas[0]!).getByText('07:00')).toBeInTheDocument()
    expect(within(filas[1]!).getByText('18:00')).toBeInTheDocument()
    expect(within(tabla).queryByText('M. García')).not.toBeInTheDocument()
  })

  it('explica cuando todavía no hay horario', async () => {
    vi.mocked(consultaHorarios.actual).mockRejectedValue(
      errorApi(404, 'Todavía no hay un horario activo.'),
    )
    renderizar(<HorarioDocente />)
    expect(
      await screen.findByText('Todavía no hay horario'),
    ).toBeInTheDocument()
  })

  it('explica cuando el horario no le asigna clases', async () => {
    vi.mocked(consultaHorarios.actual).mockResolvedValue(horario([]))
    renderizar(<HorarioDocente />)
    expect(
      await screen.findByText('No tienes clases asignadas'),
    ).toBeInTheDocument()
  })
})
