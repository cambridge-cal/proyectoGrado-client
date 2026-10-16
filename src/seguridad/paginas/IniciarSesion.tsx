import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { mensajeDeError } from '../../compartido/api'
import { Boton, Campo } from '../../compartido/ui'
import { INICIO_POR_ROL, useAuth } from '../almacenAuth'
import {
  destinoTrasIniciarSesion,
  solicitarInicioSesion,
} from '../servicioAuth'
import {
  validarLogin,
  type DatosLogin,
  type ErroresLogin,
} from '../validacionLogin'

/** Inicio de sesión (Figma 01, RF-01, RNF-14). */
export function IniciarSesion() {
  const usuario = useAuth((estado) => estado.usuario)
  const guardarSesion = useAuth((estado) => estado.iniciarSesion)
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const desde = (ubicacion.state as { desde?: string } | null)?.desde

  const [datos, setDatos] = useState<DatosLogin>({ email: '', contrasena: '' })
  const [errores, setErrores] = useState<ErroresLogin>({})
  const [verContrasena, setVerContrasena] = useState(false)

  const login = useMutation({
    mutationFn: () =>
      solicitarInicioSesion(datos.email.trim(), datos.contrasena),
    onSuccess: (respuesta) => {
      guardarSesion(respuesta)
      navegar(destinoTrasIniciarSesion(respuesta.usuario.rol, desde), {
        replace: true,
      })
    },
  })

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (usuario && !login.isPending)
    return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />

  const cambiar = (campo: keyof DatosLogin, valor: string) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))
    if (errores[campo])
      setErrores((anterior) => ({ ...anterior, [campo]: undefined }))
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const encontrados = validarLogin(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length === 0) login.mutate()
  }

  return (
    <>
      <h2 className="text-[26px] font-bold text-texto">Bienvenido de vuelta</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Ingresa tus credenciales para acceder
      </p>
      <div className="my-5 h-px bg-borde" />

      {login.isError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-control border border-peligro/40 bg-peligro/8 px-3.5 py-3 text-sm text-peligro-texto"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{mensajeDeError(login.error)}</span>
        </div>
      )}

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="nombre@cambridge.edu.co"
          value={datos.email}
          onChange={(e) => cambiar('email', e.target.value)}
          error={errores.email}
          autoFocus
        />

        <div className="relative">
          <Campo
            etiqueta="Contraseña"
            type={verContrasena ? 'text' : 'password'}
            name="contrasena"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={datos.contrasena}
            onChange={(e) => cambiar('contrasena', e.target.value)}
            error={errores.contrasena}
            className="[&_input]:pr-11"
          />
          <button
            type="button"
            onClick={() => setVerContrasena((visible) => !visible)}
            aria-label={
              verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            aria-pressed={verContrasena}
            className="absolute top-[29px] right-1.5 flex size-9 items-center justify-center rounded-lg text-texto-suave hover:bg-superficie-2 hover:text-texto focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none"
          >
            {verContrasena ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            to="/recuperar-contrasena"
            className="text-[13px] font-medium text-primario hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Boton
          type="submit"
          tamano="lg"
          cargando={login.isPending}
          className="w-full"
        >
          {!login.isPending && <LogIn className="size-4" aria-hidden />}
          {login.isPending ? 'Ingresando…' : 'Iniciar sesión'}
        </Boton>
      </form>
    </>
  )
}
