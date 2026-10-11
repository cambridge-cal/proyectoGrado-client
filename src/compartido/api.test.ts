import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../seguridad/almacenAuth'
import { api, mensajeDeError } from './api'

function responder(config: InternalAxiosRequestConfig, status: number, data: unknown = {}) {
  const respuesta = { data, status, statusText: '', headers: {}, config }
  if (status >= 400) {
    return Promise.reject(new AxiosError('error', String(status), config, null, respuesta))
  }
  return Promise.resolve(respuesta)
}

describe('cliente api', () => {
  const adaptadorOriginal = api.defaults.adapter

  beforeEach(() => {
    useAuth.getState().iniciarSesion({
      accessToken: 'token-viejo',
      refreshToken: 'refresh-1',
      usuario: { id: '1', nombre: 'Prueba', email: 'p@cambridge.edu.co', rol: 'ADMIN' },
    })
  })

  afterEach(() => {
    api.defaults.adapter = adaptadorOriginal
    vi.restoreAllMocks()
  })

  it('agrega el Access Token en la cabecera Authorization', async () => {
    const adaptador = vi.fn<AxiosAdapter>((config) => responder(config, 200, { ok: true }))
    api.defaults.adapter = adaptador

    await api.get('/salud')

    expect(adaptador.mock.calls[0]![0].headers.Authorization).toBe('Bearer token-viejo')
  })

  it('renueva el token ante un 401 y repite la petición una vez', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'token-nuevo', refreshToken: 'refresh-2' },
    })
    api.defaults.adapter = vi.fn<AxiosAdapter>((config) =>
      config.headers.Authorization === 'Bearer token-nuevo'
        ? responder(config, 200, { ok: true })
        : responder(config, 401),
    )

    const { data } = await api.get('/usuarios')

    expect(data).toEqual({ ok: true })
    expect(useAuth.getState().accessToken).toBe('token-nuevo')
    expect(useAuth.getState().refreshToken).toBe('refresh-2')
  })

  it('cierra la sesión si la renovación falla', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh inválido'))
    api.defaults.adapter = vi.fn<AxiosAdapter>((config) => responder(config, 401))

    await expect(api.get('/usuarios')).rejects.toBeInstanceOf(AxiosError)
    expect(useAuth.getState().usuario).toBeNull()
  })

  it('no intenta renovar cuando falla el propio login', async () => {
    const post = vi.spyOn(axios, 'post')
    api.defaults.adapter = vi.fn<AxiosAdapter>((config) => responder(config, 401))

    await expect(api.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError)
    expect(post).not.toHaveBeenCalled()
  })
})

describe('mensajeDeError', () => {
  it('explica el límite de peticiones (RNF-04)', () => {
    const error = new AxiosError('x', '429', undefined, null, {
      data: {},
      status: 429,
      statusText: '',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    })
    expect(mensajeDeError(error)).toContain('Demasiadas peticiones')
  })

  it('une los mensajes de validación de la API', () => {
    const error = new AxiosError('x', '400', undefined, null, {
      data: { message: ['email inválido', 'contraseña requerida'] },
      status: 400,
      statusText: '',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    })
    expect(mensajeDeError(error)).toBe('email inválido. contraseña requerida')
  })
})
