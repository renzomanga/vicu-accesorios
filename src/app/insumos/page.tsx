import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import type { Insumo } from '@/types/database'
import InsumosList from './InsumosList'

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
        <h1 className="font-caslon text-2xl text-cantera-ink">Insumos</h1>
        <Link
          href="/insumos/nuevo"
          className="flex items-center gap-1.5 rounded-lg bg-cantera-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={18} /> Nuevo
        </Link>
      </div>

      {!configurado && <ConfiguracionPendiente />}

      {configurado && insumos.length === 0 && (
        <p className="text-cantera-secondary">Todavía no cargaste ningún insumo.</p>
      )}

      {configurado && insumos.length > 0 && <InsumosList insumos={insumos} />}
    </div>
  )
}
