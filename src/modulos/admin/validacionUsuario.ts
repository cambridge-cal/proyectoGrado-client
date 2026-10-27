import type { Rol, UsuarioAdmin } from '../../compartido/tipos'
import { contrasenaValida, validarEmail } from '../../seguridad/validacionLogin'

export interface Valores {
  nombre: string
  email: string
  contrasena: string
  rol: Rol
  codigo: string
  especialidad: string
  cargaMaximaSemanal: string
}

export type Errores = Partial<Record<keyof Valores, string>>

export function valoresIniciales(usuario: UsuarioAdmin | null): Valores {
  return {
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    contrasena: '',
    rol: usuario?.rol ?? 'ESTUDIANTE',
    codigo: usuario?.codigo ?? '',
    especialidad: usuario?.especialidad ?? '',
    cargaMaximaSemanal: usuario?.cargaMaximaSemanal?.toString() ?? '',
  }
}

/** Validación en cliente con las mismas reglas del servidor (RNF-14). */
export function validarUsuario(v: Valores, edicion: boolean): Errores {
  const errores: Errores = {}
  if (v.nombre.trim().length < 2) errores.nombre = 'Escribe el nombre completo.'
  const errorEmail = validarEmail(v.email)
  if (errorEmail) errores.email = errorEmail
  if ((!edicion || v.contrasena) && !contrasenaValida(v.contrasena)) {
    errores.contrasena =
      'Mínimo 8 caracteres, con al menos una letra y un número.'
  }
  if (v.rol === 'ESTUDIANTE' && v.codigo.trim().length < 3)
    errores.codigo = 'Escribe el código del estudiante.'
  if (v.rol === 'DOCENTE') {
    if (v.especialidad.trim().length < 2)
      errores.especialidad = 'Escribe la especialidad.'
    const carga = Number(v.cargaMaximaSemanal)
    if (
      v.cargaMaximaSemanal.trim() !== '' &&
      (!Number.isInteger(carga) || carga < 1 || carga > 60)
    ) {
      errores.cargaMaximaSemanal = 'Debe ser un número entero entre 1 y 60.'
    }
  }
  return errores
}
