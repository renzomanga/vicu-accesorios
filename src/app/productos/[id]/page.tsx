import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatARS, formatNumero } from '@/lib/format'
import { actualizarCostosProducto, agregarInsumoReceta, quitarInsumoReceta } from '../actions'

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos_terminados')
    .select('*')
    .eq('id', id)
    .single()
  if (!producto) notFound()

  const { data: recetaRaw } = await supabase
    .from('recetas')
    .select('id, cantidad_usada, insumos(id, nombre, unidad_uso, costo_unitario_ponderado)')
    .eq('producto_terminado_id', id)

  type RecetaConInsumo = {
    id: string
    cantidad_usada: number
    insumos: { id: string; nombre: string; unidad_uso: string; costo_unitario_ponderado: number } | null
  }
  const receta = (recetaRaw ?? []) as unknown as RecetaConInsumo[]

  const { data: insumos } = await supabase.from('insumos').select('id, nombre, unidad_uso').order('nombre')

  const costoMateriales = receta.reduce(
    (acc, r) => acc + r.cantidad_usada * (r.insumos?.costo_unitario_ponderado ?? 0),
    0
  )

  const actualizarConId = actualizarCostosProducto.bind(null, id)
  const agregarConId = agregarInsumoReceta.bind(null, id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{producto.nombre}</h1>
        <p className="text-2xl font-bold text-rose-800">
          {formatARS(producto.precio_final ?? producto.precio_sugerido)}
        </p>
        <p className="text-sm text-zinc-500">
          Sugerido: {formatARS(producto.precio_sugerido)} · Costo materiales: {formatARS(costoMateriales)}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-zinc-800">Receta</h2>

        {receta.length === 0 ? (
          <p className="mb-3 text-sm text-zinc-500">Todavía no agregaste insumos.</p>
        ) : (
          <ul className="mb-4 flex flex-col gap-2">
            {receta.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span>
                  {r.insumos?.nombre} — {formatNumero(r.cantidad_usada)} {r.insumos?.unidad_uso}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">
                    {formatARS(r.cantidad_usada * (r.insumos?.costo_unitario_ponderado ?? 0))}
                  </span>
                  <form action={quitarInsumoReceta.bind(null, r.id, id)}>
                    <button type="submit" className="text-red-600 underline">
                      Quitar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form action={agregarConId} className="flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Insumo</span>
            <select
              name="insumo_id"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
            >
              <option value="">Elegí un insumo</option>
              {(insumos ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-28 flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Cantidad</span>
            <input
              name="cantidad_usada"
              type="number"
              step="any"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white">
            Agregar
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-zinc-800">Costos y precio</h2>
        <form action={actualizarConId} className="flex flex-col gap-4">
          <Campo label="Nombre" name="nombre" defaultValue={producto.nombre} required />
          <div className="grid grid-cols-2 gap-3">
            <Campo
              label="Mano de obra ($)"
              name="mano_obra_costo"
              type="number"
              step="any"
              defaultValue={producto.mano_obra_costo}
            />
            <Campo
              label="Otros costos ($)"
              name="otros_costos"
              type="number"
              step="any"
              defaultValue={producto.otros_costos}
            />
          </div>
          <Campo
            label="Margen de ganancia (%)"
            name="margen_pct"
            type="number"
            step="any"
            defaultValue={producto.margen_pct}
          />
          <Campo
            label="Precio final (opcional, redondeado a mano)"
            name="precio_final"
            type="number"
            step="any"
            defaultValue={producto.precio_final ?? ''}
            hint="Si lo dejás vacío se usa el precio sugerido"
          />
          <button type="submit" className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white">
            Guardar
          </button>
        </form>
      </section>
    </div>
  )
}

function Campo({
  label,
  name,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
        {...props}
      />
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  )
}
