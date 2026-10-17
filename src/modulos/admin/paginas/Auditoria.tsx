import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Lock, ScrollText } from 'lucide-react'
import { useState } from 'react'
import { mensajeDeError } from '../../../compartido/api'
import {
  Aviso,
  Campo,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Paginador,
  Selector,
  Tarjeta,
  type Tono,
} from '../../../compartido/ui'
import { detalleLegible, servicioAuditoria } from '../servicios/auditoria'
import { servicioUsuarios } from '../servicios/usuarios'

const TAMANO_PAGINA = 15
const NOMBRE_MODULO: Record<string, string> = {
  SEGURIDAD: 'Seguridad',
  USUARIOS: 'Usuarios',
  HORARIOS: 'Horarios',
  EVALUACION: 'Evaluación',
}
const TONO_MODULO: Record<string, Tono> = {
  SEGURIDAD: 'morado',
  USUARIOS: 'azul',
  HORARIOS: 'naranja',
  EVALUACION: 'turquesa',
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
})

/** Registro de auditoría de solo lectura (RF-08, RNF-11, RNF-33). */
export function Auditoria() {
  const [page, setPage] = useState(1)
  const [filtros, setFiltros] = useState({
    modulo: '',
    accion: '',
    usuarioId: '',
    desde: '',
    hasta: '',
  })

  const opciones = useQuery({
    queryKey: ['auditoria', 'opciones'],
    queryFn: servicioAuditoria.opciones,
  })
  const usuarios = useQuery({
    queryKey: ['usuarios', { page: 1, size: 100 }],
    queryFn: () => servicioUsuarios.listar({ page: 1, size: 100 }),
  })
  const consulta = useQuery({
    queryKey: ['auditoria', page, filtros],
    queryFn: () =>
      servicioAuditoria.listar({ page, size: TAMANO_PAGINA, ...filtros }),
    placeholderData: keepPreviousData,
  })

  const cambiar = (campo: keyof typeof filtros, valor: string) => {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }))
    setPage(1)
  }
  const fechasInvertidas = Boolean(
    filtros.desde && filtros.hasta && filtros.desde > filtros.hasta,
  )
  const pagina = consulta.data

  return (
    <>
      <EncabezadoPagina
        titulo="Auditoría"
        descripcion="Historial de acciones críticas con usuario, módulo, fecha e IP."
        insignia={
          <Insignia tono="gris">
            <Lock className="size-3" aria-hidden /> Solo lectura
          </Insignia>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <Aviso tipo="info">
          Los registros no se pueden modificar ni eliminar desde ningún rol, y
          sirven como evidencia de las actividades realizadas en el sistema
          (RNF-11 y RNF-33).
        </Aviso>

        <Tarjeta>
          <div className="grid gap-3 border-b border-borde p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
            <Selector
              etiqueta="Módulo"
              value={filtros.modulo}
              onChange={(e) => cambiar('modulo', e.target.value)}
              opciones={[
                { valor: '', texto: 'Todos' },
                ...(opciones.data?.modulos ?? []).map((m) => ({
                  valor: m,
                  texto: NOMBRE_MODULO[m] ?? m,
                })),
              ]}
            />
            <Selector
              etiqueta="Acción"
              value={filtros.accion}
              onChange={(e) => cambiar('accion', e.target.value)}
              opciones={[
                { valor: '', texto: 'Todas' },
                ...(opciones.data?.acciones ?? []).map((a) => ({
                  valor: a,
                  texto: a,
                })),
              ]}
            />
            <Selector
              etiqueta="Usuario"
              value={filtros.usuarioId}
              onChange={(e) => cambiar('usuarioId', e.target.value)}
              opciones={[
                { valor: '', texto: 'Todos' },
                ...(usuarios.data?.datos ?? []).map((u) => ({
                  valor: u.id,
                  texto: `${u.nombre} (${u.email})`,
                })),
              ]}
            />
            <Campo
              etiqueta="Desde"
              type="date"
              value={filtros.desde}
              onChange={(e) => cambiar('desde', e.target.value)}
              className="[&_input]:h-[42px]"
            />
            <Campo
              etiqueta="Hasta"
              type="date"
              value={filtros.hasta}
              onChange={(e) => cambiar('hasta', e.target.value)}
              error={
                fechasInvertidas ? 'Debe ser posterior a Desde.' : undefined
              }
              className="[&_input]:h-[42px]"
            />
          </div>

          {consulta.isError ? (
            <div className="p-5">
              <Aviso tipo="error">{mensajeDeError(consulta.error)}</Aviso>
            </div>
          ) : consulta.isPending ? (
            <p
              className="px-5 py-12 text-center text-sm text-texto-suave"
              role="status"
            >
              Cargando registros…
            </p>
          ) : pagina && pagina.datos.length === 0 ? (
            <EstadoVacio
              icono={ScrollText}
              titulo="No hay registros con estos filtros"
              descripcion="Cambia el módulo, el usuario o el rango de fechas."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-superficie-2 text-xs font-semibold text-texto-suave">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Fecha y hora
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Usuario
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Módulo
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Acción
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Detalle
                    </th>
                    <th scope="col" className="px-5 py-3">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {pagina?.datos.map((registro) => (
                    <tr key={registro.id}>
                      <td className="px-5 py-3 whitespace-nowrap text-texto">
                        <time dateTime={registro.fechaHora}>
                          {formatoFecha.format(new Date(registro.fechaHora))}
                        </time>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-texto">
                          {registro.usuario.nombre}
                        </p>
                        <p className="text-xs text-texto-suave">
                          {registro.usuario.email}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Insignia tono={TONO_MODULO[registro.modulo] ?? 'gris'}>
                          {NOMBRE_MODULO[registro.modulo] ?? registro.modulo}
                        </Insignia>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-texto">
                        {registro.accion}
                      </td>
                      <td className="max-w-[260px] px-3 py-3 text-xs text-texto-suave">
                        {detalleLegible(registro)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-texto-suave">
                        {registro.ip ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagina && pagina.total > 0 && (
            <Paginador
              page={pagina.page}
              size={pagina.size}
              total={pagina.total}
              onCambiar={setPage}
            />
          )}
        </Tarjeta>
      </div>
    </>
  )
}
