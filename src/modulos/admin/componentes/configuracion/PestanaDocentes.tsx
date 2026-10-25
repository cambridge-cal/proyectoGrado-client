import { CalendarCheck, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import type { DocenteConfig } from '../../../../compartido/tipos'
import { Aviso, Insignia } from '../../../../compartido/ui'
import { docentes } from '../../servicios/configuracion'
import { FormularioRecurso, type CampoFormulario } from '../FormularioRecurso'
import { TablaRecurso } from '../TablaRecurso'
import { BarraPestana, type PropsPestana } from './comun'
import { aNumero, texto } from './formato'

const CAMPOS: CampoFormulario[] = [
  {
    nombre: 'especialidad',
    etiqueta: 'Especialidad',
    tipo: 'texto',
    requerido: true,
    placeholder: 'Inglés',
    ayuda: 'El motor prefiere asignar grupos del mismo idioma.',
  },
  {
    nombre: 'cargaMaximaSemanal',
    etiqueta: 'Carga máxima semanal (horas)',
    tipo: 'numero',
    requerido: true,
    min: 1,
    max: 60,
  },
]

/** Docentes con su carga máxima y disponibilidad (RF-15). */
export function PestanaDocentes({
  onAviso,
  onVerDisponibilidad,
}: PropsPestana & { onVerDisponibilidad: (id: string) => void }) {
  const [editando, setEditando] = useState<DocenteConfig | null>(null)
  return (
    <>
      <BarraPestana>
        <Aviso tipo="info" className="w-full">
          Las cuentas de docente se crean en <strong>Usuarios</strong> con el
          rol Docente. Aquí se ajustan su especialidad, su carga máxima (40
          horas por defecto) y su disponibilidad.
        </Aviso>
      </BarraPestana>
      <TablaRecurso<DocenteConfig>
        clave={['docentes']}
        consultar={(page, size) => docentes.listar({ page, size })}
        columnas={[
          {
            encabezado: 'Docente',
            celda: (d) => (
              <div>
                <p className="font-semibold">{d.nombre}</p>
                <p className="text-xs text-texto-suave">{d.email}</p>
              </div>
            ),
          },
          { encabezado: 'Especialidad', celda: (d) => d.especialidad },
          {
            encabezado: 'Carga máxima',
            celda: (d) => `${d.cargaMaximaSemanal} h`,
            derecha: true,
          },
          {
            encabezado: 'Disponibilidad',
            celda: (d) =>
              d.franjasDisponibles ? (
                <Insignia tono="verde">{d.franjasDisponibles} franjas</Insignia>
              ) : (
                <Insignia tono="ambar">Sin registrar</Insignia>
              ),
          },
        ]}
        vacio={{
          icono: GraduationCap,
          titulo: 'No hay docentes',
          descripcion: 'Crea las cuentas de docente en Usuarios.',
        }}
        onEditar={setEditando}
        accionesExtra={(d) => (
          <button
            type="button"
            onClick={() => onVerDisponibilidad(d.id)}
            className="rounded-lg p-2 text-texto-suave hover:bg-superficie-2 hover:text-texto"
            aria-label={`Disponibilidad de ${d.nombre}`}
            title="Disponibilidad"
          >
            <CalendarCheck className="size-4" aria-hidden />
          </button>
        )}
        onAviso={onAviso}
      />
      {editando && (
        <FormularioRecurso
          titulo="Editar docente"
          descripcion={`${editando.nombre} · ${editando.email}`}
          campos={CAMPOS}
          iniciales={{
            especialidad: editando.especialidad,
            cargaMaximaSemanal: String(editando.cargaMaximaSemanal),
          }}
          guardar={(v) =>
            docentes.actualizar(editando.id, {
              especialidad: texto(v.especialidad),
              cargaMaximaSemanal: aNumero(v.cargaMaximaSemanal),
            })
          }
          invalidar="docentes"
          textoGuardar="Guardar cambios"
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null)
            onAviso({
              tipo: 'exito',
              texto: 'Se guardaron los datos del docente.',
            })
          }}
        />
      )}
    </>
  )
}
