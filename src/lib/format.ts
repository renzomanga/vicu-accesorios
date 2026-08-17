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

const ABREVIATURAS_INVARIABLES = new Set(['cm', 'mm', 'kg', 'g', 'ml', 'l', 'm'])

export function pluralizarUnidad(unidad: string, cantidad: number): string {
  if (Math.abs(cantidad) === 1) return unidad

  const [primera, ...resto] = unidad.split(' ')
  if (ABREVIATURAS_INVARIABLES.has(primera.toLowerCase())) return unidad

  let plural: string
  if (/[aeiouáéíóú]$/i.test(primera)) {
    plural = primera + 's'
  } else if (/z$/i.test(primera)) {
    plural = primera.slice(0, -1) + 'ces'
  } else {
    plural = primera + 'es'
  }

  return [plural, ...resto].join(' ')
}

export function formatCantidadUnidad(cantidad: number, unidad: string, decimales = 2): string {
  return `${formatNumero(cantidad, decimales)} ${pluralizarUnidad(unidad, cantidad)}`
}
