import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cantera Joyas — Costos y Precios',
    short_name: 'Cantera Joyas',
    description: 'Insumos, recetas, stock y precios de Cantera Joyas',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F5EE',
    theme_color: '#7A6152',
    lang: 'es-AR',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
