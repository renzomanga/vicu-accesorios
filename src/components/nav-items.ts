import { Home, Package, Tags, Hammer, Truck } from 'lucide-react'

export const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/insumos', label: 'Insumos', icon: Package },
  { href: '/productos', label: 'Productos', icon: Tags },
  { href: '/producir', label: 'Producir', icon: Hammer },
  { href: '/ordenes', label: 'Órdenes', icon: Truck },
] as const
