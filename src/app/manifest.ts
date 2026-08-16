import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vicu Accesorios — Costos y Precios',
    short_name: 'Vicu Accesorios',
    description: 'Insumos, recetas, stock y precios de Vicu Accesorios',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f5',
    theme_color: '#9d174d',
    lang: 'es-AR',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
