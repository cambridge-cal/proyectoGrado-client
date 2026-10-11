import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Insignia } from '../../compartido/ui'

/** Vista base de recuperación de contraseña. TKT-012 la implementa (Figma 02, RF-04). */
export function RecuperarContrasena() {
  return (
    <>
      <Link to="/iniciar-sesion" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primario hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Volver al inicio de sesión
      </Link>
      <h2 className="mt-6 text-[26px] font-bold text-texto">Restablecer contraseña</h2>
      <p className="mt-2 text-sm text-texto-suave">Ingresa tu correo y te enviaremos las instrucciones de recuperación.</p>
      <div className="my-5 h-px bg-borde" />
      <p className="text-sm text-texto-suave">
        Se implementa en <Insignia tono="gris">TKT-012</Insignia>
      </p>
    </>
  )
}
