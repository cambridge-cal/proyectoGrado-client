import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Check, CircleCheck, KeyRound, LinkIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { mensajeDeError } from '../../compartido/api'
import { Aviso, Boton, CampoContrasena } from '../../compartido/ui'
import { cn } from '../../compartido/utilidades'
import { restablecerContrasena } from '../servicioAuth'
import { contrasenaValida, REGLAS_CONTRASENA } from '../validacionLogin'

/** Nueva contraseña con el token del correo (RF-05). Mismo layout del login. */
export function RestablecerContrasena() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') ?? ''
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errores, setErrores] = useState<{
    nueva?: string
    confirmacion?: string
  }>({})

  const cambio = useMutation({
    mutationFn: () => restablecerContrasena(token, nueva),
  })
  // El servidor responde 400 cuando el enlace venció, ya se usó o no es válido.
  const enlaceVencido =
    cambio.isError &&
    isAxiosError(cambio.error) &&
    cambio.error.response?.status === 400 &&
    /enlace/i.test(mensajeDeError(cambio.error))

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const encontrados: typeof errores = {}
    if (!contrasenaValida(nueva))
      encontrados.nueva = 'La contraseña no cumple las reglas.'
    if (confirmacion !== nueva)
      encontrados.confirmacion = 'Las contraseñas no coinciden.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length === 0) cambio.mutate()
  }

  if (!token || enlaceVencido) {
    return (
      <>
        <h2 className="text-[26px] font-bold text-texto">Enlace no válido</h2>
        <div className="my-5 h-px bg-borde" />
        <div className="flex flex-col items-center rounded-tarjeta border border-borde bg-superficie-2 px-6 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-advertencia/12 text-advertencia-texto">
            <LinkIcon className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm text-texto-suave" role="alert">
            El enlace de restablecimiento no es válido o ya venció. Los enlaces
            duran 30 minutos y solo sirven una vez.
          </p>
          <Link
            to="/recuperar-contrasena"
            className="mt-5 text-sm font-semibold text-primario hover:underline"
          >
            Solicitar un enlace nuevo
          </Link>
        </div>
      </>
    )
  }

  if (cambio.isSuccess) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-exito/12 text-exito-texto">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <h2 className="mt-4 text-[22px] font-bold text-texto">
          Contraseña actualizada
        </h2>
        <p className="mt-2 text-sm text-texto-suave" role="status">
          {cambio.data}
        </p>
        <Link
          to="/iniciar-sesion"
          className="mt-6 inline-flex h-11 items-center rounded-control bg-primario px-5 text-sm font-semibold text-white hover:bg-primario-oscuro"
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-[26px] font-bold text-texto">
        Crea una nueva contraseña
      </h2>
      <p className="mt-2 text-sm text-texto-suave">
        El enlace de recuperación es válido por 30 minutos.
      </p>
      <div className="my-5 h-px bg-borde" />

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {cambio.isError && (
          <Aviso tipo="error">{mensajeDeError(cambio.error)}</Aviso>
        )}
        <CampoContrasena
          etiqueta="Nueva contraseña"
          name="nueva"
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          error={errores.nueva}
          autoFocus
        />
        <ul
          className="-mt-1 space-y-1 text-xs"
          aria-label="Reglas de la contraseña"
        >
          {REGLAS_CONTRASENA.map((regla) => {
            const cumple = regla.cumple(nueva)
            return (
              <li
                key={regla.id}
                className={cn(
                  'flex items-center gap-1.5',
                  cumple ? 'text-exito-texto' : 'text-texto-suave',
                )}
              >
                <Check
                  className={cn('size-3.5', !cumple && 'opacity-30')}
                  aria-hidden
                />
                {regla.texto}
                <span className="sr-only">
                  {cumple ? '(cumple)' : '(pendiente)'}
                </span>
              </li>
            )
          })}
        </ul>
        <CampoContrasena
          etiqueta="Confirmar contraseña"
          name="confirmacion"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          error={errores.confirmacion}
        />
        <Boton
          type="submit"
          tamano="lg"
          cargando={cambio.isPending}
          className="w-full"
        >
          {!cambio.isPending && <KeyRound className="size-4" aria-hidden />}
          {cambio.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Boton>
      </form>
    </>
  )
}
