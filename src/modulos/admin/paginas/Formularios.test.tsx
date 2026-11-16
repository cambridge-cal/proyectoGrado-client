import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../../pruebas/errores'
import {
  formularioDePrueba,
  periodoDePrueba,
} from '../../../pruebas/evaluacion'
import { renderizar } from '../../../pruebas/renderizar'
import { periodos } from '../servicios/configuracion'
import { servicioFormularios } from '../servicios/evaluacion'
import { Formularios } from './Formularios'

vi.mock('../servicios/evaluacion', () => ({
  servicioFormularios: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}))
vi.mock('../servicios/configuracion', () => ({
  periodos: { listar: vi.fn() },
}))

const pagina = <T,>(datos: T[]) => ({
  datos,
  total: datos.length,
  page: 1,
  size: 10,
})

describe('Formularios de evaluación (RF-28 a RF-30)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(periodos.listar).mockResolvedValue(pagina([periodoDePrueba]))
  })

  it('lista los formularios con sus dimensiones y pesos', async () => {
    vi.mocked(servicioFormularios.listar).mockResolvedValue(
      pagina([formularioDePrueba()]),
    )
    renderizar(<Formularios />)
    expect(
      await screen.findByText('Evaluación docente 2026-2'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Metodología (60%), Puntualidad (40%)'),
    ).toBeInTheDocument()
    expect(screen.getByText('3 preguntas')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Asignar Evaluación docente 2026-2' }),
    ).toHaveAttribute('href', '/admin/evaluacion/asignaciones?formulario=f1')
  })

  it('crea un formulario con dos dimensiones, pesos y preguntas', async () => {
    vi.mocked(servicioFormularios.listar).mockResolvedValue(pagina([]))
    vi.mocked(servicioFormularios.crear).mockResolvedValue(
      formularioDePrueba({ nombre: 'Evaluación final' }),
    )
    const { usuario } = renderizar(<Formularios />)
    await screen.findByText('Todavía no hay formularios')
    await usuario.click(
      screen.getByRole('button', { name: 'Nuevo formulario' }),
    )
    const panel = screen.getByRole('dialog')
    const campo = (nombre: string) => within(panel).getByLabelText(nombre)

    await usuario.type(campo('Nombre del formulario'), 'Evaluación final')
    await usuario.type(campo('Nombre de la dimensión 1'), 'Metodología')
    await usuario.clear(campo('Peso 1 (%)'))
    await usuario.type(campo('Peso 1 (%)'), '60')
    await usuario.type(campo('Pregunta 1.1'), '¿Explica con claridad?')
    await usuario.click(
      within(panel).getByRole('button', { name: 'Agregar dimensión' }),
    )
    await usuario.type(campo('Nombre de la dimensión 2'), 'Puntualidad')
    await usuario.type(campo('Peso 2 (%)'), '30')
    await usuario.type(campo('Pregunta 2.1'), '¿Inicia a tiempo?')
    expect(
      within(panel).getByText('Suma de pesos: 90 de 100'),
    ).toBeInTheDocument()

    await usuario.click(
      within(panel).getByRole('button', { name: 'Crear formulario' }),
    )
    expect(
      within(panel).getByText(
        'Los pesos de las dimensiones deben sumar 100 (suman 90).',
      ),
    ).toBeInTheDocument()
    expect(servicioFormularios.crear).not.toHaveBeenCalled()

    await usuario.clear(campo('Peso 2 (%)'))
    await usuario.type(campo('Peso 2 (%)'), '40')
    await usuario.click(
      within(panel).getByRole('button', { name: 'Crear formulario' }),
    )
    await waitFor(() =>
      expect(servicioFormularios.crear).toHaveBeenCalledWith({
        nombre: 'Evaluación final',
        periodoAcademicoId: 'p1',
        dimensiones: [
          {
            nombre: 'Metodología',
            orden: 1,
            peso: 60,
            preguntas: [{ texto: '¿Explica con claridad?', orden: 1 }],
          },
          {
            nombre: 'Puntualidad',
            orden: 2,
            peso: 40,
            preguntas: [{ texto: '¿Inicia a tiempo?', orden: 1 }],
          },
        ],
      }),
    )
    expect(
      await screen.findByText(/Se creó el formulario "Evaluación final"/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('edita un formulario y muestra el error del servidor', async () => {
    vi.mocked(servicioFormularios.listar).mockResolvedValue(
      pagina([formularioDePrueba()]),
    )
    vi.mocked(servicioFormularios.actualizar).mockRejectedValue(
      errorApi(404, 'El período académico no existe.'),
    )
    const { usuario } = renderizar(<Formularios />)
    await usuario.click(
      await screen.findByRole('button', {
        name: 'Editar Evaluación docente 2026-2',
      }),
    )
    const panel = screen.getByRole('dialog')
    expect(
      within(panel).getByLabelText('Nombre de la dimensión 2'),
    ).toHaveValue('Puntualidad')
    await usuario.click(
      within(panel).getByRole('button', { name: 'Guardar cambios' }),
    )
    expect(
      await within(panel).findByText('El período académico no existe.'),
    ).toBeInTheDocument()
    expect(vi.mocked(servicioFormularios.actualizar).mock.calls[0]![0]).toBe(
      'f1',
    )
  })

  it('elimina un formulario tras confirmar', async () => {
    vi.mocked(servicioFormularios.listar).mockResolvedValue(
      pagina([formularioDePrueba()]),
    )
    vi.mocked(servicioFormularios.eliminar).mockResolvedValue()
    const { usuario } = renderizar(<Formularios />)
    await usuario.click(
      await screen.findByRole('button', {
        name: 'Eliminar Evaluación docente 2026-2',
      }),
    )
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar formulario',
      }),
    )
    await waitFor(() =>
      expect(servicioFormularios.eliminar).toHaveBeenCalledWith('f1'),
    )
    expect(
      await screen.findByText(
        'Se eliminó el formulario "Evaluación docente 2026-2".',
      ),
    ).toBeInTheDocument()
  })

  it('pide crear un período cuando no hay ninguno', async () => {
    vi.mocked(periodos.listar).mockResolvedValue(pagina([]))
    vi.mocked(servicioFormularios.listar).mockResolvedValue(pagina([]))
    renderizar(<Formularios />)
    expect(
      await screen.findByText(/Crea primero un período académico/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Nuevo formulario' }),
    ).toBeDisabled()
  })
})
