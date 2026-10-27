import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../../compartido/api'
import type { Grupo, Jornada } from '../../../../compartido/tipos'
import { Insignia, Selector } from '../../../../compartido/ui'
import { cursos, grupos } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { aNumero, texto } from './formato'

const JORNADAS: Array<{ valor: Jornada; texto: string }> = [
  { valor: 'MAÑANA', texto: 'Mañana' },
  { valor: 'TARDE', texto: 'Tarde' },
  { valor: 'NOCHE', texto: 'Noche' },
]

/** Grupos con su código de acceso para estudiantes (RF-12). */
export function PestanaGrupos({ onAviso }: PropsPestana) {
  const clienteConsultas = useQueryClient()
  const [panel, setPanel] = useState<{ fila: Grupo | null } | null>(null)
  const [cursoId, setCursoId] = useState('')
  const listaCursos = useQuery({
    queryKey: ['cursos', 'todos'],
    queryFn: () => cursos.listar({ page: 1, size: 100 }),
  })
  const opcionesCurso = (listaCursos.data?.datos ?? []).map((c) => ({
    valor: c.id,
    texto: `${c.nombre} (${c.nivelIdioma.codigo})`,
  }))
  const fila = panel?.fila

  const regenerar = useMutation({
    mutationFn: (grupo: Grupo) => grupos.regenerarCodigo(grupo.id),
    onSuccess: async (grupo) => {
      await clienteConsultas.invalidateQueries({ queryKey: ['grupos'] })
      onAviso({
        tipo: 'exito',
        texto: `Nuevo código de acceso de ${grupo.codigo}: ${grupo.codigoAcceso}. El anterior ya no sirve.`,
      })
    },
    onError: (error) =>
      onAviso({ tipo: 'error', texto: mensajeDeError(error) }),
  })

  const campos: CampoFormulario[] = [
    {
      nombre: 'codigo',
      etiqueta: 'Código del grupo',
      tipo: 'texto',
      requerido: true,
      placeholder: 'ING-A1-01',
    },
    {
      nombre: 'cursoId',
      etiqueta: 'Curso',
      tipo: 'seleccion',
      requerido: true,
      opciones: [{ valor: '', texto: 'Elige un curso' }, ...opcionesCurso],
    },
    {
      nombre: 'cupoMaximo',
      etiqueta: 'Cupo máximo',
      tipo: 'numero',
      requerido: true,
      min: 1,
      max: 100,
    },
    {
      nombre: 'jornada',
      etiqueta: 'Jornada',
      tipo: 'seleccion',
      requerido: true,
      opciones: JORNADAS,
    },
  ]

  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nuevo grupo"
      >
        <Selector
          etiqueta="Curso"
          etiquetaOculta
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          opciones={[
            { valor: '', texto: 'Todos los cursos' },
            ...opcionesCurso,
          ]}
          className="w-full sm:w-72"
        />
      </BarraPestana>
      <TablaRecurso<Grupo>
        clave={['grupos', cursoId]}
        consultar={(page, size) => grupos.listar({ page, size, cursoId })}
        columnas={[
          {
            encabezado: 'Grupo',
            celda: (g) => <span className="font-semibold">{g.codigo}</span>,
          },
          { encabezado: 'Curso', celda: (g) => g.curso.nombre },
          {
            encabezado: 'Jornada',
            celda: (g) => JORNADAS.find((j) => j.valor === g.jornada)?.texto,
          },
          { encabezado: 'Cupo', celda: (g) => g.cupoMaximo, derecha: true },
          {
            encabezado: 'Código de acceso',
            celda: (g) => (
              <Insignia tono="azul" className="font-mono tracking-wider">
                {g.codigoAcceso}
              </Insignia>
            ),
          },
        ]}
        vacio={{
          icono: UsersRound,
          titulo: 'No hay grupos',
          descripcion: 'Crea los grupos de cada curso.',
        }}
        onEditar={(g) => setPanel({ fila: g })}
        accionesExtra={(g) => (
          <button
            type="button"
            onClick={() => regenerar.mutate(g)}
            disabled={regenerar.isPending}
            className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto disabled:opacity-40"
            aria-label={`Generar un código de acceso nuevo para ${g.codigo}`}
            title="Nuevo código de acceso"
          >
            <RefreshCw className="size-4" aria-hidden />
          </button>
        )}
        eliminar={{
          ejecutar: (g) => grupos.eliminar(g.id),
          nombre: (g) => `el grupo ${g.codigo}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar grupo' : 'Nuevo grupo'}
          descripcion={
            fila
              ? undefined
              : 'El código de acceso para los estudiantes se genera solo.'
          }
          campos={campos}
          iniciales={{
            codigo: fila?.codigo ?? '',
            cursoId: fila?.curso.id ?? cursoId,
            cupoMaximo: fila ? String(fila.cupoMaximo) : '20',
            jornada: fila?.jornada ?? 'MAÑANA',
          }}
          validar={(v) => ({
            codigo: /^[A-Za-z0-9-]{2,30}$/.test(texto(v.codigo))
              ? undefined
              : 'Usa letras, números y guiones (2 a 30).',
          })}
          guardar={(v) => {
            const datos = {
              codigo: texto(v.codigo).toUpperCase(),
              cursoId: v.cursoId,
              cupoMaximo: aNumero(v.cupoMaximo),
              jornada: v.jornada,
            }
            return fila
              ? grupos.actualizar(fila.id, datos)
              : grupos.crear(datos)
          }}
          invalidar="grupos"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear grupo'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila
                ? 'Se guardó el grupo.'
                : 'Se creó el grupo con su código de acceso.',
            })
          }}
        />
      )}
    </>
  )
}
