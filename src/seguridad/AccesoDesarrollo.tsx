import { useNavigate } from 'react-router'
import { Boton } from '../compartido/ui'
import type { Rol } from '../compartido/tipos'
import { INICIO_POR_ROL, useAuth } from './almacenAuth'

const USUARIOS_PRUEBA: Record<Rol, string> = {
  ADMIN: 'Juan Burbano',
  DOCENTE: 'María García',
  ESTUDIANTE: 'Camila Rosero',
}

/**
 * SOLO DESARROLLO. Permite recorrer las vistas por rol antes de que exista el
 * login real (TKT-005 y TKT-007). Vite elimina este bloque en la compilación
 * de producción porque import.meta.env.DEV es false. TKT-007 lo retira.
 */
export function AccesoDesarrollo() {
  const iniciarSesion = useAuth((estado) => estado.iniciarSesion)
  const navegar = useNavigate()

  if (!import.meta.env.DEV) return null

  const entrarComo = (rol: Rol) => {
    iniciarSesion({
      accessToken: 'token-desarrollo',
      refreshToken: 'token-desarrollo',
      usuario: { id: `dev-${rol}`, nombre: USUARIOS_PRUEBA[rol], email: `${rol.toLowerCase()}@cambridge.edu.co`, rol },
    })
    navegar(INICIO_POR_ROL[rol])
  }

  return (
    <div className="mt-8 rounded-control border border-dashed border-advertencia bg-advertencia/8 p-4">
      <p className="text-xs font-semibold text-advertencia-texto">Solo en desarrollo: entrar sin backend</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Boton tamano="sm" variante="secundario" onClick={() => entrarComo('ADMIN')}>
          Administrador
        </Boton>
        <Boton tamano="sm" variante="secundario" onClick={() => entrarComo('DOCENTE')}>
          Docente
        </Boton>
        <Boton tamano="sm" variante="secundario" onClick={() => entrarComo('ESTUDIANTE')}>
          Estudiante
        </Boton>
      </div>
    </div>
  )
}
