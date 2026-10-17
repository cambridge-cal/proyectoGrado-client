import { AxiosError, type InternalAxiosRequestConfig } from 'axios'

/** Error de Axios con el cuerpo que devuelve NestJS. */
export function errorApi(status: number, message: string) {
  const config = { headers: {} } as InternalAxiosRequestConfig
  return new AxiosError(String(status), 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: { message, statusCode: status },
  })
}
