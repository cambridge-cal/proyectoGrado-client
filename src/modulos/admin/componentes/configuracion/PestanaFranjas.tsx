import { Clock, Rows3 } from 'lucide-react'
import { useState } from 'react'
import {
  DIAS,
  textoDias,
  type DiaSemana,
  type Franja,
} from '../../../../compartido/tipos'
import { Boton, Selector } from '../../../../compartido/ui'
import { franjas } from '../../servicios/configuracion'
import {
  FormularioRecurso,
  type CampoFormulario,
  type Valores,
} from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { aNumero, texto } from './formato'

const CAMPOS: CampoFormulario[] = [
  ...DIAS.map((d) => ({
    nombre: d.valor,
    etiqueta: d.texto,
    tipo: 'interruptor' as const,
  })),
  {
    nombre: 'horaInicio',
    etiqueta: 'Hora de inicio',
    tipo: 'hora',
    requerido: true,
  },
  { nombre: 'horaFin', etiqueta: 'Hora de fin', tipo: 'hora', requerido: true },
  {
    nombre: 'bloque',
    etiqueta: 'Número de bloque',
    tipo: 'numero',
    requerido: true,
    min: 1,
    max: 30,
    ayuda: 'Posición del bloque dentro del día; sirve para ordenarlos.',
  },
]

const diasMarcados = (v: Valores) =>
  DIAS.filter((d) => v[d.valor] === true).map((d) => d.valor as DiaSemana)

const CAMPOS_LOTE: CampoFormulario[] = [
  ...DIAS.map((d) => ({
    nombre: d.valor,
    etiqueta: d.texto,
    tipo: 'interruptor' as const,
  })),
  { nombre: 'desde', etiqueta: 'Desde', tipo: 'hora', requerido: true },
  { nombre: 'hasta', etiqueta: 'Hasta', tipo: 'hora', requerido: true },
  {
    nombre: 'duracionMinutos',
    etiqueta: 'Duración de cada franja (minutos)',
    tipo: 'numero',
    requerido: true,
    min: 30,
    max: 240,
  },
  {
    nombre: 'bloqueInicial',
    etiqueta: 'Número del primer bloque',
    tipo: 'numero',
    requerido: true,
    min: 1,
    max: 30,
  },
]

const validarHoras = (inicio: string, fin: string, campo: string) =>
  inicio && fin && fin <= inicio
    ? { [campo]: 'Debe ser posterior a la hora de inicio.' }
    : {}

/** Franjas horarias institucionales (RF-14). */
export function PestanaFranjas({ onAviso }: PropsPestana) {
  const [panel, setPanel] = useState<{ fila: Franja | null } | null>(null)
  const [lote, setLote] = useState(false)
  const [dia, setDia] = useState('')
  const fila = panel?.fila

  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nueva franja"
      >
        <Selector
          etiqueta="Día"
          etiquetaOculta
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          opciones={[
            { valor: '', texto: 'Todos los días' },
            ...DIAS.map((d) => ({ valor: d.valor, texto: d.texto })),
          ]}
          className="w-full sm:w-48"
        />
        <Boton variante="secundario" onClick={() => setLote(true)}>
          <Rows3 className="size-4" aria-hidden /> Crear varias
        </Boton>
      </BarraPestana>
      <TablaRecurso<Franja>
        clave={['franjas', dia]}
        tamano={15}
        consultar={(page, size) => franjas.listar({ page, size, dia })}
        columnas={[
          {
            encabezado: 'Días',
            celda: (f) => textoDias(f.dias),
          },
          { encabezado: 'Bloque', celda: (f) => f.bloque, derecha: true },
          {
            encabezado: 'Horario',
            celda: (f) => (
              <span className="font-mono text-xs">
                {f.horaInicio} a {f.horaFin}
              </span>
            ),
          },
        ]}
        vacio={{
          icono: Clock,
          titulo: 'No hay franjas horarias',
          descripcion:
            'Usa "Crear varias" para generar los bloques de toda la semana de una vez.',
        }}
        onEditar={(f) => setPanel({ fila: f })}
        eliminar={{
          ejecutar: (f) => franjas.eliminar(f.id),
          nombre: (f) => `la franja ${textoDias(f.dias)} ${f.horaInicio}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar franja' : 'Nueva franja'}
          descripcion="Marca todos los días en que se repite el bloque, por ejemplo martes, miércoles y jueves de 08:00 a 10:00."
          campos={CAMPOS}
          iniciales={{
            ...Object.fromEntries(
              DIAS.map((d) => [
                d.valor,
                fila ? fila.dias.includes(d.valor) : d.valor === (dia || 'LUN'),
              ]),
            ),
            horaInicio: fila?.horaInicio ?? '',
            horaFin: fila?.horaFin ?? '',
            bloque: fila ? String(fila.bloque) : '1',
          }}
          validar={(v) => ({
            ...validarHoras(texto(v.horaInicio), texto(v.horaFin), 'horaFin'),
            ...(diasMarcados(v).length
              ? {}
              : { LUN: 'Marca al menos un día.' }),
          })}
          guardar={(v) => {
            const datos = {
              dias: diasMarcados(v),
              horaInicio: v.horaInicio,
              horaFin: v.horaFin,
              bloque: aNumero(v.bloque),
            }
            return fila
              ? franjas.actualizar(fila.id, datos)
              : franjas.crear(datos)
          }}
          invalidar="franjas"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear franja'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila ? 'Se guardó la franja.' : 'Se creó la franja.',
            })
          }}
        />
      )}
      {lote && (
        <FormularioRecurso
          titulo="Crear varias franjas"
          descripcion="Genera bloques de un solo día, uno tras otro y con la misma duración, en cada día marcado. Para un bloque que se repite varios días usa Nueva franja."
          campos={CAMPOS_LOTE}
          iniciales={{
            ...Object.fromEntries(
              DIAS.map((d) => [d.valor, d.valor !== 'SAB']),
            ),
            desde: '07:00',
            hasta: '21:00',
            duracionMinutos: '120',
            bloqueInicial: '1',
          }}
          validar={(v: Valores) => ({
            ...validarHoras(texto(v.desde), texto(v.hasta), 'hasta'),
            ...(diasMarcados(v).length
              ? {}
              : { LUN: 'Marca al menos un día.' }),
          })}
          guardar={(v) =>
            franjas.crearLote({
              dias: diasMarcados(v),
              desde: texto(v.desde),
              hasta: texto(v.hasta),
              duracionMinutos: aNumero(v.duracionMinutos),
              bloqueInicial: aNumero(v.bloqueInicial),
            })
          }
          invalidar="franjas"
          textoGuardar="Crear franjas"
          onCerrar={() => setLote(false)}
          onGuardado={() => {
            setLote(false)
            onAviso({ tipo: 'exito', texto: 'Se crearon las franjas.' })
          }}
        />
      )}
    </>
  )
}
