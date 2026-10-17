import { useEffect, useState } from 'react'

/** Devuelve el valor después de una pausa, para no consultar la API en cada tecla. */
export function useDiferido<T>(valor: T, milisegundos = 300): T {
  const [diferido, setDiferido] = useState(valor)
  useEffect(() => {
    const espera = setTimeout(() => setDiferido(valor), milisegundos)
    return () => clearTimeout(espera)
  }, [valor, milisegundos])
  return diferido
}
