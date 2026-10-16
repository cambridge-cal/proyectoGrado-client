import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { enrutador } from './rutas'

/** Caché de peticiones al servidor (TanStack Query). */
const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <RouterProvider router={enrutador} />
    </QueryClientProvider>
  )
}

export default App
