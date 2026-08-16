import Link from 'next/link'
import { AlertTriangle, Package, Tags, Hammer, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import type { Insumo } from '@/types/database'

const ACCESOS = [
  { href: '/ordenes/nueva', label: 'Cargar orden de compra', icon: Truck },
  { href: '/insumos', label: 'Mis insumos', icon: Package },
  { href: '/productos', label: 'Mis productos y precios', icon: Tags },
  { href: '/producir', label: 'Producir', icon: Hammer },
]

export default async function Dashboard() {
  const configurado = supabaseConfigurado()
  let insumosBajos: Insumo[] = []

  if (configurado) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('insumos')
      .select('*')
      .order('stock_actual', { ascending: true })
    insumosBajos = (data ?? []).filter((i) => i.stock_actual <= i.stock_minimo)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Hola, Vicu 👋</h1>

      {!configurado && <ConfiguracionPendiente />}

      {configurado && insumosBajos.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle size={20} />
            <p className="font-semibold">Insumos bajos o agotados</p>
          </div>
          <ul className="flex flex-col gap-1 text-sm text-red-700">
            {insumosBajos.map((i) => (
              <li key={i.id}>
                {i.nombre} — quedan {i.stock_actual} {i.unidad_uso}
                {i.stock_actual <= 0 ? ' (agotado)' : ''}
              </li>
            ))}
          </ul>
          <Link href="/insumos" className="text-sm font-semibold text-red-800 underline">
            Ver insumos
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACCESOS.map((a) => {
          const Icon = a.icon
          return (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50"
            >
              <span className="rounded-xl bg-rose-100 p-3 text-rose-800">
                <Icon size={24} />
              </span>
              <span className="text-base font-semibold text-zinc-800">{a.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
