import Link from 'next/link'
import { Package, Tags, Hammer, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import InsumosBajosCard from '@/components/InsumosBajosCard'
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

      {configurado && insumosBajos.length > 0 && <InsumosBajosCard insumos={insumosBajos} />}

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
