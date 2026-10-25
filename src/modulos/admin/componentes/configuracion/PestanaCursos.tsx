import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import type { Curso } from '../../../../compartido/tipos'
import { Selector } from '../../../../compartido/ui'
import { cursos, niveles } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { aNumero, texto } from './formato'

/** Cursos (RF-11). */
export function PestanaCursos({ onAviso }: PropsPestana) {
  const [panel, setPanel] = useState<{ fila: Curso | null } | null>(null)
  const [nivelId, setNivelId] = useState('')
  const listaNiveles = useQuery({
    queryKey: ['niveles', 'todos'],
    queryFn: () => niveles.listar({ page: 1, size: 100 }),
  })
  const opcionesNivel = (listaNiveles.data?.datos ?? []).map((n) => ({
    valor: n.id,
    texto: `${n.codigo} · ${n.nombre}`,
  }))
  const fila = panel?.fila

  const campos: CampoFormulario[] = [
    {
      nombre: 'nombre',
      etiqueta: 'Nombre',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Inglés A1 intensivo',
    },
    {
      nombre: 'nivelIdiomaId',
      etiqueta: 'Nivel de idioma',
      tipo: 'seleccion',
      requerido: true,
      opciones: [{ valor: '', texto: 'Elige un nivel' }, ...opcionesNivel],
    },
    {
      nombre: 'intensidadHoraria',
      etiqueta: 'Intensidad horaria semanal (horas)',
      tipo: 'numero',
      requerido: true,
      min: 1,
      max: 40,
      ayuda:
        'El motor de horarios reparte estas horas en las franjas de la semana.',
    },
  ]

  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nuevo curso"
      >
        <Selector
          etiqueta="Nivel"
          etiquetaOculta
          value={nivelId}
          onChange={(e) => setNivelId(e.target.value)}
          opciones={[
            { valor: '', texto: 'Todos los niveles' },
            ...opcionesNivel,
          ]}
          className="w-full sm:w-64"
        />
      </BarraPestana>
      <TablaRecurso<Curso>
        clave={['cursos', nivelId]}
        consultar={(page, size) =>
          cursos.listar({ page, size, nivelIdiomaId: nivelId })
        }
        columnas={[
          {
            encabezado: 'Curso',
            celda: (c) => <span className="font-semibold">{c.nombre}</span>,
          },
          {
            encabezado: 'Nivel',
            celda: (c) => `${c.nivelIdioma.codigo} · ${c.nivelIdioma.idioma}`,
          },
          {
            encabezado: 'Horas por semana',
            celda: (c) => c.intensidadHoraria,
            derecha: true,
          },
        ]}
        vacio={{
          icono: BookOpen,
          titulo: 'No hay cursos',
          descripcion: 'Crea primero los niveles de idioma y luego sus cursos.',
        }}
        onEditar={(c) => setPanel({ fila: c })}
        eliminar={{
          ejecutar: (c) => cursos.eliminar(c.id),
          nombre: (c) => `el curso ${c.nombre}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar curso' : 'Nuevo curso'}
          campos={campos}
          iniciales={{
            nombre: fila?.nombre ?? '',
            nivelIdiomaId: fila?.nivelIdioma.id ?? nivelId,
            intensidadHoraria: fila ? String(fila.intensidadHoraria) : '4',
          }}
          guardar={(v) => {
            const datos = {
              nombre: texto(v.nombre),
              nivelIdiomaId: v.nivelIdiomaId,
              intensidadHoraria: aNumero(v.intensidadHoraria),
            }
            return fila
              ? cursos.actualizar(fila.id, datos)
              : cursos.crear(datos)
          }}
          invalidar="cursos"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear curso'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila ? 'Se guardó el curso.' : 'Se creó el curso.',
            })
          }}
        />
      )}
    </>
  )
}
