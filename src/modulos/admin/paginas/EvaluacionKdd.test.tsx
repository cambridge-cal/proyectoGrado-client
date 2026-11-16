import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  servicioAlertas,
  servicioKdd,
} from '../../../compartido/evaluacion/servicio'
import { errorApi } from '../../../pruebas/errores'
import { periodoDePrueba } from '../../../pruebas/evaluacion'
import { alertaDePrueba, resultadoDocenteDePrueba } from '../../../pruebas/kdd'
import { renderizar } from '../../../pruebas/renderizar'
import { periodos } from '../servicios/configuracion'
import { horarios } from '../servicios/horarios'
import { Alertas } from './Alertas'
import { Dashboard } from './Dashboard'
import { Evaluacion } from './Evaluacion'

vi.mock('../../../compartido/evaluacion/servicio', () => ({
  servicioKdd: { resultados: vi.fn(), ejecutar: vi.fn() },
  servicioAlertas: { listar: vi.fn(), marcarLeida: vi.fn() },
}))
vi.mock('../servicios/configuracion', () => ({
  periodos: { listar: vi.fn() },
}))
vi.mock('../servicios/horarios', () => ({ horarios: { listar: vi.fn() } }))

const pagina = <T,>(datos: T[], total = datos.length) => ({
  datos,
  total,
  page: 1,
  size: 10,
})

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(periodos.listar).mockResolvedValue(pagina([periodoDePrueba]))
})

describe('Resultados KDD del Administrador (RF-39, RF-41)', () => {
  it('lista el puntaje global y por dimensión de cada docente', async () => {
    vi.mocked(servicioKdd.resultados).mockResolvedValue([
      resultadoDocenteDePrueba(),
      resultadoDocenteDePrueba({
        evaluacionId: 'e2',
        docente: { id: 'd2', nombre: 'Luis Pérez' },
        puntajeGlobal: 4.6,
        etiqueta: 'Excelente',
        estado: 'EN_PROGRESO',
        parcial: true,
      }),
    ])
    renderizar(<Evaluacion />)
    const fila = (await screen.findByText('María García')).closest('tr')!
    expect(within(fila).getByText('2.67')).toBeInTheDocument()
    expect(within(fila).getByText('Crítico')).toBeInTheDocument()
    expect(within(fila).getByText('3 de 4')).toBeInTheDocument()
    expect(within(fila).getByText('Alerta')).toBeInTheDocument()
    const otra = screen.getByText('Luis Pérez').closest('tr')!
    expect(within(otra).getByText('Parcial')).toBeInTheDocument()
    expect(servicioKdd.resultados).toHaveBeenCalledWith('p1')
  })

  it('ejecuta el KDD del período y resume lo que hizo', async () => {
    vi.mocked(servicioKdd.resultados).mockResolvedValue([])
    vi.mocked(servicioKdd.ejecutar).mockResolvedValue({
      periodo: { id: 'p1', nombre: '2026-2' },
      evaluacionesProcesadas: 2,
      sinRespuestas: 1,
      alertas: { CRITICO: 1, ADVERTENCIA: 0, INFO: 3 },
      tiempoMs: 120,
    })
    const { usuario } = renderizar(<Evaluacion />)
    await screen.findByText('Todavía no hay resultados en este período')
    await usuario.click(screen.getByRole('button', { name: 'Ejecutar KDD' }))
    expect(
      await screen.findByText(
        'Se analizaron 2 evaluaciones del período 2026-2. 1 evaluación sigue sin respuestas. Alertas: 1 crítica, 0 advertencias y 3 docentes sin evaluaciones.',
      ),
    ).toBeInTheDocument()
    expect(servicioKdd.ejecutar).toHaveBeenCalledWith('p1')
    await waitFor(() => expect(servicioKdd.resultados).toHaveBeenCalledTimes(2))
  })

  it('muestra el error si el KDD falla', async () => {
    vi.mocked(servicioKdd.resultados).mockResolvedValue([])
    vi.mocked(servicioKdd.ejecutar).mockRejectedValue(
      errorApi(404, 'El período académico no existe.'),
    )
    const { usuario } = renderizar(<Evaluacion />)
    await screen.findByText('Todavía no hay resultados en este período')
    await usuario.click(screen.getByRole('button', { name: 'Ejecutar KDD' }))
    expect(
      await screen.findByText('El período académico no existe.'),
    ).toBeInTheDocument()
  })
})

describe('Alertas del KDD (RF-40, RF-44)', () => {
  it('lista las alertas sin leer y permite marcarlas como leídas', async () => {
    vi.mocked(servicioAlertas.listar).mockResolvedValue(
      pagina([alertaDePrueba()]),
    )
    vi.mocked(servicioAlertas.marcarLeida).mockResolvedValue(
      alertaDePrueba({ leida: true }),
    )
    const { usuario } = renderizar(<Alertas />)
    expect(
      await screen.findByText(/María García obtuvo 2.67/),
    ).toBeInTheDocument()
    expect(servicioAlertas.listar).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      periodoId: 'p1',
      tipo: undefined,
      leida: false,
    })
    await usuario.click(
      screen.getByRole('button', {
        name: 'Marcar como leída la alerta de María García',
      }),
    )
    await waitFor(() =>
      expect(vi.mocked(servicioAlertas.marcarLeida).mock.calls[0]![0]).toBe(
        'a1',
      ),
    )
  })

  it('filtra por nivel y por lectura', async () => {
    vi.mocked(servicioAlertas.listar).mockResolvedValue(pagina([]))
    const { usuario } = renderizar(<Alertas />)
    await screen.findByText('No hay alertas sin leer')
    await usuario.selectOptions(screen.getByLabelText('Nivel'), 'ADVERTENCIA')
    await usuario.selectOptions(screen.getByLabelText('Lectura'), 'leidas')
    await waitFor(() =>
      expect(servicioAlertas.listar).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
        periodoId: 'p1',
        tipo: 'ADVERTENCIA',
        leida: true,
      }),
    )
  })
})

describe('Dashboard del Administrador (RF-39, RF-41, RF-44)', () => {
  it('resume resultados, alertas y horario del período activo', async () => {
    vi.mocked(servicioKdd.resultados).mockResolvedValue([
      resultadoDocenteDePrueba(),
      resultadoDocenteDePrueba({
        evaluacionId: 'e2',
        docente: { id: 'd2', nombre: 'Luis Pérez' },
        puntajeGlobal: 4.33,
        etiqueta: 'Sobresaliente',
      }),
    ])
    vi.mocked(servicioAlertas.listar).mockResolvedValue(
      pagina([alertaDePrueba()], 7),
    )
    vi.mocked(horarios.listar).mockResolvedValue(pagina([]))
    renderizar(<Dashboard />)
    expect(
      await screen.findByText(
        'Resumen del período 2026-2: horario, evaluación docente y alertas.',
      ),
    ).toBeInTheDocument()
    expect(await screen.findByText('3.50')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Generar horario' }),
    ).toHaveAttribute('href', '/admin/horarios/generar')
    expect(servicioAlertas.listar).toHaveBeenCalledWith({
      page: 1,
      size: 5,
      periodoId: 'p1',
      leida: false,
    })
  })
})
