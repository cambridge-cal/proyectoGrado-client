import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { mensajeDeError } from '../../../compartido/api'
import {
  aptitudRelativa,
  duracion,
  TEXTO_VALIDACION,
} from '../../../compartido/horario/formato'
import { InsigniaValidacion } from '../../../compartido/horario/InsigniaValidacion'
import type { HorarioDetalle, TipoAula } from '../../../compartido/tipos'
import {
  Aviso,
  BarraProgreso,
  Boton,
  EncabezadoPagina,
  Insignia,
  Tarjeta,
  TarjetaEstadistica,
} from '../../../compartido/ui'
import { cn } from '../../../compartido/utilidades'
import {
  aulas,
  cursos,
  docentes,
  franjas,
  periodos,
} from '../servicios/configuracion'
import { horarios, type RestriccionNoSatisfecha } from '../servicios/horarios'

const DURAS = [
  'Un docente no puede estar en dos clases a la vez',
  'Un aula no puede tener dos grupos a la vez',
  'Un grupo no puede tener dos clases a la vez',
  'El docente debe tener disponibilidad en la franja',
  'El grupo no supera la capacidad del aula',
]
const TIPOS: Array<{ valor: TipoAula; texto: string }> = [
  { valor: 'SALON', texto: 'Salón' },
  { valor: 'LAB', texto: 'Laboratorio' },
  { valor: 'VIRTUAL', texto: 'Virtual' },
]

/** Pasos del progreso (recomendación 5 de docs/diseno.md, RNF-13). */
const PASOS = [
  'Validar datos: docentes, aulas y disponibilidades',
  'Algoritmo Genético',
  'Búsqueda Tabú',
  'Validación semántica con Gemini 3.1 Pro',
  'Guardar el horario del período',
]
/** Estimación del paso en curso mientras el servidor trabaja: el AG y la BT tardan pocos segundos (TKT-019). */
const LIMITES_MS = [800, 2500, 4000]
const pasoEstimado = (ms: number) => {
  const i = LIMITES_MS.findIndex((limite) => ms < limite)
  return i === -1 ? 3 : i
}
const porcentajeEstimado = (ms: number) => {
  const paso = pasoEstimado(ms)
  if (paso < 3)
    return (
      [8, 30, 55][paso]! +
      ((ms - (LIMITES_MS[paso - 1] ?? 0)) / LIMITES_MS[paso]!) * 10
    )
  // Mientras espera a Gemini se acerca al 95 % sin llegar.
  return 70 + 25 * (1 - Math.exp(-(ms - LIMITES_MS[2]!) / 20_000))
}

function useTotal(clave: string, consultar: () => Promise<number>) {
  return useQuery({ queryKey: ['generar', clave], queryFn: consultar }).data
}

type ErrorGeneracion = {
  mensaje: string
  restricciones: RestriccionNoSatisfecha[]
}
function errorDeGeneracion(error: unknown): ErrorGeneracion {
  const restricciones = axios.isAxiosError<{
    restriccionesNoSatisfechas?: RestriccionNoSatisfecha[]
  }>(error)
    ? (error.response?.data?.restriccionesNoSatisfechas ?? [])
    : []
  return { mensaje: mensajeDeError(error), restricciones }
}

