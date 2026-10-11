import { Link } from 'react-router'
import { Insignia } from '../../compartido/ui'
import { AccesoDesarrollo } from '../AccesoDesarrollo'

/** Vista base del inicio de sesión. TKT-007 implementa el formulario (Figma 01, RF-01, RNF-14). */
export function IniciarSesion() {
  return (
    <>
      <h2 className="text-[26px] font-bold text-texto">Bienvenido de vuelta</h2>
      <p className="mt-2 text-sm text-texto-suave">Ingresa tus credenciales para acceder</p>
      <div className="my-5 h-px bg-borde" />
      <p className="text-sm text-texto-suave">
        El formulario de inicio de sesión se implementa en <Insignia tono="gris">TKT-007</Insignia>
      </p>
      <Link to="/recuperar-contrasena" className="mt-4 inline-block text-[13px] font-medium text-primario hover:underline">
        ¿Olvidaste tu contraseña?
      </Link>
      <AccesoDesarrollo />
    </>
  )
}
