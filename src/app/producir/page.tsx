import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import ProducirForm from './ProducirForm'

export default async function ProducirPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const configurado = supabaseConfigurado()

  let productos: { id: string; nombre: string }[] = []
  if (configurado) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('productos_terminados')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre')
    productos = data ?? []
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-caslon text-2xl text-cantera-ink">Producir</h1>

      {!configurado && <ConfiguracionPendiente />}

      {ok && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Producción registrada. El stock de los insumos ya se descontó.
        </p>
      )}

      {configurado && productos.length === 0 && (
        <p className="text-cantera-secondary">Primero creá un producto con su receta.</p>
      )}

      {configurado && productos.length > 0 && <ProducirForm productos={productos} />}
    </div>
  )
}
