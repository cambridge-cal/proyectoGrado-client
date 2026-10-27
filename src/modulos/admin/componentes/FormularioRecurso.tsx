import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import {
  Aviso,
  Boton,
  Campo,
  PanelLateral,
  Selector,
} from '../../../compartido/ui'

export type Valores = Record<string, string | boolean>
export type Errores = Record<string, string | undefined>

export interface CampoFormulario {
  nombre: string
  etiqueta: string
  tipo: 'texto' | 'numero' | 'fecha' | 'hora' | 'seleccion' | 'interruptor'
  opciones?: Array<{ valor: string; texto: string }>
  ayuda?: string
  placeholder?: string
  min?: number
  max?: number
  /** Obligatorio (valida que no esté vacío). */
  requerido?: boolean
  /** Solo se muestra si devuelve true. */
  visible?: (valores: Valores) => boolean
}

/** Validación básica según el tipo de campo (RNF-14). */
function validarCampos(campos: CampoFormulario[], valores: Valores): Errores {
  const errores: Errores = {}
  for (const campo of campos) {
    if (campo.visible && !campo.visible(valores)) continue
    const valor = valores[campo.nombre]
    if (typeof valor === 'boolean') continue
    const texto = (valor ?? '').trim()
    if (campo.requerido && !texto) {
      errores[campo.nombre] = `${campo.etiqueta} es obligatorio.`
      continue
    }
    if (campo.tipo === 'numero' && texto) {
      const numero = Number(texto)
      if (!Number.isInteger(numero))
        errores[campo.nombre] = 'Debe ser un número entero.'
      else if (campo.min !== undefined && numero < campo.min)
        errores[campo.nombre] = `El mínimo es ${campo.min}.`
      else if (campo.max !== undefined && numero > campo.max)
        errores[campo.nombre] = `El máximo es ${campo.max}.`
    }
  }
  return errores
}

/** Formulario de creación y edición en el panel lateral (Figma 14b). */
export function FormularioRecurso({
  titulo,
  descripcion,
  campos,
  iniciales,
  validar,
  guardar,
  invalidar,
  textoGuardar,
  onCerrar,
  onGuardado,
}: {
  titulo: string
  descripcion?: string
  campos: CampoFormulario[]
  iniciales: Valores
  validar?: (valores: Valores) => Errores
  guardar: (valores: Valores) => Promise<unknown>
  /** Primera parte de la clave de TanStack Query que se refresca al guardar. */
  invalidar: string
  textoGuardar: string
  onCerrar: () => void
  onGuardado: () => void
}) {
  const clienteConsultas = useQueryClient()
  const [valores, setValores] = useState<Valores>(iniciales)
  const [errores, setErrores] = useState<Errores>({})
  const mutacion = useMutation({
    mutationFn: () => guardar(valores),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: [invalidar] })
      onGuardado()
    },
  })

  const cambiar = (nombre: string, valor: string | boolean) => {
    setValores((anterior) => ({ ...anterior, [nombre]: valor }))
    if (errores[nombre])
      setErrores((anterior) => ({ ...anterior, [nombre]: undefined }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const encontrados = {
      ...validarCampos(campos, valores),
      ...validar?.(valores),
    }
    const conError = Object.fromEntries(
      Object.entries(encontrados).filter(([, v]) => v),
    )
    setErrores(conError)
    if (Object.keys(conError).length === 0) mutacion.mutate()
  }

  return (
    <PanelLateral
      abierto
      titulo={titulo}
      descripcion={descripcion}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton
            variante="secundario"
            onClick={onCerrar}
            disabled={mutacion.isPending}
          >
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="formulario-recurso"
            cargando={mutacion.isPending}
          >
            {textoGuardar}
          </Boton>
        </>
      }
    >
      <form
        id="formulario-recurso"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {mutacion.isError && (
          <Aviso tipo="error">{mensajeDeError(mutacion.error)}</Aviso>
        )}
        {campos
          .filter((campo) => !campo.visible || campo.visible(valores))
          .map((campo) => {
            const valor = valores[campo.nombre]
            if (campo.tipo === 'interruptor') {
              return (
                <label
                  key={campo.nombre}
                  className="flex items-start gap-3 text-sm text-texto"
                >
                  <input
                    type="checkbox"
                    checked={valor === true}
                    onChange={(e) => cambiar(campo.nombre, e.target.checked)}
                    className="mt-0.5 size-4 accent-primario"
                  />
                  <span>
                    <span className="font-medium">{campo.etiqueta}</span>
                    {campo.ayuda && (
                      <span className="block text-xs text-texto-suave">
                        {campo.ayuda}
                      </span>
                    )}
                    {errores[campo.nombre] && (
                      <span
                        className="block text-xs text-peligro-texto"
                        role="alert"
                      >
                        {errores[campo.nombre]}
                      </span>
                    )}
                  </span>
                </label>
              )
            }
            if (campo.tipo === 'seleccion') {
              return (
                <Selector
                  key={campo.nombre}
                  etiqueta={campo.etiqueta}
                  value={String(valor ?? '')}
                  onChange={(e) => cambiar(campo.nombre, e.target.value)}
                  opciones={campo.opciones ?? []}
                  error={errores[campo.nombre]}
                />
              )
            }
            const tipos = {
              texto: 'text',
              numero: 'number',
              fecha: 'date',
              hora: 'time',
            } as const
            return (
              <Campo
                key={campo.nombre}
                etiqueta={campo.etiqueta}
                type={tipos[campo.tipo]}
                inputMode={campo.tipo === 'numero' ? 'numeric' : undefined}
                min={campo.min}
                max={campo.max}
                value={String(valor ?? '')}
                onChange={(e) => cambiar(campo.nombre, e.target.value)}
                placeholder={campo.placeholder}
                ayuda={campo.ayuda}
                error={errores[campo.nombre]}
              />
            )
          })}
      </form>
    </PanelLateral>
  )
}
