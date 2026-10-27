import { describe, expect, it } from 'vitest'
import { validarUsuario, valoresIniciales } from './validacionUsuario'

const docente = {
  ...valoresIniciales(null),
  nombre: 'María García',
  email: 'maria@cambridge.edu.co',
  contrasena: 'Clave-Docente-1',
  rol: 'DOCENTE' as const,
  especialidad: 'Inglés',
}

describe('validarUsuario: carga máxima del docente', () => {
  it('acepta la carga vacía, el servidor usa 40 horas', () => {
    expect(
      validarUsuario({ ...docente, cargaMaximaSemanal: '' }, false)
        .cargaMaximaSemanal,
    ).toBeUndefined()
  })

  it('rechaza cargas fuera de 1 a 60', () => {
    expect(
      validarUsuario({ ...docente, cargaMaximaSemanal: '61' }, false)
        .cargaMaximaSemanal,
    ).toBeDefined()
    expect(
      validarUsuario({ ...docente, cargaMaximaSemanal: '2.5' }, false)
        .cargaMaximaSemanal,
    ).toBeDefined()
  })
})
