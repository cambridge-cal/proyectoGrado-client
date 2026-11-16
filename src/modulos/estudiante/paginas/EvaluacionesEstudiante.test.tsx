import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorApi } from '../../../pruebas/errores'
import { renderizarRutas } from '../../../pruebas/renderizar'
import {
  servicioEvaluacionesEstudiante,
  type EvaluacionEstudiante,
  type EvaluacionParaResponder,
} from '../servicios/evaluaciones'
import { DashboardEstudiante } from './DashboardEstudiante'
import { FormulariosEstudiante } from './FormulariosEstudiante'

vi.mock('../servicios/evaluaciones', () => ({
  servicioEvaluacionesEstudiante: {
    listar: vi.fn(),
    obtener: vi.fn(),
    responder: vi.fn(),
  },
}))

const resumen = (
  cambios: Partial<EvaluacionEstudiante> = {},
): EvaluacionEstudiante => ({
  id: 'e1',
  formulario: { id: 'f1', nombre: 'Evaluación docente 2026-2' },
  docente: { id: 'd1', nombre: 'María García' },
  grupos: [{ id: 'g1', codigo: 'G01', curso: 'Inglés A1' }],
  totalPreguntas: 3,
  completada: false,
  abierta: true,
  ...cambios,
})

const detalle = (
  cambios: Partial<EvaluacionParaResponder> = {},
): EvaluacionParaResponder => ({
  ...resumen(),
  dimensiones: [
    {
      id: 'dim1',
      nombre: 'Metodología',
      orden: 1,
      preguntas: [
        { id: 'q1', texto: '¿Explica los temas con claridad?', orden: 1 },
        { id: 'q2', texto: '¿Resuelve las dudas del grupo?', orden: 2 },
      ],
    },
    {
      id: 'dim2',
      nombre: 'Puntualidad',
      orden: 2,
      preguntas: [{ id: 'q3', texto: '¿Inicia la clase a tiempo?', orden: 1 }],
    },
  ],
  ...cambios,
})

const rutas = [
  { path: '/estudiante', element: <DashboardEstudiante /> },
  {
    path: '/estudiante/evaluaciones/:evaluacionId',
    element: <FormulariosEstudiante />,
  },
]

describe('Mis evaluaciones del estudiante (RF-33)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('separa las pendientes de las respondidas', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.listar).mockResolvedValue([
      resumen(),
      resumen({
        id: 'e2',
        docente: { id: 'd2', nombre: 'Luis Pérez' },
        completada: true,
      }),
    ])
    renderizarRutas(rutas, '/estudiante')
    expect(
      await screen.findByRole('link', { name: 'Evaluar a María García' }),
    ).toHaveAttribute('href', '/estudiante/evaluaciones/e1')
    expect(
      screen.getByText(/Tienes 1 evaluación pendiente/),
    ).toBeInTheDocument()
    expect(screen.getByText('Respondida')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Evaluar a Luis Pérez' }),
    ).not.toBeInTheDocument()
  })

  it('lleva a Mis grupos cuando no hay evaluaciones', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.listar).mockResolvedValue([])
    renderizarRutas(rutas, '/estudiante')
    expect(
      await screen.findByRole('link', { name: 'Ir a Mis grupos' }),
    ).toHaveAttribute('href', '/estudiante/grupos')
  })
})

