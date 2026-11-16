import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { periodos as servicioPeriodos } from '../servicios/configuracion'

/** Período elegido en las vistas de evaluación; por defecto el activo. */
export function usePeriodoEvaluacion() {
  const [elegido, setElegido] = useState<string>()
  const consulta = useQuery({
    queryKey: ['periodos', 'todos'],
    queryFn: async () =>
      (await servicioPeriodos.listar({ page: 1, size: 100 })).datos,
  })
  const lista = consulta.data ?? []
  const periodo =
    lista.find((p) => p.id === elegido) ??
    lista.find((p) => p.activo) ??
    lista[0]
  return {
    consulta,
    periodo,
    elegir: setElegido,
    opciones: lista.map((p) => ({
      valor: p.id,
      texto: p.activo ? `${p.nombre} (activo)` : p.nombre,
    })),
  }
}
