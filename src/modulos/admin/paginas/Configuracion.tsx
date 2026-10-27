import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Aviso, EncabezadoPagina, Tarjeta } from '../../../compartido/ui'
import { cn } from '../../../compartido/utilidades'
import { PestanaAulas } from '../componentes/configuracion/PestanaAulas'
import { PestanaCursos } from '../componentes/configuracion/PestanaCursos'
import { PestanaDisponibilidad } from '../componentes/configuracion/PestanaDisponibilidad'
import { PestanaDocentes } from '../componentes/configuracion/PestanaDocentes'
import { PestanaFranjas } from '../componentes/configuracion/PestanaFranjas'
import { PestanaGrupos } from '../componentes/configuracion/PestanaGrupos'
import { PestanaNiveles } from '../componentes/configuracion/PestanaNiveles'
import { PestanaPeriodos } from '../componentes/configuracion/PestanaPeriodos'
import type { AvisoConfiguracion } from '../componentes/TablaRecurso'

const PESTANAS = [
  { id: 'periodos', texto: 'Períodos' },
  { id: 'niveles', texto: 'Niveles' },
  { id: 'cursos', texto: 'Cursos' },
  { id: 'grupos', texto: 'Grupos' },
  { id: 'aulas', texto: 'Aulas' },
  { id: 'franjas', texto: 'Franjas' },
  { id: 'docentes', texto: 'Docentes' },
  { id: 'disponibilidad', texto: 'Disponibilidad' },
] as const
type IdPestana = (typeof PESTANAS)[number]['id']

/** Configuración académica del Administrador (RF-09 a RF-16, docs/diseno.md). */
export function Configuracion() {
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('pestana') as IdPestana | null
  const actual: IdPestana = PESTANAS.some((p) => p.id === pedida)
    ? pedida!
    : 'periodos'
  const docente = parametros.get('docente') ?? undefined
  const [aviso, setAviso] = useState<AvisoConfiguracion | null>(null)

  const abrir = (id: IdPestana, extra: Record<string, string> = {}) => {
    setAviso(null)
    setParametros({ pestana: id, ...extra }, { replace: true })
  }
  const props = { onAviso: setAviso }

  return (
    <>
      <EncabezadoPagina
        titulo="Configuración académica"
        descripcion="Datos que usa el motor de IA para generar los horarios."
      />
      <div className="space-y-4 p-4 sm:p-8">
        <div
          role="tablist"
          aria-label="Secciones de configuración"
          className="flex gap-1 overflow-x-auto border-b border-borde"
        >
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`pestana-${p.id}`}
              aria-selected={actual === p.id}
              aria-controls="panel-configuracion"
              onClick={() => abrir(p.id)}
              className={cn(
                '-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                actual === p.id
                  ? 'border-primario text-primario'
                  : 'border-transparent text-texto-suave hover:text-texto',
              )}
            >
              {p.texto}
            </button>
          ))}
        </div>

        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        <Tarjeta
          id="panel-configuracion"
          role="tabpanel"
          aria-labelledby={`pestana-${actual}`}
        >
          {actual === 'periodos' && <PestanaPeriodos {...props} />}
          {actual === 'niveles' && <PestanaNiveles {...props} />}
          {actual === 'cursos' && <PestanaCursos {...props} />}
          {actual === 'grupos' && <PestanaGrupos {...props} />}
          {actual === 'aulas' && <PestanaAulas {...props} />}
          {actual === 'franjas' && <PestanaFranjas {...props} />}
          {actual === 'docentes' && (
            <PestanaDocentes
              {...props}
              onVerDisponibilidad={(id) =>
                abrir('disponibilidad', { docente: id })
              }
            />
          )}
          {actual === 'disponibilidad' && (
            <PestanaDisponibilidad
              key={docente}
              {...props}
              docenteInicial={docente}
            />
          )}
        </Tarjeta>
      </div>
    </>
  )
}
