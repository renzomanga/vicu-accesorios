import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatARS, formatCantidadUnidad } from '@/lib/format'
import { actualizarInsumo, ajustarStock } from '../actions'

export default async function InsumoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: insumo } = await supabase.from('insumos').select('*').eq('id', id).single()
  if (!insumo) notFound()

  const { data: movimientos } = await supabase
    .from('movimientos_stock')
    .select('*')
    .eq('insumo_id', id)
    .order('fecha', { ascending: false })
    .limit(15)

  const actualizarConId = actualizarInsumo.bind(null, id)
  const ajustarConId = ajustarStock.bind(null, id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{insumo.nombre}</h1>
        <p className="text-sm text-zinc-500">
          Stock actual: {formatCantidadUnidad(insumo.stock_actual, insumo.unidad_uso)} · Costo:{' '}
          {formatARS(insumo.costo_unitario_ponderado)}/{insumo.unidad_uso}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-zinc-800">Ajustar stock</h2>
        <form action={ajustarConId} className="flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">
              Cantidad ({insumo.unidad_uso}, negativo para descontar)
            </span>
            <input
              name="cantidad"
              type="number"
              step="any"
              required
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-base focus:border-rose-500 focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white">
            Aplicar
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-zinc-800">Editar insumo</h2>
        <form action={actualizarConId} className="flex flex-col gap-4">
          <Campo label="Nombre" name="nombre" defaultValue={insumo.nombre} required />
          <Campo label="SKU / código" name="sku" defaultValue={insumo.sku ?? ''} />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Unidad de compra" name="unidad_compra" defaultValue={insumo.unidad_compra} required />
            <Campo label="Unidad de uso" name="unidad_uso" defaultValue={insumo.unidad_uso} required />
          </div>
          <Campo
            label="Factor de conversión"
            name="factor_conversion"
            type="number"
            step="any"
            defaultValue={insumo.factor_conversion}
          />
          <Campo
            label="Stock mínimo"
            name="stock_minimo"
            type="number"
            step="any"
            defaultValue={insumo.stock_minimo}
          />
          <Campo
            label="Costo por unidad de uso ($)"
            name="costo_unitario_ponderado"
            type="number"
            step="any"
            defaultValue={insumo.costo_unitario_ponderado}
          />
          <button type="submit" className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white">
            Guardar cambios
          </button>
        </form>
      </section>

      {movimientos && movimientos.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-zinc-800">Movimientos recientes</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {movimientos.map((m) => (
              <li key={m.id} className="flex justify-between text-zinc-600">
                <span>
                  {m.tipo === 'compra' ? 'Compra' : m.tipo === 'consumo_produccion' ? 'Producción' : 'Ajuste manual'}
                </span>
                <span className={m.cantidad < 0 ? 'text-red-600' : 'text-emerald-600'}>
                  {m.cantidad > 0 ? '+' : ''}
                  {formatCantidadUnidad(m.cantidad, insumo.unidad_uso)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Campo({
  label,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
        {...props}
      />
    </label>
  )
}
