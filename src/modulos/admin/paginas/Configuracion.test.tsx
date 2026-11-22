import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DocenteConfig, Franja, Periodo } from '../../../compartido/tipos'
import { errorApi } from '../../../pruebas/errores'
import { renderizar } from '../../../pruebas/renderizar'
import { docentes, franjas, periodos } from '../servicios/configuracion'
import { Configuracion } from './Configuracion'

vi.mock('../servicios/configuracion', () => {
  const recurso = () => ({
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  })
  return {
    periodos: recurso(),
    niveles: recurso(),
    cursos: recurso(),
    aulas: recurso(),
    grupos: { ...recurso(), regenerarCodigo: vi.fn() },
    franjas: { ...recurso(), crearLote: vi.fn(), todas: vi.fn() },
    docentes: {
      ...recurso(),
      disponibilidad: vi.fn(),
      guardarDisponibilidad: vi.fn(),
    },
  }
})

const periodo: Periodo = {
  id: 'p1',
  nombre: '2026-2',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-11-30',
  activo: true,
}
const docente: DocenteConfig = {
  id: 'd1',
  usuarioId: 'u1',
  nombre: 'María García',
  email: 'maria@cambridge.edu.co',
  especialidad: 'Inglés',
  cargaMaximaSemanal: 40,
  franjasDisponibles: 0,
  activo: true,
}
const lunes: Franja = {
  id: 'f1',
  dias: ['LUN'],
  horaInicio: '07:00',
  horaFin: '09:00',
  bloque: 1,
}
const martes: Franja = {
  id: 'f2',
  dias: ['MAR'],
  horaInicio: '07:00',
  horaFin: '09:00',
  bloque: 2,
}
const pagina = <T,>(datos: T[]) => ({
  datos,
  total: datos.length,
  page: 1,
  size: 10,
})

describe('Configuración académica (RF-09 a RF-16)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(periodos.listar).mockResolvedValue(pagina([periodo]))
    vi.mocked(docentes.listar).mockResolvedValue(pagina([docente]))
    vi.mocked(franjas.todas).mockResolvedValue([lunes, martes])
    vi.mocked(docentes.disponibilidad).mockResolvedValue([lunes])
  })

  it('muestra los períodos en la primera pestaña', async () => {
    renderizar(<Configuracion />)
    expect(screen.getByRole('tab', { name: 'Períodos' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const fila = (await screen.findByText('2026-2')).closest('tr')!
    expect(within(fila).getByText('Activo')).toBeInTheDocument()
  })

  it('valida las fechas antes de crear un período', async () => {
    const { usuario } = renderizar(<Configuracion />)
    await usuario.click(
      await screen.findByRole('button', { name: /Nuevo período/ }),
    )
    await usuario.type(screen.getByLabelText(/Nombre/), '2027-1')
    await usuario.type(screen.getByLabelText(/Fecha de inicio/), '2027-02-01')
    await usuario.type(screen.getByLabelText(/Fecha de fin/), '2027-01-01')
    await usuario.click(screen.getByRole('button', { name: 'Crear período' }))
    expect(
      await screen.findByText('Debe ser posterior a la fecha de inicio.'),
    ).toBeInTheDocument()
    expect(periodos.crear).not.toHaveBeenCalled()
  })

  it('avisa cuando un período no se puede eliminar porque está en uso (RNF-19)', async () => {
    vi.mocked(periodos.eliminar).mockRejectedValue(
      errorApi(409, 'El período tiene horarios asociados.'),
    )
    const { usuario } = renderizar(<Configuracion />)
    await usuario.click(
      await screen.findByRole('button', { name: 'Eliminar el período 2026-2' }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(
      await screen.findByText('El período tiene horarios asociados.'),
    ).toBeInTheDocument()
  })

  it('abre la disponibilidad de un docente desde su fila y la guarda', async () => {
    vi.mocked(docentes.guardarDisponibilidad).mockResolvedValue([lunes, martes])
    const { usuario } = renderizar(<Configuracion />, '/?pestana=docentes')
    expect(await screen.findByText('Sin registrar')).toBeInTheDocument()
    await usuario.click(
      screen.getByRole('button', { name: 'Disponibilidad de María García' }),
    )
    expect(screen.getByRole('tab', { name: 'Disponibilidad' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const celdaMartes = await screen.findByRole('button', {
      name: 'Martes 07:00 a 09:00: no disponible',
    })
    expect(
      screen.getByRole('button', { name: 'Lunes 07:00 a 09:00: disponible' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await usuario.click(celdaMartes)
    await usuario.click(screen.getByRole('button', { name: /Guardar/ }))
    await waitFor(() =>
      expect(docentes.guardarDisponibilidad).toHaveBeenCalledWith('d1', [
        'f1',
        'f2',
      ]),
    )
    expect(
      await screen.findByText('Se guardó la disponibilidad del docente.'),
    ).toBeInTheDocument()
  })

  it('crea una franja que se repite de martes a jueves (RF-14)', async () => {
    vi.mocked(franjas.listar).mockResolvedValue(pagina([lunes]))
    vi.mocked(franjas.crear).mockResolvedValue(lunes)
    const { usuario } = renderizar(<Configuracion />, '/?pestana=franjas')
    expect(await screen.findByText('Lun')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Nueva franja/ }))
    await usuario.click(screen.getByLabelText('Lunes'))
    await usuario.click(screen.getByRole('button', { name: 'Crear franja' }))
    expect(
      await screen.findByText('Marca al menos un día.'),
    ).toBeInTheDocument()
    for (const dia of ['Martes', 'Miércoles', 'Jueves'])
      await usuario.click(screen.getByLabelText(dia))
    await usuario.type(screen.getByLabelText(/Hora de inicio/), '08:00')
    await usuario.type(screen.getByLabelText(/Hora de fin/), '10:00')
    await usuario.click(screen.getByRole('button', { name: 'Crear franja' }))
    await waitFor(() =>
      expect(franjas.crear).toHaveBeenCalledWith({
        dias: ['MAR', 'MIE', 'JUE'],
        horaInicio: '08:00',
        horaFin: '10:00',
        bloque: 1,
      }),
    )
  })
})