/** Generación del horario con IA (Figma 04b, RF-17, RF-18, RF-19, RNF-13). */
export function GenerarHorario() {
  const clienteConsultas = useQueryClient()
  const [excluidos, setExcluidos] = useState<TipoAula[]>([])
  const [inicio, setInicio] = useState<number | null>(null)
  const [transcurrido, setTranscurrido] = useState(0)

  const periodo = useQuery({
    queryKey: ['generar', 'periodo'],
    queryFn: async () =>
      (await periodos.listar({ activo: true, page: 1, size: 1 })).datos[0] ??
      null,
  })
  const totalCursos = useTotal(
    'cursos',
    async () => (await cursos.listar({ page: 1, size: 1 })).total,
  )
  const docentesDisponibles = useTotal(
    'docentes',
    async () =>
      (await docentes.listar({ page: 1, size: 100 })).datos.filter(
        (d) => d.franjasDisponibles > 0,
      ).length,
  )
  const aulasActivas = useTotal(
    'aulas',
    async () => (await aulas.listar({ activa: true, page: 1, size: 1 })).total,
  )
  const totalFranjas = useTotal(
    'franjas',
    async () => (await franjas.listar({ page: 1, size: 1 })).total,
  )

  const generar = useMutation({
    mutationFn: () => horarios.generar({ tiposAulaExcluidos: excluidos }),
    onMutate: () => {
      setInicio(Date.now())
      setTranscurrido(0)
    },
    onSettled: () => setInicio(null),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ['horario-actual'] })
      await clienteConsultas.invalidateQueries({ queryKey: ['horarios'] })
    },
  })

  useEffect(() => {
    if (inicio === null) return
    const reloj = setInterval(() => setTranscurrido(Date.now() - inicio), 250)
    return () => clearInterval(reloj)
  }, [inicio])

  const alternar = (tipo: TipoAula) =>
    setExcluidos((actual) =>
      actual.includes(tipo)
        ? actual.filter((t) => t !== tipo)
        : [...actual, tipo],
    )
  const valor = (n: number | undefined) => (n === undefined ? '…' : String(n))
  const sinPeriodo = periodo.isSuccess && periodo.data === null
  const estado = generar.isPending
    ? 'generando'
    : generar.isSuccess
      ? 'listo'
      : generar.isError
        ? 'error'
        : null

  return (
    <>
      <EncabezadoPagina
        titulo={
          periodo.data
            ? `Generar horario · Período ${periodo.data.nombre}`
            : 'Generar horario'
        }
        insignia={
          estado === 'generando' && <Insignia tono="azul">Generando</Insignia>
        }
        descripcion="El motor combina Algoritmo Genético, Búsqueda Tabú y validación semántica con Gemini (RF-17)."
      />
      <div className="space-y-5 p-4 sm:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <TarjetaEstadistica
            valor={valor(totalCursos)}
            etiqueta="Cursos registrados"
            acento="azul"
          />
          <TarjetaEstadistica
            valor={valor(docentesDisponibles)}
            etiqueta="Docentes con disponibilidad"
            acento="verde"
          />
          <TarjetaEstadistica
            valor={valor(aulasActivas)}
            etiqueta="Aulas habilitadas"
            acento="morado"
          />
          <TarjetaEstadistica
            valor={valor(totalFranjas)}
            etiqueta="Franjas configuradas"
            acento="naranja"
          />
        </div>

        {sinPeriodo && (
          <Aviso tipo="advertencia">
            No hay un período activo. Actívalo en{' '}
            <Link
              to="/admin/configuracion?pestana=periodos"
              className="font-semibold underline"
            >
              Configuración &gt; Períodos
            </Link>{' '}
            antes de generar.
          </Aviso>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Tarjeta className="p-5">
            <h2 className="text-[15px] font-bold text-texto">Restricciones</h2>
            <p className="mt-3 text-xs font-semibold text-texto-suave">
              Duras: siempre se cumplen (RF-18)
            </p>
            <ul className="mt-2 space-y-2">
              {DURAS.map((texto) => (
                <li
                  key={texto}
                  className="flex items-center justify-between gap-3 rounded-lg bg-superficie-2 px-3 py-2.5 text-[13px]"
                >
                  {texto} <Insignia tono="rojo">Dura</Insignia>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold text-texto-suave">
              Blanda: se optimiza
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-superficie-2 px-3 py-2.5 text-[13px]">
              Respetar la carga máxima semanal del docente{' '}
              <Insignia tono="ambar">Blanda</Insignia>
            </div>

            <fieldset className="mt-5" disabled={generar.isPending}>
              <legend className="text-xs font-semibold text-texto-suave">
                Excluir tipos de aula en esta generación (RF-19)
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {TIPOS.map((tipo) => {
                  const marcado = excluidos.includes(tipo.valor)
                  const ultimo =
                    !marcado && excluidos.length === TIPOS.length - 1
                  return (
                    <label
                      key={tipo.valor}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        ultimo && 'opacity-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primario"
                        checked={marcado}
                        disabled={ultimo}
                        onChange={() => alternar(tipo.valor)}
                      />
                      {tipo.texto}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <Boton
              tamano="lg"
              className="mt-5 w-full"
              onClick={() => generar.mutate()}
              cargando={generar.isPending}
              disabled={sinPeriodo}
            >
              <Sparkles className="size-4" aria-hidden />{' '}
              {generar.isPending ? 'Generando…' : 'Iniciar generación'}
            </Boton>
            <p className="mt-2 text-xs text-texto-suave">
              Tiempo esperado: menos de 3 minutos (RNF-02).
            </p>
          </Tarjeta>

          {estado === null ? (
            <Tarjeta className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Sparkles className="size-8 text-primario" aria-hidden />
              <p className="text-sm font-semibold text-texto">
                Listo para generar
              </p>
              <p className="max-w-sm text-xs text-texto-suave">
                Revisa las restricciones y pulsa Iniciar generación. Al terminar
                verás el estado de la validación con Gemini y podrás abrir el
                horario.
              </p>
            </Tarjeta>
          ) : estado === 'error' ? (
            <PanelError error={errorDeGeneracion(generar.error)} />
          ) : (
            <PanelProgreso
              transcurrido={transcurrido}
              resultado={estado === 'listo' ? generar.data! : null}
            />
          )}
        </div>
      </div>
    </>
  )
}

function PanelProgreso({
  transcurrido,
  resultado,
}: {
  transcurrido: number
  resultado: HorarioDetalle | null
}) {
  const enCurso = resultado ? PASOS.length : pasoEstimado(transcurrido)
  const porcentaje = resultado ? 100 : porcentajeEstimado(transcurrido)
  const detalle = (i: number) => {
    if (!resultado) return PASOS[i]
    if (i === 1) {
      const intentos = `${resultado.intentos} ${resultado.intentos === 1 ? 'intento' : 'intentos'}`
      return resultado.generaciones === 0
        ? `${PASOS[1]} · la población inicial ya cumplía las restricciones, ${intentos}`
        : `${PASOS[1]} · ${resultado.generaciones} generaciones, ${intentos}`
    }
    if (i === 3)
      return `${PASOS[3]} · ${TEXTO_VALIDACION[resultado.estadoValidacion]}`
    return PASOS[i]
  }
  return (
    <Tarjeta
      className={cn(
        'border-2 p-5',
        resultado ? 'border-exito' : 'border-primario',
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className={cn(
            'text-[15px] font-bold',
            resultado ? 'text-exito-texto' : 'text-primario',
          )}
        >
          {resultado ? 'Horario generado' : 'Generando horario…'}
        </h2>
        {resultado && <InsigniaValidacion horario={resultado} />}
      </div>
      <BarraProgreso
        valor={porcentaje}
        etiqueta="Progreso de la generación"
        className="mt-4"
        colorRelleno={resultado ? 'bg-exito' : 'bg-primario'}
      />
      <p className="mt-1.5 text-xs font-semibold text-primario">
        {Math.round(porcentaje)} %
      </p>
      <ol className="mt-3 divide-y divide-borde">
        {PASOS.map((_, i) => {
          const advertencia = resultado && i === 3 && !resultado.validadoGemini
          const hecho = i < enCurso
          return (
            <li key={i} className="flex items-start gap-2.5 py-2.5 text-[13px]">
              {advertencia ? (
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-advertencia-texto"
                  aria-hidden
                />
              ) : hecho ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-exito-texto"
                  aria-hidden
                />
              ) : i === enCurso ? (
                <Loader2
                  className="mt-0.5 size-4 shrink-0 animate-spin text-primario"
                  aria-hidden
                />
              ) : (
                <Circle
                  className="mt-0.5 size-4 shrink-0 text-texto-suave"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  advertencia
                    ? 'text-advertencia-texto'
                    : hecho
                      ? 'text-exito-texto'
                      : i === enCurso
                        ? 'text-primario'
                        : 'text-texto-suave',
                )}
              >
                {detalle(i)}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-xs text-texto-suave">
        Tiempo {resultado ? 'total' : 'transcurrido'}:{' '}
        {duracion(resultado ? resultado.tiempoEjecucionMs : transcurrido)}
        {resultado && ` · Aptitud ${aptitudRelativa(resultado)}`}
      </p>
      {resultado && !resultado.validadoGemini ? (
        <Aviso tipo="advertencia" className="mt-4">
          {resultado.motivoValidacion ??
            TEXTO_VALIDACION[resultado.estadoValidacion]}{' '}
          Se guardó el mejor resultado del AG + BT con validadoGemini = false
          (RNF-18).
        </Aviso>
      ) : (
        !resultado && (
          <div className="mt-4 flex gap-2 rounded-control border border-primario/30 bg-primario-suave px-3.5 py-3 text-xs text-primario-oscuro">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Si Gemini no responde o rechaza la propuesta, se guarda el mejor
            resultado del AG + BT con validadoGemini = false (RNF-18).
          </div>
        )
      )}
      {resultado && (
        <Link
          to={`/admin/horarios/${resultado.id}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-control bg-primario px-4 text-sm font-semibold text-white hover:bg-primario-oscuro"
        >
          Ver horario
        </Link>
      )}
    </Tarjeta>
  )
}

function PanelError({ error }: { error: ErrorGeneracion }) {
  return (
    <Tarjeta className="border-2 border-peligro p-5" role="alert">
      <div className="flex items-center gap-2">
        <XCircle className="size-5 text-peligro-texto" aria-hidden />
        <h2 className="text-[15px] font-bold text-peligro-texto">
          No se pudo generar el horario
        </h2>
      </div>
      <p className="mt-2 text-sm text-texto">{error.mensaje}</p>
      {error.restricciones.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold text-texto-suave">
            Restricciones no satisfechas (Figura 6.4)
          </p>
          <ul className="mt-2 space-y-2">
            {error.restricciones.map((r) => (
              <li
                key={r.tipo}
                className="flex items-center justify-between gap-3 rounded-lg bg-peligro/5 px-3 py-2.5 text-[13px]"
              >
                {r.descripcion}
                <Insignia tono="rojo">{r.cantidad}</Insignia>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-texto-suave">
            Revisa la disponibilidad de los docentes, la capacidad de las aulas
            y las franjas en Configuración, o quita alguna exclusión de tipo de
            aula, y vuelve a intentarlo.
          </p>
        </>
      )}
    </Tarjeta>
  )
}
