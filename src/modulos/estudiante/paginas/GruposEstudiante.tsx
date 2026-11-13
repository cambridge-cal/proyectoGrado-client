import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, LogOut, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  grupoNivel,
  NOMBRE_JORNADA,
  TONO_NIVEL,
} from '../../../compartido/horario/formato'
import type { Inscripcion } from '../../../compartido/tipos'
import {
  Aviso,
  Boton,
  Campo,
  DialogoConfirmacion,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
  TituloTarjeta,
} from '../../../compartido/ui'
import { servicioInscripciones } from '../servicios/inscripciones'

/** Texto que el estudiante debe escribir para confirmar la baja (RF-27). */
export const TEXTO_CONFIRMACION = 'confirmo darme de baja'

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})
const fecha = (iso: string) =>
  formatoFecha.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))

const normalizar = (texto: string) =>
  texto.trim().replace(/\s+/g, ' ').toLowerCase()

function InsigniaNivel({ nivel }: { nivel: string }) {
  const grupo = grupoNivel(nivel)
  return <Insignia tono={grupo ? TONO_NIVEL[grupo] : 'gris'}>{nivel}</Insignia>
}

/** Mis grupos (Figura 6.17, RF-26, RF-27): inscripción con código y baja con confirmación escrita. */
export function GruposEstudiante() {
  const consultas = useQueryClient()
  const [codigo, setCodigo] = useState('')
  const [errorCodigo, setErrorCodigo] = useState<string>()
  const [exito, setExito] = useState<string>()
  const [verHistorial, setVerHistorial] = useState(false)
  const [baja, setBaja] = useState<Inscripcion | null>(null)
  const [confirmacion, setConfirmacion] = useState('')

  const consulta = useQuery({
    queryKey: ['mis-grupos'],
    queryFn: () => servicioInscripciones.listar(true),
  })
  const inscripciones = consulta.data ?? []
  const activas = inscripciones.filter((i) => i.activo)
  const bajas = inscripciones.filter((i) => !i.activo)

  const refrescar = () =>
    Promise.all([
      consultas.invalidateQueries({ queryKey: ['mis-grupos'] }),
      consultas.invalidateQueries({ queryKey: ['horario-actual'] }),
    ])

  const unirse = useMutation({
    mutationFn: servicioInscripciones.unirse,
    onSuccess: async (inscripcion) => {
      setCodigo('')
      setExito(
        `Te uniste al grupo ${inscripcion.grupo.codigo} (${inscripcion.grupo.curso}).`,
      )
      await refrescar()
    },
    onError: (error) => setErrorCodigo(mensajeDeError(error)),
  })

  const darDeBaja = useMutation({
    mutationFn: (inscripcion: Inscripcion) =>
      servicioInscripciones.darDeBaja(inscripcion.grupo.id),
    onSuccess: async (_respuesta, inscripcion) => {
      setExito(
        `Te diste de baja del grupo ${inscripcion.grupo.codigo}. La inscripción queda en tu historial.`,
      )
      cerrarBaja()
      await refrescar()
    },
  })

  function alUnirse(evento: FormEvent) {
    evento.preventDefault()
    setExito(undefined)
    const limpio = codigo.trim().toUpperCase()
    if (limpio.length < 4 || limpio.length > 12) {
      setErrorCodigo('El código de acceso tiene entre 4 y 12 caracteres.')
      return
    }
    setErrorCodigo(undefined)
    unirse.mutate(limpio)
  }

  function cerrarBaja() {
    setBaja(null)
    setConfirmacion('')
    darDeBaja.reset()
  }

  const confirmado = normalizar(confirmacion) === TEXTO_CONFIRMACION

  return (
    <>
      <EncabezadoPagina
        titulo="Mis grupos"
        descripcion="Únete a un grupo con el código de acceso que te dio la academia, o date de baja."
      />
      <div className="space-y-4 p-4 sm:p-8">
        {exito && <Aviso tipo="exito">{exito}</Aviso>}

        <Tarjeta className="p-5">
          <TituloTarjeta
            titulo="Unirme a un grupo"
            descripcion="Puedes tener un grupo activo por idioma."
          />
          <form
            onSubmit={alUnirse}
            noValidate
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
          >
            <Campo
              etiqueta="Código de acceso"
              className="sm:w-72"
              value={codigo}
              onChange={(evento) => {
                setCodigo(evento.target.value.toUpperCase())
                setErrorCodigo(undefined)
              }}
              error={errorCodigo}
              placeholder="Ej. K7M2Q9XA"
              autoComplete="off"
              maxLength={12}
            />
            <Boton
              type="submit"
              className="sm:mt-[25px] sm:h-[46px]"
              cargando={unirse.isPending}
            >
              Unirme
            </Boton>
          </form>
        </Tarjeta>

        {consulta.isPending ? (
          <Tarjeta
            className="h-40 animate-pulse"
            aria-label="Cargando grupos"
          />
        ) : consulta.isError ? (
          <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
        ) : (
          <>
            <Tarjeta className="p-5">
              <TituloTarjeta
                titulo="Grupos activos"
                descripcion={
                  activas.length > 0
                    ? 'Sus clases aparecen en Mi horario.'
                    : undefined
                }
                acciones={
                  activas.length > 0 && (
                    <Link
                      to="/estudiante/horario"
                      className="text-sm font-semibold text-primario hover:underline"
                    >
                      Ver mi horario
                    </Link>
                  )
                }
              />
              {activas.length === 0 ? (
                <EstadoVacio
                  icono={UsersRound}
                  titulo="Todavía no tienes grupos"
                  descripcion="Escribe arriba el código de acceso de tu grupo para inscribirte."
                />
              ) : (
                <ul className="mt-4 divide-y divide-borde">
                  {activas.map((inscripcion) => (
                    <li
                      key={inscripcion.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-texto">
                          {inscripcion.grupo.codigo} · {inscripcion.grupo.curso}
                        </p>
                        <p className="mt-0.5 text-xs text-texto-suave">
                          {inscripcion.grupo.idioma} · Jornada{' '}
                          {NOMBRE_JORNADA[
                            inscripcion.grupo.jornada
                          ].toLowerCase()}{' '}
                          · Inscrito el {fecha(inscripcion.fechaInscripcion)}
                        </p>
                      </div>
                      <InsigniaNivel nivel={inscripcion.grupo.nivel} />
                      <Boton
                        variante="peligro"
                        tamano="sm"
                        onClick={() => {
                          setExito(undefined)
                          setBaja(inscripcion)
                        }}
                        aria-label={`Darme de baja del grupo ${inscripcion.grupo.codigo}`}
                      >
                        <LogOut className="size-3.5" aria-hidden />
                        Darme de baja
                      </Boton>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>

            {bajas.length > 0 && (
              <Tarjeta className="p-5">
                <TituloTarjeta
                  titulo="Historial"
                  descripcion={`${bajas.length} ${bajas.length === 1 ? 'grupo anterior' : 'grupos anteriores'}.`}
                  acciones={
                    <Boton
                      variante="fantasma"
                      tamano="sm"
                      onClick={() => setVerHistorial((valor) => !valor)}
                      aria-expanded={verHistorial}
                    >
                      <History className="size-3.5" aria-hidden />
                      {verHistorial ? 'Ocultar historial' : 'Ver historial'}
                    </Boton>
                  }
                />
                {verHistorial && (
                  <ul className="mt-4 divide-y divide-borde">
                    {bajas.map((inscripcion) => (
                      <li
                        key={inscripcion.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-texto">
                            {inscripcion.grupo.codigo} ·{' '}
                            {inscripcion.grupo.curso}
                          </p>
                          <p className="mt-0.5 text-xs text-texto-suave">
                            Del {fecha(inscripcion.fechaInscripcion)}
                            {inscripcion.fechaBaja
                              ? ` al ${fecha(inscripcion.fechaBaja)}`
                              : ''}
                          </p>
                        </div>
                        <Insignia tono="gris">Baja</Insignia>
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>
            )}
          </>
        )}
      </div>

      <DialogoConfirmacion
        abierto={baja !== null}
        titulo={`¿Darte de baja del grupo ${baja?.grupo.codigo ?? ''}?`}
        textoConfirmar="Darme de baja"
        cargando={darDeBaja.isPending}
        confirmarDeshabilitado={!confirmado}
        onConfirmar={() => baja && darDeBaja.mutate(baja)}
        onCancelar={cerrarBaja}
      >
        <p>
          Dejarás de ver las clases de {baja?.grupo.curso} en tu horario y sus
          evaluaciones. Para volver necesitarás de nuevo el código de acceso.
        </p>
        <Campo
          className="mt-4"
          etiqueta={`Escribe "${TEXTO_CONFIRMACION}" para continuar`}
          value={confirmacion}
          onChange={(evento) => setConfirmacion(evento.target.value)}
          autoComplete="off"
        />
        {darDeBaja.isError && (
          <Aviso tipo="error" className="mt-3">
            {mensajeDeError(darDeBaja.error)}
          </Aviso>
        )}
      </DialogoConfirmacion>
    </>
  )
}
