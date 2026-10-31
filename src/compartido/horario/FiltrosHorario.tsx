import { useState } from 'react'
import type { AsignacionDetalle, Jornada } from '../tipos'
import { Selector } from '../ui'
import { grupoNivel, LEYENDA_NIVELES, NOMBRE_JORNADA } from './formato'

export interface Filtros {
  docente: string
  aula: string
  nivel: string
  jornada: string
}
const SIN_FILTROS: Filtros = { docente: '', aula: '', nivel: '', jornada: '' }

const unicos = <T,>(
  lista: Array<T | null | undefined>,
  clave: (x: T) => string,
) => [
  ...new Map(
    lista.filter((x): x is T => x != null).map((x) => [clave(x), x]),
  ).values(),
]

/** Filtros por docente, aula, nivel y jornada de la grilla (Figma 03b). */
export function useFiltrosHorario(
  asignaciones: AsignacionDetalle[],
  { conDocente = true } = {},
) {
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const docentes = unicos(
    asignaciones.map((a) => a.docente),
    (d) => d.id,
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))
  const aulas = unicos(
    asignaciones.map((a) => a.aula),
    (a) => a.id,
  ).sort((a, b) => a.codigo.localeCompare(b.codigo))
  const jornadas = [
    ...new Set(asignaciones.map((a) => a.grupo?.jornada).filter(Boolean)),
  ] as Jornada[]

  const filtradas = asignaciones.filter(
    (a) =>
      (!filtros.docente || a.docente?.id === filtros.docente) &&
      (!filtros.aula || a.aula?.id === filtros.aula) &&
      (!filtros.nivel || grupoNivel(a.grupo?.nivel) === filtros.nivel) &&
      (!filtros.jornada || a.grupo?.jornada === filtros.jornada),
  )
  const cambiar =
    (campo: keyof Filtros) => (e: { target: { value: string } }) =>
      setFiltros((f) => ({ ...f, [campo]: e.target.value }))

  const controles = (
    <div className="flex flex-wrap gap-3">
      {conDocente && (
        <Selector
          etiqueta="Docente"
          value={filtros.docente}
          onChange={cambiar('docente')}
          opciones={[
            { valor: '', texto: 'Todos' },
            ...docentes.map((d) => ({ valor: d.id, texto: d.nombre })),
          ]}
          className="w-full sm:w-52"
        />
      )}
      <Selector
        etiqueta="Aula"
        value={filtros.aula}
        onChange={cambiar('aula')}
        opciones={[
          { valor: '', texto: 'Todas' },
          ...aulas.map((a) => ({ valor: a.id, texto: a.codigo })),
        ]}
        className="w-full sm:w-40"
      />
      <Selector
        etiqueta="Nivel"
        value={filtros.nivel}
        onChange={cambiar('nivel')}
        opciones={[
          { valor: '', texto: 'Todos' },
          ...LEYENDA_NIVELES.map((n) => ({ valor: n.grupo, texto: n.texto })),
        ]}
        className="w-full sm:w-40"
      />
      <Selector
        etiqueta="Jornada"
        value={filtros.jornada}
        onChange={cambiar('jornada')}
        opciones={[
          { valor: '', texto: 'Todas' },
          ...jornadas.map((j) => ({ valor: j, texto: NOMBRE_JORNADA[j] })),
        ]}
        className="w-full sm:w-40"
      />
    </div>
  )
  return { controles, filtradas }
}
