import { createClient } from '@/lib/supabase/server'
import { supabaseConfigurado } from '@/lib/supabase/config'
import ConfiguracionPendiente from '@/components/ConfiguracionPendiente'
import { producir } from './actions'

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
      <h1 className="text-2xl font-bold text-zinc-900">Producir</h1>

      {!configurado && <ConfiguracionPendiente />}

      {ok && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Producción registrada. El stock de los insumos ya se descontó.
        </p>
      )}

      {configurado && productos.length === 0 && (
        <p className="text-zinc-500">Primero creá un producto con su receta.</p>
      )}

      {configurado && productos.length > 0 && (
        <form action={producir} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Producto</span>
            <select
              name="producto_id"
              required
              className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
            >
              <option value="">Elegí un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Cantidad producida</span>
            <input
              name="cantidad"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={1}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
            />
          </label>

          <button type="submit" className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white">
            Confirmar producción
          </button>
        </form>
      )}
    </div>
  )
}
