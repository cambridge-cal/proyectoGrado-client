import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import { NOMBRE_ROL, type UsuarioAdmin } from '../../../compartido/tipos'
import {
  Aviso,
  Boton,
  Campo,
  CampoContrasena,
  PanelLateral,
  Selector,
} from '../../../compartido/ui'
import { servicioUsuarios, type DatosUsuario } from '../servicios/usuarios'
import {
  validarUsuario,
  valoresIniciales,
  type Errores,
  type Valores,
} from '../validacionUsuario'

/** Crear o editar un usuario en el panel lateral (Figma 14b, RF-06). */
export function FormularioUsuario({
  abierto,
  usuario,
  onCerrar,
  onGuardado,
}: {
  abierto: boolean
  usuario: UsuarioAdmin | null
  onCerrar: () => void
  onGuardado: (mensaje: string) => void
}) {
  const edicion = usuario !== null
  const clienteConsultas = useQueryClient()
  const [valores, setValores] = useState<Valores>(() =>
    valoresIniciales(usuario),
  )
  const [errores, setErrores] = useState<Errores>({})

  const guardar = useMutation({
    mutationFn: () => {
      const datos: DatosUsuario = {
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        contrasena: valores.contrasena || undefined,
      }
      if (valores.rol === 'ESTUDIANTE') datos.codigo = valores.codigo.trim()
      if (valores.rol === 'DOCENTE') {
        datos.especialidad = valores.especialidad.trim()
        datos.cargaMaximaSemanal = Number(valores.cargaMaximaSemanal)
      }
      return edicion
        ? servicioUsuarios.actualizar(usuario.id, datos)
        : servicioUsuarios.crear({ ...datos, rol: valores.rol })
    },
    onSuccess: async (guardado) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['usuarios'] })
      onGuardado(
        edicion
          ? `Se guardaron los cambios de ${guardado.nombre}.`
          : `Se creó la cuenta de ${guardado.nombre}.`,
      )
    },
  })

  const cambiar = (campo: keyof Valores, valor: string) => {
    setValores((anterior) => ({ ...anterior, [campo]: valor }))
    if (errores[campo])
      setErrores((anterior) => ({ ...anterior, [campo]: undefined }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const encontrados = validarUsuario(valores, edicion)
    setErrores(encontrados)
    if (Object.keys(encontrados).length === 0) guardar.mutate()
  }

  return (
    <PanelLateral
      abierto={abierto}
      titulo={edicion ? 'Editar usuario' : 'Nuevo usuario'}
      descripcion={
        edicion
          ? `${NOMBRE_ROL[usuario.rol]} · ${usuario.email}`
          : 'La contraseña se guarda cifrada con bcrypt.'
      }
      onCerrar={onCerrar}
      pie={
        <>
          <Boton
            variante="secundario"
            onClick={onCerrar}
            disabled={guardar.isPending}
          >
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="formulario-usuario"
            cargando={guardar.isPending}
          >
            {edicion ? 'Guardar cambios' : 'Crear usuario'}
          </Boton>
        </>
      }
    >
      <form
        id="formulario-usuario"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {guardar.isError && (
          <Aviso tipo="error">{mensajeDeError(guardar.error)}</Aviso>
        )}

        {!edicion && (
          <Selector
            etiqueta="Rol"
            value={valores.rol}
            onChange={(e) => cambiar('rol', e.target.value)}
            opciones={(['ESTUDIANTE', 'DOCENTE', 'ADMIN'] as const).map(
              (rol) => ({ valor: rol, texto: NOMBRE_ROL[rol] }),
            )}
          />
        )}
        <Campo
          etiqueta="Nombre completo"
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={errores.nombre}
          autoComplete="off"
        />
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          value={valores.email}
          onChange={(e) => cambiar('email', e.target.value)}
          error={errores.email}
          autoComplete="off"
        />
        <CampoContrasena
          etiqueta={edicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          value={valores.contrasena}
          onChange={(e) => cambiar('contrasena', e.target.value)}
          error={errores.contrasena}
          ayuda={
            edicion
              ? 'Déjala vacía para no cambiarla. Si la cambias, se cierran sus sesiones.'
              : 'Mínimo 8 caracteres, con letras y números.'
          }
          autoComplete="new-password"
        />

        {valores.rol === 'ESTUDIANTE' && (
          <Campo
            etiqueta="Código de estudiante"
            value={valores.codigo}
            onChange={(e) => cambiar('codigo', e.target.value)}
            error={errores.codigo}
            placeholder="EST-2026-0001"
          />
        )}
        {valores.rol === 'DOCENTE' && (
          <>
            <Campo
              etiqueta="Especialidad"
              value={valores.especialidad}
              onChange={(e) => cambiar('especialidad', e.target.value)}
              error={errores.especialidad}
              placeholder="Inglés"
            />
            <Campo
              etiqueta="Carga máxima semanal (horas)"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={valores.cargaMaximaSemanal}
              onChange={(e) => cambiar('cargaMaximaSemanal', e.target.value)}
              error={errores.cargaMaximaSemanal}
              ayuda="El motor de horarios no le asigna más horas que estas."
            />
          </>
        )}
      </form>
    </PanelLateral>
  )
}
