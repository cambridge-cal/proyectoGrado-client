import { Construction, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { EncabezadoPagina, EstadoVacio, Insignia, Tarjeta } from '../ui'

export interface InfoVista {
  titulo: string
  descripcion: string
  /** Ticket del tablero que implementa la vista. */
  ticket: string
  /** Requisitos de la tesis que cubre. */
  requisitos: string
  /** Pantalla del prototipo en Figma que sirve de referencia. */
  figma?: string
  icono?: LucideIcon
  /** Contenido sobre el aviso, como las pestañas de la sección. */
  children?: ReactNode
}

/**
 * Vista base mientras se implementa el ticket correspondiente.
 * Cada ticket reemplaza este componente por la vista real.
 */
export function EnConstruccion({
  titulo,
  descripcion,
  ticket,
  requisitos,
  figma,
  icono,
  children,
}: InfoVista) {
  return (
    <>
      <EncabezadoPagina
        titulo={titulo}
        descripcion={descripcion}
        insignia={<Insignia tono="gris">{ticket}</Insignia>}
      />
      <div className="space-y-4 p-4 sm:p-8">
        {children}
        <Tarjeta>
          <EstadoVacio
            icono={icono ?? Construction}
            titulo="Vista en construcción"
            descripcion={`Se implementa en ${ticket} y cubre ${requisitos}.${figma ? ` Diseño de referencia en Figma: ${figma}.` : ''}`}
          />
        </Tarjeta>
      </div>
    </>
  )
}
