import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { clase } from '../../pruebas/horario'
import { ProximasClases } from './ProximasClases'

// Martes 24 de noviembre de 2026, 10:00 en Colombia
const MARTES = new Date('2026-11-24T15:00:00Z')

describe('ProximasClases', () => {
  it('muestra las clases de hoy ordenadas por hora', () => {
    render(
      <ProximasClases
        ahora={MARTES}
        asignaciones={[
          clase(['MAR', 'JUE'], '14:00', '16:00', 'G02'),
          clase('MAR', '08:00', '10:00', 'G01'),
          clase('LUN', '07:00', '09:00', 'G03'),
        ]}
      />,
    )
    expect(screen.getByText('Hoy · 2 clases')).toBeInTheDocument()
    const horas = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(horas[0]).toContain('08:00')
    expect(horas[1]).toContain('14:00')
  })

  it('pasa al siguiente día con clases si hoy no hay', () => {
    render(
      <ProximasClases
        ahora={MARTES}
        asignaciones={[clase('SAB', '08:30', '12:00')]}
      />,
    )
    expect(screen.getByText('Sábado · 1 clase')).toBeInTheDocument()
  })

  it('avisa cuando no hay clases en la semana', () => {
    render(<ProximasClases ahora={MARTES} asignaciones={[]} />)
    expect(screen.getByText('Sin clases esta semana')).toBeInTheDocument()
  })
})
