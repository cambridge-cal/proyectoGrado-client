import { DoorOpen } from 'lucide-react'
import { useState } from 'react'
import type { Aula, TipoAula } from '../../../../compartido/tipos'
import { Insignia, Selector, type Tono } from '../../../../compartido/ui'
import { aulas } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { aNumero, texto } from './formato'

const TIPOS_AULA: Array<{ valor: TipoAula; texto: string; tono: Tono }> = [
  { valor: 'SALON', texto: 'Salón', tono: 'azul' },
  { valor: 'LAB', texto: 'Laboratorio', tono: 'morado' },
  { valor: 'VIRTUAL', texto: 'Virtual', tono: 'turquesa' },
]

const CAMPOS: CampoFormulario[] = [
  {
    nombre: 'codigo',
    etiqueta: 'Código',
    tipo: 'texto',
    requerido: true,
    placeholder: 'A101',
  },
  {
    nombre: 'capacidad',
    etiqueta: 'Capacidad (estudiantes)',
    tipo: 'numero',
    requerido: true,
    min: 1,
    max: 500,
  },
  {
    nombre: 'tipo',
    etiqueta: 'Tipo',
    tipo: 'seleccion',
    requerido: true,
    opciones: TIPOS_AULA,
  },
  {
    nombre: 'activa',
    etiqueta: 'Aula activa',
    tipo: 'interruptor',
    ayuda: 'Las aulas inactivas no se usan al generar horarios.',
  },
]

/** Aulas (RF-13). */
export function PestanaAulas({ onAviso }: PropsPestana) {
  const [panel, setPanel] = useState<{ fila: Aula | null } | null>(null)
  const [tipo, setTipo] = useState('')
  const fila = panel?.fila
  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nueva aula"
      >
        <Selector
          etiqueta="Tipo"
          etiquetaOculta
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          opciones={[{ valor: '', texto: 'Todos los tipos' }, ...TIPOS_AULA]}
          className="w-full sm:w-52"
        />
      </BarraPestana>
      <TablaRecurso<Aula>
        clave={['aulas', tipo]}
        consultar={(page, size) => aulas.listar({ page, size, tipo })}
        columnas={[
          {
            encabezado: 'Código',
            celda: (a) => <span className="font-semibold">{a.codigo}</span>,
          },
          {
            encabezado: 'Tipo',
            celda: (a) => {
              const t = TIPOS_AULA.find((x) => x.valor === a.tipo)!
              return <Insignia tono={t.tono}>{t.texto}</Insignia>
            },
          },
          { encabezado: 'Capacidad', celda: (a) => a.capacidad, derecha: true },
          {
            encabezado: 'Estado',
            celda: (a) => (
              <Insignia tono={a.activa ? 'verde' : 'gris'}>
                {a.activa ? 'Activa' : 'Inactiva'}
              </Insignia>
            ),
          },
        ]}
        vacio={{
          icono: DoorOpen,
          titulo: 'No hay aulas',
          descripcion: 'Registra los salones, laboratorios y aulas virtuales.',
        }}
        onEditar={(a) => setPanel({ fila: a })}
        eliminar={{
          ejecutar: (a) => aulas.eliminar(a.id),
          nombre: (a) => `el aula ${a.codigo}`,
          advertencia:
            'Si el aula ya se usó en un horario, desactívala en lugar de eliminarla.',
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar aula' : 'Nueva aula'}
          campos={CAMPOS}
          iniciales={{
            codigo: fila?.codigo ?? '',
            capacidad: fila ? String(fila.capacidad) : '25',
            tipo: fila?.tipo ?? 'SALON',
            activa: fila?.activa ?? true,
          }}
          guardar={(v) => {
            const datos = {
              codigo: texto(v.codigo).toUpperCase(),
              capacidad: aNumero(v.capacidad),
              tipo: v.tipo,
              activa: v.activa,
            }
            return fila ? aulas.actualizar(fila.id, datos) : aulas.crear(datos)
          }}
          invalidar="aulas"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear aula'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila ? 'Se guardó el aula.' : 'Se creó el aula.',
            })
          }}
        />
      )}
    </>
  )
}
