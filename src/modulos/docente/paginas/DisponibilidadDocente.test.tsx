import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Franja } from '../../../compartido/tipos'
import { errorApi } from '../../../pruebas/errores'
import { renderizar } from '../../../pruebas/renderizar'
import { franjas } from '../../admin/servicios/configuracion'
import { miDisponibilidad } from '../servicios/disponibilidad'
import { DisponibilidadDocente } from './DisponibilidadDocente'

vi.mock('../../admin/servicios/configuracion', () => ({
  franjas: { todas: vi.fn() },
}))
vi.mock('../servicios/disponibilidad', () => ({
  miDisponibilidad: { obtener: vi.fn(), guardar: vi.fn() },
}))

const f = (
  id: string,
  diaSemana: Franja['diaSemana'],
  horaInicio: string,
  horaFin: string,
): Franja => ({
  id,
  diaSemana,
  horaInicio,
  horaFin,
  bloque: 1,
})
const lunes7 = f('a', 'LUN', '07:00', '09:00')
const lunes9 = f('b', 'LUN', '09:00', '11:00')
const martes7 = f('c', 'MAR', '07:00', '09:00')

describe('Mi disponibilidad (RF-16)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(franjas.todas).mockResolvedValue([lunes7, lunes9, martes7])
    vi.mocked(miDisponibilidad.obtener).mockResolvedValue([martes7])
  })

  it('marca un día completo desde su encabezado y guarda', async () => {
    vi.mocked(miDisponibilidad.guardar).mockResolvedValue([
      lunes7,
      lunes9,
      martes7,
    ])
    const { usuario } = renderizar(<DisponibilidadDocente />)
    expect(await screen.findByText('1 franjas disponibles')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    await usuario.click(
      screen.getByRole('button', { name: 'Marcar todo el lunes' }),
    )
    expect(
      screen.getByText('3 franjas disponibles · cambios sin guardar'),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() =>
      expect(miDisponibilidad.guardar).toHaveBeenCalledWith(['c', 'a', 'b']),
    )
    expect(
      await screen.findByText(/Se guardó tu disponibilidad/),
    ).toBeInTheDocument()
  })

  it('explica el error cuando la cuenta no tiene perfil de docente', async () => {
    vi.mocked(miDisponibilidad.obtener).mockRejectedValue(
      errorApi(403, 'Tu cuenta no tiene perfil de docente.'),
    )
    renderizar(<DisponibilidadDocente />)
    expect(
      await screen.findByText('Tu cuenta no tiene perfil de docente.'),
    ).toBeInTheDocument()
  })
})
