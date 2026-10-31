import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CalendarClock } from 'lucide-react'
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

/** Mi horario del docente (Figma 07, RF-21, RF-25): sus clases del horario activo. */
export function HorarioDocente() {
  const consulta = useQuery({
    queryKey: ['horario-actual'],
    queryFn: consultaHorarios.actual,
    retry: false,
  })
  const horario = consulta.data
  const { controles, filtradas } = useFiltrosHorario(
    horario?.asignaciones ?? [],
    { conDocente: false },
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
            : 'Tus clases del horario activo del período.'
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
                descripcion="Cuando el Administrador genere el horario del período, aquí verás tus clases."
              />
            </Tarjeta>
          ) : (
            <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
          )
        ) : horas === 0 ? (
          <Tarjeta>
            <EstadoVacio
              icono={CalendarClock}
              titulo="No tienes clases asignadas"
              descripcion="El horario activo no te asigna grupos. Revisa tu disponibilidad o consulta al Administrador."
            />
          </Tarjeta>
        ) : (
          <>
            {controles}
            <Tarjeta className="overflow-hidden">
              <GrillaHorario asignaciones={filtradas} mostrarDocente={false} />
            </Tarjeta>
            <LeyendaNiveles />
          </>
        )}
      </div>
    </>
  )
}
