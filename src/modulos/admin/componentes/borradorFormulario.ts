import type { DatosFormulario, Formulario } from '../servicios/evaluacion'

interface BorradorPregunta {
  clave: number
  texto: string
}
export interface BorradorDimension {
  clave: number
  nombre: string
  peso: string
  preguntas: BorradorPregunta[]
}
export interface Borrador {
  nombre: string
  periodoAcademicoId: string
  dimensiones: BorradorDimension[]
}

let siguienteClave = 0
export const nuevaClave = () => siguienteClave++

export const dimensionVacia = (peso = ''): BorradorDimension => ({
  clave: nuevaClave(),
  nombre: '',
  peso,
  preguntas: [{ clave: nuevaClave(), texto: '' }],
})

export function borradorDe(
  formulario: Formulario | null,
  periodoPorDefecto: string,
): Borrador {
  if (!formulario)
    return {
      nombre: '',
      periodoAcademicoId: periodoPorDefecto,
      dimensiones: [dimensionVacia('100')],
    }
  return {
    nombre: formulario.nombre,
    periodoAcademicoId: formulario.periodoAcademico.id,
    dimensiones: formulario.dimensiones.map((dimension) => ({
      clave: nuevaClave(),
      nombre: dimension.nombre,
      peso: String(dimension.peso ?? ''),
      preguntas: dimension.preguntas.map((pregunta) => ({
        clave: nuevaClave(),
        texto: pregunta.texto,
      })),
    })),
  }
}

export const sumaPesos = (borrador: Borrador) =>
  borrador.dimensiones.reduce(
    (total, dimension) => total + (Number(dimension.peso) || 0),
    0,
  )

/** Reglas de RF-28 a RF-30, las mismas que valida la API. */
export function validarFormulario(borrador: Borrador): string[] {
  const errores: string[] = []
  if (borrador.nombre.trim().length < 3)
    errores.push('El nombre del formulario necesita al menos 3 caracteres.')
  if (!borrador.periodoAcademicoId)
    errores.push('Elige el período académico del formulario.')
  borrador.dimensiones.forEach((dimension, indice) => {
    const numero = indice + 1
    if (dimension.nombre.trim().length < 2)
      errores.push(`La dimensión ${numero} necesita un nombre.`)
    const peso = Number(dimension.peso)
    if (!Number.isInteger(peso) || peso < 1 || peso > 100)
      errores.push(
        `El peso de la dimensión ${numero} debe ser un entero entre 1 y 100.`,
      )
    dimension.preguntas.forEach((pregunta, posicion) => {
      if (pregunta.texto.trim().length < 5)
        errores.push(
          `La pregunta ${posicion + 1} de la dimensión ${numero} necesita al menos 5 caracteres.`,
        )
    })
  })
  const suma = sumaPesos(borrador)
  if (suma !== 100)
    errores.push(
      `Los pesos de las dimensiones deben sumar 100 (suman ${suma}).`,
    )
  return errores
}

export function datosDe(borrador: Borrador): DatosFormulario {
  return {
    nombre: borrador.nombre.trim(),
    periodoAcademicoId: borrador.periodoAcademicoId,
    dimensiones: borrador.dimensiones.map((dimension, indice) => ({
      nombre: dimension.nombre.trim(),
      orden: indice + 1,
      peso: Number(dimension.peso),
      preguntas: dimension.preguntas.map((pregunta, posicion) => ({
        texto: pregunta.texto.trim(),
        orden: posicion + 1,
      })),
    })),
  }
}
