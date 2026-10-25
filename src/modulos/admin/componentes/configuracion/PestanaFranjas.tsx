import { Clock, Rows3 } from 'lucide-react'
import { useState } from 'react'
import { DIAS, type DiaSemana, type Franja } from '../../../../compartido/tipos'
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
  {
    nombre: 'diaSemana',
    etiqueta: 'Día',
    tipo: 'seleccion',
    requerido: true,
    opciones: DIAS.map((d) => ({ valor: d.valor, texto: d.texto })),
  },
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
    ayuda: 'Posición de la franja dentro del día.',
  },
]

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
        consultar={(page, size) =>
          franjas.listar({ page, size, diaSemana: dia })
        }
        columnas={[
          {
            encabezado: 'Día',
            celda: (f) => DIAS.find((d) => d.valor === f.diaSemana)?.texto,
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
          nombre: (f) => `la franja ${f.diaSemana} ${f.horaInicio}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar franja' : 'Nueva franja'}
          campos={CAMPOS}
          iniciales={{
            diaSemana: fila?.diaSemana ?? (dia || 'LUN'),
            horaInicio: fila?.horaInicio ?? '',
            horaFin: fila?.horaFin ?? '',
            bloque: fila ? String(fila.bloque) : '1',
          }}
          validar={(v) =>
            validarHoras(texto(v.horaInicio), texto(v.horaFin), 'horaFin')
          }
          guardar={(v) => {
            const datos = {
              diaSemana: v.diaSemana,
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
          descripcion="Genera los bloques de los días marcados, uno tras otro, con la misma duración."
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
            ...(DIAS.some((d) => v[d.valor] === true)
              ? {}
              : { LUN: 'Marca al menos un día.' }),
          })}
          guardar={(v) =>
            franjas.crearLote({
              dias: DIAS.filter((d) => v[d.valor] === true).map(
                (d) => d.valor as DiaSemana,
              ),
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
