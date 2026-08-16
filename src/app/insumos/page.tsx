import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import { formatARS, formatNumero } from '@/lib/format'
import type { Insumo } from '@/types/database'

function estadoInsumo(i: Insumo): { label: string; className: string } {
  if (i.stock_actual <= 0) return { label: 'Agotado', className: 'bg-red-100 text-red-800' }
  if (i.stock_actual <= i.stock_minimo) return { label: 'Bajo', className: 'bg-amber-100 text-amber-800' }
  return { label: 'OK', className: 'bg-emerald-100 text-emerald-800' }
}

export default async function InsumosPage() {
  const configurado = supabaseConfigurado()
  let insumos: Insumo[] = []

  if (configurado) {
    const supabase = await createClient()
    const { data } = await supabase.from('insumos').select('*').order('nombre')
    insumos = data ?? []
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Insumos</h1>
        <Link
          href="/insumos/nuevo"
          className="flex items-center gap-1.5 rounded-lg bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={18} /> Nuevo
        </Link>
      </div>

      {!configurado && <ConfiguracionPendiente />}

      {configurado && insumos.length === 0 && (
        <p className="text-zinc-500">Todavía no cargaste ningún insumo.</p>
      )}

      <div className="flex flex-col gap-2">
        {insumos.map((i) => {
          const estado = estadoInsumo(i)
          return (
            <Link
              key={i.id}
              href={`/insumos/${i.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-zinc-800">{i.nombre}</p>
                <p className="text-sm text-zinc-500">
                  {formatNumero(i.stock_actual)} {i.unidad_uso} · {formatARS(i.costo_unitario_ponderado)}/
                  {i.unidad_uso}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.className}`}>
                {estado.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
