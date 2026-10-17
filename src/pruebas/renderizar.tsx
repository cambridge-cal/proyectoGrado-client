import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'

/** Renderiza rutas con TanStack Query y React Router para las pruebas. */
export function renderizarRutas(rutas: RouteObject[], inicial: string) {
  const enrutador = createMemoryRouter(rutas, { initialEntries: [inicial] })
  const consultas = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={consultas}>
      <RouterProvider router={enrutador} />
    </QueryClientProvider>,
  )
  return { usuario: userEvent.setup(), enrutador }
}

export function renderizar(elemento: ReactNode, ruta = '/') {
  return renderizarRutas([{ path: '*', element: elemento }], ruta)
}
