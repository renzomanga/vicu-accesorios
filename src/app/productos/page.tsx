import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import { formatARS } from '@/lib/format'
import type { ProductoTerminado } from '@/types/database'

export default async function ProductosPage() {
  const configurado = supabaseConfigurado()
  let productos: ProductoTerminado[] = []

  if (configurado) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('productos_terminados')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    productos = data ?? []
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-caslon text-2xl text-cantera-ink">Productos</h1>
        <Link
          href="/productos/nuevo"
          className="flex items-center gap-1.5 rounded-lg bg-cantera-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={18} /> Nuevo
        </Link>
      </div>

      {!configurado && <ConfiguracionPendiente />}

      {configurado && productos.length === 0 && (
        <p className="text-cantera-secondary">Todavía no cargaste ningún producto.</p>
      )}

      <div className="flex flex-col gap-2">
        {productos.map((p) => (
          <Link
            key={p.id}
            href={`/productos/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-cantera-sand bg-white p-4 shadow-sm"
          >
            <p className="font-semibold text-cantera-ink">{p.nombre}</p>
            <p className="text-base font-bold text-cantera-primary">
              {formatARS(p.precio_final ?? p.precio_sugerido)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
