import { Check } from 'lucide-react'
import { DIAS, type Franja } from '../tipos'
import { cn } from '../utilidades'

/**
 * Grilla de días por franjas para marcar la disponibilidad de un docente (RF-16,
 * docs/diseno.md: "Mi disponibilidad"). Cada celda es un botón que se activa o desactiva.
 */
export function GrillaDisponibilidad({
  franjas,
  seleccionadas,
  onCambiar,
  deshabilitada,
}: {
  franjas: Franja[]
  seleccionadas: ReadonlySet<string>
  onCambiar: (seleccion: Set<string>) => void
  deshabilitada?: boolean
}) {
  const dias = DIAS.filter((d) => franjas.some((f) => f.diaSemana === d.valor))
  const horarios = [
    ...new Set(franjas.map((f) => `${f.horaInicio}-${f.horaFin}`)),
  ].sort()
  const franjaEn = (dia: string, horario: string) =>
    franjas.find(
      (f) => f.diaSemana === dia && `${f.horaInicio}-${f.horaFin}` === horario,
    )

  const alternar = (ids: string[], activar: boolean) => {
    const nueva = new Set(seleccionadas)
    for (const id of ids) {
      if (activar) nueva.add(id)
      else nueva.delete(id)
    }
    onCambiar(nueva)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-28 px-2 py-1 text-left text-xs font-semibold text-texto-suave"
            >
              Franja
            </th>
            {dias.map((dia) => {
              const ids = franjas
                .filter((f) => f.diaSemana === dia.valor)
                .map((f) => f.id)
              const todas = ids.every((id) => seleccionadas.has(id))
              return (
                <th
                  key={dia.valor}
                  scope="col"
                  className="px-1 py-1 text-xs font-semibold text-texto"
                >
                  <button
                    type="button"
                    disabled={deshabilitada}
                    onClick={() => alternar(ids, !todas)}
                    className="rounded px-1.5 py-0.5 hover:bg-superficie-2 disabled:cursor-default"
                    aria-label={
                      todas
                        ? `Quitar todo el ${dia.texto.toLowerCase()}`
                        : `Marcar todo el ${dia.texto.toLowerCase()}`
                    }
                    title={
                      todas
                        ? `Quitar todo el ${dia.texto.toLowerCase()}`
                        : `Marcar todo el ${dia.texto.toLowerCase()}`
                    }
                  >
                    {dia.corto}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {horarios.map((horario) => (
            <tr key={horario}>
              <th
                scope="row"
                className="px-2 py-1 text-left font-mono text-xs font-normal whitespace-nowrap text-texto-suave"
              >
                {horario.replace('-', ' a ')}
              </th>
              {dias.map((dia) => {
                const franja = franjaEn(dia.valor, horario)
                if (!franja)
                  return (
                    <td
                      key={dia.valor}
                      className="rounded-lg bg-fondo/60"
                      aria-hidden
                    />
                  )
                const activa = seleccionadas.has(franja.id)
                return (
                  <td key={dia.valor} className="p-0">
                    <button
                      type="button"
                      disabled={deshabilitada}
                      aria-pressed={activa}
                      aria-label={`${dia.texto} ${horario.replace('-', ' a ')}: ${activa ? 'disponible' : 'no disponible'}`}
                      onClick={() => alternar([franja.id], !activa)}
                      className={cn(
                        'flex h-10 w-full items-center justify-center rounded-lg border text-xs font-medium transition-colors',
                        activa
                          ? 'border-exito bg-exito/12 text-exito-texto'
                          : 'border-borde bg-superficie text-texto-suave hover:border-primario/50',
                        deshabilitada && 'cursor-default opacity-70',
                      )}
                    >
                      {activa ? <Check className="size-4" aria-hidden /> : null}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
