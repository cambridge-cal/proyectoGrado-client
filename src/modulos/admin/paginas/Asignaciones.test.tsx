import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../../pruebas/errores'
import {
  docenteDePrueba,
  evaluacionDePrueba,
  formularioDePrueba,
} from '../../../pruebas/evaluacion'
import { renderizar } from '../../../pruebas/renderizar'
import { docentes } from '../servicios/configuracion'
import {
  servicioEvaluaciones,
  servicioFormularios,
} from '../servicios/evaluacion'
import { Asignaciones } from './Asignaciones'

vi.mock('../servicios/evaluacion', () => ({
  servicioFormularios: { listar: vi.fn() },
  servicioEvaluaciones: {
    listar: vi.fn(),
    asignar: vi.fn(),
    asignarMasivo: vi.fn(),
    eliminar: vi.fn(),
  },
}))
vi.mock('../servicios/configuracion', () => ({
  docentes: { listar: vi.fn() },
}))

const pagina = <T,>(datos: T[]) => ({
  datos,
  total: datos.length,
  page: 1,
  size: 100,
})

const RUTA = '/admin/evaluacion/asignaciones?formulario=f1'

describe('Asignación de evaluaciones (RF-31, RF-32)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(servicioFormularios.listar).mockResolvedValue(
      pagina([formularioDePrueba()]),
    )
    vi.mocked(docentes.listar).mockResolvedValue(
      pagina([
        docenteDePrueba('d1', 'María García'),
        docenteDePrueba('d2', 'Luis Pérez'),
        docenteDePrueba('d3', 'Ana Ruiz'),
        docenteDePrueba('d4', 'Docente Inactivo', false),
      ]),
    )
    vi.mocked(servicioEvaluaciones.listar).mockResolvedValue(pagina([]))
  })

  it('muestra los docentes activos y su estado de asignación', async () => {
    vi.mocked(servicioEvaluaciones.listar).mockResolvedValue(
      pagina([evaluacionDePrueba('e1', 'd1', 'María García', 'EN_PROGRESO')]),
    )
    renderizar(<Asignaciones />, RUTA)
    const fila = (await screen.findByText('María García')).closest('tr')!
    expect(within(fila).getByText('En progreso')).toBeInTheDocument()
    expect(within(fila).getByRole('checkbox')).toBeDisabled()
    expect(screen.getAllByText('Sin asignar')).toHaveLength(2)
    expect(screen.queryByText('Docente Inactivo')).not.toBeInTheDocument()
    expect(screen.getByText('1 docente asignado de 3.')).toBeInTheDocument()
    expect(servicioEvaluaciones.listar).toHaveBeenCalledWith({
      formularioId: 'f1',
      page: 1,
      size: 100,
    })
  })

  it('asigna el formulario a un solo docente', async () => {
    vi.mocked(servicioEvaluaciones.asignar).mockResolvedValue(
      evaluacionDePrueba('e2', 'd2', 'Luis Pérez'),
    )
    const { usuario } = renderizar(<Asignaciones />, RUTA)
    await usuario.click(
      await screen.findByRole('checkbox', { name: 'Seleccionar a Luis Pérez' }),
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Asignar a 1 docente' }),
    )
    await waitFor(() =>
      expect(servicioEvaluaciones.asignar).toHaveBeenCalledWith('f1', 'd2'),
    )
    expect(servicioEvaluaciones.asignarMasivo).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Se asignó el formulario a 1 docente.'),
    ).toBeInTheDocument()
  })

  it('asigna el formulario a todos los docentes sin asignar', async () => {
    vi.mocked(servicioEvaluaciones.listar).mockResolvedValue(
      pagina([evaluacionDePrueba('e1', 'd1', 'María García')]),
    )
    vi.mocked(servicioEvaluaciones.asignarMasivo).mockResolvedValue({
      creadas: 2,
      omitidas: 0,
    })
    const { usuario } = renderizar(<Asignaciones />, RUTA)
    await usuario.click(
      await screen.findByRole('checkbox', {
        name: 'Seleccionar todos los docentes sin asignar',
      }),
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Asignar a 2 docentes' }),
    )
    await waitFor(() =>
      expect(servicioEvaluaciones.asignarMasivo).toHaveBeenCalledWith('f1', [
        'd2',
        'd3',
      ]),
    )
    expect(
      await screen.findByText('Se asignó el formulario a 2 docentes.'),
    ).toBeInTheDocument()
  })

  it('muestra el error del servidor al asignar', async () => {
    vi.mocked(servicioEvaluaciones.asignar).mockRejectedValue(
      errorApi(
        409,
        'Ya existe una evaluación para este docente en este formulario.',
      ),
    )
    const { usuario } = renderizar(<Asignaciones />, RUTA)
    await usuario.click(
      await screen.findByRole('checkbox', { name: 'Seleccionar a Ana Ruiz' }),
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Asignar a 1 docente' }),
    )
    expect(
      await screen.findByText(
        'Ya existe una evaluación para este docente en este formulario.',
      ),
    ).toBeInTheDocument()
  })

  it('elimina una evaluación tras confirmar', async () => {
    vi.mocked(servicioEvaluaciones.listar).mockResolvedValue(
      pagina([evaluacionDePrueba('e1', 'd1', 'María García')]),
    )
    vi.mocked(servicioEvaluaciones.eliminar).mockResolvedValue()
    const { usuario } = renderizar(<Asignaciones />, RUTA)
    await usuario.click(
      await screen.findByRole('button', {
        name: 'Eliminar la evaluación de María García',
      }),
    )
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar evaluación',
      }),
    )
    await waitFor(() =>
      expect(servicioEvaluaciones.eliminar).toHaveBeenCalledWith('e1'),
    )
    expect(
      await screen.findByText('Se eliminó la evaluación de María García.'),
    ).toBeInTheDocument()
  })

  it('pide crear un formulario cuando no hay ninguno', async () => {
    vi.mocked(servicioFormularios.listar).mockResolvedValue(pagina([]))
    renderizar(<Asignaciones />, '/admin/evaluacion/asignaciones')
    expect(
      await screen.findByRole('link', { name: 'Ir a Formularios' }),
    ).toHaveAttribute('href', '/admin/evaluacion/formularios')
    expect(servicioEvaluaciones.listar).not.toHaveBeenCalled()
  })
})
