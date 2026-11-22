import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CalendarClock } from 'lucide-react'
import { mensajeDeError } from '../../../compartido/api'
import { useFiltrosHorario } from '../../../compartido/horario/FiltrosHorario'
import {
  GrillaHorario,
  LeyendaNiveles,
} from '../../../compartido/horario/GrillaHorario'
import { ProximasClases } from '../../../compartido/horario/ProximasClases'
import { consultaHorarios } from '../../../compartido/horario/servicio'
import type { AsignacionDetalle } from '../../../compartido/tipos'
import {
  Aviso,
  BannerSaludo,
  EncabezadoPagina,
  EstadoVacio,
  Tarjeta,
} from '../../../compartido/ui'

/** Horas de clase a la semana: duración de cada franja por el número de días que ocupa. */
function horasSemanales(asignaciones: AsignacionDetalle[]): number {
  const minutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  return asignaciones.reduce((total, a) => {
    if (!a.franja) return total
    const duracion = minutos(a.franja.horaFin) - minutos(a.franja.horaInicio)
    return total + (duracion * a.franja.dias.length) / 60
  }, 0)
}

const formatoHoras = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
})

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
          <div
            className="esqueleto h-64 rounded-tarjeta"
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
            <BannerSaludo
              titulo={`Dictas ${horas} ${horas === 1 ? 'grupo' : 'grupos'} y ${formatoHoras.format(horasSemanales(horario!.asignaciones))} horas de clase por semana`}
              descripcion="Abajo tienes la grilla completa. Puedes filtrarla por aula, nivel o jornada."
            >
              <div className="rounded-2xl bg-superficie p-4 text-texto">
                <ProximasClases
                  asignaciones={horario!.asignaciones}
                  mostrarDocente={false}
                  limite={3}
                />
              </div>
            </BannerSaludo>
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
