import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import OrdenNuevaForm from './OrdenNuevaForm'

export default async function NuevaOrdenPage() {
  const configurado = supabaseConfigurado()

  if (!configurado) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-zinc-900">Nueva orden de compra</h1>
        <ConfiguracionPendiente />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: insumos } = await supabase.from('insumos').select('id, nombre, unidad_uso').order('nombre')

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-zinc-900">Nueva orden de compra</h1>
      <OrdenNuevaForm insumosExistentes={insumos ?? []} />
    </div>
  )
}
