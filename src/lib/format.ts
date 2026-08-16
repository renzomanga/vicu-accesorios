export function formatARS(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(valor)
}

export function formatNumero(valor: number, decimales = 2): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: decimales,
  }).format(valor)
}