describe('Evaluar docente (RF-34 a RF-36, RNF-10)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(servicioEvaluacionesEstudiante.listar).mockResolvedValue([
      resumen({ completada: true }),
    ])
  })

  const elegir = async (
    usuario: ReturnType<typeof renderizarRutas>['usuario'],
    pregunta: RegExp,
    valor: number,
  ) => {
    const grupo = screen.getByRole('group', { name: pregunta })
    const opcion = grupo.querySelector<HTMLInputElement>(
      `input[value="${valor}"]`,
    )!
    await usuario.click(opcion)
  }

  it('exige responder todo y un comentario de 30 caracteres si se escribe', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.obtener).mockResolvedValue(
      detalle(),
    )
    const { usuario } = renderizarRutas(rutas, '/estudiante/evaluaciones/e1')
    expect(
      await screen.findByRole('heading', { name: 'Evaluar a María García' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tus respuestas son anónimas.')).toBeInTheDocument()
    await elegir(usuario, /Explica los temas/, 5)
    await usuario.type(
      screen.getByLabelText('Comentario anónimo (opcional)'),
      'Muy buena.',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Enviar evaluación' }),
    )
    expect(screen.getAllByText('Falta responder esta pregunta.')).toHaveLength(
      2,
    )
    expect(
      screen.getByText(/debe tener al menos 30 caracteres \(llevas 10\)/),
    ).toBeInTheDocument()
    expect(screen.getByText('1 de 3 preguntas respondidas')).toBeInTheDocument()
    expect(servicioEvaluacionesEstudiante.responder).not.toHaveBeenCalled()
  })

  it('envía las respuestas y vuelve a la lista con la confirmación', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.obtener).mockResolvedValue(
      detalle(),
    )
    vi.mocked(servicioEvaluacionesEstudiante.responder).mockResolvedValue({
      id: 'e1',
      completada: true,
    })
    const { usuario } = renderizarRutas(rutas, '/estudiante/evaluaciones/e1')
    await screen.findByRole('heading', { name: 'Evaluar a María García' })
    await elegir(usuario, /Explica los temas/, 5)
    await elegir(usuario, /Resuelve las dudas/, 4)
    await elegir(usuario, /Inicia la clase/, 3)
    await usuario.click(
      screen.getByRole('button', { name: 'Enviar evaluación' }),
    )
    await waitFor(() =>
      expect(servicioEvaluacionesEstudiante.responder).toHaveBeenCalledWith(
        'e1',
        {
          respuestas: [
            { preguntaId: 'q1', valor: 5 },
            { preguntaId: 'q2', valor: 4 },
            { preguntaId: 'q3', valor: 3 },
          ],
        },
      ),
    )
    expect(
      await screen.findByText(
        'Gracias. Tu evaluación de María García se envió de forma anónima.',
      ),
    ).toBeInTheDocument()
  })

  it('muestra el error del servidor si ya la había respondido', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.obtener).mockResolvedValue(
      detalle({
        dimensiones: [detalle().dimensiones[1]!],
      }),
    )
    vi.mocked(servicioEvaluacionesEstudiante.responder).mockRejectedValue(
      errorApi(409, 'Ya respondiste esta evaluación.'),
    )
    const { usuario } = renderizarRutas(rutas, '/estudiante/evaluaciones/e1')
    await screen.findByRole('heading', { name: 'Evaluar a María García' })
    await elegir(usuario, /Inicia la clase/, 2)
    await usuario.click(
      screen.getByRole('button', { name: 'Enviar evaluación' }),
    )
    expect(
      await screen.findByText('Ya respondiste esta evaluación.'),
    ).toBeInTheDocument()
  })

  it('no muestra el formulario de una evaluación ya respondida', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.obtener).mockResolvedValue(
      detalle({ completada: true }),
    )
    renderizarRutas(rutas, '/estudiante/evaluaciones/e1')
    expect(
      await screen.findByText(/Ya respondiste esta evaluación/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Enviar evaluación' }),
    ).not.toBeInTheDocument()
  })

  it('explica cuando la evaluación no corresponde a sus docentes', async () => {
    vi.mocked(servicioEvaluacionesEstudiante.obtener).mockRejectedValue(
      errorApi(404, 'La evaluación no existe o no corresponde a tus docentes.'),
    )
    renderizarRutas(rutas, '/estudiante/evaluaciones/e9')
    expect(
      await screen.findByText('Esta evaluación no está disponible'),
    ).toBeInTheDocument()
  })
})
