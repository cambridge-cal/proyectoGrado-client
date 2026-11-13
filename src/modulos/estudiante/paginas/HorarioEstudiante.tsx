import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CalendarClock, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import { useFiltrosHorario } from '../../../compartido/horario/FiltrosHorario'
import {
  GrillaHorario,
  LeyendaNiveles,
} from '../../../compartido/horario/GrillaHorario'
import { consultaHorarios } from '../../../compartido/horario/servicio'
import {
  Aviso,
  EncabezadoPagina,
  EstadoVacio,
  Tarjeta,
} from '../../../compartido/ui'

const sinHorario = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404

const ENLACE_GRUPOS =
  'inline-flex h-11 items-center justify-center rounded-control bg-primario px-4 text-sm font-semibold text-white hover:bg-primario-oscuro'

/** Mi horario del estudiante (RF-25): las clases de sus grupos activos en el horario vigente. */
export function HorarioEstudiante() {
  const consulta = useQuery({
    queryKey: ['horario-actual'],
    queryFn: consultaHorarios.actual,
    retry: false,
  })
  const horario = consulta.data
  const { controles, filtradas } = useFiltrosHorario(
    horario?.asignaciones ?? [],
  )
  const horas = (horario?.asignaciones ?? []).length

  return (
    <>
      <EncabezadoPagina
        titulo={
          horario
            ? `Mi horario · Período ${horario.periodo.nombre}`
            : 'Mi horario'
        }
        descripcion={
          horario && horas > 0
            ? `${horas} ${horas === 1 ? 'clase' : 'clases'} por semana, de la mañana a la noche.`
            : 'Las clases de tus grupos activos.'
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {consulta.isPending ? (
          <Tarjeta
            className="h-64 animate-pulse"
            aria-label="Cargando horario"
          />
        ) : consulta.isError ? (
          sinHorario(consulta.error) ? (
            <Tarjeta>
              <EstadoVacio
                icono={CalendarClock}
                titulo="Todavía no hay horario"
                descripcion="Cuando la academia publique el horario del período, aquí verás las clases de tus grupos."
              />
            </Tarjeta>
          ) : (
            <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
          )
        ) : horas === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={UsersRound}
              titulo="Tus grupos no tienen clases en el horario"
              descripcion="Si todavía no te has inscrito, únete a tu grupo con el código de acceso."
              accion={
                <Link to="/estudiante/grupos" className={ENLACE_GRUPOS}>
                  Ir a Mis grupos
                </Link>
              }
            />
          </Tarjeta>
        ) : (
          <>
            {controles}
            <Tarjeta className="overflow-hidden">
              <GrillaHorario asignaciones={filtradas} />
            </Tarjeta>
            <LeyendaNiveles />
          </>
        )}
      </div>
    </>
  )
}
