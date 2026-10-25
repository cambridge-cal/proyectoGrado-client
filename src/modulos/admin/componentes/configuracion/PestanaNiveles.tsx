import { Languages } from 'lucide-react'
import { useState } from 'react'
import type { Nivel } from '../../../../compartido/tipos'
import { niveles } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { texto } from './formato'

const CAMPOS: CampoFormulario[] = [
  {
    nombre: 'codigo',
    etiqueta: 'Código',
    tipo: 'texto',
    requerido: true,
    placeholder: 'ING-A1',
    ayuda: 'Único en todo el sistema (RF-10).',
  },
  {
    nombre: 'nombre',
    etiqueta: 'Nombre',
    tipo: 'texto',
    requerido: true,
    placeholder: 'Inglés A1 - Principiante',
  },
  {
    nombre: 'idioma',
    etiqueta: 'Idioma',
    tipo: 'texto',
    requerido: true,
    placeholder: 'Inglés',
  },
]

/** Niveles de idioma (RF-10). */
export function PestanaNiveles({ onAviso }: PropsPestana) {
  const [panel, setPanel] = useState<{ fila: Nivel | null } | null>(null)
  const fila = panel?.fila
  return (
    <>
      <BarraPestana
        onNuevo={() => setPanel({ fila: null })}
        textoNuevo="Nuevo nivel"
      />
      <TablaRecurso<Nivel>
        clave={['niveles']}
        consultar={(page, size) => niveles.listar({ page, size })}
        columnas={[
          {
            encabezado: 'Código',
            celda: (n) => (
              <span className="font-mono text-xs font-semibold">
                {n.codigo}
              </span>
            ),
          },
          { encabezado: 'Nombre', celda: (n) => n.nombre },
          { encabezado: 'Idioma', celda: (n) => n.idioma },
        ]}
        vacio={{
          icono: Languages,
          titulo: 'No hay niveles de idioma',
          descripcion: 'Crea los niveles A1 a C1 de cada idioma.',
        }}
        onEditar={(n) => setPanel({ fila: n })}
        eliminar={{
          ejecutar: (n) => niveles.eliminar(n.id),
          nombre: (n) => `el nivel ${n.codigo}`,
        }}
        onAviso={onAviso}
      />
      {panel && (
        <FormularioRecurso
          titulo={fila ? 'Editar nivel' : 'Nuevo nivel de idioma'}
          campos={CAMPOS}
          iniciales={{
            codigo: fila?.codigo ?? '',
            nombre: fila?.nombre ?? '',
            idioma: fila?.idioma ?? '',
          }}
          validar={(v) => ({
            codigo: /^[A-Za-z0-9-]{2,20}$/.test(texto(v.codigo))
              ? undefined
              : 'Usa letras, números y guiones (2 a 20).',
          })}
          guardar={(v) => {
            const datos = {
              codigo: texto(v.codigo).toUpperCase(),
              nombre: texto(v.nombre),
              idioma: texto(v.idioma),
            }
            return fila
              ? niveles.actualizar(fila.id, datos)
              : niveles.crear(datos)
          }}
          invalidar="niveles"
          textoGuardar={fila ? 'Guardar cambios' : 'Crear nivel'}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            setPanel(null)
            onAviso({
              tipo: 'exito',
              texto: fila ? 'Se guardó el nivel.' : 'Se creó el nivel.',
            })
          }}
        />
      )}
    </>
  )
}
