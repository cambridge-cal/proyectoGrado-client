import { describe, expect, it } from 'vitest'
import { formularioDePrueba } from '../../../pruebas/evaluacion'
import {
  borradorDe,
  datosDe,
  sumaPesos,
  validarFormulario,
} from './borradorFormulario'

describe('Borrador del formulario (RF-28 a RF-30)', () => {
  it('un formulario nuevo empieza con una dimensión de peso 100', () => {
    const borrador = borradorDe(null, 'p1')
    expect(borrador.periodoAcademicoId).toBe('p1')
    expect(borrador.dimensiones).toHaveLength(1)
    expect(sumaPesos(borrador)).toBe(100)
  })

  it('convierte un formulario existente y conserva el orden', () => {
    const borrador = borradorDe(formularioDePrueba(), '')
    expect(validarFormulario(borrador)).toEqual([])
    expect(datosDe(borrador)).toEqual({
      nombre: 'Evaluación docente 2026-2',
      periodoAcademicoId: 'p1',
      dimensiones: [
        {
          nombre: 'Metodología',
          orden: 1,
          peso: 60,
          preguntas: [
            { texto: '¿Explica los temas con claridad?', orden: 1 },
            { texto: '¿Resuelve las dudas del grupo?', orden: 2 },
          ],
        },
        {
          nombre: 'Puntualidad',
          orden: 2,
          peso: 40,
          preguntas: [{ texto: '¿Inicia la clase a tiempo?', orden: 1 }],
        },
      ],
    })
  })

  it('exige que los pesos sumen 100', () => {
    const borrador = borradorDe(formularioDePrueba(), '')
    borrador.dimensiones[1]!.peso = '30'
    expect(validarFormulario(borrador)).toEqual([
      'Los pesos de las dimensiones deben sumar 100 (suman 90).',
    ])
  })

  it('señala nombre, período, peso y preguntas incompletos', () => {
    const borrador = borradorDe(null, '')
    borrador.dimensiones[0]!.peso = '0'
    expect(validarFormulario(borrador)).toEqual([
      'El nombre del formulario necesita al menos 3 caracteres.',
      'Elige el período académico del formulario.',
      'La dimensión 1 necesita un nombre.',
      'El peso de la dimensión 1 debe ser un entero entre 1 y 100.',
      'La pregunta 1 de la dimensión 1 necesita al menos 5 caracteres.',
      'Los pesos de las dimensiones deben sumar 100 (suman 0).',
    ])
  })
})
