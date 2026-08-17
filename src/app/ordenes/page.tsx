import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import { formatARS } from '@/lib/format'

export default async function OrdenesPage() {
  const configurado = supabaseConfigurado()

  type OrdenConProveedor = {
    id: string
    numero_orden: string | null
    fecha: string | null
    total: number
    estado: string
    proveedores: { nombre: string } | null
  }
  let ordenes: OrdenConProveedor[] = []

  if (configurado) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('ordenes_compra')
      .select('id, numero_orden, fecha, total, estado, proveedores(nombre)')
      .order('creado_en', { ascending: false })
    ordenes = (data ?? []) as unknown as OrdenConProveedor[]
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-caslon text-2xl text-cantera-ink">Órdenes de compra</h1>
        <Link
          href="/ordenes/nueva"
          className="flex items-center gap-1.5 rounded-lg bg-cantera-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={18} /> Subir captura
        </Link>
      </div>

      {!configurado && <ConfiguracionPendiente />}

      {configurado && ordenes.length === 0 && (
        <p className="text-cantera-secondary">Todavía no cargaste ninguna orden.</p>
      )}

      <div className="flex flex-col gap-2">
        {ordenes.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-xl border border-cantera-sand bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold text-cantera-ink">
                {o.proveedores?.nombre ?? 'Proveedor'} {o.numero_orden ? `— #${o.numero_orden}` : ''}
              </p>
              <p className="text-sm text-cantera-secondary">{o.fecha ?? 'Sin fecha'}</p>
            </div>
            <p className="text-base font-bold text-cantera-primary">{formatARS(o.total)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
