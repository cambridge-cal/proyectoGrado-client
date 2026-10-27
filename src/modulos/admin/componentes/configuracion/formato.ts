/** Conversión de los valores del formulario y formato de fechas de las pestañas. */
export const aNumero = (valor: string | boolean) => Number(valor)
export const texto = (valor: string | boolean | undefined) =>
  String(valor ?? '').trim()

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})
export const fechaCorta = (iso: string) =>
  formatoFecha.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
