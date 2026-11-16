import { useMutation } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { mensajeDeError } from '../../compartido/api'
import { Aviso, Boton, Logo } from '../../compartido/ui'
import { useAuth } from '../almacenAuth'
import { AvisoPrivacidad } from '../componentes/AvisoPrivacidad'
import {
  autorizarTratamientoDatos,
  destinoTrasIniciarSesion,
} from '../servicioAuth'

/** Página pública con el aviso de privacidad, enlazada desde el inicio de sesión. */
export function PaginaAvisoPrivacidad() {
  return (
    <Marco titulo="Aviso de privacidad">
      <AvisoPrivacidad />
    </Marco>
  )
}

function Marco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-fondo px-4 py-8 sm:py-12">
      <main
        id="contenido"
        className="mx-auto w-full max-w-2xl rounded-tarjeta border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8"
      >
        <div className="flex items-center gap-3">
          <Logo className="size-9 bg-linear-to-br from-marino-900 to-azul-700 text-base" />
          <h1 className="text-xl font-bold text-texto">{titulo}</h1>
        </div>
        <div className="mt-5">{children}</div>
      </main>
    </div>
  )
}

/**
 * Primer ingreso (RNF-31, Decreto 1377 de 2013): el usuario lee el aviso de privacidad y
 * autoriza de forma expresa el tratamiento de sus datos antes de usar el sistema.
 */
export function AutorizacionDatos() {
  const usuario = useAuth((estado) => estado.usuario)
  const registrarAutorizacion = useAuth(
    (estado) => estado.registrarAutorizacion,
  )
  const cerrarSesion = useAuth((estado) => estado.cerrarSesion)
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const desde = (ubicacion.state as { desde?: string } | null)?.desde
  const [acepta, setAcepta] = useState(false)

  const autorizar = useMutation({
    mutationFn: autorizarTratamientoDatos,
    onSuccess: () => {
      registrarAutorizacion()
      if (usuario)
        navegar(destinoTrasIniciarSesion(usuario.rol, desde), { replace: true })
    },
  })

  if (!usuario) return <Navigate to="/iniciar-sesion" replace />
  if (usuario.autorizoDatos)
    return (
      <Navigate to={destinoTrasIniciarSesion(usuario.rol, desde)} replace />
    )

  return (
    <Marco titulo="Autorización de tratamiento de datos">
      <p className="text-sm text-texto">
        Hola, {usuario.nombre}. Antes de continuar necesitamos tu autorización
        para tratar tus datos personales, como lo exige la Ley 1581 de 2012.
      </p>
      <div
        tabIndex={0}
        role="region"
        aria-label="Aviso de privacidad"
        className="mt-4 max-h-[46dvh] overflow-y-auto rounded-control border border-borde bg-superficie-2 p-4"
      >
        <AvisoPrivacidad />
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-texto">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-primario"
          checked={acepta}
          onChange={(evento) => setAcepta(evento.target.checked)}
        />
        <span>
          He leído el aviso de privacidad y autorizo a Cambridge Academy of
          Languages a tratar mis datos personales para las finalidades
          descritas.
        </span>
      </label>
      {autorizar.isError && (
        <Aviso tipo="error" className="mt-4">
          {mensajeDeError(autorizar.error)}
        </Aviso>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Boton
          variante="secundario"
          onClick={cerrarSesion}
          disabled={autorizar.isPending}
        >
          No autorizo, cerrar sesión
        </Boton>
        <Boton
          onClick={() => autorizar.mutate()}
          disabled={!acepta}
          cargando={autorizar.isPending}
        >
          Autorizar y continuar
        </Boton>
      </div>
    </Marco>
  )
}
