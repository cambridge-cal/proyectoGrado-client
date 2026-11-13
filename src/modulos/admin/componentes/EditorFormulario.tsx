import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Periodo } from '../../../compartido/tipos'
import {
  Aviso,
  Boton,
  Campo,
  PanelLateral,
  Selector,
} from '../../../compartido/ui'
import type { DatosFormulario, Formulario } from '../servicios/evaluacion'
import {
  borradorDe,
  datosDe,
  dimensionVacia,
  nuevaClave,
  sumaPesos,
  validarFormulario,
  type Borrador,
  type BorradorDimension,
} from './borradorFormulario'

/** Panel para crear o editar un formulario con sus dimensiones, pesos y preguntas (RF-28 a RF-30). */
export function EditorFormulario({
  formulario,
  periodos,
  guardando,
  errorServidor,
  onGuardar,
  onCerrar,
}: {
  /** null para crear uno nuevo. */
  formulario: Formulario | null
  periodos: Periodo[]
  guardando: boolean
  errorServidor?: string
  onGuardar: (datos: DatosFormulario) => void
  onCerrar: () => void
}) {
  const [borrador, setBorrador] = useState<Borrador>(() =>
    borradorDe(
      formulario,
      (periodos.find((periodo) => periodo.activo) ?? periodos[0])?.id ?? '',
    ),
  )
  const [errores, setErrores] = useState<string[]>([])
  const suma = sumaPesos(borrador)

  const cambiarDimension = (
    claveDimension: number,
    cambio: (dimension: BorradorDimension) => BorradorDimension,
  ) =>
    setBorrador((actual) => ({
      ...actual,
      dimensiones: actual.dimensiones.map((dimension) =>
        dimension.clave === claveDimension ? cambio(dimension) : dimension,
      ),
    }))

  function guardar() {
    const encontrados = validarFormulario(borrador)
    setErrores(encontrados)
    if (encontrados.length === 0) onGuardar(datosDe(borrador))
  }

  return (
    <PanelLateral
      abierto
      titulo={formulario ? 'Editar formulario' : 'Nuevo formulario'}
      descripcion="Cada dimensión tiene un peso; entre todas deben sumar 100."
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton onClick={guardar} cargando={guardando}>
            {formulario ? 'Guardar cambios' : 'Crear formulario'}
          </Boton>
        </>
      }
    >
      <div className="space-y-5">
        <Campo
          etiqueta="Nombre del formulario"
          value={borrador.nombre}
          maxLength={160}
          onChange={(evento) =>
            setBorrador({ ...borrador, nombre: evento.target.value })
          }
        />
        <Selector
          etiqueta="Período académico"
          value={borrador.periodoAcademicoId}
          onChange={(evento) =>
            setBorrador({
              ...borrador,
              periodoAcademicoId: evento.target.value,
            })
          }
          opciones={periodos.map((periodo) => ({
            valor: periodo.id,
            texto: periodo.activo
              ? `${periodo.nombre} (activo)`
              : periodo.nombre,
          }))}
        />

        {borrador.dimensiones.map((dimension, indice) => (
          <fieldset
            key={dimension.clave}
            className="space-y-3 rounded-control border border-borde p-4"
          >
            <legend className="px-1 text-[13px] font-bold text-texto">
              Dimensión {indice + 1}
            </legend>
            <div className="flex items-start gap-3">
              <Campo
                className="min-w-0 flex-1"
                etiqueta={`Nombre de la dimensión ${indice + 1}`}
                value={dimension.nombre}
                maxLength={120}
                placeholder="Ej. Metodología"
                onChange={(evento) =>
                  cambiarDimension(dimension.clave, (actual) => ({
                    ...actual,
                    nombre: evento.target.value,
                  }))
                }
              />
              <Campo
                className="w-24"
                etiqueta={`Peso ${indice + 1} (%)`}
                inputMode="numeric"
                value={dimension.peso}
                onChange={(evento) =>
                  cambiarDimension(dimension.clave, (actual) => ({
                    ...actual,
                    peso: evento.target.value.replace(/\D/g, '').slice(0, 3),
                  }))
                }
              />
            </div>
            {dimension.preguntas.map((pregunta, posicion) => (
              <div key={pregunta.clave} className="flex items-end gap-2">
                <Campo
                  className="min-w-0 flex-1"
                  etiqueta={`Pregunta ${indice + 1}.${posicion + 1}`}
                  value={pregunta.texto}
                  maxLength={500}
                  placeholder="Ej. ¿Explica los temas con claridad?"
                  onChange={(evento) =>
                    cambiarDimension(dimension.clave, (actual) => ({
                      ...actual,
                      preguntas: actual.preguntas.map((otra) =>
                        otra.clave === pregunta.clave
                          ? { ...otra, texto: evento.target.value }
                          : otra,
                      ),
                    }))
                  }
                />
                {dimension.preguntas.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Quitar la pregunta ${indice + 1}.${posicion + 1}`}
                    className="mb-1.5 rounded-lg p-2 text-texto-suave hover:bg-peligro/10 hover:text-peligro-texto"
                    onClick={() =>
                      cambiarDimension(dimension.clave, (actual) => ({
                        ...actual,
                        preguntas: actual.preguntas.filter(
                          (otra) => otra.clave !== pregunta.clave,
                        ),
                      }))
                    }
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap justify-between gap-2">
              <Boton
                variante="fantasma"
                tamano="sm"
                onClick={() =>
                  cambiarDimension(dimension.clave, (actual) => ({
                    ...actual,
                    preguntas: [
                      ...actual.preguntas,
                      { clave: nuevaClave(), texto: '' },
                    ],
                  }))
                }
              >
                <Plus className="size-3.5" aria-hidden />
                Agregar pregunta
              </Boton>
              {borrador.dimensiones.length > 1 && (
                <Boton
                  variante="peligro"
                  tamano="sm"
                  aria-label={`Quitar la dimensión ${indice + 1}`}
                  onClick={() =>
                    setBorrador((actual) => ({
                      ...actual,
                      dimensiones: actual.dimensiones.filter(
                        (otra) => otra.clave !== dimension.clave,
                      ),
                    }))
                  }
                >
                  Quitar dimensión
                </Boton>
              )}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Boton
            variante="secundario"
            tamano="sm"
            onClick={() =>
              setBorrador((actual) => ({
                ...actual,
                dimensiones: [...actual.dimensiones, dimensionVacia()],
              }))
            }
          >
            <Plus className="size-3.5" aria-hidden />
            Agregar dimensión
          </Boton>
          <p
            className={
              suma === 100
                ? 'text-sm font-semibold text-exito-texto'
                : 'text-sm font-semibold text-advertencia-texto'
            }
            aria-live="polite"
          >
            Suma de pesos: {suma} de 100
          </p>
        </div>

        {errores.length > 0 && (
          <Aviso tipo="error">
            <ul className="list-disc space-y-1 pl-4">
              {errores.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Aviso>
        )}
        {errorServidor && errores.length === 0 && (
          <Aviso tipo="error">{errorServidor}</Aviso>
        )}
      </div>
    </PanelLateral>
  )
}
