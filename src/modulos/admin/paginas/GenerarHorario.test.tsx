import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../../pruebas/errores'
import { clase, horarioDePrueba } from '../../../pruebas/horario'
import { renderizar } from '../../../pruebas/renderizar'
import {
  aulas,
  cursos,
  docentes,
  franjas,
  periodos,
} from '../servicios/configuracion'
import { horarios } from '../servicios/horarios'
import { GenerarHorario } from './GenerarHorario'

vi.mock('../servicios/configuracion', () => {
  const recurso = () => ({ listar: vi.fn() })
  return {
    periodos: recurso(),
    cursos: recurso(),
    docentes: recurso(),
    aulas: recurso(),
    franjas: recurso(),
  }
})
vi.mock('../servicios/horarios', () => ({ horarios: { generar: vi.fn() } }))

const pagina = <T,>(datos: T[], total = datos.length) => ({
  datos,
  total,
  page: 1,
  size: 1,
})

describe('Generar horario (RF-17, RF-19, RNF-13, RNF-18)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(periodos.listar).mockResolvedValue(
      pagina([
        {
          id: 'p1',
          nombre: '2026-2',
          fechaInicio: '2026-07-01',
          fechaFin: '2026-11-30',
          activo: true,
        },
      ]),
    )
    vi.mocked(cursos.listar).mockResolvedValue(pagina([], 18))
    vi.mocked(docentes.listar).mockResolvedValue(
      pagina([{ franjasDisponibles: 4 }, { franjasDisponibles: 0 }] as never),
    )
    vi.mocked(aulas.listar).mockResolvedValue(pagina([], 8))
    vi.mocked(franjas.listar).mockResolvedValue(pagina([], 35))
  })

  it('muestra los datos que usará el motor y las cinco restricciones duras', async () => {
    renderizar(<GenerarHorario />)
    expect(
      await screen.findByRole('heading', {
        name: 'Generar horario · Período 2026-2',
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText('18')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getAllByText('Dura')).toHaveLength(5)
    expect(screen.getByText('Blanda')).toBeInTheDocument()
  })

  it('no deja excluir los tres tipos de aula', async () => {
    const { usuario } = renderizar(<GenerarHorario />)
    await usuario.click(screen.getByLabelText('Salón'))
    await usuario.click(screen.getByLabelText('Laboratorio'))
    expect(screen.getByLabelText('Virtual')).toBeDisabled()
  })

  it('envía las exclusiones y muestra el resultado con el estado de Gemini', async () => {
    vi.mocked(horarios.generar).mockResolvedValue(
      horarioDePrueba([clase('LUN', '07:00', '09:00')], {
        id: 'h9',
        validadoGemini: false,
        estadoValidacion: 'TIEMPO_AGOTADO',
        motivoValidacion: 'Gemini no respondió en 60 s.',
      }),
    )
    const { usuario } = renderizar(<GenerarHorario />)
    await usuario.click(screen.getByLabelText('Virtual'))
    await usuario.click(
      await screen.findByRole('button', { name: /Iniciar generación/ }),
    )
    expect(horarios.generar).toHaveBeenCalledWith({
      tiposAulaExcluidos: ['VIRTUAL'],
    })
    expect(await screen.findByText('Horario generado')).toBeInTheDocument()
    expect(
      screen.getByText(/Gemini no respondió en 60 s\./),
    ).toBeInTheDocument()
    expect(screen.getByText('Sin validar')).toBeInTheDocument()
    expect(
      screen.getByText(/Validación semántica con Gemini \(gemini-2\.5-flash\)/),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    expect(screen.getByRole('link', { name: 'Ver horario' })).toHaveAttribute(
      'href',
      '/admin/horarios/h9',
    )
  })

  it('informa las restricciones no satisfechas cuando no hay solución (Figura 6.4)', async () => {
    const error = errorApi(
      422,
      'El motor no encontró un horario que cumpla todas las restricciones duras después de 3 intentos.',
    )
    ;(
      error.response!.data as Record<string, unknown>
    ).restriccionesNoSatisfechas = [
      {
        tipo: 'CAPACIDAD_AULA',
        descripcion: 'Grupo que excede la capacidad del aula',
        cantidad: 2,
      },
    ]
    vi.mocked(horarios.generar).mockRejectedValue(error)
    const { usuario } = renderizar(<GenerarHorario />)
    await usuario.click(
      await screen.findByRole('button', { name: /Iniciar generación/ }),
    )
    const panel = await screen.findByRole('alert')
    expect(
      within(panel).getByText('No se pudo generar el horario'),
    ).toBeInTheDocument()
    expect(
      within(panel).getByText('Grupo que excede la capacidad del aula'),
    ).toBeInTheDocument()
    expect(within(panel).getByText('2')).toBeInTheDocument()
  })

  it('avisa si no hay período activo y no deja generar', async () => {
    vi.mocked(periodos.listar).mockResolvedValue(pagina([]))
    renderizar(<GenerarHorario />)
    expect(
      await screen.findByText(/No hay un período activo/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Iniciar generación/ }),
    ).toBeDisabled()
  })
})
