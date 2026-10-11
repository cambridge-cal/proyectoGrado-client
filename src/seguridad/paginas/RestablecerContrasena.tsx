import { Insignia } from '../../compartido/ui'

/** Vista base para definir la nueva contraseña con el token del correo. TKT-012 la implementa (RF-05). */
export function RestablecerContrasena() {
  return (
    <>
      <h2 className="text-[26px] font-bold text-texto">Crea una nueva contraseña</h2>
      <p className="mt-2 text-sm text-texto-suave">El enlace de recuperación es válido por 30 minutos.</p>
      <div className="my-5 h-px bg-borde" />
      <p className="text-sm text-texto-suave">
        Se implementa en <Insignia tono="gris">TKT-012</Insignia>
      </p>
    </>
  )
}
