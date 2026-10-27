import { CalendarRange } from 'lucide-react'
import { useState } from 'react'
import type { Periodo } from '../../../../compartido/tipos'
import { Insignia } from '../../../../compartido/ui'
import { periodos } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { fechaCorta, texto } from './formato'

const CAMPOS: CampoFormulario[] = [
  {
    nombre: 'nombre',
    etiqueta: 'Nombre',
    tipo: 'texto',
    requerido: true,
    placeholder: '2026-2',
  },
  {
    nombre: 'fechaInicio',
    etiqueta: 'Fecha de inicio',
    tipo: 'fecha',
    requerido: true,
  },
  {
    nombre: 'fechaFin',
    etiqueta: 'Fecha de fin',
    tipo: 'fecha',
    requerido: true,
  },
  {
    nombre: 'activo',
    etiqueta: 'Período activo',
    tipo: 'interruptor',
    ayuda:
      'Solo puede haber uno activo. Al activarlo se desactiva el anterior (RF-09).',
  },
]

/** Períodos académicos (RF-09). */
export function PestanaPeriodos({ onAviso }: PropsPestana) {
  const [panel, setPanel] = useState<{ fila: Periodo | null } | null>(null)
  const fila = panel?.fila

  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nuevo período"
      />
      <TablaRecurso<Periodo>
        clave={['periodos']}
        consultar={(page, size) => periodos.listar({ page, size })}
        columnas={[
          {
            encabezado: 'Nombre',
            celda: (p) => <span className="font-semibold">{p.nombre}</span>,
          },
          { encabezado: 'Inicio', celda: (p) => fechaCorta(p.fechaInicio) },
          { encabezado: 'Fin', celda: (p) => fechaCorta(p.fechaFin) },
          {
            encabezado: 'Estado',
            celda: (p) => (
              <Insignia tono={p.activo ? 'verde' : 'gris'}>
                {p.activo ? 'Activo' : 'Inactivo'}
              </Insignia>
            ),
          },
        ]}
        vacio={{
          icono: CalendarRange,
          titulo: 'No hay períodos',
          descripcion: 'Crea el período académico en curso.',
        }}
        onEditar={(p) => setPanel({ fila: p })}
        eliminar={{
          ejecutar: (p) => periodos.eliminar(p.id),
          nombre: (p) => `el período ${p.nombre}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar período' : 'Nuevo período'}
          campos={CAMPOS}
          iniciales={{
            nombre: fila?.nombre ?? '',
            fechaInicio: fila?.fechaInicio ?? '',
            fechaFin: fila?.fechaFin ?? '',
            activo: fila?.activo ?? false,
          }}
          validar={(v) => ({
            fechaFin:
              texto(v.fechaInicio) &&
              texto(v.fechaFin) &&
              texto(v.fechaFin) <= texto(v.fechaInicio)
                ? 'Debe ser posterior a la fecha de inicio.'
                : undefined,
          })}
          guardar={(v) => {
            const datos = {
              nombre: texto(v.nombre),
              fechaInicio: v.fechaInicio,
              fechaFin: v.fechaFin,
              activo: v.activo,
            }
            return fila
              ? periodos.actualizar(fila.id, datos)
              : periodos.crear(datos)
          }}
          invalidar="periodos"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear período'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila ? 'Se guardó el período.' : 'Se creó el período.',
            })
          }}
        />
      )}
    </>
  )
}
