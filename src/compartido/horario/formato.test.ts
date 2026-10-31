import { describe, expect, it } from 'vitest'
import { clase } from '../../pruebas/horario'
import {
  aptitudRelativa,
  duracion,
  grupoNivel,
  nombreCorto,
  organizar,
} from './formato'

describe('organizar (RF-25)', () => {
  it('ordena las filas de la mañana a la noche y agrupa por día', () => {
    const { dias, filas } = organizar([
      clase('MIE', '18:00', '20:00'),
      clase('LUN', '07:00', '09:00'),
      clase('MAR', '14:00', '16:00'),
      clase('LUN', '14:00', '16:00', 'G02'),
    ])
    expect(filas.map((f) => f.inicio)).toEqual(['07:00', '14:00', '18:00'])
    expect(dias.map((d) => d.valor)).toEqual([
      'LUN',
      'MAR',
      'MIE',
      'JUE',
      'VIE',
    ])
    const tarde = filas[1]!
    expect(
      tarde.celdas.find((c) => c.dia.valor === 'LUN')!.asignaciones[0]!.grupo!
        .codigo,
    ).toBe('G02')
    expect(
      tarde.celdas.find((c) => c.dia.valor === 'MAR')!.asignaciones,
    ).toHaveLength(1)
  })

  it('muestra el sábado solo si tiene clases y omite asignaciones sin franja', () => {
    const sinFranja = { ...clase('LUN', '07:00', '09:00'), franja: null }
    expect(
      organizar([clase('SAB', '08:00', '10:00'), sinFranja]).dias.at(-1)!.valor,
    ).toBe('SAB')
    expect(organizar([sinFranja]).filas).toEqual([])
  })
})

describe('formato del horario', () => {
  it.each([
    ['ING-A1', 'A'],
    ['FRA-B2', 'B'],
    ['c1', 'C'],
    ['BASICO', null],
  ])('nivel %s -> %s', (nivel, grupo) => expect(grupoNivel(nivel)).toBe(grupo))

  it('abrevia el nombre del docente como en Figma 03b', () => {
    expect(nombreCorto('María García')).toBe('M. García')
    expect(nombreCorto('María Fernanda García López')).toBe('M. García')
    expect(nombreCorto('Pierre')).toBe('Pierre')
  })

  it('calcula la aptitud relativa sobre la máxima posible', () => {
    expect(aptitudRelativa({ fitness: 40, totalAsignaciones: 4 })).toBe('1.00')
    expect(aptitudRelativa({ fitness: 35, totalAsignaciones: 4 })).toBe('0.88')
    expect(aptitudRelativa({ fitness: -100, totalAsignaciones: 4 })).toBe(
      '0.00',
    )
  })

  it('escribe la duración de forma legible', () => {
    expect(duracion(450)).toBe('450 ms')
    expect(duracion(2300)).toBe('2,3 s')
    expect(duracion(108_000)).toBe('1 min 48 s')
  })
})
