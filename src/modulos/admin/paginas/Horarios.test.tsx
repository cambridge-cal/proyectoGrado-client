import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../../pruebas/errores'
import { clase, horarioDePrueba } from '../../../pruebas/horario'
import { renderizar, renderizarRutas } from '../../../pruebas/renderizar'
import { horarios } from '../servicios/horarios'
import { Horarios } from './Horarios'

vi.mock('../servicios/horarios', () => ({
  horarios: {
    actual: vi.fn(),
    obtener: vi.fn(),
    archivar: vi.fn(),
    eliminar: vi.fn(),
  },
}))

const asignaciones = [
  clase('LUN', '07:00', '09:00', 'G01', 'ING-A1'),
  {
    ...clase('MAR', '14:00', '16:00', 'G02', 'ING-B1'),
    docente: { id: 'd2', nombre: 'Rosa López' },
  },
]

describe('Horarios (RF-21, RF-22, RF-24, RF-25)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(horarios.actual).mockResolvedValue(horarioDePrueba(asignaciones))
  })

  it('muestra el horario activo con su validación y metadatos', async () => {
    renderizar(<Horarios />)
    expect(
      await screen.findByRole('heading', { name: 'Horarios · Período 2026-2' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Validado por Gemini')).toBeInTheDocument()
    expect(screen.getByText(/Aptitud 1\.00 · 1,2 s/)).toBeInTheDocument()
    const tabla = screen.getByRole('table')
    expect(within(tabla).getByText('Inglés A1 · G01')).toBeInTheDocument()
    expect(within(tabla).getByText('R. López')).toBeInTheDocument()
  })

  it('filtra por docente', async () => {
    const { usuario } = renderizar(<Horarios />)
    await screen.findByRole('table')
    await usuario.selectOptions(screen.getByLabelText('Docente'), 'd2')
    const tabla = screen.getByRole('table')
    expect(within(tabla).queryByText('Inglés A1 · G01')).not.toBeInTheDocument()
    expect(within(tabla).getByText('Inglés A1 · G02')).toBeInTheDocument()
  })

  it('avisa cuando el horario quedó sin validar por Gemini (RNF-18)', async () => {
    vi.mocked(horarios.actual).mockResolvedValue(
      horarioDePrueba(asignaciones, {
        validadoGemini: false,
        estadoValidacion: 'SIN_CONFIGURAR',
        motivoValidacion: 'Falta GEMINI_API_KEY en el servidor.',
      }),
    )
    renderizar(<Horarios />)
    expect(
      await screen.findByText(/Falta GEMINI_API_KEY en el servidor\./),
    ).toBeInTheDocument()
    expect(screen.getByText('Sin validar')).toBeInTheDocument()
  })

  it('invita a generar cuando no hay horario activo', async () => {
    vi.mocked(horarios.actual).mockRejectedValue(
      errorApi(404, 'Todavía no hay un horario activo.'),
    )
    renderizar(<Horarios />)
    expect(
      await screen.findByText('Todavía no hay un horario activo'),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /Generar con IA/ }).length,
    ).toBeGreaterThan(0)
  })

  it('archiva los horarios activos del período con confirmación (RF-22)', async () => {
    vi.mocked(horarios.archivar).mockResolvedValue({ archivados: 2 })
    const { usuario } = renderizar(<Horarios />)
    await usuario.click(await screen.findByRole('button', { name: /Archivar/ }))
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Archivar',
      }),
    )
    expect(horarios.archivar).toHaveBeenCalledWith('p1')
    expect(
      await screen.findByText(/Se archivaron 2 horarios/),
    ).toBeInTheDocument()
  })

  it('abre un horario por id y al eliminarlo vuelve al historial (RF-24)', async () => {
    vi.mocked(horarios.obtener).mockResolvedValue(
      horarioDePrueba(asignaciones, { id: 'h7', archivado: true }),
    )
    vi.mocked(horarios.eliminar).mockResolvedValue()
    const { usuario, enrutador } = renderizarRutas(
      [
        { path: '/admin/horarios/:horarioId', element: <Horarios /> },
        { path: '/admin/horarios/historial', element: <p>Historial</p> },
      ],
      '/admin/horarios/h7',
    )
    expect(await screen.findByText('Archivado')).toBeInTheDocument()
    expect(horarios.obtener).toHaveBeenCalledWith('h7')
    expect(
      screen.queryByRole('button', { name: /Archivar/ }),
    ).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Eliminar/ }))
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar',
      }),
    )
    expect(horarios.eliminar).toHaveBeenCalledWith('h7')
    expect(await screen.findByText('Historial')).toBeInTheDocument()
    expect(enrutador.state.location.pathname).toBe('/admin/horarios/historial')
  })
})
