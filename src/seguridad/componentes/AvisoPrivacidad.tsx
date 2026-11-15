import type { ReactNode } from 'react'

/** Versión del texto. Debe coincidir con VERSION_AVISO_PRIVACIDAD del servidor. */
const VERSION_AVISO = '2026-11'

const CORREO_DATOS: string | undefined = import.meta.env.VITE_CORREO_DATOS

const DATOS = [
  'Identificación y contacto: nombre completo y correo electrónico.',
  'Académicos: rol, código de estudiante, grupos e inscripciones, y en el caso de los docentes su especialidad, disponibilidad y carga horaria.',
  'Evaluación docente: las respuestas y los comentarios se guardan sin el nombre ni el código de quien responde; el docente recibe solo los resultados agregados.',
  'Uso del sistema: fecha, hora y dirección IP de los inicios de sesión y de las acciones registradas en la auditoría.',
]

const FINALIDADES = [
  'Crear y administrar tu cuenta y controlar el acceso según tu rol.',
  'Generar y publicar los horarios académicos.',
  'Gestionar la inscripción a grupos.',
  'Aplicar la evaluación docente y calcular sus resultados para mejorar la calidad académica.',
  'Mantener la seguridad y la trazabilidad del sistema.',
]

const DERECHOS = [
  'Conocer, actualizar y rectificar tus datos.',
  'Pedir prueba de esta autorización.',
  'Saber qué uso se ha dado a tus datos.',
  'Revocar la autorización o pedir que se supriman tus datos, cuando no exista un deber legal o contractual de conservarlos.',
  'Presentar quejas ante la Superintendencia de Industria y Comercio.',
  'Consultar tus datos de forma gratuita.',
]

function Seccion({
  titulo,
  children,
}: {
  titulo: string
  children: ReactNode
}) {
  return (
    <section className="mt-5">
      <h2 className="text-sm font-bold text-texto">{titulo}</h2>
      <div className="mt-1.5 text-sm leading-relaxed text-texto-suave">
        {children}
      </div>
    </section>
  )
}

function Lista({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Aviso de privacidad (Ley 1581 de 2012, Decreto 1377 de 2013, arts. 14 y 15). */
export function AvisoPrivacidad() {
  return (
    <article>
      <p className="text-sm leading-relaxed text-texto-suave">
        Cambridge Academy of Languages, con sede en Pasto (Nariño, Colombia), es
        responsable del tratamiento de los datos personales que se registran en
        el Sistema de Gestión Académica.
      </p>
      <Seccion titulo="Qué datos tratamos">
        <Lista items={DATOS} />
      </Seccion>
      <Seccion titulo="Para qué los usamos">
        <Lista items={FINALIDADES} />
        <p className="mt-2">
          No vendemos ni compartimos tus datos con terceros. La validación de
          horarios con inteligencia artificial usa códigos internos, no nombres
          ni correos.
        </p>
      </Seccion>
      <Seccion titulo="Tus derechos">
        <Lista items={DERECHOS} />
      </Seccion>
      <Seccion titulo="Cómo ejercerlos">
        <p>
          Presenta tu solicitud a la administración de la academia
          {CORREO_DATOS ? (
            <>
              {' '}
              en{' '}
              <a
                className="font-semibold text-primario hover:underline"
                href={`mailto:${CORREO_DATOS}`}
              >
                {CORREO_DATOS}
              </a>
            </>
          ) : (
            ' en la sede o por sus canales de atención'
          )}
          . Las consultas se responden en un máximo de 10 días hábiles y los
          reclamos en un máximo de 15 días hábiles (Ley 1581 de 2012, arts. 14 y
          15).
        </p>
      </Seccion>
      <Seccion titulo="Menores de edad">
        <p>
          Si eres menor de edad, lee este aviso con tu padre, madre o
          representante legal: la autorización debe darla esa persona.
        </p>
      </Seccion>
      <p className="mt-5 text-xs text-texto-suave">
        Versión {VERSION_AVISO} del aviso de privacidad.
      </p>
    </article>
  )
}
