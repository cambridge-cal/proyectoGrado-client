import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, MailCheck, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../compartido/api'
import { Aviso, Boton, Campo } from '../../compartido/ui'
import { solicitarRecuperacion } from '../servicioAuth'
import { validarEmail } from '../validacionLogin'

/** Recuperación de contraseña (Figma 02, RF-04). */
export function RecuperarContrasena() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const solicitud = useMutation({
    mutationFn: () => solicitarRecuperacion(email.trim()),
  })

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const encontrado = validarEmail(email)
    setError(encontrado)
    if (!encontrado) solicitud.mutate()
  }

  return (
    <>
      <Link
        to="/iniciar-sesion"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primario hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Volver al inicio de sesión
      </Link>
      <h2 className="mt-6 text-[26px] font-bold text-texto">
        Restablecer contraseña
      </h2>
      <p className="mt-2 text-sm text-texto-suave">
        Ingresa tu correo y te enviaremos las instrucciones de recuperación.
      </p>
      <div className="my-5 h-px bg-borde" />

      {solicitud.isSuccess ? (
        <div className="flex flex-col items-center rounded-tarjeta border border-borde bg-superficie-2 px-6 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-exito/12 text-exito-texto">
            <MailCheck className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-texto">
            Revisa tu correo
          </p>
          <p className="mt-1 text-sm text-texto-suave" role="status">
            {solicitud.data}
          </p>
          <p className="mt-3 text-xs text-texto-suave">
            El enlace vence en 30 minutos.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {solicitud.isError && (
            <Aviso tipo="error">{mensajeDeError(solicitud.error)}</Aviso>
          )}
          <Campo
            etiqueta="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nombre@cambridge.edu.co"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(undefined)
            }}
            error={error}
            autoFocus
          />
          <Boton
            type="submit"
            tamano="lg"
            cargando={solicitud.isPending}
            className="w-full"
          >
            {!solicitud.isPending && <Send className="size-4" aria-hidden />}
            {solicitud.isPending ? 'Enviando…' : 'Enviar enlace'}
          </Boton>
        </form>
      )}
    </>
  )
}
